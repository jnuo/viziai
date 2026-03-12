import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";
import { resolveMetricName } from "@/lib/metric-definitions";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/quality/alias-coverage
 * Shows what percentage of extracted metric names are covered by
 * canonical names or aliases vs. unknown/unmapped.
 */
export async function GET() {
  const userId = await requireAdmin();
  if (!userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    // Get all distinct metric names from recent reports (last 90 days)
    const distinctMetrics = await sql`
      SELECT m.name, COUNT(*) AS occurrence_count
      FROM metrics m
      JOIN reports r ON r.id = m.report_id
      WHERE r.created_at >= NOW() - INTERVAL '90 days'
      GROUP BY m.name
      ORDER BY occurrence_count DESC
    `;

    // Classify each metric name
    const coveredNames: { name: string; count: number }[] = [];
    const unmapped: { name: string; count: number }[] = [];

    for (const row of distinctMetrics) {
      const name = row.name;
      const count = Number(row.occurrence_count);
      const resolved = await resolveMetricName(name);

      if (resolved) {
        coveredNames.push({ name, count });
      } else {
        unmapped.push({ name, count });
      }
    }

    const totalNames = distinctMetrics.length;
    const coveragePercent =
      totalNames > 0 ? (coveredNames.length / totalNames) * 100 : 100;

    const totalOccurrences = distinctMetrics.reduce(
      (sum, r) => sum + Number(r.occurrence_count),
      0,
    );
    const coveredOccurrences = coveredNames.reduce(
      (sum, r) => sum + r.count,
      0,
    );
    const occurrenceCoverage =
      totalOccurrences > 0
        ? (coveredOccurrences / totalOccurrences) * 100
        : 100;

    return NextResponse.json({
      totalMetricNames: totalNames,
      coveredByDefinition: coveredNames.length,
      unmapped: unmapped.length,
      coveragePercent: Math.round(coveragePercent * 10) / 10,
      occurrenceCoverage: Math.round(occurrenceCoverage * 10) / 10,
      unmappedMetrics: unmapped.slice(0, 50),
    });
  } catch (error) {
    reportError(error, { op: "admin.quality.alias-coverage.GET" });
    return NextResponse.json(
      { error: "Failed to compute alias coverage" },
      { status: 500 },
    );
  }
}
