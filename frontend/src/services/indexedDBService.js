/**
 * IndexedDB Service for Offline Data Storage
 * Stores survey data locally when offline and syncs when online
 */

const DB_NAME = 'SamparkDB';
const DB_VERSION = 1;

// Object Store names
const STORES = {
  SURVEYS: 'surveys',
  PENDING_SYNC: 'pendingSync',
  SYNC_LOGS: 'syncLogs',
  SCHEMAS: 'schemas',
};

class IndexedDBService {
  constructor() {
    this.db = null;
  }

  /**
   * Initialize IndexedDB
   */
  async init() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        const error = new Error('IndexedDB is not supported in this browser');
        console.error(error);
        reject(error);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB failed to open', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        console.log('Upgrading IndexedDB schema...');

        // Create Surveys store
        if (!db.objectStoreNames.contains(STORES.SURVEYS)) {
          const surveyStore = db.createObjectStore(STORES.SURVEYS, {
            keyPath: 'id',
            autoIncrement: true,
          });
          surveyStore.createIndex('survey_id', 'survey_id', { unique: false });
          surveyStore.createIndex('panchayat_id', 'panchayat_id', { unique: false });
          surveyStore.createIndex('status', 'status', { unique: false });
          surveyStore.createIndex('created_at', 'created_at', { unique: false });
          console.log('Created surveys store');
        }

