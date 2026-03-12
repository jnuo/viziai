import { NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/cron/quality-check
 * Daily quality check triggered by QStash cron.
 *
 * Runs:
 * 1. Unmapped metric flagging (new metrics not in canonical list or aliases)
 * 2. Anomaly count (out-of-range metrics in recent reports)
 * 3. Alias coverage stats
 *
 * Results are logged. The admin dashboard reads live data,
 * so this cron ensures periodic monitoring even without admin visits.
 *
 * QStash schedule: configure via Upstash Console
 *   URL: https://www.viziai.app/api/cron/quality-check
 *   Schedule: 0 8 * * * (daily at 08:00 UTC)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handler(_request: Request) {
  try {
    const results = {
      timestamp: new Date().toISOString(),
      newUnmapped: 0,
      totalUnmappedPending: 0,
      outOfRangeCount: 0,
      aliasCoverage: { total: 0, covered: 0, percent: 0 },
    };

    // 1. Count pending unmapped metrics
    const unmappedRows = await sql`
      SELECT COUNT(*) AS count FROM unmapped_metrics WHERE status = 'pending'
    `;
    results.totalUnmappedPending = Number(unmappedRows[0].count);

    // 2. Count new unmapped metrics from last 24 hours
    const newUnmappedRows = await sql`
      SELECT COUNT(*) AS count FROM unmapped_metrics
      WHERE status = 'pending' AND created_at >= NOW() - INTERVAL '24 hours'
    `;
    results.newUnmapped = Number(newUnmappedRows[0].count);

    // 3. Count out-of-range metrics in last 7 days
    const anomalyRows = await sql`
      SELECT COUNT(*) AS count
      FROM metrics m
      JOIN reports r ON r.id = m.report_id
      WHERE r.created_at >= NOW() - INTERVAL '7 days'
        AND (
          (m.ref_low IS NOT NULL AND m.value < m.ref_low)
          OR (m.ref_high IS NOT NULL AND m.value > m.ref_high)
        )
    `;
    results.outOfRangeCount = Number(anomalyRows[0].count);

    // 4. Alias coverage: % of distinct metric names that have a metric_definition_id
    const coverageRows = await sql`
      SELECT
        COUNT(DISTINCT m.name)::int AS total,
        COUNT(DISTINCT CASE WHEN m.metric_definition_id IS NOT NULL THEN m.name END)::int AS covered
      FROM metrics m
      JOIN reports r ON r.id = m.report_id
      WHERE r.created_at >= NOW() - INTERVAL '90 days'
    `;

    const total = Number(coverageRows[0].total);
    const covered = Number(coverageRows[0].covered);

    results.aliasCoverage = {
      total,
      covered,
      percent: total > 0 ? Math.round((covered / total) * 1000) / 10 : 100,
    };

    console.log("[QualityCheck] Daily results:", JSON.stringify(results));

    return NextResponse.json({ success: true, results });
  } catch (error) {
    reportError(error, { op: "cron.quality-check" });
    console.error("[QualityCheck] Cron failed:", error);
    return NextResponse.json(
      { error: "Quality check failed" },
      { status: 500 },
    );
  }
}

// Lazy-initialize QStash signature verification (same pattern as extraction worker)
let verified: ReturnType<typeof verifySignatureAppRouter> | null = null;

export const POST = async (...args: Parameters<typeof handler>) => {
  if (process.env.NODE_ENV === "development") {
    return handler(...args);
  }
  if (process.env.QSTASH_CURRENT_SIGNING_KEY) {
    if (!verified) {
      verified = verifySignatureAppRouter(handler);
    }
    return verified(...args);
  }
  console.error(
    "[QualityCheck] Production deploy missing QSTASH_CURRENT_SIGNING_KEY",
  );
  return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
};
