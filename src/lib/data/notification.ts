/**
 * Notification database operations
 * Handles all database queries related to notifications
 */

import { supabase } from "../supabase";
import type {
  Notification,
  NotificationRow,
  NotificationType,
} from "../../types/notification";
import { transformNotificationRows } from "../transformers";
import { ERROR_MESSAGES } from "../constants";

/**
 * Fetch all notifications for a specific user
 * @param userId - The user ID to fetch notifications for
 * @returns Promise<Notification[]> - Array of notifications
 */
export async function fetchNotificationsByUserId(
  userId: string
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notification")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(ERROR_MESSAGES.NOTIFICATION.FETCH_ERROR, error);
    return [];
  }

  return transformNotificationRows((data || []) as NotificationRow[]);
}

/**
 * Fetch unread notifications for a specific user
 * @param userId - The user ID to fetch unread notifications for
 * @returns Promise<Notification[]> - Array of unread notifications
 */
export async function fetchUnreadNotifications(
  userId: string
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notification")
    .select("*")
    .eq("user_id", userId)
    .eq("is_read", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(ERROR_MESSAGES.NOTIFICATION.FETCH_ERROR, error);
    return [];
  }

  return transformNotificationRows((data || []) as NotificationRow[]);
}

/**
 * Get the count of unread notifications for a user
 * @param userId - The user ID to count unread notifications for
 * @returns Promise<number> - Count of unread notifications
 */
export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("notification")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    console.error(ERROR_MESSAGES.NOTIFICATION.FETCH_ERROR, error);
    return 0;
  }

  return count || 0;
}

/**
 * Mark a specific notification as read
 * @param notificationId - The notification ID to mark as read
 * @returns Promise<boolean> - True if successful, false otherwise
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("notification")
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq("id", notificationId);

  if (error) {
    console.error(ERROR_MESSAGES.NOTIFICATION.MARK_READ_ERROR, error);
    return false;
  }

  return true;
}

/**
 * Mark all notifications as read for a user
 * @param userId - The user ID to mark all notifications as read for
 * @returns Promise<boolean> - True if successful, false otherwise
 */
export async function markAllNotificationsAsRead(
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("notification")
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    console.error(ERROR_MESSAGES.NOTIFICATION.MARK_ALL_READ_ERROR, error);
    return false;
  }

  return true;
}

/**
 * Create a new notification
 * @param userId - The user ID to create notification for
 * @param type - The type of notification
 * @param title - The notification title
 * @param content - Optional notification content
 * @param relatedUserId - Optional related user ID
 * @param relatedMessageId - Optional related message ID
 * @returns Promise<string | null> - The created notification ID or null if failed
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  content?: string,
  relatedUserId?: string,
  relatedMessageId?: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("notification")
    .insert({
      user_id: userId,
      type,
      title,
      content: content || null,
      related_user_id: relatedUserId || null,
      related_message_id: relatedMessageId || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error(ERROR_MESSAGES.NOTIFICATION.CREATE_ERROR, error);
    return null;
  }

  return data?.id || null;
}

/**
 * Delete a notification
 * @param notificationId - The notification ID to delete
 * @returns Promise<boolean> - True if successful, false otherwise
 */
export async function deleteNotification(
  notificationId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("notification")
    .delete()
    .eq("id", notificationId);

  if (error) {
    console.error("Error deleting notification:", error);
    return false;
  }

  return true;
}

/**
 * Delete all read notifications for a user
 * @param userId - The user ID to delete read notifications for
 * @returns Promise<boolean> - True if successful, false otherwise
 */
export async function deleteReadNotifications(
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("notification")
    .delete()
    .eq("user_id", userId)
    .eq("is_read", true);

  if (error) {
    console.error("Error deleting read notifications:", error);
    return false;
  }

  return true;
}
