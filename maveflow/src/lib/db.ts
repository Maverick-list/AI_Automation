// ============================================
// MaveFlow - Database & Token Utilities
// ============================================
// Singleton Prisma Client for database connection pooling,
// and token utilities for refreshing and decrypting 
// Google tokens for background execution.

import { PrismaClient, User } from "@prisma/client";
import { encrypt, decrypt } from "@/lib/encryption";
import { auth } from "@/lib/auth";

// ── Prisma Client Singleton ─────────────────────────────────────

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// ── Server Session Helper ───────────────────────────────────────

/**
 * Gets the current authenticated user's ID from NextAuth.
 */
export async function getServerSessionUser() {
  const session = await auth();
  return session?.user;
}

/**
 * Gets the full user object from the database for the current session.
 */
export async function getCurrentDbUser(): Promise<User | null> {
  const sessionUser = await getServerSessionUser();
  if (!sessionUser?.id) return null;

  return db.user.findUnique({
    where: { id: sessionUser.id },
  });
}

// ── Google Token Utilities ──────────────────────────────────────

interface TokenResult {
  accessToken: string;
  isRefreshed: boolean;
}

/**
 * Refreshes the Google access token for a user.
 */
export async function refreshUserToken(
  user: User,
  refreshTokenStr: string
): Promise<string> {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Missing Google OAuth credentials");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshTokenStr,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${data.error_description || data.error}`);
  }

  const newExpiry = new Date(Date.now() + data.expires_in * 1000);

  // Update user with new token
  await db.user.update({
    where: { id: user.id },
    data: {
      encryptedAccessToken: encrypt(data.access_token),
      tokenExpiry: newExpiry,
      // Update refresh token if Google returned a new one
      ...(data.refresh_token && {
        encryptedRefreshToken: encrypt(data.refresh_token),
      }),
    },
  });

  return data.access_token;
}

/**
 * Retrieves a valid access token for a user, automatically refreshing
 * if the current one is expired or about to expire.
 */
export async function getValidAccessToken(userId: string): Promise<TokenResult> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      encryptedAccessToken: true,
      encryptedRefreshToken: true,
      tokenExpiry: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.encryptedAccessToken) {
    throw new Error("User has no connected Google account");
  }

  // Check if token is expired (or expires within 5 minutes)
  const isExpired =
    !user.tokenExpiry ||
    user.tokenExpiry.getTime() - Date.now() < 5 * 60 * 1000;

  if (isExpired) {
    if (!user.encryptedRefreshToken) {
      throw new Error("Access token expired and no refresh token available");
    }

    try {
      const refreshToken = decrypt(user.encryptedRefreshToken);
      const newAccessToken = await refreshUserToken(user as User, refreshToken);
      
      return { accessToken: newAccessToken, isRefreshed: true };
    } catch (error) {
      console.error(`Failed to refresh token for user ${userId}:`, error);
      throw error;
    }
  }

  // Token is still valid
  return {
    accessToken: decrypt(user.encryptedAccessToken),
    isRefreshed: false,
  };
}
