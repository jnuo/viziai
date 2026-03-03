import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { requireApiKey } from "@/lib/api-key-auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ImportMetric {
  name: string;
  value: number;
  unit?: string;
  ref_low?: number | null;
  ref_high?: number | null;
}

interface ImportReport {
  date: string; // YYYY-MM-DD
  hospital?: string;
  metrics: ImportMetric[];
}

interface ImportRequest {
  reports: ImportReport[];
}

function determineFlag(
  value: number,
  refLow: number | null | undefined,
  refHigh: number | null | undefined,
): string | null {
  if (refLow != null && value < refLow) return "L";
  if (refHigh != null && value > refHigh) return "H";
  if (refLow != null || refHigh != null) return "N";
  return null;
}

/**
 * POST /api/import/enabiz
 * Import lab reports from e-Nabız Chrome extension
 */
export async function POST(request: Request) {
  try {
    const auth = await requireApiKey(request);
    if (!auth) {
      return NextResponse.json(
        { error: "Invalid or expired API key" },
        { status: 401 },
      );
    }

    const { profileId } = auth;

    const body = (await request.json()) as ImportRequest;
    if (
      !body.reports ||
      !Array.isArray(body.reports) ||
      body.reports.length === 0
    ) {
      return NextResponse.json(
        { error: "At least one report is required" },
        { status: 400 },
      );
    }

    // Load alias map for server-side normalization
    const aliasRows =
      await sql`SELECT alias, canonical_name FROM metric_aliases`;
    const aliasMap = new Map(
      aliasRows.map((r) => [r.alias.toLowerCase(), r.canonical_name]),
    );

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const report of body.reports) {
      // Validate date format
      if (!report.date || !/^\d{4}-\d{2}-\d{2}$/.test(report.date)) {
        errors.push(`Invalid date: ${report.date}`);
        continue;
      }

      if (!report.metrics || report.metrics.length === 0) {
        errors.push(`No metrics for report ${report.date}`);
        continue;
      }

      // Content hash for dedup: hash of date + sorted metric names+values
      const hashInput = [
        report.date,
        ...report.metrics.map((m) => `${m.name}:${m.value}`).sort(),
      ].join("|");
      const contentHash = createHash("sha256").update(hashInput).digest("hex");

      // Check if already imported
      const existing = await sql`
        SELECT id FROM processed_files
        WHERE profile_id = ${profileId}
        AND content_hash = ${contentHash}
      `;

      if (existing.length > 0) {
        skipped++;
        continue;
      }

      // Find or create report for this date
      const existingReports = await sql`
        SELECT id FROM reports
        WHERE profile_id = ${profileId}
        AND sample_date = ${report.date}
      `;

      let reportId: string;

      if (existingReports.length > 0) {
        reportId = existingReports[0].id;
      } else {
        const fileName = report.hospital
          ? `e-Nabız - ${report.hospital}`
          : "e-Nabız";
        const reportResult = await sql`
          INSERT INTO reports (profile_id, sample_date, file_name, source)
          VALUES (${profileId}, ${report.date}, ${fileName}, 'enabiz')
          RETURNING id
        `;
        reportId = reportResult[0].id;
      }

      // Upsert metrics
      for (const metric of report.metrics) {
        if (typeof metric.value !== "number" || isNaN(metric.value)) continue;

        // Apply alias mapping
        const canonicalName =
          aliasMap.get(metric.name.toLowerCase()) || metric.name;

        const flag = determineFlag(
          metric.value,
          metric.ref_low,
          metric.ref_high,
        );

        await sql`
          INSERT INTO metrics (report_id, name, value, unit, ref_low, ref_high, flag)
          VALUES (
            ${reportId},
            ${canonicalName},
            ${metric.value},
            ${metric.unit || null},
            ${metric.ref_low ?? null},
            ${metric.ref_high ?? null},
            ${flag}
          )
          ON CONFLICT (report_id, name) DO UPDATE
          SET
            value = EXCLUDED.value,
            unit = COALESCE(EXCLUDED.unit, metrics.unit),
            ref_low = COALESCE(EXCLUDED.ref_low, metrics.ref_low),
            ref_high = COALESCE(EXCLUDED.ref_high, metrics.ref_high),
            flag = EXCLUDED.flag
        `;

        // Ensure metric_preferences row exists
        await sql`
          INSERT INTO metric_preferences (profile_id, name)
          VALUES (${profileId}, ${canonicalName})
          ON CONFLICT (profile_id, name) DO NOTHING
        `;
      }

      // Record in processed_files for dedup
      const fileName = report.hospital
        ? `e-Nabız - ${report.hospital} - ${report.date}`
        : `e-Nabız - ${report.date}`;
      await sql`
        INSERT INTO processed_files (profile_id, file_name, content_hash)
        VALUES (${profileId}, ${fileName}, ${contentHash})
        ON CONFLICT (profile_id, content_hash) DO NOTHING
      `;

      imported++;
    }

    console.log(
      `[API] e-Nabız import: ${imported} imported, ${skipped} skipped, ${errors.length} errors`,
    );

    return NextResponse.json({ imported, skipped, errors });
  } catch (error) {
    reportError(error, { op: "import.enabiz.POST" });
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
