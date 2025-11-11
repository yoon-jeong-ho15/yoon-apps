import type { Message } from "../types";
import { supabase } from "../supabase";

/**
 * Get the owner user ID from environment variable
 */
export function getOwnerId(): string {
  const ownerId = import.meta.env.VITE_OWNER_USER_ID;
  if (!ownerId) {
    console.error("VITE_OWNER_USER_ID is not set in environment variables");
    return "";
  }
  return ownerId;
}

/**
 * Check if a user is the owner
 */
export function isOwner(userId: string): boolean {
  return userId === getOwnerId();
}

/**
 * Fetch all messages with user information (for owner)
 * Joins with user table to get username and profile_pic
 */
export async function fetchAllMessages(): Promise<Message[]> {
  const { data, error } = await supabase
    .from("message")
    .select(`
      id,
      author_id,
      recipient_id,
      message,
      created_at,
      user:author_id (
        username,
        profile_pic
      )
    `)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching all messages:", error);
    return [];
  }

  // Flatten the joined user data
  return (data || []).map((msg: any) => ({
    id: msg.id,
    author_id: msg.author_id,
    recipient_id: msg.recipient_id,
    message: msg.message,
    created_at: msg.created_at,
    username: msg.user?.username,
    profile_pic: msg.user?.profile_pic,
  }));
}

/**
 * Fetch messages for a specific user conversation
 * Returns messages between the user and the owner
 */
export async function fetchMessagesByUserId(userId: string): Promise<Message[]> {
  const ownerId = getOwnerId();

  // Get messages where:
  // - User sent to owner (author=user, recipient=owner)
  // - Owner sent to user (author=owner, recipient=user)
  const { data, error } = await supabase
    .from("message")
    .select(`
      id,
      author_id,
      recipient_id,
      message,
      created_at,
      user:author_id (
        username,
        profile_pic
      )
    `)
    .or(`and(author_id.eq.${userId},recipient_id.eq.${ownerId}),and(author_id.eq.${ownerId},recipient_id.eq.${userId})`)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages for user:", error);
    return [];
  }

  // Flatten the joined user data
  return (data || []).map((msg: any) => ({
    id: msg.id,
    author_id: msg.author_id,
    recipient_id: msg.recipient_id,
    message: msg.message,
    created_at: msg.created_at,
    username: msg.user?.username,
    profile_pic: msg.user?.profile_pic,
  }));
}

/**
 * Insert a new message
 * @param authorId - The user sending the message
 * @param message - The message content
 * @param recipientId - Optional recipient ID. If not provided:
 *                      - Regular users always send to owner
 *                      - Owner must specify recipient
 */
export async function insertMessage(
  authorId: string,
  message: string,
  recipientId?: string
): Promise<string | null> {
  const ownerId = getOwnerId();

  // Determine recipient:
  // - If author is owner, recipient must be provided
  // - If author is regular user, recipient is always owner
  let finalRecipientId: string;

  if (isOwner(authorId)) {
    if (!recipientId) {
      console.error("Owner must specify recipient when sending message");
      return null;
    }
    finalRecipientId = recipientId;
  } else {
    // Regular user always sends to owner
    finalRecipientId = ownerId;
  }

  const { data, error } = await supabase
    .from("message")
    .insert({
      author_id: authorId,
      recipient_id: finalRecipientId,
      message: message,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error inserting message:", error);
    return null;
  }

  return data?.id || null;
}

/**
 * Get messages grouped by user (for owner view)
 * Returns a map of user_id -> messages
 */
export async function fetchMessagesGroupedByUser(): Promise<Map<string, Message[]>> {
  const messages = await fetchAllMessages();
  const grouped = new Map<string, Message[]>();

  messages.forEach((msg) => {
    if (!grouped.has(msg.author_id)) {
      grouped.set(msg.author_id, []);
    }
    grouped.get(msg.author_id)!.push(msg);
  });

  return grouped;
}
