import { supabase } from "../supabase";
import type { Notification } from "../types";

export async function updateNotificationReadAtByMessageId(
  messageId: string,
  userId: string
) {
  const { error } = await supabase
    .from("notification")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("type", "chat_message")
    .filter("data->message_id", "eq", messageId)
    .is("read_at", null);

  if (error) {
    return error;
  }
}

export async function updateNotificationReadAt(notificationId: number) {
  const { error } = await supabase
    .from("notification")
    .update({ read_at: new Date(Date.now()).toISOString() })
    .eq("id", notificationId)
    .is("read_at", null);
  if (error) {
    return error;
  }
}

export async function fetchNotificationByUserId(userId: string) {
  const { data, error } = await supabase
    .from("notification")
    .select("*")
    .eq("user_id", userId)
    .is("read_at", null);
  if (error) {
    console.error("Error fetching notification", error);
  } else {
    return data as Notification[];
  }
}
