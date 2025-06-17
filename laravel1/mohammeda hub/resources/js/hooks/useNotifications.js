import { useState, useCallback } from 'react';

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, type = 'error') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);

    // Remove notification after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, 3000);
  }, []);

  return {
    notifications,
    showNotification
  };
};

export default useNotifications;