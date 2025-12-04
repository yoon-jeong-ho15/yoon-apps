import { useEffect, useState } from "react";
import {
  fetchNotificationsByUserId,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../lib/data/notification";
import type { Notification } from "../types/notification";
import { NOTIFICATION_POLLING_INTERVAL } from "../lib/constants";

export function useNotification(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!userId) return;

      const data = await fetchNotificationsByUserId(userId);
      setNotifications(data);
    };

    // Initial fetch
    loadNotifications();

    // Poll for updates
    const interval = setInterval(loadNotifications, NOTIFICATION_POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [userId]);

  const handleMarkAsRead = async (notificationId: string) => {
    const success = await markNotificationAsRead(notificationId);
    if (success) {
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId
            ? { ...notif, isRead: true, readAt: new Date().toISOString() }
            : notif
        )
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;

    const success = await markAllNotificationsAsRead(userId);
    if (success) {
      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          isRead: true,
          readAt: new Date().toISOString(),
        }))
      );
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    handleMarkAsRead,
    handleMarkAllAsRead,
  };
}
