import { ERROR_MESSAGES } from "../lib/constants";

/**
 * Get the admin user ID from environment variable
 */
export function getAdminId(): string {
  const adminId = import.meta.env.VITE_ADMIN_USER_ID;
  if (!adminId) {
    console.error(ERROR_MESSAGES.ENV.ADMIN_ID_NOT_SET);
    return "";
  }
  return adminId;
}

/**
 * Check if a user is the admin
 */
export function isAdmin(userId: string): boolean {
  return userId === getAdminId();
}