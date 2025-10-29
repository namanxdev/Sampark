import { useState, useEffect } from 'react';

/**
 * Hook to detect online/offline status
 * @returns {boolean} isOnline - true if online, false if offline
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      console.log('Network: ONLINE');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('Network: OFFLINE');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

/**
 * Hook to show a toast when online/offline status changes
 */
export const useOnlineStatusNotification = (toast) => {
  const isOnline = useOnlineStatus();
  const [wasOffline, setWasOffline] = useState(!navigator.onLine);

  useEffect(() => {
    if (!isOnline && !wasOffline) {
      toast.error('You are now offline. Changes will be saved locally.', {
        duration: 5000,
        icon: '🔴',
      });
      setWasOffline(true);
    } else if (isOnline && wasOffline) {
      toast.success('You are back online! Syncing changes...', {
        duration: 3000,
        icon: '🟢',
      });
      setWasOffline(false);
    }
  }, [isOnline, wasOffline, toast]);

  return isOnline;
};
