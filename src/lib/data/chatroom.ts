import type { ChatroomMap } from "../types";
import { supabase } from "../supabase";

export async function fetchChatrooms(username: string) {
  const { data, error } = await supabase.rpc("get_chatroom_data", {
    p_username: username,
  });
  const chatrooms: ChatroomMap = new Map();

  if (error) {
    console.error("Error fetching data : ", error);
    throw new Error("Failed to fetch Chatrooms");
  }

  if (!data) {
    console.log("No chatroom data returned from get_chatroom_data.");
    return chatrooms;
  }

  data.forEach((obj: Record<string, unknown>) => {
    const roomId = String(obj.id);
    const roomtitle = obj.title as string;
    const username = obj.username as string;
    const uid = obj.uid as string;
    const profilePic = obj.profile_pic as string;

    let room = chatrooms.get(roomId);

    if (!room) {
      room = {
        id: roomId,
        title: roomtitle,
        users: [],
      };
      chatrooms.set(roomId, room);
    }

    room.users.push({
      username: username,
      id: uid,
      profilePic: profilePic,
    });
  });

  return chatrooms;
}

export async function checkExistingChatroom(
  selectedFriend: string[],
  title?: string
) {
  title = title ? title : "";

  const { data } = await supabase.rpc("check_chatroom", {
    userid: selectedFriend,
    member_count: selectedFriend.length,
    p_title: title,
  });
  console.log("data[0]", data[0]);
  if (data[0]) {
    return data[0].chatroom_id;
  }
}

export async function insertChatroom(title?: string) {
  const { data, error } = await supabase
    .from("chatroom")
    .insert({ title: title })
    .select("id")
    .single();
  if (error) {
    console.error("Error inserting chatroom", error);
  } else {
    return data.id as string;
  }
}

export async function insertChatroomMember(
  insertingData: {
    chatroom_id: string;
    user_id: string;
  }[]
) {
  const { error } = await supabase
    .from("chatroom_member")
    .insert(insertingData);

  if (error) {
    return error;
  }
}

export async function enterChatroom(chatroomId: string, userId: string) {
  const { error } = await supabase.rpc("mark_chatroom_as_read", {
    p_chatroom_id: chatroomId,
    p_user_id: userId,
  });

  if (error) {
    console.error("Error marking messages as read", error);
  }
}

export async function fetchUnreadCountsByUserId(userId: string) {
  const { data, error } = await supabase.rpc("get_unread_message_counts", {
    p_user_id: userId,
  });
  if (error) {
    console.error("Error fetching unread counts:", error);
  } else {
    return data;
  }
}
