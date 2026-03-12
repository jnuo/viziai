import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, getDbUserId, getProfileAccessLevel } from "@/lib/auth";
import { sql } from "@/lib/db";
import { isValidUUID } from "@/lib/utils";

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
    const session = await getServerSession(authOptions);
    const userId = getDbUserId(session);

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

    // Verify the metric belongs to a report associated with this file
    const metricCheck = await sql`
      SELECT m.id
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

    // Calculate flag based on reference values
    let flag: string | null = null;
    if (body.ref_low != null && body.value < body.ref_low) {
      flag = "L";
    } else if (body.ref_high != null && body.value > body.ref_high) {
      flag = "H";
    } else if (body.ref_low != null || body.ref_high != null) {
      flag = "N";
    }

    // Update the metric
    await sql`
      UPDATE metrics
      SET
        value = ${body.value},
        unit = ${body.unit},
        ref_low = ${body.ref_low},
        ref_high = ${body.ref_high},
        flag = ${flag}
      WHERE id = ${body.metricId}
    `;

    console.log(`[API] Metric updated: ${body.metricId}`);

    return NextResponse.json({
      success: true,
      metricId: body.metricId,
    });
  } catch (error) {
    console.error("[API] PUT /api/settings/files/[id]/metrics error:", error);
    return NextResponse.json(
      { error: "Failed to update metric" },
      { status: 500 },
    );
  }
}
