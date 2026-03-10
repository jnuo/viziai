import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/quality/unmapped
 * Paginated list of unmapped metrics with report context.
 */
export async function GET(request: Request) {
  const userId = await requireAdmin();
  if (!userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "pending";
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "50"),
      100,
    );
    const offset = parseInt(url.searchParams.get("offset") || "0");

    const rows = await sql`
      SELECT
        um.id,
        um.metric_name,
        um.unit,
        um.ref_low,
        um.ref_high,
        um.status,
        um.suggested_canonical,
        um.created_at,
        r.sample_date,
        r.file_name AS lab_name,
        p.display_name AS profile_name
      FROM unmapped_metrics um
      JOIN reports r ON r.id = um.report_id
      JOIN profiles p ON p.id = um.profile_id
      WHERE um.status = ${status}
      ORDER BY um.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const total = await sql`
      SELECT COUNT(*)::int AS count FROM unmapped_metrics WHERE status = ${status}
    `;

    return NextResponse.json({
      items: rows,
      total: total[0].count,
      limit,
      offset,
    });
  } catch (error) {
    reportError(error, { op: "admin.quality.unmapped" });
    return NextResponse.json(
      { error: "Failed to fetch unmapped metrics" },
      { status: 500 },
    );
  }
}
