import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    const toast = { id, message, type };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const fetchNotifications = useCallback(async (userId) => {
    if (!userId) return;
    try {
      setLoading(true);
      const [listRes, countRes] = await Promise.all([
        api.get(ENDPOINTS.notifications.list(userId)),
        api.get(ENDPOINTS.notifications.unreadCount(userId)),
      ]);
      setNotifications(listRes.data);
      setUnreadCount(countRes.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id) => {
    try {
      await api.put(ENDPOINTS.notifications.markRead(id));
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async (userId) => {
    if (!userId) return;
    try {
      await api.put(ENDPOINTS.notifications.markAllRead(userId));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    toasts,
    showToast,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}