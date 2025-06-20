"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// Re-define Notification type here or import from a shared types file
export interface Notification {
  id: string;
  title: string;
  description?: string;
  timestamp: string; // ISO string date
  read: boolean;
  // Potentially add 'type': 'info' | 'success' | 'warning' | 'error' later
}

interface NotificationsContextType {
  notifications: Notification[];
  addNotification: (notificationData: { title: string; description?: string }) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  // markAsRead: (id: string) => void; // For future implementation
  // markAllAsRead: () => void; // For future implementation
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = (): NotificationsContextType => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notificationData: { title: string; description?: string }) => {
    const newNotification: Notification = {
      id: uuidv4(),
      ...notificationData,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prevNotifications => [newNotification, ...prevNotifications].slice(0, 50)); // Keep max 50 notifications
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prevNotifications => prevNotifications.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Placeholder for future markAsRead functionality
  // const markAsRead = useCallback((id: string) => {
  //   setNotifications(prevNotifications =>
  //     prevNotifications.map(n => (n.id === id ? { ...n, read: true } : n))
  //   );
  // }, []);

  // const markAllAsRead = useCallback(() => {
  //   setNotifications(prevNotifications =>
  //     prevNotifications.map(n => ({ ...n, read: true }))
  //   );
  // }, []);


  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
        // markAsRead,
        // markAllAsRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
