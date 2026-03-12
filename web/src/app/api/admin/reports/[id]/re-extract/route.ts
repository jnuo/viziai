import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";
import { isValidUUID } from "@/lib/utils";
import { Client } from "@upstash/qstash";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/reports/[id]/re-extract
 * Triggers a new PDF extraction from the stored blob_url.
 * Creates a new pending_uploads record and enqueues extraction.
 * The original report is not modified — a new report will be created on confirm.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireAdmin();
  if (!userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Fetch report with blob_url
    const reports = await sql`
      SELECT id, profile_id, blob_url, file_name, sample_date
      FROM reports
      WHERE id = ${id}
    `;

    if (reports.length === 0) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const report = reports[0];

    if (!report.blob_url) {
      return NextResponse.json(
        { error: "No PDF stored for this report. Cannot re-extract." },
        { status: 400 },
      );
    }

    // Guard against concurrent re-extractions for the same report
    const inFlight = await sql`
      SELECT id FROM pending_uploads
      WHERE file_url = ${report.blob_url}
        AND status IN ('extracting', 'review')
      LIMIT 1
    `;
    if (inFlight.length > 0) {
      return NextResponse.json(
        { error: "A re-extraction is already in progress for this report." },
        { status: 409 },
      );
    }

    const contentHash = `re-extract-${randomUUID()}`;

    // Create a new pending_uploads record for the re-extraction
    const uploads = await sql`
      INSERT INTO pending_uploads (
        user_id, profile_id, file_name, content_hash, file_url, status
      )
      VALUES (
        ${userId},
        ${report.profile_id},
        ${report.file_name || "re-extraction.pdf"},
        ${contentHash},
        ${report.blob_url},
        'extracting'
      )
      RETURNING id
    `;

    const uploadId = uploads[0].id;

    // Trigger extraction (same pattern as upload/[id]/extract)
    const qstashToken = process.env.QSTASH_TOKEN;
    const isLocalDev = !qstashToken || process.env.NODE_ENV === "development";

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");
    const workerUrl = `${baseUrl}/api/upload/${uploadId}/extract/worker`;

    if (isLocalDev) {
      fetch(workerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId }),
      }).catch((err) => console.error("[Re-extract] Worker call failed:", err));
    } else {
      const client = new Client({ token: qstashToken });
      await client.publishJSON({
        url: workerUrl,
        body: { uploadId },
        retries: 2,
        timeout: "5m",
      });
    }

    return NextResponse.json({
      uploadId,
      status: "extracting",
      message: "Re-extraction triggered from stored PDF",
    });
  } catch (error) {
    reportError(error, { op: "admin.reports.re-extract.POST" });
    return NextResponse.json(
      { error: "Failed to trigger re-extraction" },
      { status: 500 },
    );
  }
}
