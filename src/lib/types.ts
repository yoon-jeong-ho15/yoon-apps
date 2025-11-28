export type AuthUser = {
  id: string;
  username: string;
  profile_pic: string;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: string;
  username: string;
  profilePic: string;
  createdAt : string;
  updatedAt : string;
};

// Database view response type for v_message
// Direct mapping from database with snake_case fields
export type MessageViewRow = {
  id: string;
  author_id: string;
  author_username: string;
  author_profile_pic: string;
  recipient_id: string;
  recipient_username: string;
  recipient_profile_pic: string;
  message: string;
  created_at: string;
};

// Database table response type for user table
export type UserRow = {
  id: string;
  username: string;
  profile_pic: string;
  created_at: string;
  updated_at: string;
};

// Simple Message type for new message system
// Maps to v_message view which includes username fields from joins
export type Message = {
  id: string;
  author: {
    id: string;
    username: string;
    profile_pic: string;
  };
  recipient: {
    id: string;
    username: string;
    profile_pic: string;
  };
  message: string;
  created_at: string;
};

// Notification type - represents the notification table in database
export type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  content: string | null;
  related_user_id: string | null;
  related_message_id: string | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
};

// Transformed notification type with camelCase for frontend use
export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string | null;
  relatedUserId: string | null;
  relatedMessageId: string | null;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
};

// Notification types enum
export type NotificationType =
  | "new_message"
  | "message_reply"
  | "friend_request"
  | "system";
