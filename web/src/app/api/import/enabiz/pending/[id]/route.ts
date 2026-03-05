import { NextResponse } from "next/server";
import { requireAuth, hasProfileAccess } from "@/lib/auth";
import { sql } from "@/lib/db";
import { computeReportSimilarity } from "@/lib/report-similarity";
import { reportError } from "@/lib/error-reporting";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/import/enabiz/pending/[id]
 * Returns pending import data + collision info + aliases for the review page.
 * Auth: session-based (opened in browser).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireAuth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please sign in" },
        { status: 401 },
      );
    }

    const { id } = await params;

    const rows = await sql`
      SELECT pi.*, pi.sample_date::text as sample_date_text, p.display_name as profile_name
      FROM pending_imports pi
      JOIN profiles p ON p.id = pi.profile_id
      WHERE pi.id = ${id}
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Not Found", message: "Import not found" },
        { status: 404 },
      );
    }

    const pending = rows[0];

    // Check access
    const access = await hasProfileAccess(userId, pending.profile_id);
    if (!access) {
      return NextResponse.json(
        { error: "Forbidden", message: "No access to this profile" },
        { status: 403 },
      );
    }

    // Check if already processed or expired
    if (pending.status !== "pending") {
      return NextResponse.json({
        import: pending,
        processed: true,
        message: "This import has already been processed",
      });
    }

    if (new Date(pending.expires_at) < new Date()) {
      return NextResponse.json({
        import: pending,
        processed: true,
        message: "This import has expired",
      });
    }

    // Fetch alias map (needed for both collision check and response)
    const aliasRows =
      await sql`SELECT alias, canonical_name FROM metric_aliases`;
    const aliases = Object.fromEntries(
      aliasRows.map((row) => [row.alias, row.canonical_name]),
    );
    const aliasLookup = new Map(
      aliasRows.map((row) => [row.alias.toLowerCase(), row.canonical_name]),
    );

    // Check for same-date report collisions
    let collision = null;
    const sameDateReports = await sql`
      SELECT r.id, r.source,
        json_agg(json_build_object('name', m.name, 'value', m.value)) as metrics
      FROM reports r
      LEFT JOIN metrics m ON m.report_id = r.id
      WHERE r.profile_id = ${pending.profile_id}
      AND r.sample_date = ${pending.sample_date}
      GROUP BY r.id
    `;

    if (sameDateReports.length > 0) {
      // Normalize pending metric names via aliases for accurate comparison
      const pendingMetrics = (
        pending.metrics as Array<{ name: string; value: number }>
      ).map((m) => ({
        ...m,
        name: aliasLookup.get(m.name.toLowerCase()) || m.name,
      }));
      let bestMatch = null;
      let bestSimilarity = 0;

      for (const report of sameDateReports) {
        const existingMetrics = (report.metrics || []).filter(
          (m: { name: string | null }) => m.name !== null,
        );
        const result = computeReportSimilarity(existingMetrics, pendingMetrics);
        if (result.similarity > bestSimilarity) {
          bestSimilarity = result.similarity;
          bestMatch = {
            reportId: report.id,
            source: report.source,
            existingMetrics,
            ...result,
          };
        }
      }

      if (bestMatch) {
        collision = bestMatch;
      }
    }

    return NextResponse.json({
      import: {
        id: pending.id,
        profileId: pending.profile_id,
        profileName: pending.profile_name,
        source: pending.source,
        contentHash: pending.content_hash,
        sampleDate: pending.sample_date_text,
        hospitalName: pending.hospital_name,
        metrics: pending.metrics,
        status: pending.status,
        createdAt: pending.created_at,
      },
      collision,
      aliases,
      processed: false,
    });
  } catch (error) {
    reportError(error, { op: "import.enabiz.pending.GET" });
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to load import" },
      { status: 500 },
    );
  }
}
