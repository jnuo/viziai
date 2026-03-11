import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/reports/[id]
 * Returns full report with metrics, blob_url, and profile info for admin review.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireAdmin();
  if (!userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;

    const UUID_RE =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const reports = await sql`
      SELECT
        r.id,
        r.profile_id,
        r.sample_date::TEXT AS sample_date,
        r.file_name,
        r.blob_url,
        r.source,
        r.created_at,
        p.display_name AS profile_name
      FROM reports r
      JOIN profiles p ON p.id = r.profile_id
      WHERE r.id = ${id}
    `;

    if (reports.length === 0) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const report = reports[0];

    const [metrics, review] = await Promise.all([
      sql`
        SELECT id, name, value, unit, ref_low, ref_high, flag, metric_definition_id
        FROM metrics
        WHERE report_id = ${id}
        ORDER BY sort_order ASC NULLS LAST, name ASC
      `,
      sql`
        SELECT id, status, notes, reviewer_user_id, reviewed_at, created_at
        FROM extraction_reviews
        WHERE report_id = ${id}
      `,
    ]);

    return NextResponse.json({
      report: {
        id: report.id,
        profileId: report.profile_id,
        profileName: report.profile_name,
        sampleDate: report.sample_date,
        fileName: report.file_name,
        blobUrl: report.blob_url,
        source: report.source,
        createdAt: report.created_at,
      },
      metrics: metrics.map((m) => ({
        id: m.id,
        name: m.name,
        value: Number(m.value),
        unit: m.unit,
        refLow: m.ref_low != null ? Number(m.ref_low) : null,
        refHigh: m.ref_high != null ? Number(m.ref_high) : null,
        flag: m.flag,
        metricDefinitionId: m.metric_definition_id || null,
      })),
      review:
        review.length > 0
          ? {
              id: review[0].id,
              status: review[0].status,
              notes: review[0].notes,
              reviewerUserId: review[0].reviewer_user_id,
              reviewedAt: review[0].reviewed_at,
              createdAt: review[0].created_at,
            }
          : null,
    });
  } catch (error) {
    reportError(error, { op: "admin.reports.GET" });
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 },
    );
  }
}
