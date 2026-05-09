// ============================================
// MaveFlow - NextAuth Type Declarations
// ============================================
// Extends NextAuth default types for custom
// session and JWT token fields.

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    accessToken: string;
    accessTokenExpires: number;
    error?: string;
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    accessTokenExpires?: number;
    refreshToken?: string;
    provider?: string;
    googleId?: string;
    picture?: string;
    error?: string;
  }
}
