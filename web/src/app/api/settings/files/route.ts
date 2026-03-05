import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, getDbUserId, hasProfileAccess } from "@/lib/auth";
import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/settings/files
 * List processed files for a profile with metric counts
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = getDbUserId(session);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please sign in" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json(
        { error: "Bad Request", message: "profileId is required" },
        { status: 400 },
      );
    }

    // Verify user has access to this profile
    const hasAccess = await hasProfileAccess(userId, profileId);
    if (!hasAccess) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "You don't have access to this profile",
        },
        { status: 403 },
      );
    }

    // Get processed files with metric counts and sample date.
    // Use DISTINCT ON to collapse multiple reports per file into one row
    // (duplicate reports can occur if confirm was called multiple times).
    const files = await sql`
      SELECT
        pf.id,
        pf.file_name,
        pf.created_at,
        sub.sample_date,
        sub.metric_count
      FROM processed_files pf
      LEFT JOIN LATERAL (
        SELECT r.sample_date, COUNT(DISTINCT m.id)::int as metric_count
        FROM reports r
        LEFT JOIN metrics m ON m.report_id = r.id
        WHERE r.profile_id = pf.profile_id
          AND (
            (pf.content_hash IS NOT NULL AND r.content_hash = pf.content_hash)
            OR (pf.content_hash IS NULL AND r.file_name = pf.file_name)
          )
        GROUP BY r.id
        ORDER BY r.created_at DESC
        LIMIT 1
      ) sub ON true
      WHERE pf.profile_id = ${profileId}
      ORDER BY pf.created_at DESC
    `;

    return NextResponse.json({ files });
  } catch (error) {
    console.error("[API] GET /api/settings/files error:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 },
    );
  }
}
