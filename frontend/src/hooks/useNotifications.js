import { useNotifications as useNotificationsContext } from '../contexts/NotificationContext';

export function useNotifications() {
  return useNotificationsContext();
}