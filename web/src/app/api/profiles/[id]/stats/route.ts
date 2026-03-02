import { NextResponse } from "next/server";
import { requireProfileOwner } from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/profiles/[id]/stats
 * Returns data counts and shared users for a profile (owner only).
 * Used to show enriched delete confirmation.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: profileId } = await params;
    const userId = await requireProfileOwner(profileId);
    if (!userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [reportRows, weightRows, bpRows, sharedRows] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM reports WHERE profile_id = ${profileId}`,
      sql`SELECT COUNT(*) as count FROM tracking_measurements WHERE profile_id = ${profileId} AND type = 'weight'`,
      sql`SELECT COUNT(*) as count FROM tracking_measurements WHERE profile_id = ${profileId} AND type = 'blood_pressure'`,
      sql`
        SELECT u.email, u.name as display_name
        FROM user_access ua
        JOIN users u ON u.id = ua.user_id_new
        WHERE ua.profile_id = ${profileId}
        AND ua.user_id_new != ${userId}
        ORDER BY u.name ASC
      `,
    ]);

    return NextResponse.json({
      reportCount: parseInt(reportRows[0].count, 10),
      weightCount: parseInt(weightRows[0].count, 10),
      bpCount: parseInt(bpRows[0].count, 10),
      sharedWith: sharedRows.map((row) => ({
        email: row.email,
        displayName: row.display_name,
      })),
    });
  } catch (error) {
    reportError(error, { op: "api.profiles.stats.GET" });
    return NextResponse.json(
      { error: "Failed to fetch profile stats" },
      { status: 500 },
    );
  }
}
