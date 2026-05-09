// ============================================
// MaveFlow - Global Middleware
// ============================================
// Protects routes, applies rate limiting to APIs,
// and manages global headers.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { applyRateLimit } from "@/lib/rate-limit";

// ── Configuration ───────────────────────────────────────────────

// Define protected route prefixes
const protectedRoutes = ["/dashboard"];
const protectedApiRoutes = ["/api/private", "/api/workflows", "/api/integrations"];

// Define auth routes
const authRoutes = ["/auth/signin", "/auth/error"];

// ── Middleware Logic ────────────────────────────────────────────

export default auth(async (req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;
  const isApiRoute = nextUrl.pathname.startsWith("/api");

  // 1. Rate Limiting for API routes
  if (isApiRoute) {
    // Apply strict limit for auth endpoints
    if (nextUrl.pathname.startsWith("/api/auth")) {
      const rateLimitResponse = await applyRateLimit(req, "auth");
      if (rateLimitResponse) return rateLimitResponse;
    } 
    // Apply standard limit for other API endpoints
    else {
      const rateLimitResponse = await applyRateLimit(req, "api");
      if (rateLimitResponse) return rateLimitResponse;
    }
  }

  // 2. Route Protection Logic
  const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  
  const isProtectedApiRoute = protectedApiRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  // If trying to access protected UI route while not authenticated
  if (isProtectedRoute && !isAuthenticated) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return NextResponse.redirect(
      new URL(`/auth/signin?callbackUrl=${encodedCallbackUrl}`, nextUrl)
    );
  }

  // If trying to access protected API route while not authenticated
  if (isProtectedApiRoute && !isAuthenticated) {
    return NextResponse.json(
      { error: "Unauthorized", message: "You must be logged in to access this API." },
      { status: 401 }
    );
  }

  // If trying to access auth pages while already authenticated
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Allow the request to proceed
  return NextResponse.next();
});

// ── Matcher Configuration ───────────────────────────────────────

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
