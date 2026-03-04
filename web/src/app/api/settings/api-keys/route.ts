import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requireAuth, getUserProfiles } from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/settings/api-keys
 * List user's API keys (session auth)
 */
export async function GET() {
  try {
    const userId = await requireAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const keys = await sql`
      SELECT
        ak.id,
        ak.name,
        ak.key_prefix,
        ak.profile_id,
        p.display_name as profile_name,
        ak.created_at,
        ak.last_used_at,
        ak.revoked_at
      FROM api_keys ak
      JOIN profiles p ON p.id = ak.profile_id
      WHERE ak.user_id = ${userId}
      ORDER BY ak.created_at DESC
    `;

    return NextResponse.json({ keys });
  } catch (error) {
    reportError(error, { op: "apiKeys.GET" });
    return NextResponse.json(
      { error: "Failed to load API keys" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/settings/api-keys
 * Create a new API key. Returns the full key ONCE.
 */
export async function POST(request: Request) {
  try {
    const userId = await requireAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { profileId, name } = body;

    if (!profileId) {
      return NextResponse.json(
        { error: "profileId is required" },
        { status: 400 },
      );
    }

    // Verify user has editor/owner access to the profile
    const profiles = await getUserProfiles(userId);
    const profile = profiles.find((p) => p.id === profileId);
    if (!profile || profile.access_level === "viewer") {
      return NextResponse.json(
        { error: "No write access to this profile" },
        { status: 403 },
      );
    }

    // Generate key: viz_ + 32 random hex bytes
    const rawKey = `viz_${randomBytes(32).toString("hex")}`;
    const prefix = rawKey.slice(0, 12); // "viz_" + 8 hex chars

    // Hash with SHA-256
    const encoder = new TextEncoder();
    const data = encoder.encode(rawKey);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const keyHash = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const result = await sql`
      INSERT INTO api_keys (user_id, profile_id, name, key_hash, key_prefix)
      VALUES (${userId}, ${profileId}, ${name || "e-Nabız Extension"}, ${keyHash}, ${prefix})
      RETURNING id, name, key_prefix, profile_id, created_at
    `;

    return NextResponse.json({
      key: rawKey,
      id: result[0].id,
      name: result[0].name,
      keyPrefix: result[0].key_prefix,
      profileId: result[0].profile_id,
      profileName: profile.display_name,
      createdAt: result[0].created_at,
    });
  } catch (error) {
    reportError(error, { op: "apiKeys.POST" });
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/settings/api-keys
 * Revoke an API key (soft delete via revoked_at)
 */
export async function DELETE(request: Request) {
  try {
    const userId = await requireAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get("id");
    if (!keyId) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const result = await sql`
      UPDATE api_keys
      SET revoked_at = NOW()
      WHERE id = ${keyId}
      AND user_id = ${userId}
      AND revoked_at IS NULL
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Key not found or already revoked" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    reportError(error, { op: "apiKeys.DELETE" });
    return NextResponse.json(
      { error: "Failed to revoke API key" },
      { status: 500 },
    );
  }
}
