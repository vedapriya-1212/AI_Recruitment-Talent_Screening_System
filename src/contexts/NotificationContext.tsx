import React, { createContext, useContext, useState, useEffect } from 'react';
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

const STORAGE_KEY = 'app_notifications_sync';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse notifications', e);
    }
    return [
      {
        id: 'init-1',
        title: 'Welcome to AI ATS',
        message: 'Your profile has been indexed by the neural match engine.',
        timestamp: 'Just now',
        read: false,
        type: 'info',
      }
    ];
  });

  // Sync to localStorage whenever notifications change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // Listen to cross-tab changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          // Check if there are new unread notifications to trigger a toast
          const oldUnread = notifications.filter(n => !n.read).map(n => n.id);
          const newUnreads = parsed.filter((n: AppNotification) => !n.read && !oldUnread.includes(n.id));
          
          setNotifications(parsed);
          
          // Fire toasts for new cross-tab notifications
          newUnreads.forEach((n: AppNotification) => {
            if (n.type === 'success') toast.success(n.title, { description: n.message });
            else if (n.type === 'error') toast.error(n.title, { description: n.message });
            else if (n.type === 'warning') toast.warning(n.title, { description: n.message });
            else toast(n.title, { description: n.message });
          });
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [notifications]);

  const addNotification = (title: string, message: string, type: AppNotification['type'] = 'info') => {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      type,
    };

    setNotifications((prev) => {
      const next = [newNotif, ...prev];
      return next;
    });

    // Local tab toast
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
