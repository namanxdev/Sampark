import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import syncService from '../services/syncService';
import indexedDBService from '../services/indexedDBService';
import { useAuth } from './AuthContext';

const SyncContext = createContext(null);

export const SyncProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [syncStatus, setSyncStatus] = useState({
    online: navigator.onLine,
    syncing: false,
    lastSync: null,
    pendingOperations: 0,
    totalSurveys: 0,
    unsyncedSurveys: 0,
  });

  const [syncHistory, setSyncHistory] = useState([]);
  const [initError, setInitError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Only initialize sync service when user is authenticated
    if (!isAuthenticated) {
      setInitialized(false);
      return;
    }

    if (initialized) {
      return; // Already initialized
    }

    // Initialize sync service
    const initSync = async () => {
      try {
        await syncService.init();
        await updateSyncStatus();
        setInitialized(true);
        console.log('Sync service initialized successfully');
      } catch (error) {
        console.error('Failed to initialize sync service:', error);
        setInitError(error.message);
        // Still allow the app to function, just without sync
      }
    };

    initSync();

    // Subscribe to sync status changes
    const unsubscribe = syncService.onSyncStatusChange((status) => {
      console.log('Sync status changed:', status);
      
      if (status.status === 'syncing') {
        setSyncStatus(prev => ({ ...prev, syncing: true }));
      } else if (status.status === 'synced') {
        setSyncStatus(prev => ({
          ...prev,
          syncing: false,
          lastSync: new Date(),
          ...status,
        }));
        updateSyncStatus();
        
        // Show success toast if operations were synced
        if (status.success > 0) {
          toast.success(`✅ Synced ${status.success} item${status.success !== 1 ? 's' : ''} to server`, {
            duration: 3000,
            icon: '🔄',
          });
        }
      } else if (status.status === 'error') {
        setSyncStatus(prev => ({ ...prev, syncing: false }));
        toast.error('Sync failed. Will retry automatically.', {
          duration: 4000,
        });
      } else if (status.status === 'online') {
        console.log('✅ Setting online status to TRUE');
        setSyncStatus(prev => ({ ...prev, online: true }));
        toast.success('Back online! Syncing your changes...', {
          duration: 2000,
          icon: '🌐',
        });
      } else if (status.status === 'offline') {
        console.log('❌ Setting online status to FALSE');
        setSyncStatus(prev => ({ ...prev, online: false }));
      }
    });

    // Also listen to browser's online/offline events directly
    const handleOnline = () => {
      console.log('🌐 Browser detected: ONLINE');
      setSyncStatus(prev => ({ ...prev, online: true }));
    };

    const handleOffline = () => {
      console.log('🌐 Browser detected: OFFLINE');
      setSyncStatus(prev => ({ ...prev, online: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update status periodically and also check online status
    const interval = setInterval(() => {
      if (!initError && initialized) {
        updateSyncStatus();
        // Also update online status in case it changed
        const currentOnlineStatus = navigator.onLine;
        setSyncStatus(prev => {
          if (prev.online !== currentOnlineStatus) {
            console.log(`📡 Online status changed: ${prev.online} -> ${currentOnlineStatus}`);
          }
          return { ...prev, online: currentOnlineStatus };
        });
      }
    }, 30000); // Every 30 seconds

    return () => {
      unsubscribe();
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      syncService.stopAutoSync();
    };
  }, [isAuthenticated, initialized, initError]);

  const updateSyncStatus = async () => {
    try {
      const status = await syncService.getSyncStatus();
      setSyncStatus(prev => ({
        ...prev,
        ...status,
      }));
    } catch (error) {
      console.error('Failed to update sync status:', error);
    }
  };

  const triggerSync = async () => {
    try {
      const result = await syncService.syncNow();
      await updateSyncStatus();
      // Dispatch custom event to notify components that sync completed
      window.dispatchEvent(new CustomEvent('syncCompleted', { detail: result }));
      return result;
    } catch (error) {
      console.error('Failed to trigger sync:', error);
      throw error;
    }
  };

  const triggerFullSync = async () => {
    try {
      const result = await syncService.fullSync();
      await updateSyncStatus();
      // Dispatch custom event to notify components that sync completed
      window.dispatchEvent(new CustomEvent('syncCompleted', { detail: result }));
      return result;
    } catch (error) {
      console.error('Failed to trigger full sync:', error);
      throw error;
    }
  };

  const getSyncLogs = async () => {
    try {
      const logs = await indexedDBService.getSyncLogs(20);
      setSyncHistory(logs);
      return logs;
    } catch (error) {
      console.error('Failed to get sync logs:', error);
      return [];
    }
  };

  const clearLocalData = async () => {
    try {
      await indexedDBService.clearAllData();
      await updateSyncStatus();
    } catch (error) {
      console.error('Failed to clear local data:', error);
      throw error;
    }
  };

  const value = {
    syncStatus,
    syncHistory,
    isOnline: syncStatus.online,
    isSyncing: syncStatus.syncing,
    hasPendingChanges: syncStatus.pendingOperations > 0,
    triggerSync,
    triggerFullSync,
    getSyncLogs,
    clearLocalData,
    updateSyncStatus,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};
