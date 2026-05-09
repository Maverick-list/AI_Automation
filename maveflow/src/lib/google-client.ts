// ============================================
// MaveFlow - Google Client Factory
// ============================================
// Provides authenticated OAuth2 instances for Google APIs
// Automatically refreshes tokens behind the scenes.

import { google, Auth } from "googleapis";
import { getValidAccessToken } from "@/lib/db";

/**
 * Retrieves an authenticated Google OAuth2 client for a specific user.
 * Automatically handles token refresh via the database layer.
 * 
 * @param userId - The ID of the user in the database
 * @returns Authenticated OAuth2Client
 */
export async function getGoogleAuth(userId: string): Promise<Auth.OAuth2Client> {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth credentials are not configured.");
  }

  // Uses db.ts helper which automatically refreshes if expired
  const { accessToken } = await getValidAccessToken(userId);

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
  );

  oauth2Client.setCredentials({ access_token: accessToken });

  return oauth2Client;
}

/**
 * Revokes the Google token for a user.
 * @param userId - The ID of the user
 */
export async function revokeGoogleToken(userId: string): Promise<boolean> {
  try {
    const { accessToken } = await getValidAccessToken(userId);
    const oauth2Client = new google.auth.OAuth2();
    await oauth2Client.revokeToken(accessToken);
    return true;
  } catch (error) {
    console.error(`Failed to revoke token for user ${userId}:`, error);
    return false;
  }
}
