import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle } from 'lucide-react';

const Notifications = ({ notifications }) => {
  console.log("Notifications received:", notifications); // Log notifications for debugging
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`flex items-center p-4 rounded-lg shadow-lg ${
              notification.type === 'error'
                ? 'bg-red-500 text-white'
                : notification.type === 'success'
                ? 'bg-green-500 text-white'
                : notification.type === 'info'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-500 text-white'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            <p className="font-medium">{notification.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;
