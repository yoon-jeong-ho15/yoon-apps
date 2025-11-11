export type AuthUser = {
  id: string;
  username: string;
  password: string;
  from: string;
  profile_pic: string;
  friend_group: string;
};

export type User = {
  id: string;
  username: string;
  from: number;
  profilePic: string;
  friendGroup: string;
};

export type ChatroomUser = {
  username: string;
  id: string;
  profilePic: string;
};

export type Chatroom = {
  id: string;
  title: string;
  users: ChatroomUser[];
};

export type ChatroomMap = Map<string, Chatroom>;

export type ChatMessage = {
  id: string;
  created_at: string;
  username: string;
  user_id: string;
  message: string;
  chatroom: string;
  profile_pic: string;
  recipients_count: number;
  unread_count: number;
};

export type MessageDataForNotification = {
  message_id: number;
  chatroom_title: string;
  sender_username: string;
  message_preview: string;
};

export type Notification = {
  id: number;
  user_id: string;
  type: string;
  created_at: string;
  data: MessageDataForNotification;
  read_at?: string;
};

// Simple Message type for new message system
export type Message = {
  id: string;
  author_id: string;
  recipient_id: string;
  message: string;
  created_at: string;
  // Joined data from user table
  username?: string;
  profile_pic?: string;
};
