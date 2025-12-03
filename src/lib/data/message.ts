import type { Message, MessageViewRow } from "../../types/message";
import { supabase } from "../supabase";
import { transformMessageViewRows } from "../transformers";
import { ERROR_MESSAGES } from "../constants";
import { getAdminId, isAdmin } from "../../utils/user";

/**
 * Fetch all messages with user information (for admin)
 * Joins with user table to get username and profile_pic
 */
export async function fetchAllMessages(): Promise<Message[]> {
  const { data, error } = await supabase
    .from("v_message")
    .select(
      `
      id,
      author_id,
      author_username,
      author_profile_pic,
      recipient_id,
      recipient_username,
      recipient_profile_pic,
      message,
      created_at
    `
    )
    .order("created_at", { ascending: true });

  if (error) {
    console.error(ERROR_MESSAGES.MESSAGE.FETCH_ERROR, error);
    return [];
  }

  // Return data from v_message view, transforming to nested structure
  return transformMessageViewRows((data || []) as MessageViewRow[]);
}

/**
 * Fetch messages for a specific user conversation
 * Returns messages between the user and the admin
 */
export async function fetchMessagesByUserId(
  userId: string
): Promise<Message[]> {
  const adminId = getAdminId();

  // Get messages where:
  // - User sent to admin (author=user, recipient=admin)
  // - Admin sent to user (author=admin, recipient=user)
  const { data, error } = await supabase
    .from("v_message")
    .select(
      `
      id,
      author_id,
      author_username,
      author_profile_pic,
      recipient_id,
      recipient_username,
      recipient_profile_pic,
      message,
      created_at
    `
    )
    .or(
      `and(author_id.eq.${userId},recipient_id.eq.${adminId}),and(author_id.eq.${adminId},recipient_id.eq.${userId})`
    )
    .order("created_at", { ascending: true });

  if (error) {
    console.error(ERROR_MESSAGES.MESSAGE.FETCH_ERROR, error);
    return [];
  }

  // Return data from v_message view, transforming to nested structure
  return transformMessageViewRows((data || []) as MessageViewRow[]);
}

/**
 * Insert a new message
 * @param authorId - The user sending the message
 * @param message - The message content
 * @param recipientId - Optional recipient ID. If not provided:
 *                      - Regular users always send to admin
 *                      - Admin must specify recipient
 */
export async function insertMessage(
  authorId: string,
  message: string,
  recipientId?: string
): Promise<string | null> {
  const adminId = getAdminId();

  // Determine recipient:
  // - If author is admin, recipient must be provided
  // - If author is regular user, recipient is always admin
  let finalRecipientId: string;

  if (isAdmin(authorId)) {
    if (!recipientId) {
      console.error(ERROR_MESSAGES.MESSAGE.ADMIN_MUST_SPECIFY_RECIPIENT);
      return null;
    }
    finalRecipientId = recipientId;
  } else {
    // Regular user always sends to admin
    finalRecipientId = adminId;
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
 * Get messages grouped by user (for admin view)
 * Returns a map of user_id -> messages
 */
export async function fetchMessagesGroupedByUser(): Promise<
  Map<string, Message[]>
> {
  const messages = await fetchAllMessages();
  const grouped = new Map<string, Message[]>();

  messages.forEach((msg) => {
    if (!grouped.has(msg.author.id)) {
      grouped.set(msg.author.id, []);
    }
    grouped.get(msg.author.id)!.push(msg);
  });

  return grouped;
}
