/**
 * Sync Service - Handles automatic synchronization between IndexedDB and Backend
 */

import api from './api';
import indexedDBService from './indexedDBService';
import { surveyService } from './surveyService';

class SyncService {
  constructor() {
    this.isSyncing = false;
    this.syncInterval = null;
    this.onlineListenerAdded = false;
    this.syncCallbacks = new Set();
  }

  /**
   * Initialize sync service
   */
  async init() {
    try {
      await indexedDBService.init();
      this.startAutoSync();
      this.setupOnlineListener();
      console.log('Sync service initialized');
    } catch (error) {
      console.error('Error initializing sync service:', error);
      throw error;
    }
  }

  /**
   * Check if online
   */
  isOnline() {
    return navigator.onLine;
  }

  /**
   * Check server connectivity
   */
  async checkServerConnection() {
    try {
      const response = await api.get('/api/ping', { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      console.log('Server not reachable');
      return false;
    }
  }

  /**
   * Setup online/offline event listeners
   */
  setupOnlineListener() {
    if (this.onlineListenerAdded) return;

    window.addEventListener('online', () => {
      console.log('🌐 Network status: ONLINE - Triggering automatic sync...');
      this.notifyStatusChange('online');
      
      // Trigger sync after a small delay to ensure network is stable
      setTimeout(() => {
        console.log('🔄 Initiating sync after coming online...');
        this.syncNow();
      }, 1000);
    });

    window.addEventListener('offline', () => {
      console.log('📡 Network status: OFFLINE - Working in offline mode');
      this.notifyStatusChange('offline');
    });

    this.onlineListenerAdded = true;
  }

  /**
   * Start automatic sync at intervals
   */
  startAutoSync(intervalMs = 60000) { // Default: 1 minute
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.isOnline()) {
        this.syncNow();
      }
    }, intervalMs);

