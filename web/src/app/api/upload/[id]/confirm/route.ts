import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";
import {
  processMetricsBatch,
  trackUnmappedMetrics,
  type RawMetric,
} from "@/lib/metric-definitions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ConfirmedMetric {
  name: string;
  value: number;
  unit?: string;
  ref_low?: number | null;
  ref_high?: number | null;
}

interface ConfirmRequest {
  sampleDate: string; // YYYY-MM-DD
  metrics: ConfirmedMetric[];
}

function isValidMetricValue(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

/**
 * POST /api/upload/[id]/confirm
 * Confirm extracted data and save to database
 */
export async function POST(
  request: Request,
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

    const { id: uploadId } = await params;
    const body = (await request.json()) as ConfirmRequest;

    if (!body.sampleDate) {
      return NextResponse.json(
        { error: "Bad Request", message: "sampleDate is required" },
        { status: 400 },
      );
    }

    if (
      !body.metrics ||
      !Array.isArray(body.metrics) ||
      body.metrics.length === 0
    ) {
      return NextResponse.json(
        { error: "Bad Request", message: "At least one metric is required" },
        { status: 400 },
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.sampleDate)) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "sampleDate must be in YYYY-MM-DD format",
        },
        { status: 400 },
      );
    }

    // Atomically claim the upload — prevents duplicate confirms from double-clicks/retries.
    // Only one request can transition from 'review' to 'confirming'.
    const uploads = await sql`
      UPDATE pending_uploads
      SET status = 'confirming', updated_at = NOW()
      WHERE id = ${uploadId}
        AND user_id = ${userId}
        AND status = 'review'
      RETURNING id, profile_id, file_name, content_hash, file_url
    `;

    if (uploads.length === 0) {
      // Either not found or already confirmed/confirming
      const existing = await sql`
        SELECT status FROM pending_uploads
        WHERE id = ${uploadId} AND user_id = ${userId}
      `;
      if (existing.length === 0) {
        return NextResponse.json(
          { error: "Not Found", message: "Upload not found" },
          { status: 404 },
        );
      }
      return NextResponse.json(
        {
          error: "Bad Request",
          message: `Upload must be in 'review' status to confirm. Current: ${existing[0].status}`,
        },
        { status: 400 },
      );
    }

    const upload = uploads[0];

    const profileId = upload.profile_id;

    // Check if this exact file was already processed (dedup by content_hash)
    if (upload.content_hash) {
      const alreadyProcessed = await sql`
        SELECT id FROM processed_files
        WHERE profile_id = ${profileId} AND content_hash = ${upload.content_hash}
      `;
      if (alreadyProcessed.length > 0) {
        // Revert status so the user can see the error
        await sql`UPDATE pending_uploads SET status = 'review' WHERE id = ${uploadId}`;
        return NextResponse.json(
          {
            error: "Duplicate",
            message: "This file has already been processed",
          },
          { status: 409 },
        );
      }
    }

    // Create report. Multiple reports on the same date are allowed (e.g. blood test + urine test).
    const reportResult = await sql`
      INSERT INTO reports (profile_id, sample_date, file_name, source, content_hash, blob_url)
      VALUES (${profileId}, ${body.sampleDate}, ${upload.file_name}, 'pdf', ${upload.content_hash}, ${upload.file_url || null})
      RETURNING id
    `;
    const reportId = reportResult[0]?.id;
    if (!reportId) {
      throw new Error("Failed to create report");
    }
    console.log(
      `[API] Created new report: ${reportId} for date ${body.sampleDate}`,
    );

    // Filter valid metrics and process through unified pipeline
    const validMetrics = body.metrics.filter((m) => {
      if (!isValidMetricValue(m.value)) {
        console.log(`[API] Skipping metric with invalid value: ${m.name}`);
        return false;
      }
      return true;
    });

    // Process all metrics through the unified pipeline (resolve + convert + flag)
    const rawMetrics: RawMetric[] = validMetrics.map((m) => ({
      name: m.name,
      value: m.value,
      unit: m.unit,
      ref_low: m.ref_low,
      ref_high: m.ref_high,
    }));
    const processedMetrics = await processMetricsBatch(rawMetrics);

    // Insert metrics
    let insertedCount = 0;
    let updatedCount = 0;

    for (let i = 0; i < processedMetrics.length; i++) {
      const metric = validMetrics[i];
      const processed = processedMetrics[i];

      const result = await sql`
        INSERT INTO metrics (report_id, name, value, unit, ref_low, ref_high, flag, metric_definition_id, sort_order)
        VALUES (
          ${reportId},
          ${metric.name},
          ${processed.value},
          ${processed.unit},
          ${processed.refLow},
          ${processed.refHigh},
          ${processed.flag},
          ${processed.definitionId},
          ${i}
        )
        ON CONFLICT (report_id, name) DO UPDATE
        SET
          value = EXCLUDED.value,
          unit = COALESCE(EXCLUDED.unit, metrics.unit),
          ref_low = COALESCE(EXCLUDED.ref_low, metrics.ref_low),
          ref_high = COALESCE(EXCLUDED.ref_high, metrics.ref_high),
          flag = EXCLUDED.flag,
          metric_definition_id = COALESCE(EXCLUDED.metric_definition_id, metrics.metric_definition_id),
          sort_order = EXCLUDED.sort_order
        RETURNING (xmax = 0) as is_insert
      `;

      if (result[0]?.is_insert) {
        insertedCount++;
      } else {
        updatedCount++;
      }
    }

    // Batch-insert metric_preferences for all confirmed metrics
    const validNames = validMetrics.map((m) => m.name);
    if (validNames.length > 0) {
      await sql`
        INSERT INTO metric_preferences (profile_id, name)
        SELECT ${profileId}, unnest(${validNames}::text[])
        ON CONFLICT (profile_id, name) DO NOTHING
      `;
    }

    // Record in processed_files (to prevent duplicate uploads)
    try {
      await sql`
        INSERT INTO processed_files (profile_id, file_name, content_hash)
        VALUES (${profileId}, ${upload.file_name}, ${upload.content_hash})
        ON CONFLICT (profile_id, content_hash) DO UPDATE
        SET file_name = EXCLUDED.file_name, created_at = NOW()
      `;
      console.log(`[API] processed_files recorded: ${upload.file_name}`);
    } catch (e) {
      reportError(e, { op: "upload.confirm.processedFiles", uploadId });
    }

    // Track unmapped metrics (fire-and-forget — don't block confirm flow)
    const unmappedData = processedMetrics.map((p, i) => ({
      name: validMetrics[i].name,
      unit: validMetrics[i].unit,
      refLow: validMetrics[i].ref_low,
      refHigh: validMetrics[i].ref_high,
      resolved: p.resolved,
    }));
    trackUnmappedMetrics(unmappedData, {
      reportId,
      profileId,
      uploadId,
    });

    // Update pending upload status — blob is preserved for admin review and re-extraction
    await sql`
      UPDATE pending_uploads
      SET status = 'confirmed',
          updated_at = NOW()
      WHERE id = ${uploadId}
    `;

    console.log(
      `[API] Upload confirmed: ${uploadId}, ${insertedCount} inserted, ${updatedCount} updated`,
    );

    return NextResponse.json({
      success: true,
      reportId,
      sampleDate: body.sampleDate,
      metricsInserted: insertedCount,
      metricsUpdated: updatedCount,
    });
  } catch (error) {
    reportError(error, { op: "upload.confirm.POST" });
    return NextResponse.json(
      {
        error: "Failed to confirm upload",
        message: "Failed to confirm upload",
      },
      { status: 500 },
    );
  }
}
