import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";

export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST /api/admin/reports/[id]/add-to-evals
 * Saves the reviewed report as an eval test case (ground truth).
 * The report's current metrics become the expected output.
 * The blob_url is the input PDF.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireAdmin();
  if (!userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;

    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Parse optional notes from body
    let notes: string | null = null;
    try {
      const body = await request.json();
      if (body.notes && typeof body.notes === "string") {
        notes = body.notes.slice(0, 2000);
      }
    } catch {
      // Empty body is OK
    }

    // Fetch report with blob_url
    const reports = await sql`
      SELECT id, blob_url, sample_date::TEXT AS sample_date
      FROM reports
      WHERE id = ${id}
    `;

    if (reports.length === 0) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const report = reports[0];

    if (!report.blob_url) {
      return NextResponse.json(
        { error: "No PDF stored for this report. Cannot create eval case." },
        { status: 400 },
      );
    }

    // Fetch current metrics (this is the ground truth)
    const metrics = await sql`
      SELECT name, value, unit, ref_low, ref_high, flag
      FROM metrics
      WHERE report_id = ${id}
      ORDER BY name ASC
    `;

    if (metrics.length === 0) {
      return NextResponse.json(
        { error: "Report has no metrics. Cannot create eval case." },
        { status: 400 },
      );
    }

    const expectedMetrics = metrics.map((m) => ({
      name: m.name,
      value: Number(m.value),
      unit: m.unit,
      ref_low: m.ref_low != null ? Number(m.ref_low) : null,
      ref_high: m.ref_high != null ? Number(m.ref_high) : null,
      flag: m.flag,
    }));

    // Upsert eval case (one per report)
    await sql`
      INSERT INTO extraction_evals (
        report_id, blob_url, expected_sample_date, expected_metrics, notes
      )
      VALUES (
        ${id},
        ${report.blob_url},
        ${report.sample_date},
        ${JSON.stringify(expectedMetrics)},
        ${notes}
      )
      ON CONFLICT (report_id)
      DO UPDATE SET
        blob_url = ${report.blob_url},
        expected_sample_date = ${report.sample_date},
        expected_metrics = ${JSON.stringify(expectedMetrics)},
        notes = ${notes},
        created_at = NOW()
    `;

    return NextResponse.json({
      success: true,
      evalCase: {
        reportId: id,
        metricCount: expectedMetrics.length,
        sampleDate: report.sample_date,
      },
    });
  } catch (error) {
    reportError(error, { op: "admin.reports.add-to-evals.POST" });
    return NextResponse.json(
      { error: "Failed to create eval case" },
      { status: 500 },
    );
  }
}
