import { NextResponse } from "next/server";
import { requireApiKey } from "@/lib/api-key-auth";
import { sql } from "@/lib/db";
import { computeReportSimilarity } from "@/lib/report-similarity";
import { reportError } from "@/lib/error-reporting";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PendingImportRequest {
  date: string;
  hospital: string | null;
  contentHash: string;
  metrics: Array<{
    name: string;
    value: number;
    unit?: string;
    ref_low?: number | null;
    ref_high?: number | null;
  }>;
}

/**
 * POST /api/import/enabiz/pending
 * Creates a pending import from the Chrome extension.
 * Auth: Bearer API key (profileId derived from key).
 */
export async function POST(request: Request) {
  try {
    const auth = await requireApiKey(request);
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid or missing API key" },
        { status: 401 },
      );
    }

    const { userId, profileId } = auth;

    // Clean up expired pending imports (fire-and-forget)
    sql`DELETE FROM pending_imports WHERE expires_at < NOW() AND status = 'pending'`.catch(
      () => {},
    );

    const body = (await request.json()) as PendingImportRequest;

    if (!body.date || !body.contentHash || !body.metrics?.length) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "date, contentHash, and metrics are required",
        },
        { status: 400 },
      );
    }

    // Check if this exact report was already processed (dedup by content_hash)
    const alreadyProcessed = await sql`
      SELECT id FROM processed_files
      WHERE profile_id = ${profileId} AND content_hash = ${body.contentHash}
    `;
    if (alreadyProcessed.length > 0) {
      return NextResponse.json(
        {
          error: "Duplicate",
          message: "Bu rapor zaten aktarılmış",
        },
        { status: 409 },
      );
    }

    // Check if a pending import with the same hash already exists (prevents duplicates from rapid clicks)
    const existingPending = await sql`
      SELECT id FROM pending_imports
      WHERE profile_id = ${profileId}
        AND content_hash = ${body.contentHash}
        AND status = 'pending'
        AND expires_at > NOW()
    `;
    if (existingPending.length > 0) {
      return NextResponse.json({ id: existingPending[0].id, collision: null });
    }

    // Check for same-date reports (collision detection)
    let collision = null;
    const sameDateReports = await sql`
      SELECT r.id, r.source,
        json_agg(json_build_object('name', m.name, 'value', m.value)) as metrics
      FROM reports r
      LEFT JOIN metrics m ON m.report_id = r.id
      WHERE r.profile_id = ${profileId}
      AND r.sample_date = ${body.date}
      GROUP BY r.id
    `;

    if (sameDateReports.length > 0) {
      // Find the most similar report
      let bestMatch = null;
      let bestSimilarity = 0;

      for (const report of sameDateReports) {
        const existingMetrics = (report.metrics || []).filter(
          (m: { name: string | null }) => m.name !== null,
        );
        const result = computeReportSimilarity(existingMetrics, body.metrics);
        if (result.similarity > bestSimilarity) {
          bestSimilarity = result.similarity;
          bestMatch = {
            reportId: report.id,
            source: report.source,
            ...result,
          };
        }
      }

      if (bestMatch) {
        collision = bestMatch;
      }
    }

    // Create pending import (15-minute expiry)
    const result = await sql`
      INSERT INTO pending_imports (profile_id, user_id, source, content_hash, sample_date, hospital_name, metrics, expires_at)
      VALUES (${profileId}, ${userId}, 'enabiz', ${body.contentHash}, ${body.date}, ${body.hospital}, ${JSON.stringify(body.metrics)}, NOW() + INTERVAL '15 minutes')
      RETURNING id
    `;

    const pendingId = result[0]?.id;
    if (!pendingId) {
      throw new Error("Failed to create pending import");
    }

    console.log(
      `[API] Created pending import: ${pendingId} for profile ${profileId}`,
    );

    return NextResponse.json({ id: pendingId, collision });
  } catch (error) {
    reportError(error, { op: "import.enabiz.pending.POST" });
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to create pending import",
      },
      { status: 500 },
    );
  }
}
