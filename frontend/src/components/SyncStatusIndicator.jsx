import { useState, useEffect } from 'react';
import { useSync } from '../context/SyncContext';
import { useTranslation } from 'react-i18next';
import { FiWifi, FiWifiOff, FiRefreshCw, FiCheckCircle, FiAlertCircle, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SyncStatusIndicator = ({ showDetails = false }) => {
  const { t } = useTranslation('common');
  const { syncStatus, isOnline, isSyncing, hasPendingChanges, triggerSync } = useSync();
  const [showTooltip, setShowTooltip] = useState(false);
  const [lastSyncText, setLastSyncText] = useState('Never');

  useEffect(() => {
    if (syncStatus.lastSync) {
      const updateLastSyncText = () => {
        const now = new Date();
        const lastSync = new Date(syncStatus.lastSync);
        const diffMinutes = Math.floor((now - lastSync) / 60000);

        if (diffMinutes < 1) {
          setLastSyncText(t('time.just_now'));
        } else if (diffMinutes < 60) {
          setLastSyncText(t('time.minutes_ago', { count: diffMinutes }));
        } else if (diffMinutes < 1440) {
          const hours = Math.floor(diffMinutes / 60);
          setLastSyncText(t('time.hours_ago', { count: hours }));
        } else {
          const days = Math.floor(diffMinutes / 1440);
          setLastSyncText(t('time.days_ago', { count: days }));
        }
      };

      updateLastSyncText();
      const interval = setInterval(updateLastSyncText, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [syncStatus.lastSync, t]);

  const handleSyncClick = async () => {
    if (!isOnline) {
      toast.error(t('messages.network_error'));
      return;
    }

    if (isSyncing) {
      toast(t('sync.sync_in_progress'), { icon: '⏳' });
      return;
    }

    try {
      toast.loading(t('sync.sync_in_progress'), { id: 'sync' });
      const result = await triggerSync();
      
      if (result.success > 0) {
        toast.success(t('sync.sync_complete'), { id: 'sync' });
      } else {
        toast.success(t('sync.sync_complete'), { id: 'sync' });
      }
    } catch (error) {
      toast.error(t('sync.sync_failed'), { id: 'sync' });
    }
  };

  const getStatusIcon = () => {
    if (isSyncing) {
      return <FiRefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
    }
    if (!isOnline) {
      return <FiWifiOff className="w-4 h-4 text-red-500" />;
    }
    if (hasPendingChanges) {
      return <FiAlertCircle className="w-4 h-4 text-yellow-500" />;
    }
    return <FiCheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (isSyncing) return t('status.syncing');
    if (!isOnline) return t('status.offline');
    if (hasPendingChanges) return t('sync.pending_changes', { count: syncStatus.pendingOperations });
    return t('status.synced');
  };

  const getStatusColor = () => {
    if (isSyncing) return 'text-blue-600';
    if (!isOnline) return 'text-red-600';
    if (hasPendingChanges) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (!showDetails) {
    // Compact indicator for navbar
    return (
      <div className="relative">
        <button
          onClick={handleSyncClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
            isOnline 
              ? 'bg-white/10 hover:bg-white/20 text-white' 
              : 'bg-red-500/20 text-red-200 cursor-not-allowed'
          }`}
          disabled={isSyncing}
        >
          {getStatusIcon()}
          <div className="flex flex-col items-start">
            <span className="text-xs font-semibold leading-tight">
              {isOnline ? '🟢 Online' : '🔴 Offline'}
            </span>
            {hasPendingChanges && (
              <span className="text-[10px] opacity-75 leading-tight">
                {syncStatus.pendingOperations} pending
              </span>
            )}
          </div>
        </button>

        {showTooltip && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-base-100 text-base-content text-xs rounded-lg shadow-xl p-4 z-50 border border-base-300">
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-base-300">
                <span className="font-bold text-sm">Connection Status</span>
                <span className={`font-semibold px-2 py-1 rounded ${
                  isOnline ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
                }`}>
                  {isOnline ? '🟢 Online' : '🔴 Offline'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="opacity-60">Last sync:</span>
                <span className="font-semibold">{lastSyncText}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="opacity-60">Pending changes:</span>
                <span className={`font-semibold ${hasPendingChanges ? 'text-warning' : 'text-success'}`}>
                  {syncStatus.pendingOperations}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="opacity-60">Total surveys:</span>
                <span className="font-semibold">{syncStatus.totalSurveys}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="opacity-60">Unsynced surveys:</span>
                <span className={`font-semibold ${syncStatus.unsyncedSurveys > 0 ? 'text-warning' : 'text-success'}`}>
                  {syncStatus.unsyncedSurveys}
                </span>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-base-300">
              {isOnline ? (
                <div className="text-center">
                  <p className="opacity-60 mb-2">Click to sync now</p>
                  {isSyncing && (
                    <p className="text-info text-[10px]">Syncing in progress...</p>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-error font-medium">⚠️ Working Offline</p>
                  <p className="opacity-60 text-[10px] mt-1">
                    Changes are saved locally and will sync automatically when online
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Detailed card view
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Sync Status</h3>
        {getStatusIcon()}
      </div>

      <div className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center gap-3">
          {isOnline ? (
            <FiWifi className="w-5 h-5 text-green-500" />
          ) : (
            <FiWifiOff className="w-5 h-5 text-red-500" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">Connection</p>
            <p className={`text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        {/* Last Sync */}
        <div className="flex items-center gap-3">
          <FiClock className="w-5 h-5 text-gray-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">Last Sync</p>
            <p className="text-sm text-gray-600">{lastSyncText}</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs text-gray-500">Total Surveys</p>
            <p className="text-2xl font-bold text-gray-800">{syncStatus.totalSurveys}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Unsynced</p>
            <p className="text-2xl font-bold text-yellow-600">{syncStatus.unsyncedSurveys}</p>
          </div>
        </div>

        {/* Pending Operations */}
        {hasPendingChanges && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                {syncStatus.pendingOperations} operation(s) waiting to sync
              </p>
            </div>
          </div>
        )}

        {/* Sync Button */}
        <button
          onClick={handleSyncClick}
          disabled={!isOnline || isSyncing}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            isOnline && !isSyncing
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSyncing ? (
            <span className="flex items-center justify-center gap-2">
              <FiRefreshCw className="animate-spin" />
              Syncing...
            </span>
          ) : isOnline ? (
            'Sync Now'
          ) : (
            'Offline - Cannot Sync'
          )}
        </button>
      </div>
    </div>
  );
};

export default SyncStatusIndicator;