        // Create Pending Sync store
        if (!db.objectStoreNames.contains(STORES.PENDING_SYNC)) {
          const syncStore = db.createObjectStore(STORES.PENDING_SYNC, {
            keyPath: 'id',
            autoIncrement: true,
          });
          syncStore.createIndex('action', 'action', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('synced', 'synced', { unique: false });
          console.log('Created pendingSync store');
        }

        // Create Sync Logs store
        if (!db.objectStoreNames.contains(STORES.SYNC_LOGS)) {
          const logsStore = db.createObjectStore(STORES.SYNC_LOGS, {
            keyPath: 'id',
            autoIncrement: true,
          });
          logsStore.createIndex('timestamp', 'timestamp', { unique: false });
          logsStore.createIndex('status', 'status', { unique: false });
          console.log('Created syncLogs store');
        }

        // Create Schemas store
        if (!db.objectStoreNames.contains(STORES.SCHEMAS)) {
          const schemaStore = db.createObjectStore(STORES.SCHEMAS, {
            keyPath: 'id',
          });
          schemaStore.createIndex('name', 'name', { unique: false });
          console.log('Created schemas store');
        }

        console.log('IndexedDB schema upgrade completed');
      };
    });
  }

  /**
   * Get a transaction
   */
  getTransaction(storeName, mode = 'readonly') {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db.transaction([storeName], mode);
  }

  /**
   * Save survey to IndexedDB
   */
  async saveSurvey(surveyData) {
    try {
      const transaction = this.getTransaction(STORES.SURVEYS, 'readwrite');
      const store = transaction.objectStore(STORES.SURVEYS);

      const survey = {
        ...surveyData,
        created_at: surveyData.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        synced: false,
        local_id: surveyData.id || `local_${Date.now()}`,
      };

      return new Promise((resolve, reject) => {
        const request = store.put(survey);

        request.onsuccess = async () => {
          console.log('Survey saved to IndexedDB:', request.result);
          
          // Add to pending sync queue
          await this.addToPendingSync({
            action: surveyData.survey_id ? 'update' : 'create',
            data: survey,
            local_id: survey.local_id,
            survey_id: surveyData.survey_id,
          });

          resolve(request.result);
        };

        request.onerror = () => {
          console.error('Error saving survey:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in saveSurvey:', error);
      throw error;
    }
  }

  /**
   * Get all surveys from IndexedDB
   */
  async getAllSurveys(filters = {}) {
    try {
      const transaction = this.getTransaction(STORES.SURVEYS, 'readonly');
      const store = transaction.objectStore(STORES.SURVEYS);

      return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
          let surveys = request.result;

          // Apply filters
          if (filters.panchayat_id) {
            surveys = surveys.filter(s => s.panchayat_id === filters.panchayat_id);
          }
          if (filters.status) {
            surveys = surveys.filter(s => s.status === filters.status);
          }

          resolve(surveys);
        };

        request.onerror = () => {
          console.error('Error getting surveys:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in getAllSurveys:', error);
      throw error;
    }
  }

  /**
   * Get survey by ID
   */
  async getSurveyById(id) {
    try {
      const transaction = this.getTransaction(STORES.SURVEYS, 'readonly');
      const store = transaction.objectStore(STORES.SURVEYS);

      return new Promise((resolve, reject) => {
        const request = store.get(id);

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          console.error('Error getting survey:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in getSurveyById:', error);
      throw error;
    }
  }

  /**
   * Update survey in IndexedDB
   */
  async updateSurvey(id, updates) {
    try {
      const survey = await this.getSurveyById(id);
      if (!survey) {
        throw new Error('Survey not found');
      }

      const updatedSurvey = {
        ...survey,
        ...updates,
        updated_at: new Date().toISOString(),
        synced: false,
      };

      return await this.saveSurvey(updatedSurvey);
    } catch (error) {
      console.error('Error in updateSurvey:', error);
      throw error;
    }
  }

  /**
   * Delete survey from IndexedDB
   */
  async deleteSurvey(id) {
    try {
      const transaction = this.getTransaction(STORES.SURVEYS, 'readwrite');
      const store = transaction.objectStore(STORES.SURVEYS);

      return new Promise((resolve, reject) => {
        const request = store.delete(id);

        request.onsuccess = async () => {
          console.log('Survey deleted from IndexedDB');
          
          // Add to pending sync queue
          await this.addToPendingSync({
            action: 'delete',
            local_id: id,
          });

          resolve();
        };

        request.onerror = () => {
          console.error('Error deleting survey:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in deleteSurvey:', error);
      throw error;
    }
  }

  /**
   * Add operation to pending sync queue
   */
  async addToPendingSync(operation) {
    try {
      const transaction = this.getTransaction(STORES.PENDING_SYNC, 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_SYNC);

      const syncItem = {
        ...operation,
        timestamp: new Date().toISOString(),
        synced: false,
        attempts: 0,
      };

      return new Promise((resolve, reject) => {
        const request = store.add(syncItem);

        request.onsuccess = () => {
          console.log('Added to pending sync queue:', request.result);
          resolve(request.result);
        };

        request.onerror = () => {
          console.error('Error adding to sync queue:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in addToPendingSync:', error);
      throw error;
    }
  }

  /**
   * Get all pending sync operations
   */
  async getPendingSyncOperations() {
    try {
      const transaction = this.getTransaction(STORES.PENDING_SYNC, 'readonly');
      const store = transaction.objectStore(STORES.PENDING_SYNC);

      return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
          // Filter for unsynced items
          const pendingItems = request.result.filter(item => !item.synced);
          console.log(`Total sync queue items: ${request.result.length}, Pending: ${pendingItems.length}`);
          resolve(pendingItems);
        };

        request.onerror = () => {
          console.error('Error getting pending sync operations:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in getPendingSyncOperations:', error);
      throw error;
    }
  }

  /**
   * Clean up completed sync operations (older than 24 hours)
   */
  async cleanupCompletedSyncOperations(hoursOld = 24) {
    try {
      const transaction = this.getTransaction(STORES.PENDING_SYNC, 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_SYNC);

      return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
          const allItems = request.result;
          const cutoffTime = new Date(Date.now() - hoursOld * 60 * 60 * 1000);
          let deletedCount = 0;

          const deletePromises = allItems
            .filter(item => {
              if (!item.synced) return false;
              const syncedAt = new Date(item.synced_at);
              return syncedAt < cutoffTime;
            })
            .map(item => {
              return new Promise((res, rej) => {
                const deleteRequest = store.delete(item.id);
                deleteRequest.onsuccess = () => {
                  deletedCount++;
                  res();
                };
                deleteRequest.onerror = () => rej(deleteRequest.error);
              });
            });

          Promise.all(deletePromises)
            .then(() => {
              console.log(`Cleaned up ${deletedCount} completed sync operations`);
              resolve(deletedCount);
            })
            .catch(reject);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in cleanupCompletedSyncOperations:', error);
      throw error;
    }
  }

  /**
   * Mark sync operation as completed
   */
  async markSyncCompleted(syncId, serverResponse = null) {
    try {
      const transaction = this.getTransaction(STORES.PENDING_SYNC, 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_SYNC);

      const getRequest = store.get(syncId);

      return new Promise((resolve, reject) => {
        getRequest.onsuccess = () => {
          const syncItem = getRequest.result;
          if (syncItem) {
            syncItem.synced = true;
            syncItem.synced_at = new Date().toISOString();
            syncItem.server_response = serverResponse;

            const updateRequest = store.put(syncItem);

            updateRequest.onsuccess = () => {
              console.log('Sync operation marked as completed');
              resolve();
            };

            updateRequest.onerror = () => {
              reject(updateRequest.error);
            };
          } else {
            resolve();
          }
        };

        getRequest.onerror = () => {
          reject(getRequest.error);
        };
      });
    } catch (error) {
      console.error('Error in markSyncCompleted:', error);
      throw error;
    }
  }

  /**
   * Update survey with server ID after sync
   */
  async updateSurveyWithServerId(localId, serverId) {
    try {
      const surveys = await this.getAllSurveys();
      const survey = surveys.find(s => s.local_id === localId);

      if (survey) {
        survey.survey_id = serverId;
        survey.synced = true;
        survey.synced_at = new Date().toISOString();

        const transaction = this.getTransaction(STORES.SURVEYS, 'readwrite');
        const store = transaction.objectStore(STORES.SURVEYS);

        return new Promise((resolve, reject) => {
          const request = store.put(survey);

          request.onsuccess = () => {
            console.log('Survey updated with server ID');
            resolve();
          };

          request.onerror = () => {
            reject(request.error);
          };
        });
      }
    } catch (error) {
      console.error('Error in updateSurveyWithServerId:', error);
      throw error;
    }
  }

  /**
   * Add sync log
   */
  async addSyncLog(log) {
    try {
      const transaction = this.getTransaction(STORES.SYNC_LOGS, 'readwrite');
      const store = transaction.objectStore(STORES.SYNC_LOGS);

      const logEntry = {
        ...log,
        timestamp: new Date().toISOString(),
      };

      return new Promise((resolve, reject) => {
        const request = store.add(logEntry);

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in addSyncLog:', error);
      throw error;
    }
  }

  /**
   * Get sync logs
   */
  async getSyncLogs(limit = 50) {
    try {
      const transaction = this.getTransaction(STORES.SYNC_LOGS, 'readonly');
      const store = transaction.objectStore(STORES.SYNC_LOGS);
      const index = store.index('timestamp');

      return new Promise((resolve, reject) => {
        const request = index.openCursor(null, 'prev');
        const logs = [];

        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor && logs.length < limit) {
            logs.push(cursor.value);
            cursor.continue();
          } else {
            resolve(logs);
          }
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in getSyncLogs:', error);
      throw error;
    }
  }

  /**
   * Clear all data (use with caution)
   */
  async clearAllData() {
    try {
      const stores = [STORES.SURVEYS, STORES.PENDING_SYNC, STORES.SYNC_LOGS, STORES.SCHEMAS];
      
      for (const storeName of stores) {
        const transaction = this.getTransaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        
        await new Promise((resolve, reject) => {
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }

      console.log('All IndexedDB data cleared');
    } catch (error) {
      console.error('Error in clearAllData:', error);
      throw error;
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats() {
    try {
      const surveys = await this.getAllSurveys();
      const pendingSync = await this.getPendingSyncOperations();
      const logs = await this.getSyncLogs();

      return {
        totalSurveys: surveys.length,
        unsyncedSurveys: surveys.filter(s => !s.synced).length,
        pendingOperations: pendingSync.length,
        totalLogs: logs.length,
      };
    } catch (error) {
      console.error('Error in getStorageStats:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const indexedDBService = new IndexedDBService();

export default indexedDBService;