    console.log(`Auto-sync started with interval: ${intervalMs}ms`);
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Auto-sync stopped');
    }
  }

  /**
   * Subscribe to sync status changes
   */
  onSyncStatusChange(callback) {
    this.syncCallbacks.add(callback);
    return () => this.syncCallbacks.delete(callback);
  }

  /**
   * Notify all subscribers of status change
   */
  notifyStatusChange(status, data = {}) {
    this.syncCallbacks.forEach(callback => {
      try {
        callback({ status, ...data });
      } catch (error) {
        console.error('Error in sync callback:', error);
      }
    });
  }

  /**
   * Sync now - Main sync function
   */
  async syncNow() {
    if (this.isSyncing) {
      console.log('Sync already in progress, skipping...');
      return { status: 'skipped', message: 'Sync already in progress' };
    }

    if (!this.isOnline()) {
      console.log('Offline, cannot sync');
      return { status: 'offline', message: 'Device is offline' };
    }

    const serverReachable = await this.checkServerConnection();
    if (!serverReachable) {
      console.log('Server not reachable, cannot sync');
      return { status: 'server_unreachable', message: 'Server not reachable' };
    }

    this.isSyncing = true;
    this.notifyStatusChange('syncing');

    const syncResults = {
      success: 0,
      failed: 0,
      errors: [],
      timestamp: new Date().toISOString(),
    };

    try {
      console.log('🔄 Starting sync...');

      // Get pending sync operations
      const pendingOps = await indexedDBService.getPendingSyncOperations();
      console.log(`📦 Found ${pendingOps.length} pending operations to sync`);

      if (pendingOps.length === 0) {
        await indexedDBService.addSyncLog({
          status: 'success',
          message: 'No pending operations to sync',
          details: syncResults,
        });

        this.notifyStatusChange('synced', syncResults);
        return { status: 'success', ...syncResults };
      }

      console.log('📋 Pending operations:', pendingOps.map(op => ({
        action: op.action,
        local_id: op.local_id,
        survey_id: op.survey_id
      })));

      // Process each pending operation
      for (const op of pendingOps) {
        try {
          console.log(`⚙️ Processing ${op.action} operation for ${op.local_id || op.survey_id}`);
          await this.processSyncOperation(op);
          syncResults.success++;
          console.log(`✅ Successfully synced ${op.action} operation`);
          
          // Mark as completed
          await indexedDBService.markSyncCompleted(op.id, { success: true });
        } catch (error) {
          console.error(`❌ Error syncing operation ${op.id}:`, error);
          syncResults.failed++;
          syncResults.errors.push({
            operation: op.action,
            error: error.message,
          });

          // Update attempt count
          const transaction = indexedDBService.getTransaction('pendingSync', 'readwrite');
          const store = transaction.objectStore('pendingSync');
          const getRequest = store.get(op.id);
          
          getRequest.onsuccess = () => {
            const item = getRequest.result;
            if (item) {
              item.attempts = (item.attempts || 0) + 1;
              item.last_error = error.message;
              store.put(item);
            }
          };
        }
      }

      // Log sync results
      await indexedDBService.addSyncLog({
        status: syncResults.failed === 0 ? 'success' : 'partial',
        message: `Synced ${syncResults.success}/${pendingOps.length} operations`,
        details: syncResults,
      });

      // Clean up completed sync operations (older than 1 hour)
      await indexedDBService.cleanupCompletedSyncOperations(1);

      console.log('Sync completed:', syncResults);
      this.notifyStatusChange('synced', syncResults);

      return { status: 'success', ...syncResults };
    } catch (error) {
      console.error('Sync failed:', error);
      
      await indexedDBService.addSyncLog({
        status: 'error',
        message: error.message,
        details: syncResults,
      });

      this.notifyStatusChange('error', { error: error.message });
      
      return { 
        status: 'error', 
        message: error.message,
        ...syncResults 
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Process individual sync operation
   */
  async processSyncOperation(operation) {
    const { action, data, local_id, survey_id } = operation;

    console.log(`Processing ${action} operation:`, local_id);

    switch (action) {
      case 'create':
        return await this.syncCreateSurvey(data, local_id);
      
      case 'update':
        return await this.syncUpdateSurvey(data, survey_id);
      
      case 'delete':
        return await this.syncDeleteSurvey(survey_id);
      
      default:
        throw new Error(`Unknown sync action: ${action}`);
    }
  }

  /**
   * Sync create survey to backend
   */
  async syncCreateSurvey(surveyData, localId) {
    try {
      // Skip drafts - only sync finalized surveys
      if (surveyData.is_draft) {
        console.log('⏭️ Skipping draft survey (not finalized yet):', localId);
        return { skipped: true, reason: 'draft' };
      }

      // Remove local-only fields
      const { id, local_id, synced, synced_at, is_draft, last_auto_save, ...cleanData } = surveyData;

      console.log('📤 Syncing survey to server:', {
        local_id: localId,
        survey_id: cleanData.survey_id,
        village_name: cleanData.village_name,
        panchayat_id: cleanData.panchayat_id,
        fields: Object.keys(cleanData),
      });

      // Call API directly (not through surveyService to avoid duplicate IndexedDB writes)
      const response = await api.post('/api/surveys', cleanData);
      
      // Update local survey with server ID and mark as synced
      await indexedDBService.updateSurveyWithServerId(localId, response.data.survey_id);
      
      // Also mark as synced (WITHOUT adding to sync queue)
      const surveys = await indexedDBService.getAllSurveys();
      const localSurvey = surveys.find(s => s.local_id === localId);
      if (localSurvey) {
        await indexedDBService.updateSurvey(localSurvey.id, {
          synced: true,
          synced_at: new Date().toISOString(),
        }, false); // false = don't add to sync queue!
      }
      
      console.log('✅ Survey synced to server:', response.data.survey_id, 'for village:', response.data.village_name);
      return response.data;
    } catch (error) {
      console.error('❌ Error syncing create survey:', error.response?.status, error.message);
      
      // If 409 Conflict, the survey was already created and updated by the backend
      if (error.response?.status === 409) {
        console.log('⚠️ Survey already exists on server (conflict), but backend will handle it');
        // The conflict might be resolved by backend's upsert logic, mark as synced
        const surveys = await indexedDBService.getAllSurveys();
        const localSurvey = surveys.find(s => s.local_id === localId);
        if (localSurvey) {
          await indexedDBService.updateSurvey(localSurvey.id, {
            synced: true,
            synced_at: new Date().toISOString(),
          }, false); // false = don't add to sync queue!
        }
        return;
      }
      
      if (error.response) {
        console.error('Server response:', error.response.data);
      }
      throw error;
    }
  }

  /**
   * Sync update survey to backend
   */
  async syncUpdateSurvey(surveyData, surveyId) {
    try {
      // Skip drafts - only sync finalized surveys
      if (surveyData.is_draft) {
        console.log('⏭️ Skipping draft survey (not finalized yet):', surveyId);
        return { skipped: true, reason: 'draft' };
      }

      // If survey ID starts with "local_" or looks like a timestamp, it was never synced
      // We need to CREATE it instead of UPDATE
      if (!surveyId || surveyId.toString().startsWith('local_') || surveyId.toString().startsWith('SURVEY_')) {
        console.log('Survey not synced to server yet, creating instead of updating');
        return await this.syncCreateSurvey(surveyData, surveyData.local_id);
      }

      // Remove local-only fields
      const { id, local_id, synced, synced_at, is_draft, last_auto_save, ...cleanData } = surveyData;

      // Call API directly (not through surveyService to avoid duplicate IndexedDB writes)
      const response = await api.put(`/api/surveys/${surveyId}`, cleanData);
      
      // Update the synced status in IndexedDB (WITHOUT adding to sync queue)
      const surveys = await indexedDBService.getAllSurveys();
      const localSurvey = surveys.find(s => s.survey_id === surveyId);
      if (localSurvey) {
        await indexedDBService.updateSurvey(localSurvey.id, {
          synced: true,
          synced_at: new Date().toISOString(),
        }, false); // false = don't add to sync queue!
      }
      
      console.log('Survey updated on server:', surveyId);
      return response.data;
    } catch (error) {
      // If we get 404, the survey doesn't exist on server - create it instead
      if (error.response?.status === 404) {
        console.log('Survey not found on server (404), creating instead');
        return await this.syncCreateSurvey(surveyData, surveyData.local_id);
      }
      console.error('Error syncing update survey:', error);
      throw error;
    }
  }

  /**
   * Sync delete survey to backend
   */
  async syncDeleteSurvey(surveyId) {
    try {
      if (!surveyId || surveyId.startsWith('local_')) {
        // Survey was never synced to server, just skip
        console.log('Survey was never synced, skipping delete');
        return;
      }

      // Call API directly
      const response = await api.delete(`/api/surveys/${surveyId}`);
      
      console.log('Survey deleted on server:', surveyId);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        // Survey already deleted on server, that's fine
        console.log('Survey already deleted on server');
        return;
      }
      console.error('Error syncing delete survey:', error);
      throw error;
    }
  }

  /**
   * Pull surveys from server and update local database
   */
  async pullFromServer(filters = {}) {
    try {
      if (!this.isOnline()) {
        throw new Error('Cannot pull from server while offline');
      }

      console.log('Pulling surveys from server...');
      const serverSurveys = await surveyService.getSurveys(filters);

      // Update local database
      for (const survey of serverSurveys) {
        const existingSurveys = await indexedDBService.getAllSurveys();
        const existingSurvey = existingSurveys.find(
          s => s.survey_id === survey.survey_id
        );

        if (existingSurvey) {
          // Update existing survey (WITHOUT adding to sync queue)
          await indexedDBService.updateSurvey(existingSurvey.id, {
            ...survey,
            synced: true,
            synced_at: new Date().toISOString(),
          }, false); // false = don't add to sync queue!
        } else {
          // Add new survey (WITHOUT adding to sync queue)
          await indexedDBService.saveSurvey({
            ...survey,
            synced: true,
            synced_at: new Date().toISOString(),
            local_id: `server_${survey.survey_id}`,
          }, false); // false = don't add to sync queue!
        }
      }

      console.log(`Pulled ${serverSurveys.length} surveys from server`);
      return serverSurveys;
    } catch (error) {
      console.error('Error pulling from server:', error);
      throw error;
    }
  }

  /**
   * Force full sync (pull then push)
   */
  async fullSync(filters = {}) {
    try {
      this.notifyStatusChange('syncing');

      // First pull from server
      await this.pullFromServer(filters);

      // Then push local changes
      await this.syncNow();

      this.notifyStatusChange('synced');

      return { status: 'success', message: 'Full sync completed' };
    } catch (error) {
      console.error('Error in full sync:', error);
      this.notifyStatusChange('error', { error: error.message });
      throw error;
    }
  }

  /**
   * Get sync status
   */
  async getSyncStatus() {
    const pendingOps = await indexedDBService.getPendingSyncOperations();
    const stats = await indexedDBService.getStorageStats();
    const logs = await indexedDBService.getSyncLogs(10);

    return {
      online: this.isOnline(),
      syncing: this.isSyncing,
      pendingOperations: pendingOps.length,
      ...stats,
      recentLogs: logs,
    };
  }

  /**
   * Clear sync queue (dangerous - use with caution)
   */
  async clearSyncQueue() {
    const transaction = indexedDBService.getTransaction('pendingSync', 'readwrite');
    const store = transaction.objectStore('pendingSync');
    
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => {
        console.log('Sync queue cleared');
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }
}

// Create and export singleton instance
const syncService = new SyncService();

export default syncService;
