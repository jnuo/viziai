import { NextResponse } from "next/server";
import { requireApiKey } from "@/lib/api-key-auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/settings/api-keys/verify
 * Verify API key works. Returns profile name. Used by extension "Test Connection".
 */
export async function GET(request: Request) {
  try {
    const auth = await requireApiKey(request);
    if (!auth) {
      return NextResponse.json(
        { error: "Invalid or expired API key" },
        { status: 401 },
      );
    }

    const profiles = await sql`
      SELECT display_name FROM profiles WHERE id = ${auth.profileId}
    `;

    if (profiles.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      profileName: profiles[0].display_name,
      profileId: auth.profileId,
    });
  } catch (error) {
    reportError(error, { op: "apiKeys.verify" });
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
