import { NextResponse } from "next/server";
import { requireAuth, getProfileAccessLevel } from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";
import { isValidUUID } from "@/lib/utils";
import { processMetric } from "@/lib/metric-definitions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface UpdateMetricRequest {
  metricId: string;
  value: number;
  unit: string | null;
  ref_low: number | null;
  ref_high: number | null;
}

/**
 * PUT /api/settings/files/[id]/metrics
 * Update a metric's value and reference ranges
 */
export async function PUT(
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

    const { id: fileId } = await params;

    if (!isValidUUID(fileId)) {
      return NextResponse.json(
        { error: "Bad Request", message: "Invalid file ID" },
        { status: 400 },
      );
    }

    const body = (await request.json()) as UpdateMetricRequest;

    // Validate request
    if (!body.metricId || !isValidUUID(body.metricId)) {
      return NextResponse.json(
        { error: "Bad Request", message: "metricId is required" },
        { status: 400 },
      );
    }

    if (typeof body.value !== "number" || isNaN(body.value)) {
      return NextResponse.json(
        { error: "Bad Request", message: "value must be a valid number" },
        { status: 400 },
      );
    }

    // Get the processed file to verify access
    const files = await sql`
      SELECT profile_id, file_name
      FROM processed_files
      WHERE id = ${fileId}
    `;

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Not Found", message: "File not found" },
        { status: 404 },
      );
    }

    const file = files[0];

    // Verify user has editor or owner access to this profile
    const accessLevel = await getProfileAccessLevel(userId, file.profile_id);
    if (!accessLevel || accessLevel === "viewer") {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "You don't have write access to this file",
        },
        { status: 403 },
      );
    }

    // Verify the metric belongs to a report associated with this file and get its name
    const metricCheck = await sql`
      SELECT m.id, m.name
      FROM metrics m
      JOIN reports r ON r.id = m.report_id
      WHERE m.id = ${body.metricId}
      AND r.profile_id = ${file.profile_id}
      AND r.file_name = ${file.file_name}
    `;

    if (metricCheck.length === 0) {
      return NextResponse.json(
        {
          error: "Not Found",
          message: "Metric not found or doesn't belong to this file",
        },
        { status: 404 },
      );
    }

    const existingMetric = metricCheck[0];

    // Re-process through the unified pipeline to handle unit conversion and flag calculation
    const processed = await processMetric({
      name: existingMetric.name as string,
      value: body.value,
      unit: body.unit,
      ref_low: body.ref_low,
      ref_high: body.ref_high,
    });

    // Update the metric with processed values
    await sql`
      UPDATE metrics
      SET
        value = ${processed.value},
        unit = ${processed.unit},
        ref_low = ${processed.refLow},
        ref_high = ${processed.refHigh},
        flag = ${processed.flag},
        metric_definition_id = COALESCE(${processed.definitionId}, metric_definition_id)
      WHERE id = ${body.metricId}
    `;

    console.log(`[API] Metric updated: ${body.metricId}`);

    return NextResponse.json({
      success: true,
      metricId: body.metricId,
    });
  } catch (error) {
    reportError(error, { op: "settings.files.metrics.put" });
    return NextResponse.json(
      { error: "Failed to update metric" },
      { status: 500 },
    );
  }
}
