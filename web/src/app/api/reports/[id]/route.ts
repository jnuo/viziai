import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth, hasProfileAccess } from "@/lib/auth";
import { reportError } from "@/lib/error-reporting";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/reports/[id]
 * Returns a single report with all its metrics.
 * Auth: user must have access to the report's profile_id.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Validate UUID format to avoid Postgres cast errors and Sentry noise
    const UUID_RE =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Fetch report
    const reports = await sql`
      SELECT
        r.id,
        r.profile_id,
        r.sample_date::TEXT as sample_date,
        r.file_name,
        r.blob_url,
        r.source,
        r.created_at
      FROM reports r
      WHERE r.id = ${id}
    `;

    if (reports.length === 0) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const report = reports[0];

    // Verify user has access to this report's profile
    const hasAccess = await hasProfileAccess(userId, report.profile_id);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch metrics for this report
    const metrics = await sql`
      SELECT
        id,
        name,
        value,
        unit,
        ref_low,
        ref_high,
        flag
      FROM metrics
      WHERE report_id = ${id}
      ORDER BY sort_order ASC NULLS LAST, name ASC
    `;

    return NextResponse.json({
      report: {
        id: report.id,
        profileId: report.profile_id,
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
      })),
    });
  } catch (error) {
    reportError(error, { op: "api.reports.GET" });
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 },
    );
  }
}
