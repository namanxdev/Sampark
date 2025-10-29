import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiWifi, FiWifiOff, FiDatabase, FiRefreshCw, 
  FiCheckCircle, FiAlertCircle, FiTrash2, FiList
} from 'react-icons/fi';
import { useSync } from '../context/SyncContext';
import indexedDBService from '../services/indexedDBService';
import SyncStatusIndicator from '../components/SyncStatusIndicator';
import toast from 'react-hot-toast';

const OfflineDemo = () => {
  const { 
    syncStatus, 
    isOnline, 
    isSyncing, 
    hasPendingChanges,
    triggerSync,
    getSyncLogs,
    updateSyncStatus 
  } = useSync();

  const [logs, setLogs] = useState([]);
  const [pendingOps, setPendingOps] = useState([]);
  const [showPendingOps, setShowPendingOps] = useState(false);

  useEffect(() => {
    loadLogs();
    loadPendingOps();
  }, []);

  const loadLogs = async () => {
    const syncLogs = await getSyncLogs();
    setLogs(syncLogs);
  };

  const loadPendingOps = async () => {
    const ops = await indexedDBService.getPendingSyncOperations();
    setPendingOps(ops);
  };

  const handleSync = async () => {
    try {
      toast.loading('Syncing...', { id: 'sync' });
      const result = await triggerSync();
      
      if (result.success > 0) {
        toast.success(`Synced ${result.success} item(s)`, { id: 'sync' });
      } else {
        toast.success('All data is up to date', { id: 'sync' });
      }
      
      await loadLogs();
      await loadPendingOps();
      await updateSyncStatus();
    } catch (error) {
      toast.error('Sync failed: ' + error.message, { id: 'sync' });
    }
  };

  const handleCleanup = async () => {
    try {
      const deleted = await indexedDBService.cleanupCompletedSyncOperations(0);
      toast.success(`Cleaned up ${deleted} completed operations`);
      await loadPendingOps();
      await updateSyncStatus();
    } catch (error) {
      toast.error('Cleanup failed: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🔌 Offline-First Demo
          </h1>
          <p className="text-gray-600">
            Test the offline functionality and sync capabilities
          </p>
        </motion.div>

        {/* Main Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Connection Status Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Connection Status</h2>
              {isOnline ? (
                <FiWifi className="w-6 h-6 text-green-500" />
              ) : (
                <FiWifiOff className="w-6 h-6 text-red-500" />
              )}
            </div>

            <div className={`p-4 rounded-lg mb-4 ${
              isOnline 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${
                  isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`} />
                <div>
                  <p className={`font-bold ${
                    isOnline ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {isOnline ? '🟢 You are Online' : '🔴 You are Offline'}
                  </p>
                  <p className={`text-sm ${
                    isOnline ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isOnline 
                      ? 'Connected to server - changes sync automatically'
                      : 'Working offline - changes saved locally'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Sync Status</span>
                <span className={`font-semibold ${
                  isSyncing ? 'text-blue-600' : 
                  hasPendingChanges ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {isSyncing ? 'Syncing...' : 
                   hasPendingChanges ? 'Pending' : 'Up to date'}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Last Sync</span>
                <span className="font-semibold text-gray-800">
                  {syncStatus.lastSync 
                    ? new Date(syncStatus.lastSync).toLocaleString()
                    : 'Never'}
                </span>
              </div>
            </div>

            <button
              onClick={handleSync}
              disabled={!isOnline || isSyncing}
              className={`w-full mt-4 py-3 rounded-lg font-semibold transition-all ${
                isOnline && !isSyncing
                  ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSyncing ? (
                <span className="flex items-center justify-center gap-2">
                  <FiRefreshCw className="animate-spin" />
                  Syncing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FiRefreshCw />
                  Sync Now
                </span>
              )}
            </button>

            {!isOnline && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Tip:</strong> To test offline mode, open DevTools (F12) → 
                  Network tab → Change "Online" to "Offline"
                </p>
              </div>
            )}
          </motion.div>

          {/* Storage Statistics Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Local Storage</h2>
              <FiDatabase className="w-6 h-6 text-indigo-500" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Surveys</p>
                <p className="text-3xl font-bold text-blue-600">
                  {syncStatus.totalSurveys || 0}
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Unsynced</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {syncStatus.unsyncedSurveys || 0}
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Pending Ops</p>
                <p className="text-3xl font-bold text-purple-600">
                  {syncStatus.pendingOperations || 0}
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Sync Logs</p>
                <p className="text-3xl font-bold text-green-600">
                  {logs.length}
                </p>
              </div>
            </div>

            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <h3 className="font-semibold text-indigo-800 mb-2">How it works:</h3>
              <ul className="text-sm text-indigo-700 space-y-1">
                <li>✓ All data saved to IndexedDB first</li>
                <li>✓ Works completely offline</li>
                <li>✓ Auto-sync when online (every 60s)</li>
                <li>✓ Manual sync anytime</li>
                <li>✓ Conflict resolution built-in</li>
              </ul>
            </div>

            <button
              onClick={() => setShowPendingOps(!showPendingOps)}
              className="btn btn-outline btn-sm w-full mt-4"
            >
              <FiList className="mr-2" />
              {showPendingOps ? 'Hide' : 'Show'} Pending Operations
            </button>
          </motion.div>
        </div>

        {/* Pending Operations Card */}
        {showPendingOps && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Pending Sync Operations ({pendingOps.length})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={loadPendingOps}
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <FiRefreshCw className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowPendingOps(false)}
                  className="text-gray-600 hover:text-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {pendingOps.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FiCheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p className="font-semibold">All caught up!</p>
                <p className="text-sm">No pending sync operations</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {pendingOps.map((op, index) => (
                  <div
                    key={op.id || index}
                    className="p-3 rounded-lg border bg-yellow-50 border-yellow-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-yellow-800 uppercase text-sm">
                            {op.action}
                          </span>
                          {op.synced ? (
                            <span className="badge badge-sm badge-success">Synced</span>
                          ) : (
                            <span className="badge badge-sm badge-warning">Pending</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">
                          Created: {new Date(op.timestamp).toLocaleString()}
                        </p>
                        {op.attempts > 0 && (
                          <p className="text-xs text-red-600 mt-1">
                            Failed attempts: {op.attempts}
                          </p>
                        )}
                        {op.last_error && (
                          <p className="text-xs text-red-600 mt-1">
                            Error: {op.last_error}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {op.local_id?.slice(-8) || op.id}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t flex gap-2">
              <button
                onClick={handleCleanup}
                className="btn btn-sm btn-outline flex-1"
              >
                <FiTrash2 className="mr-1" />
                Clean Completed
              </button>
              <button
                onClick={handleSync}
                disabled={!isOnline}
                className="btn btn-sm btn-primary flex-1"
              >
                <FiRefreshCw className="mr-1" />
                Sync Now
              </button>
            </div>
          </motion.div>
        )}

        {/* Sync Logs Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Sync Activity</h2>
            <button
              onClick={loadLogs}
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              <FiRefreshCw className="w-5 h-5" />
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FiAlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No sync activity yet</p>
              <p className="text-sm">Create or edit surveys to see sync logs</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {logs.map((log, index) => (
                <div
                  key={log.id || index}
                  className={`p-3 rounded-lg border ${
                    log.status === 'success'
                      ? 'bg-green-50 border-green-200'
                      : log.status === 'error'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {log.status === 'success' ? (
                      <FiCheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : log.status === 'error' ? (
                      <FiAlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    ) : (
                      <FiRefreshCw className="w-5 h-5 text-yellow-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`font-semibold text-sm ${
                        log.status === 'success'
                          ? 'text-green-800'
                          : log.status === 'error'
                          ? 'text-red-800'
                          : 'text-yellow-800'
                      }`}>
                        {log.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                      {log.details && (
                        <div className="text-xs mt-2 opacity-75">
                          {log.details.success && (
                            <span className="mr-3">✓ {log.details.success} synced</span>
                          )}
                          {log.details.failed > 0 && (
                            <span>✗ {log.details.failed} failed</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Instructions Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold mb-4">🧪 Testing Guide</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="text-3xl mb-2">1️⃣</div>
              <h3 className="font-bold mb-2">Go Offline</h3>
              <p className="text-sm opacity-90">
                Open DevTools (F12) → Network tab → Select "Offline" from dropdown
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="text-3xl mb-2">2️⃣</div>
              <h3 className="font-bold mb-2">Create Surveys</h3>
              <p className="text-sm opacity-90">
                Create or edit surveys while offline - they'll be saved locally
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="text-3xl mb-2">3️⃣</div>
              <h3 className="font-bold mb-2">Go Online</h3>
              <p className="text-sm opacity-90">
                Change back to "Online" - watch automatic sync happen!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OfflineDemo;
