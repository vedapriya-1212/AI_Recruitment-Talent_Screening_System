import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (title: string, message: string, type?: AppNotification['type']) => void;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'init-1',
      title: 'Interview Scheduled',
      message: 'Your interview for Senior React Architect has been scheduled with Tech Lead.',
      timestamp: 'Just now',
      read: false,
      type: 'info',
    },
    {
      id: 'init-2',
      title: 'Application Shortlisted',
      message: 'Your application for the Security Operations Lead role has been shortlisted.',
      timestamp: '10m ago',
      read: false,
      type: 'success',
    },
    {
      id: 'init-3',
      title: 'Profile Viewed',
      message: 'A recruiter from ZeroTrust Lab viewed your indexed profile skills.',
      timestamp: '2h ago',
      read: true,
      type: 'info',
    },
    {
      id: 'init-4',
      title: 'Application Rejected',
      message: 'Unfortunately, your application for the Junior Python Engineer role was rejected.',
      timestamp: '1d ago',
      read: true,
      type: 'error',
    },
  ]);

  const addNotification = (title: string, message: string, type: AppNotification['type'] = 'info') => {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      message,
      timestamp: 'Just now',
      read: false,
      type,
    };

    setNotifications((prev) => [newNotif, ...prev]);

    // Sonner popup alerts
    if (type === 'success') {
      toast.success(title, { description: message });
    } else if (type === 'error') {
      toast.error(title, { description: message });
    } else if (type === 'warning') {
      toast.warning(title, { description: message });
    } else {
      toast(title, { description: message });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        deleteNotification,
        markAllAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
