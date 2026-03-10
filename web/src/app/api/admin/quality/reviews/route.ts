import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/quality/reviews
 * List of reports with their review status.
 * Shows unreviewed reports first, then recently reviewed.
 */
export async function GET(request: Request) {
  const userId = await requireAdmin();
  if (!userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const url = new URL(request.url);
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "50"),
      100,
    );
    const offset = parseInt(url.searchParams.get("offset") || "0");

    const rows = await sql`
      SELECT
        r.id,
        r.sample_date,
        r.file_name,
        r.blob_url,
        r.created_at,
        p.display_name AS profile_name,
        er.status AS review_status,
        er.reviewed_at,
        (SELECT COUNT(*)::int FROM metrics WHERE report_id = r.id) AS metric_count,
        (SELECT COUNT(*)::int FROM unmapped_metrics WHERE report_id = r.id AND status = 'pending') AS unmapped_count
      FROM reports r
      JOIN profiles p ON p.id = r.profile_id
      LEFT JOIN extraction_reviews er ON er.report_id = r.id
      ORDER BY
        CASE WHEN er.status IS NULL THEN 0 ELSE 1 END,
        r.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const total = await sql`SELECT COUNT(*)::int AS count FROM reports`;

    return NextResponse.json({
      items: rows,
      total: total[0].count,
      limit,
      offset,
    });
  } catch (error) {
    reportError(error, { op: "admin.quality.reviews" });
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}
