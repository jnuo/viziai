import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/quality/anomalies
 * Detects metrics with suspicious values:
 * 1. Values outside any known reference range for that metric name
 * 2. Values >3 standard deviations from the profile's historical average
 *
 * Scoped to recent reports (last 90 days) for efficiency.
 */
export async function GET() {
  const userId = await requireAdmin();
  if (!userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    // Find metrics whose value falls outside the reference range
    // Scoped to reports from the last 90 days
    const outOfRange = await sql`
      SELECT
        m.id AS metric_id,
        m.name,
        m.value,
        m.unit,
        m.ref_low,
        m.ref_high,
        m.flag,
        r.id AS report_id,
        r.sample_date::TEXT AS sample_date,
        r.file_name,
        p.display_name AS profile_name
      FROM metrics m
      JOIN reports r ON r.id = m.report_id
      JOIN profiles p ON p.id = r.profile_id
      WHERE r.created_at >= NOW() - INTERVAL '90 days'
        AND (
          (m.ref_low IS NOT NULL AND m.value < m.ref_low)
          OR (m.ref_high IS NOT NULL AND m.value > m.ref_high)
        )
      ORDER BY r.sample_date DESC, m.name ASC
      LIMIT 100
    `;

    // Find statistical outliers: values >3 std dev from the profile's
    // historical mean for that metric name
    const statisticalOutliers = await sql`
      WITH metric_stats AS (
        SELECT
          m.name,
          r.profile_id,
          AVG(m.value) AS avg_value,
          STDDEV(m.value) AS stddev_value,
          COUNT(*) AS sample_count
        FROM metrics m
        JOIN reports r ON r.id = m.report_id
        GROUP BY m.name, r.profile_id
        HAVING COUNT(*) >= 3 AND STDDEV(m.value) > 0
      )
      SELECT
        m.id AS metric_id,
        m.name,
        m.value,
        m.unit,
        ms.avg_value,
        ms.stddev_value,
        r.id AS report_id,
        r.sample_date::TEXT AS sample_date,
        r.file_name,
        p.display_name AS profile_name
      FROM metrics m
      JOIN reports r ON r.id = m.report_id
      JOIN profiles p ON p.id = r.profile_id
      JOIN metric_stats ms ON ms.name = m.name AND ms.profile_id = r.profile_id
      WHERE r.created_at >= NOW() - INTERVAL '90 days'
        AND ABS(m.value - ms.avg_value) > 3 * ms.stddev_value
      ORDER BY ABS(m.value - ms.avg_value) / ms.stddev_value DESC
      LIMIT 50
    `;

    return NextResponse.json({
      outOfRange: outOfRange.map((m) => ({
        metricId: m.metric_id,
        name: m.name,
        value: Number(m.value),
        unit: m.unit,
        refLow: m.ref_low != null ? Number(m.ref_low) : null,
        refHigh: m.ref_high != null ? Number(m.ref_high) : null,
        flag: m.flag,
        reportId: m.report_id,
        sampleDate: m.sample_date,
        fileName: m.file_name,
        profileName: m.profile_name,
      })),
      statisticalOutliers: statisticalOutliers.map((m) => ({
        metricId: m.metric_id,
        name: m.name,
        value: Number(m.value),
        unit: m.unit,
        avgValue: Number(m.avg_value),
        stddevValue: Number(m.stddev_value),
        reportId: m.report_id,
        sampleDate: m.sample_date,
        fileName: m.file_name,
        profileName: m.profile_name,
      })),
    });
  } catch (error) {
    reportError(error, { op: "admin.quality.anomalies.GET" });
    return NextResponse.json(
      { error: "Failed to detect anomalies" },
      { status: 500 },
    );
  }
}
