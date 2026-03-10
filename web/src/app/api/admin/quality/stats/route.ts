import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/quality/stats
 * Summary counts for the admin quality dashboard.
 */
export async function GET() {
  const userId = await requireAdmin();
  if (!userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const [unmapped, pendingReviews, reports, recent] = await Promise.all([
      sql`SELECT COUNT(*)::int AS count FROM unmapped_metrics WHERE status = 'pending'`,
      sql`SELECT COUNT(*)::int AS count FROM extraction_reviews WHERE status = 'pending'`,
      sql`SELECT COUNT(*)::int AS count FROM reports`,
      sql`SELECT COUNT(*)::int AS count FROM reports WHERE created_at > NOW() - INTERVAL '7 days'`,
    ]);

    return NextResponse.json({
      unmappedCount: unmapped[0].count,
      pendingReviewCount: pendingReviews[0].count,
      totalReports: reports[0].count,
      recentReports: recent[0].count,
    });
  } catch (error) {
    reportError(error, { op: "admin.quality.stats" });
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
