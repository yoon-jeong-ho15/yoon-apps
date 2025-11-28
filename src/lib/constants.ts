/**
 * Application constants
 * Following Toss frontend fundamentals - avoid magic numbers
 */

// Polling intervals (in milliseconds)
export const MESSAGE_POLLING_INTERVAL = 180_000; // 3 minutes
export const NOTIFICATION_POLLING_INTERVAL = 30_000; // 30 seconds
export const MINUTES_TO_MS = 60_000;

// Time calculations
export const calculateMinutesToMs = (minutes: number) => minutes * MINUTES_TO_MS;

// Message constraints
export const MESSAGE_MAX_LENGTH = 1000;
export const MESSAGE_MIN_LENGTH = 1;

// Profile image sizes
export const PROFILE_IMAGE_SIZE = {
  SMALL: "w-8 h-8",
  MEDIUM: "w-16 h-16",
  LARGE: "w-24 h-24",
} as const;

// Error messages
export const ERROR_MESSAGES = {
  AUTH: {
    EMAIL_PASSWORD_REQUIRED: "이메일과 비밀번호를 입력해주세요.",
    INVALID_CREDENTIALS: "이메일 또는 비밀번호가 올바르지 않습니다.",
    LOGIN_FAILED: "로그인에 실패했습니다.",
    LOGIN_ERROR: "로그인 중 오류가 발생했습니다.",
    GOOGLE_LOGIN_ERROR: "Google 로그인 중 오류가 발생했습니다.",
    ALL_FIELDS_REQUIRED: "모든 필드를 입력해주세요.",
    SIGNUP_FAILED: "회원가입에 실패했습니다.",
    SIGNUP_ERROR: "회원가입 중 오류가 발생했습니다.",
    PROFILE_CREATE_FAILED: "프로필 생성에 실패했습니다.",
  },
  MESSAGE: {
    SEND_FAILED: "Failed to send message. Please try again.",
    SEND_ERROR: "An error occurred while sending the message.",
    ADMIN_MUST_SPECIFY_RECIPIENT: "Admin must specify recipient when sending message",
    FETCH_ERROR: "Error fetching messages",
    MESSAGE_REQUIRED: "메시지를 입력해주세요.",
    MESSAGE_TOO_LONG: `메시지는 ${MESSAGE_MAX_LENGTH}자를 초과할 수 없습니다.`,
  },
  USER: {
    FETCH_FAILED: "Failed to fetch user",
    FETCH_ERROR: "Error fetching user",
  },
  NOTIFICATION: {
    FETCH_ERROR: "Error fetching notifications",
    UPDATE_ERROR: "Error updating notification",
    MARK_READ_ERROR: "Error marking notification as read",
    MARK_ALL_READ_ERROR: "Error marking all notifications as read",
    CREATE_ERROR: "Error creating notification",
  },
  ENV: {
    ADMIN_ID_NOT_SET: "VITE_ADMIN_USER_ID is not set in environment variables",
  },
} as const;

// UI Text
export const UI_TEXT = {
  MESSAGE: {
    NO_MESSAGES: "No messages yet. Start the conversation!",
    PLACEHOLDER: "Type your message...",
    SEND: "Send",
    SENDING: "Sending...",
  },
  AUTH: {
    UNKNOWN_USER: "Unknown User",
  },
} as const;
