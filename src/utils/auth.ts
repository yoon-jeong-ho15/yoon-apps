/**
 * Authentication business logic utilities
 * Following Toss frontend fundamentals - extract business logic
 */

import type { User as SupabaseUser } from "@supabase/supabase-js";

/**
 * Generate a username from Supabase user metadata
 * Follows a priority order: full_name > name > email prefix > default
 */
export function generateUsernameFromOAuthUser(
  supabaseUser: SupabaseUser
): string {
  // Priority 1: Full name from user metadata
  if (supabaseUser.user_metadata?.full_name) {
    return supabaseUser.user_metadata.full_name;
  }

  // Priority 2: Name from user metadata
  if (supabaseUser.user_metadata?.name) {
    return supabaseUser.user_metadata.name;
  }

  // Priority 3: Email prefix (before @)
  if (supabaseUser.email) {
    const emailPrefix = supabaseUser.email.split("@")[0];
    if (emailPrefix) {
      return emailPrefix;
    }
  }

  // Fallback: Default user
  return "User";
}

/**
 * Check if error message indicates invalid login credentials
 */
export function isInvalidCredentialsError(errorMessage: string): boolean {
  return errorMessage.includes("Invalid login credentials");
}
