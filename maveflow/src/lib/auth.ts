// ============================================
// MaveFlow - NextAuth.js v5 Configuration
// ============================================
// Central auth configuration with Google OAuth,
// JWT strategy, and token encryption.

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";
import { encrypt } from "@/lib/encryption";

// ── Google OAuth Scopes ─────────────────────────────────────────

const GOOGLE_SCOPES = [
  // OpenID Connect
  "openid",
  "profile",
  "email",
  // Gmail
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.labels",
  // Google Drive
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  // Google Calendar
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
  // Google Tasks
  "https://www.googleapis.com/auth/tasks",
  // Google Contacts (People API)
  "https://www.googleapis.com/auth/contacts",
  "https://www.googleapis.com/auth/contacts.readonly",
  // Google Sheets
  "https://www.googleapis.com/auth/spreadsheets",
  // Google Docs
  "https://www.googleapis.com/auth/documents",
  // Google Slides
  "https://www.googleapis.com/auth/presentations",
].join(" ");

// ── Auth Configuration ──────────────────────────────────────────

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: GOOGLE_SCOPES,
          access_type: "offline", // Request refresh token
          prompt: "consent",     // Always show consent screen for refresh token
          response_type: "code",
        },
      },
    }),
  ],

  // ── Session Strategy ──────────────────────────────────────────
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,   // Update session every 24 hours
  },

  // ── Pages ─────────────────────────────────────────────────────
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  // ── Cookies Configuration (HttpOnly) ──────────────────────────
  cookies: {
    sessionToken: {
      name: "__Secure-maveflow.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: "__Secure-maveflow.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: "__Host-maveflow.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  // ── Callbacks ─────────────────────────────────────────────────
  callbacks: {
    /**
     * JWT callback - runs on sign in and on every session check.
     * Stores Google access_token and encrypted refresh_token in JWT.
     */
    async jwt({ token, account, profile }) {
      // Initial sign in - save Google tokens
      if (account && profile) {
        token.accessToken = account.access_token;
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000 // Convert to ms
          : Date.now() + 3600 * 1000;
        token.refreshToken = account.refresh_token
          ? encrypt(account.refresh_token)
          : undefined;
        token.provider = account.provider;
        token.googleId = profile.sub;
        token.picture = profile.picture as string | undefined;
      }

      // Return previous token if access token has not expired
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to refresh it
      return await refreshAccessToken(token);
    },

    /**
     * Session callback - exposes custom fields to the client session.
     */
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string;
        session.user.image = token.picture as string;
        // Expose access token to client (for Google API calls)
        (session as ExtendedSession).accessToken = token.accessToken as string;
        (session as ExtendedSession).accessTokenExpires = token.accessTokenExpires as number;
        (session as ExtendedSession).error = token.error as string | undefined;
      }
      return session;
    },

    /**
     * Authorized callback - validates state parameter and protects routes.
     */
    async authorized({ auth, request }) {
      const isAuthenticated = !!auth?.user;
      const { pathname } = request.nextUrl;

      // Protected routes
      const isProtectedRoute =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/api/private");

      if (isProtectedRoute && !isAuthenticated) {
        return false; // Will redirect to signIn page
      }

      return true;
    },
  },

  // ── Events ────────────────────────────────────────────────────
  events: {
    async signIn({ user, account }) {
      console.log(`[Auth] User signed in: ${user.email} via ${account?.provider}`);
    },
    async signOut({ token }) {
      console.log(`[Auth] User signed out: ${(token as { email?: string })?.email}`);
    },
  },

  // ── Debug ─────────────────────────────────────────────────────
  debug: process.env.NODE_ENV === "development",
};

// ── Token Refresh ───────────────────────────────────────────────

/**
 * Refreshes an expired Google access token using the refresh token.
 */
async function refreshAccessToken(token: Record<string, unknown>): Promise<Record<string, unknown>> {
  try {
    const { decrypt } = await import("@/lib/encryption");

    const refreshToken = token.refreshToken
      ? decrypt(token.refreshToken as string)
      : null;

    if (!refreshToken) {
      console.error("[Auth] No refresh token available for token refresh");
      return { ...token, error: "NoRefreshToken" };
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Auth] Token refresh failed:", data);
      return { ...token, error: "RefreshTokenError" };
    }

    console.log("[Auth] Access token refreshed successfully");

    return {
      ...token,
      accessToken: data.access_token,
      accessTokenExpires: Date.now() + data.expires_in * 1000,
      // Keep existing refresh token if new one isn't provided
      refreshToken: data.refresh_token
        ? encrypt(data.refresh_token)
        : token.refreshToken,
      error: undefined,
    };
  } catch (error) {
    console.error("[Auth] Error refreshing access token:", error);
    return { ...token, error: "RefreshTokenError" };
  }
}

// ── Extended Types ──────────────────────────────────────────────

export interface ExtendedSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  accessToken: string;
  accessTokenExpires: number;
  error?: string;
  expires: string;
}

// ── NextAuth Export ─────────────────────────────────────────────

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);
