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
