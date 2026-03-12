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
    const [unreviewed, approved, coverage] = await Promise.all([
      sql`
        SELECT COUNT(*)::int AS count FROM reports r
        WHERE NOT EXISTS (
          SELECT 1 FROM extraction_reviews er
          WHERE er.report_id = r.id AND er.status = 'approved'
        )
      `,
      sql`
        SELECT COUNT(*)::int AS count FROM extraction_reviews
        WHERE status = 'approved'
      `,
      sql`
        SELECT
          COUNT(*)::int AS total,
          COUNT(metric_definition_id)::int AS linked
        FROM metrics
      `,
    ]);

    const total = coverage[0].total as number;
    const linked = coverage[0].linked as number;
    const coveragePct = total > 0 ? Math.round((linked / total) * 100) : 0;

    return NextResponse.json({
      unreviewedCount: unreviewed[0].count,
      approvedCount: approved[0].count,
      coveragePct,
    });
  } catch (error) {
    reportError(error, { op: "admin.quality.stats" });
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
