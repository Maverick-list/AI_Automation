import { NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/db";
import { getGoogleAuth, revokeGoogleToken } from "@/lib/google-client";
import { GoogleApiError } from "@/lib/google-error";
import { google } from "googleapis";

/**
 * GET /api/google/status
 * Checks the connection status and scopes of the authenticated user.
 */
export async function GET() {
  try {
    const user = await getServerSessionUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const auth = await getGoogleAuth(user.id);
    const oauth2Info = google.oauth2({ version: "v2", auth });
    
    // Call tokeninfo to get scopes and validity
    const tokenInfo = await oauth2Info.tokeninfo({ access_token: auth.credentials.access_token! });

    return NextResponse.json({
      success: true,
      connected: true,
      scopes: tokenInfo.data.scope?.split(" "),
      expiresIn: tokenInfo.data.expires_in,
      email: tokenInfo.data.email,
    });
  } catch (error) {
    if (error instanceof GoogleApiError && error.code === "INVALID_GRANT") {
      return NextResponse.json({ success: false, connected: false, error: "Token revoked or expired." }, { status: 401 });
    }
    return NextResponse.json({ success: false, connected: false, error: "Failed to connect" }, { status: 500 });
  }
}

/**
 * POST /api/google/revoke
 * Revokes all Google tokens for the current user.
 */
export async function POST() {
  try {
    const user = await getServerSessionUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const revoked = await revokeGoogleToken(user.id);
    
    if (revoked) {
      return NextResponse.json({ success: true, message: "Token revoked successfully." });
    } else {
      return NextResponse.json({ success: false, error: "Failed to revoke token." }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
