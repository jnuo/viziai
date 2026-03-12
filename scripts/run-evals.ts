#!/usr/bin/env npx tsx
/**
 * Extraction eval runner.
 *
 * Fetches all eval cases from the extraction_evals table,
 * re-runs extraction on each PDF via the worker endpoint,
 * and compares the result against expected metrics.
 *
 * Usage:
 *   npx tsx scripts/run-evals.ts
 *
 * Requires:
 *   - NEON_DATABASE_URL in .env.local
 *   - Local dev server running on localhost:3000
 *     (or set BASE_URL env var)
 */

import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local from web/ directory
config({ path: resolve(__dirname, "../web/.env.local") });

const DATABASE_URL = process.env.NEON_DATABASE_URL;
if (!DATABASE_URL) {
  console.error("NEON_DATABASE_URL not set. Check web/.env.local");
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

interface ExpectedMetric {
  name: string;
  value: number;
  unit: string | null;
  ref_low: number | null;
  ref_high: number | null;
  flag: string | null;
}

interface EvalCase {
  id: string;
  report_id: string;
  blob_url: string;
  expected_sample_date: string | null;
  expected_metrics: ExpectedMetric[];
  notes: string | null;
}

interface EvalResult {
  evalId: string;
  reportId: string;
  dateMatch: boolean;
  metricCount: { expected: number; extracted: number };
  nameMatches: number;
  valueMatches: number;
  unitMatches: number;
  accuracy: number;
  errors: string[];
}

function normalizeMetricName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function compareMetrics(
  expected: ExpectedMetric[],
  extracted: ExpectedMetric[],
): { nameMatches: number; valueMatches: number; unitMatches: number } {
  let nameMatches = 0;
  let valueMatches = 0;
  let unitMatches = 0;

  const extractedMap = new Map<string, ExpectedMetric>();
  for (const m of extracted) {
    extractedMap.set(normalizeMetricName(m.name), m);
  }

  for (const expected_m of expected) {
    const key = normalizeMetricName(expected_m.name);
    const found = extractedMap.get(key);
    if (!found) continue;

    nameMatches++;

    // Value match: within 1% tolerance or exact match
    if (expected_m.value != null && found.value != null) {
      const tolerance = Math.abs(expected_m.value) * 0.01;
      if (
        Math.abs(expected_m.value - found.value) <= Math.max(tolerance, 0.01)
      ) {
        valueMatches++;
      }
    }

    // Unit match: case-insensitive
    if (
      expected_m.unit &&
      found.unit &&
      expected_m.unit.toLowerCase() === found.unit.toLowerCase()
    ) {
      unitMatches++;
    }
  }

  return { nameMatches, valueMatches, unitMatches };
}

async function runSingleEval(evalCase: EvalCase): Promise<EvalResult> {
  const errors: string[] = [];
  const result: EvalResult = {
    evalId: evalCase.id,
    reportId: evalCase.report_id,
    dateMatch: false,
    metricCount: { expected: evalCase.expected_metrics.length, extracted: 0 },
    nameMatches: 0,
    valueMatches: 0,
    unitMatches: 0,
    accuracy: 0,
    errors,
  };

  try {
    // Create a temporary pending_uploads record for extraction
    const contentHash = `eval-${evalCase.id}-${Date.now()}`;
    const uploads = await sql`
      INSERT INTO pending_uploads (
        user_id, profile_id, file_name, content_hash, file_url, status
      )
      SELECT
        (SELECT id FROM users WHERE is_admin = true LIMIT 1),
        r.profile_id,
        'eval-' || r.file_name,
        ${contentHash},
        ${evalCase.blob_url},
        'extracting'
      FROM reports r WHERE r.id = ${evalCase.report_id}
      RETURNING id
    `;

    if (uploads.length === 0) {
      errors.push("Failed to create pending upload");
      return result;
    }

    const uploadId = uploads[0].id;

    // Call worker directly (local dev mode)
    const workerUrl = `${BASE_URL}/api/upload/${uploadId}/extract/worker`;
    const workerResponse = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uploadId }),
    });

    if (!workerResponse.ok) {
      errors.push(`Worker returned ${workerResponse.status}`);
      return result;
    }

    // Wait for extraction to complete (poll)
    let extracted = null;
    for (let attempt = 0; attempt < 60; attempt++) {
      await new Promise((r) => setTimeout(r, 5000));
      const rows = await sql`
        SELECT status, extracted_data, error_message
        FROM pending_uploads WHERE id = ${uploadId}
      `;
      if (rows.length === 0) break;
      if (rows[0].status === "review") {
        extracted = rows[0].extracted_data;
        break;
      }
      if (rows[0].status === "pending" && rows[0].error_message) {
        errors.push(`Extraction failed: ${rows[0].error_message}`);
        break;
      }
    }

    if (!extracted) {
      if (errors.length === 0) errors.push("Extraction timed out");
      return result;
    }

    // Compare results
    const extractedMetrics: ExpectedMetric[] = (extracted.metrics || []).map(
      (m: Record<string, unknown>) => ({
        name: String(m.name || ""),
        value: Number(m.value),
        unit: m.unit ? String(m.unit) : null,
        ref_low: m.ref_low != null ? Number(m.ref_low) : null,
        ref_high: m.ref_high != null ? Number(m.ref_high) : null,
        flag: m.flag ? String(m.flag) : null,
      }),
    );

    result.metricCount.extracted = extractedMetrics.length;

    // Check sample date
    if (evalCase.expected_sample_date && extracted.sample_date) {
      result.dateMatch =
        evalCase.expected_sample_date === extracted.sample_date;
    }

    // Compare metrics
    const comparison = compareMetrics(
      evalCase.expected_metrics,
      extractedMetrics,
    );
    result.nameMatches = comparison.nameMatches;
    result.valueMatches = comparison.valueMatches;
    result.unitMatches = comparison.unitMatches;

    // Overall accuracy: % of expected metrics correctly extracted (name + value)
    result.accuracy =
      evalCase.expected_metrics.length > 0
        ? (comparison.valueMatches / evalCase.expected_metrics.length) * 100
        : 0;

    // Clean up: delete the temporary pending upload
    await sql`DELETE FROM pending_uploads WHERE id = ${uploadId}`;
  } catch (err) {
    errors.push(String(err));
  }

  return result;
}

