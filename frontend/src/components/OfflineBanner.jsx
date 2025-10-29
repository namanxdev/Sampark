import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiWifiOff, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { useSync } from '../context/SyncContext';

const OfflineBanner = () => {
  const { isOnline, hasPendingChanges, syncStatus } = useSync();
  const [showBanner, setShowBanner] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true);
      setWasOffline(true);
      setShowBackOnline(false);
    } else {
      setShowBanner(false);
      
      // Show "back online" message if was previously offline
      if (wasOffline) {
        setShowBackOnline(true);
        setTimeout(() => {
          setShowBackOnline(false);
          setWasOffline(false);
        }, 5000); // Hide after 5 seconds
      }
    }
  }, [isOnline, wasOffline]);

  return (
    <>
      {/* Offline Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg"
          >
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FiWifiOff className="w-6 h-6 animate-pulse" />
                  <div>
                    <p className="font-bold text-sm md:text-base">
                      🔴 You are currently offline
                    </p>
                    <p className="text-xs md:text-sm opacity-90">
                      Don't worry! Your changes are being saved locally and will sync automatically when you're back online.
                    </p>
                  </div>
                </div>
                
                {hasPendingChanges && (
                  <div className="hidden md:flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                    <FiAlertCircle className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      {syncStatus.pendingOperations} pending change{syncStatus.pendingOperations !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back Online Banner */}
      <AnimatePresence>
        {showBackOnline && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
          >
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center gap-3">
                <FiCheck className="w-6 h-6" />
                <div>
                  <p className="font-bold text-sm md:text-base">
                    🟢 You're back online!
                  </p>
                  <p className="text-xs md:text-sm opacity-90">
                    {hasPendingChanges 
                      ? `Syncing ${syncStatus.pendingOperations} pending change${syncStatus.pendingOperations !== 1 ? 's' : ''}...`
                      : 'All your data is up to date.'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default OfflineBanner;
