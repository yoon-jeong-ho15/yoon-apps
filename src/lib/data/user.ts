import type { User } from "../types";
import { supabase } from "../supabase";

export async function fetchUserByUsername(username: string) {
  const { data, error } = await supabase
    .from("user")
    .select("*")
    .eq("username", username);
  if (error) {
    console.error("Error fetching data", error);
    throw new Error("Failed to fetch user by username");
  } else {
    const user: User = {
      id: data[0].id,
      username: data[0].username,
      from: data[0].from,
      profilePic: data[0].profile_pic,
      friendGroup: data[0].friend_group,
    };
    return user;
  }
}

export async function fetchUsersByGroup(group: string, username: string) {
  console.log("username : ", username, "group : ", group);
  console.log(typeof group);
  let query = supabase
    .from("user")
    .select()
    .or(`friend_group.eq.${group}, friend_group.eq.0`)
    .neq("username", username);

  if (group + "" === "0") {
    query = supabase.from("user").select().neq("username", username);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching users by group", error);
  } else {
    return data as User[];
  }
}

export async function getUser(username: string) {
  const { data: user, error } = await supabase
    .from("user")
    .select("*")
    .eq("username", username);

  if (error) {
    console.error("Failed to fetch user", error);
    throw new Error("Failed to fetch user.");
  }
  return user[0];
}
