import type { User, UserRow } from "../types";
import { supabase } from "../supabase";
import { transformUserRow, transformUserRows } from "../transformers";
import { ERROR_MESSAGES } from "../constants";

export async function fetchUserByUsername(username: string): Promise<User> {
  const { data, error } = await supabase
    .from("user")
    .select("*")
    .eq("username", username)
    .single();

  if (error) {
    console.error(ERROR_MESSAGES.USER.FETCH_ERROR, error);
    throw new Error(ERROR_MESSAGES.USER.FETCH_FAILED);
  }

  return transformUserRow(data as UserRow);
}

export async function fetchUsersByGroup(
  username: string
): Promise<User[]> {
  // Fetch all users except current user
  const query = supabase.from("user").select().neq("username", username);

  const { data, error } = await query;

  if (error) {
    console.error(ERROR_MESSAGES.USER.FETCH_ERROR, error);
    return [];
  }

  return transformUserRows((data || []) as UserRow[]);
}

export async function getUser(username: string): Promise<UserRow> {
  const { data, error } = await supabase
    .from("user")
    .select("*")
    .eq("username", username)
    .single();

  if (error) {
    console.error(ERROR_MESSAGES.USER.FETCH_FAILED, error);
    throw new Error(ERROR_MESSAGES.USER.FETCH_FAILED);
  }

  return data as UserRow;
}
