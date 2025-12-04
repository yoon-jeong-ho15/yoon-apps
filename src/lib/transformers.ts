/**
 * Data transformation utilities
 * Following Toss frontend fundamentals - extract repeated logic
 */

import type { User } from "../types/user";
import type { MessageViewRow, Message } from "../types/message";
import type {
  Notification,
  NotificationRow,
  NotificationType,
} from "../types/notification";
import type { UserRow } from "../types/user";

/**
 * Transform database message view row to Message type
 * Centralizes the transformation logic to avoid duplication
 */
export function transformMessageViewRow(row: MessageViewRow): Message {
  return {
    id: row.id,
    author: {
      id: row.author_id,
      username: row.author_username,
      profile_img: row.author_profile_img,
    },
    recipient: {
      id: row.recipient_id,
      username: row.recipient_username,
      profile_img: row.recipient_profile_img,
    },
    message: row.message,
    created_at: row.created_at,
  };
}

/**
 * Transform multiple message view rows to Message array
 */
export function transformMessageViewRows(rows: MessageViewRow[]): Message[] {
  return rows.map(transformMessageViewRow);
}

/**
 * Transform database user row to User type
 * Handles snake_case to camelCase conversion
 */
export function transformUserRow(row: UserRow): User {
  return {
    id: row.id,
    username: row.username,
    profileImg: row.profile_img,
    email: row.email,
    provider: row.provider,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Transform multiple user rows to User array
 */
export function transformUserRows(rows: UserRow[]): User[] {
  return rows.map(transformUserRow);
}

/**
 * Transform database notification row to Notification type
 * Handles snake_case to camelCase conversion
 */
export function transformNotificationRow(row: NotificationRow): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type as NotificationType,
    title: row.title,
    content: row.content,
    relatedUserId: row.related_user_id,
    relatedMessageId: row.related_message_id,
    isRead: row.is_read,
    createdAt: row.created_at,
    readAt: row.read_at,
  };
}

/**
 * Transform multiple notification rows to Notification array
 */
export function transformNotificationRows(
  rows: NotificationRow[]
): Notification[] {
  return rows.map(transformNotificationRow);
}