async function main() {
  console.log("Fetching eval cases...\n");

  const evalCases = (await sql`
    SELECT id, report_id, blob_url, expected_sample_date::TEXT, expected_metrics, notes
    FROM extraction_evals
    ORDER BY created_at ASC
  `) as unknown as EvalCase[];

  if (evalCases.length === 0) {
    console.log("No eval cases found. Add some via the admin dashboard.");
    console.log("  POST /api/admin/reports/[id]/add-to-evals\n");
    process.exit(0);
  }

  console.log(`Found ${evalCases.length} eval case(s). Running...\n`);

  const results: EvalResult[] = [];

  for (const evalCase of evalCases) {
    process.stdout.write(
      `  [${results.length + 1}/${evalCases.length}] Report ${evalCase.report_id.slice(0, 8)}... `,
    );

    const result = await runSingleEval(evalCase);
    results.push(result);

    if (result.errors.length > 0) {
      console.log(`ERROR: ${result.errors[0]}`);
    } else {
      console.log(
        `${result.accuracy.toFixed(1)}% accuracy ` +
          `(${result.valueMatches}/${result.metricCount.expected} values, ` +
          `${result.nameMatches} names, date: ${result.dateMatch ? "OK" : "MISS"})`,
      );
    }
  }

  // Summary
  console.log("\n--- SUMMARY ---\n");

  const successful = results.filter((r) => r.errors.length === 0);
  const failed = results.filter((r) => r.errors.length > 0);

  if (successful.length > 0) {
    const avgAccuracy =
      successful.reduce((sum, r) => sum + r.accuracy, 0) / successful.length;
    const avgNameRecall =
      successful.reduce(
        (sum, r) => sum + r.nameMatches / r.metricCount.expected,
        0,
      ) / successful.length;

    console.log(`  Total cases:     ${results.length}`);
    console.log(`  Successful:      ${successful.length}`);
    console.log(`  Failed:          ${failed.length}`);
    console.log(`  Avg accuracy:    ${avgAccuracy.toFixed(1)}%`);
    console.log(`  Avg name recall: ${(avgNameRecall * 100).toFixed(1)}%`);
    console.log(
      `  Date matches:    ${successful.filter((r) => r.dateMatch).length}/${successful.length}`,
    );
  }

  if (failed.length > 0) {
    console.log("\nFailed cases:");
    for (const r of failed) {
      console.log(`  - ${r.reportId.slice(0, 8)}: ${r.errors.join(", ")}`);
    }
  }

  console.log();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
