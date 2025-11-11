import type { ChatMessage } from "../types";
import { supabase } from "../supabase";

export async function fetchChatsByChatroomId(chatroomId: string) {
  console.log("fetchChatsByChatroomId id : ", chatroomId);
  const { data, error } = await supabase.rpc(
    "get_chat_messages_with_read_status",
    {
      p_chatroom_id: chatroomId,
    }
  );

  if (error) {
    console.error(
      "Error fetching chats with read status:",
      JSON.stringify(error, null, 2)
    );
  }

  return data as ChatMessage[];
}

export async function insertChat(formData: FormData) {
  const { data, error } = await supabase
    .from("chat_message")
    .insert({
      chatroom: formData.get("chatroom"),
      user_id: formData.get("user_id"),
      message: formData.get("message"),
    })
    .select("id");

  if (error) {
    console.error("Error inserting chat message", error);
  } else {
    return data[0].id;
  }
}

export async function fetchChatById(id: string) {
  const { data, error } = await supabase
    .from("v_chat_message")
    .select("*")
    .eq("id", id);

  if (error) {
    console.error("Error fetching chat message", error);
  } else {
    return data[0] as ChatMessage;
  }
}

export async function updateReadStatusByMessageId(
  messageId: string,
  userId: string
) {
  const error = await supabase
    .from("chat_read_status")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("message_id", messageId)
    .is("read_at", null);

  if (error) {
    return error;
  }
}
