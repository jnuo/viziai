import { NextResponse } from "next/server";
import { requireAuth, getProfileAccessLevel } from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";
import {
  processMetricsBatch,
  trackUnmappedMetrics,
  type RawMetric,
} from "@/lib/metric-definitions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ConfirmRequest {
  sampleDate: string;
  metrics: Array<{
    name: string;
    value: number;
    unit?: string;
    ref_low?: number | null;
    ref_high?: number | null;
  }>;
  collisionAction?: "overwrite" | "skip" | "create_separate";
  collisionReportId?: string;
}

/**
 * POST /api/import/enabiz/pending/[id]/confirm
 * Confirm a pending import from the review page.
 * Auth: session-based, must be owner or editor.
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

    const { id } = await params;
    const body = (await request.json()) as ConfirmRequest;

    // Fetch the pending import
    const rows = await sql`
      SELECT * FROM pending_imports WHERE id = ${id}
    `;
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Not Found", message: "Import not found" },
        { status: 404 },
      );
    }

    const pending = rows[0];

    // Check status
    if (pending.status !== "pending") {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "This import has already been processed",
        },
        { status: 400 },
      );
    }

    // Check expiry
    if (new Date(pending.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Gone", message: "This import has expired" },
        { status: 410 },
      );
    }

    // Check access level (must be owner or editor)
    const level = await getProfileAccessLevel(userId, pending.profile_id);
    if (!level || level === "viewer") {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "You need editor or owner access to confirm imports",
        },
        { status: 403 },
      );
    }

    const profileId = pending.profile_id;
    const collisionAction = body.collisionAction || "create_separate";

    // Handle "skip" action (before validation — skip sends empty metrics)
    if (collisionAction === "skip") {
      await sql`
        UPDATE pending_imports SET status = 'skipped' WHERE id = ${id}
      `;
      return NextResponse.json({ success: true, action: "skipped" });
    }

    // Validate input
    if (!body.sampleDate || !body.metrics?.length) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "sampleDate and metrics are required",
        },
        { status: 400 },
      );
    }

    let reportId: string;

    if (collisionAction === "overwrite" && body.collisionReportId) {
      // Delete existing metrics and reuse the report
      reportId = body.collisionReportId;

      // Verify the report belongs to this profile
      const reportCheck = await sql`
        SELECT id FROM reports WHERE id = ${reportId} AND profile_id = ${profileId}
      `;
      if (reportCheck.length === 0) {
        return NextResponse.json(
          {
            error: "Bad Request",
            message: "Collision report not found for this profile",
          },
          { status: 400 },
        );
      }

      await sql`DELETE FROM metrics WHERE report_id = ${reportId}`;
      await sql`
        UPDATE reports
        SET sample_date = ${body.sampleDate}, source = 'enabiz', file_name = ${pending.hospital_name || "e-Nabız"}
        WHERE id = ${reportId}
      `;
      console.log(`[API] Overwriting report: ${reportId}`);
    } else {
      // Create new report (create_separate or no collision)
      const reportResult = await sql`
        INSERT INTO reports (profile_id, sample_date, file_name, source, content_hash)
        VALUES (${profileId}, ${body.sampleDate}, ${pending.hospital_name || "e-Nabız"}, 'enabiz', ${pending.content_hash})
        RETURNING id
      `;
      reportId = reportResult[0]?.id;
      if (!reportId) {
        throw new Error("Failed to create report");
      }
      console.log(`[API] Created new report: ${reportId} from e-Nabız import`);
    }

    // Filter valid metrics and process through unified pipeline
    const validMetrics = body.metrics.filter(
      (m) => typeof m.value === "number" && !isNaN(m.value),
    );

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
    for (let i = 0; i < processedMetrics.length; i++) {
      const metric = validMetrics[i];
      const processed = processedMetrics[i];

      await sql`
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
        SET value = EXCLUDED.value,
            unit = COALESCE(EXCLUDED.unit, metrics.unit),
            ref_low = COALESCE(EXCLUDED.ref_low, metrics.ref_low),
            ref_high = COALESCE(EXCLUDED.ref_high, metrics.ref_high),
            flag = EXCLUDED.flag,
            metric_definition_id = COALESCE(EXCLUDED.metric_definition_id, metrics.metric_definition_id),
            sort_order = EXCLUDED.sort_order
      `;
      insertedCount++;
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

    // Record in processed_files for dedup
    try {
      await sql`
        INSERT INTO processed_files (profile_id, file_name, content_hash)
        VALUES (${profileId}, ${pending.hospital_name || "e-Nabız"}, ${pending.content_hash})
        ON CONFLICT (profile_id, content_hash) DO UPDATE
        SET file_name = EXCLUDED.file_name, created_at = NOW()
      `;
    } catch (e) {
      reportError(e, {
        op: "import.enabiz.confirm.processedFiles",
        importId: id,
      });
    }

    // Track unmapped metrics (fire-and-forget)
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
      uploadId: null,
    });

    // Mark pending import as confirmed
    await sql`
      UPDATE pending_imports SET status = 'confirmed' WHERE id = ${id}
    `;

    console.log(
      `[API] e-Nabız import confirmed: ${id}, ${insertedCount} metrics inserted`,
    );

    return NextResponse.json({
      success: true,
      action: collisionAction,
      reportId,
      metricsInserted: insertedCount,
    });
  } catch (error) {
    reportError(error, { op: "import.enabiz.confirm.POST" });
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to confirm import" },
      { status: 500 },
    );
  }
}
