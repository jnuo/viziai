import { NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { sql } from "@/lib/db";
import { CANONICAL_METRIC_NAMES } from "@/lib/canonical-metrics";
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
async function handler() {
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

    // 4. Alias coverage: % of distinct metric names that are known
    const distinctNames = await sql`
      SELECT DISTINCT m.name
      FROM metrics m
      JOIN reports r ON r.id = m.report_id
      WHERE r.created_at >= NOW() - INTERVAL '90 days'
    `;

    const aliases = await sql`SELECT alias FROM metric_aliases`;
    const aliasSet = new Set(aliases.map((a) => a.alias.toLowerCase()));

    let covered = 0;
    for (const row of distinctNames) {
      if (
        CANONICAL_METRIC_NAMES.has(row.name) ||
        aliasSet.has(row.name.toLowerCase())
      ) {
        covered++;
      }
    }

    results.aliasCoverage = {
      total: distinctNames.length,
      covered,
      percent:
        distinctNames.length > 0
          ? Math.round((covered / distinctNames.length) * 1000) / 10
          : 100,
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

// QStash signature verification (same pattern as extraction worker)
const isLocalDev = process.env.NODE_ENV === "development";
const hasSigningKey = !!process.env.QSTASH_CURRENT_SIGNING_KEY;

export const POST = hasSigningKey
  ? verifySignatureAppRouter(handler)
  : async (...args: Parameters<typeof handler>) => {
      if (!isLocalDev) {
        console.error(
          "[QualityCheck] Production deploy missing QSTASH_CURRENT_SIGNING_KEY",
        );
        return NextResponse.json(
          { error: "Server misconfigured" },
          { status: 500 },
        );
      }
      return handler(...args);
    };
