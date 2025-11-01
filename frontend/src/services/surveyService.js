import api from './api';
import indexedDBService from './indexedDBService';

const isOnline = () => navigator.onLine;

// Ensure IndexedDB is initialized before any operations
let dbInitialized = false;
const ensureDBInitialized = async () => {
  if (!dbInitialized) {
    try {
      await indexedDBService.init();
      dbInitialized = true;
      console.log('✅ IndexedDB initialized');
    } catch (error) {
      console.error('❌ Failed to initialize IndexedDB:', error);
      throw error;
    }
  }
};

export const surveyService = {
  /**
   * Get all surveys - merge server and local data
   */
  async getSurveys(params = {}) {
    await ensureDBInitialized();
    
    let serverSurveys = [];
    let localSurveys = [];

    // Try to get from server if online
    try {
      if (isOnline()) {
        const response = await api.get('/api/surveys', { params });
        serverSurveys = response.data;
        console.log(`✅ Fetched ${serverSurveys.length} surveys from server`);
        
        // Save server surveys to IndexedDB (marked as synced, without adding to queue)
        for (const serverSurvey of serverSurveys) {
          const existing = await indexedDBService.getSurveyById(serverSurvey.survey_id);
          if (existing) {
            // Update existing survey - preserve local data if it's newer or unsynced
            if (existing.synced === false) {
              console.log(`⚠️ Skipping server update for ${serverSurvey.survey_id} - has unsynced local changes`);
              continue;
            }
            
            await indexedDBService.updateSurvey(existing.id, {
              ...serverSurvey,
              synced: true,
              sync_status: 'synced',
              synced_at: new Date().toISOString(),
            }, false); // false = don't add to sync queue!
          } else {
            // Save new survey from server
            await indexedDBService.saveSurvey({
              ...serverSurvey,
              synced: true,
              sync_status: 'synced',
              synced_at: new Date().toISOString(),
              local_id: `server_${serverSurvey.survey_id}`,
            }, false); // false = don't add to sync queue!
          }
        }
        console.log(`💾 Saved ${serverSurveys.length} surveys to IndexedDB`);
      }
    } catch (error) {
      console.log('⚠️ Failed to fetch from server:', error.message);
    }

    // Always get local surveys
    try {
      localSurveys = await indexedDBService.getAllSurveys(params);
      console.log(`✅ Found ${localSurveys.length} surveys in IndexedDB`);
    } catch (error) {
      console.log('❌ Failed to fetch from IndexedDB:', error.message);
    }

    // Merge: local unsynced data takes priority over server data
    const mergedSurveys = this.mergeSurveys(serverSurveys, localSurveys);
    console.log(`Returning ${mergedSurveys.length} merged surveys`);
    
    return mergedSurveys;
  },

  /**
   * Merge server and local surveys, prioritizing local unsynced changes
   */
  mergeSurveys(serverSurveys, localSurveys) {
    const merged = new Map();

    // Add all server surveys first
    serverSurveys.forEach(survey => {
      merged.set(survey.survey_id, { ...survey, source: 'server' });
    });

    // Override with local surveys (especially unsynced ones)
    localSurveys.forEach(localSurvey => {
      const surveyId = localSurvey.survey_id || localSurvey.local_id;
      
      // If survey is not synced or has local changes, use local version
      if (!localSurvey.synced) {
        merged.set(surveyId, { ...localSurvey, source: 'local_unsynced' });
      } else if (localSurvey.survey_id && merged.has(localSurvey.survey_id)) {
        // If synced, check which is newer
        const serverVersion = merged.get(localSurvey.survey_id);
        const localTime = new Date(localSurvey.updated_at).getTime();
        const serverTime = new Date(serverVersion.updated_at || serverVersion.server_timestamp).getTime();
        
        if (localTime > serverTime) {
          merged.set(surveyId, { ...localSurvey, source: 'local_newer' });
        }
      } else {
        // Local-only survey (never synced)
        merged.set(surveyId, { ...localSurvey, source: 'local_only' });
      }
    });

    return Array.from(merged.values());
  },

  /**
   * Get survey by ID - merge server and local data
   */
  async getSurveyById(surveyId) {
    await ensureDBInitialized();
    
    console.log('🔍 getSurveyById called with:', surveyId);
    let serverSurvey = null;
    let localSurvey = null;

    // Try to get from server if online (but only if it's not a local-only ID)
    if (isOnline() && surveyId && !String(surveyId).startsWith('local_')) {
      try {
        const response = await api.get(`/api/surveys/${surveyId}`);
        serverSurvey = response.data;
        console.log('✅ Fetched survey from server:', surveyId);
      } catch (error) {
        console.log('⚠️ Failed to fetch survey from server:', error.message);
      }
    }

    // Always check IndexedDB
    try {
      localSurvey = await indexedDBService.getSurveyById(surveyId);
      if (localSurvey) {
        console.log('✅ Found survey in IndexedDB:', surveyId, 'synced:', localSurvey.synced);
      } else {
        console.log('⚠️ Survey not found in IndexedDB:', surveyId);
      }
    } catch (error) {
      console.log('❌ Failed to fetch from IndexedDB:', error.message);
    }

    // Prioritize local unsynced data
    if (localSurvey && !localSurvey.synced) {
      console.log('📍 Using local unsynced version of survey');
      return localSurvey;
    }

    // If both exist, use newer one
    if (localSurvey && serverSurvey) {
      const localTime = new Date(localSurvey.updated_at).getTime();
      const serverTime = new Date(serverSurvey.updated_at || serverSurvey.server_timestamp).getTime();
      
      if (localTime > serverTime) {
        console.log('📍 Using local version (newer)');
        return localSurvey;
      }
      console.log('☁️ Using server version (newer)');
      return serverSurvey;
    }

    // Return whichever exists
    if (localSurvey) {
      console.log('📍 Using local version (only source)');
      return localSurvey;
    }
    if (serverSurvey) {
      console.log('☁️ Using server version (only source)');
      return serverSurvey;
    }

    console.error('❌ Survey not found:', surveyId);
    throw new Error('Survey not found');
  },

  /**
   * Create survey - save to IndexedDB first, then sync
   */
  async createSurvey(surveyData) {
    await ensureDBInitialized();
    
    // Generate a temporary local ID
    const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Always save to IndexedDB first
    const indexedId = await indexedDBService.saveSurvey({
      ...surveyData,
      local_id: localId,
      status: surveyData.status || 'draft',
    });

    console.log('Survey saved to IndexedDB:', indexedId, 'with local_id:', localId);

    // Try to sync immediately if online
    if (isOnline()) {
      try {
        const response = await api.post('/api/surveys', surveyData);
        
        // Update local survey with server ID
        await indexedDBService.updateSurveyWithServerId(localId, response.data.survey_id);
        
        console.log('Survey synced to server:', response.data.survey_id);
        return response.data;
      } catch (error) {
        console.log('Failed to sync immediately, will sync later:', error.message);
        
        // Return local data
        const survey = await indexedDBService.getSurveyById(indexedId);
        return survey;
      }
    }

    // Return local data if offline
    const survey = await indexedDBService.getSurveyById(indexedId);
    return survey;
  },

  /**
   * Update survey - save to IndexedDB first, then sync
   */
  async updateSurvey(surveyId, surveyData) {
    await ensureDBInitialized();
    
    console.log('🔄 updateSurvey called with:', surveyId);
    console.log('📝 Survey data to update:', surveyData);
    
    // Find survey in IndexedDB using the improved getSurveyById
    const localSurvey = await indexedDBService.getSurveyById(surveyId);

    if (localSurvey) {
      // Merge the data properly to preserve existing module data
      const mergedData = {
        ...localSurvey,
        ...surveyData,
        // Ensure module data is properly merged
        basic_info: surveyData.basic_info || localSurvey.basic_info,
        infrastructure: surveyData.infrastructure || localSurvey.infrastructure,
        sanitation: surveyData.sanitation || localSurvey.sanitation,
        connectivity: surveyData.connectivity || localSurvey.connectivity,
        land_forest: surveyData.land_forest || localSurvey.land_forest,
        electricity: surveyData.electricity || localSurvey.electricity,
        waste_management: surveyData.waste_management || localSurvey.waste_management,
        updated_at: new Date().toISOString(),
      };
      
      // Update in IndexedDB using the IndexedDB ID
      await indexedDBService.updateSurvey(localSurvey.id, mergedData);
      console.log('✅ Survey updated in IndexedDB with merged data');
    } else {
      // Create new local survey
      console.log('⚠️ Survey not found locally, creating new entry');
      await indexedDBService.saveSurvey({
        ...surveyData,
        survey_id: surveyId,
        updated_at: new Date().toISOString(),
      });
    }

    // Try to sync immediately if online (but only if it's a server ID)
    if (isOnline() && surveyId && !String(surveyId).startsWith('local_')) {
      try {
        const response = await api.put(`/api/surveys/${surveyId}`, surveyData);
        console.log('✅ Survey synced to server');
        
        // Update local survey with synced status
        const updatedLocalSurvey = await indexedDBService.getSurveyById(surveyId);
        if (updatedLocalSurvey) {
          await indexedDBService.updateSurvey(updatedLocalSurvey.id, {
            synced: true,
            sync_status: 'synced',
            synced_at: new Date().toISOString(),
          }, false); // Don't add to sync queue
        }
        
        return response.data;
      } catch (error) {
        console.log('⚠️ Failed to sync immediately, will sync later:', error.message);
        
        // Return local data
        const updatedSurvey = await this.getSurveyById(surveyId);
        return updatedSurvey;
      }
    }

    // Return local data if offline or local-only ID
    const updatedSurvey = await this.getSurveyById(surveyId);
    return updatedSurvey;
  },

  /**
   * Delete survey - mark in IndexedDB, then sync
   */
  async deleteSurvey(surveyId) {
    await ensureDBInitialized();
    
    console.log('🗑️ deleteSurvey called with:', surveyId);
    
    // Find and delete from IndexedDB using improved method
    const localSurvey = await indexedDBService.getSurveyById(surveyId);

    if (localSurvey) {
      await indexedDBService.deleteSurvey(localSurvey.id);
      console.log('✅ Survey deleted from IndexedDB');
    } else {
      console.log('⚠️ Survey not found in IndexedDB');
    }

    // Try to delete on server immediately if online (but only if it's a server ID)
    if (isOnline() && surveyId && !String(surveyId).startsWith('local_')) {
      try {
        await api.delete(`/api/surveys/${surveyId}`);
        console.log('✅ Survey deleted from server');
        return { message: 'Survey deleted successfully', deleted: true };
      } catch (error) {
        console.error('❌ Failed to delete on server:', error.response?.status, error.message);
        
        // If it's a 403 or 401, throw the error so user knows about permission issue
        if (error.response?.status === 403) {
          throw new Error('You do not have permission to delete this survey');
        } else if (error.response?.status === 401) {
          throw new Error('You must be logged in to delete surveys');
        } else if (error.response?.status === 404) {
          console.log('⚠️ Survey not found on server (already deleted or never synced)');
        } else {
          console.log('⚠️ Failed to delete on server, will sync later:', error.message);
        }
      }
    }

    return { message: 'Survey deleted locally', deleted: true };
  },

  /**
   * Batch sync - only works online
   */
  async batchSync(surveys) {
    if (!isOnline()) {
      throw new Error('Cannot batch sync while offline');
    }

    const response = await api.post('/api/sync/batch', { surveys });
    return response.data;
  },

  /**
   * Get sync status - try server, fallback to local
   */
  async getSyncStatus(panchayatId) {
    try {
      if (isOnline()) {
        const response = await api.get('/api/sync/status', {
          params: { panchayat_id: panchayatId },
        });
        return response.data;
      }
    } catch (error) {
      console.log('Failed to fetch sync status from server:', error.message);
    }

    // Return local sync status
    const stats = await indexedDBService.getStorageStats();
    return {
      panchayat_id: panchayatId,
      ...stats,
      source: 'local',
    };
  },

  /**
   * Get sync logs - try server, fallback to local
   */
  async getSyncLogs(params = {}) {
    try {
      if (isOnline()) {
        const response = await api.get('/api/sync/logs', { params });
        return response.data;
      }
    } catch (error) {
      console.log('Failed to fetch sync logs from server:', error.message);
    }

    // Return local sync logs
    const logs = await indexedDBService.getSyncLogs(params.limit || 50);
    return logs;
  },

  /**
   * Auto-save draft - saves to IndexedDB without syncing
   * Called every 30 seconds during form editing
   */
  async autoSaveDraft(surveyId, formData) {
    await ensureDBInitialized();
    
    try {
      console.log('🔄 Auto-saving draft for survey:', surveyId);
      
      // Calculate completion percentage
      const completionPercentage = this.calculateCompletion(formData);
      
      const draftData = {
        ...formData,
        completion_percentage: completionPercentage,
        is_complete: completionPercentage === 100,
        client_timestamp: new Date().toISOString(),
      };

      // Save draft to IndexedDB (doesn't add to sync queue)
      await indexedDBService.saveDraft(surveyId, draftData);
      
      console.log('✅ Draft auto-saved successfully');
      return { success: true, timestamp: new Date().toISOString() };
    } catch (error) {
      console.error('❌ Failed to auto-save draft:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Manual save - saves to IndexedDB and syncs if online
   * Called when user clicks "Save Survey" button
   */
  async manualSave(surveyId, formData) {
    await ensureDBInitialized();
    
    try {
      console.log('💾 Manual save for survey:', surveyId);
      
      const completionPercentage = this.calculateCompletion(formData);
      
      const updatedData = {
        ...formData,
        completion_percentage: completionPercentage,
        is_complete: completionPercentage === 100,
        client_timestamp: new Date().toISOString(),
      };

      // Mark as final (not a draft) and add to sync queue
      await indexedDBService.markAsFinal(surveyId);
      
      // Now update with the latest data
      await this.updateSurvey(surveyId, updatedData);
      
      console.log('✅ Manual save successful');
      return { success: true, synced: isOnline() };
    } catch (error) {
      console.error('❌ Failed to manually save:', error);
      throw error;
    }
  },

  /**
   * Load draft from IndexedDB
   * Called when loading survey detail page
   */
  async loadDraft(surveyId) {
    await ensureDBInitialized();
    
    try {
      console.log('📂 Loading draft for survey:', surveyId);
      const draft = await indexedDBService.getDraft(surveyId);
      
      if (draft) {
        console.log('✅ Draft loaded successfully');
        return draft;
      }
      
      console.log('⚠️ No draft found');
      return null;
    } catch (error) {
      console.error('❌ Failed to load draft:', error);
      return null;
    }
  },

  /**
   * Calculate completion percentage for survey
   */
  calculateCompletion(formData) {
    const MODULES = [
      'basic_info',
      'infrastructure', 
      'sanitation',
      'connectivity',
      'land_forest',
      'electricity',
      'waste_management'
    ];
    
    const totalModules = MODULES.length;
    let completed = 0;
    
    MODULES.forEach(module => {
      if (formData[module] && Object.keys(formData[module]).length > 0) {
        completed++;
      }
    });
    
    return Math.round((completed / totalModules) * 100);
  },
};
