import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";
import { isValidUUID } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * PUT /api/admin/metric-definitions/[id]/ref-ranges/[rangeId]
 * Update a reference range.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; rangeId: string }> },
) {
  const userId = await requireAdmin();
  if (!userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id, rangeId } = await params;

    if (!isValidUUID(id) || !isValidUUID(rangeId)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Verify ref range exists and belongs to this definition
    const existing = await sql`
      SELECT id FROM metric_ref_ranges
      WHERE id = ${rangeId} AND metric_definition_id = ${id}
    `;
    if (existing.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const { sex, ageMin, ageMax, refLow, refHigh } = body;

    // Validate sex if provided
    if (sex !== undefined && sex !== null && !["M", "F"].includes(sex)) {
      return NextResponse.json(
        { error: "sex must be null, 'M', or 'F'" },
        { status: 400 },
      );
    }

    await sql`
      UPDATE metric_ref_ranges
      SET
        sex = ${sex === undefined ? null : (sex || null)},
        age_min = ${ageMin === undefined ? null : (ageMin ?? null)},
        age_max = ${ageMax === undefined ? null : (ageMax ?? null)},
        ref_low = ${refLow === undefined ? null : (refLow ?? null)},
        ref_high = ${refHigh === undefined ? null : (refHigh ?? null)}
      WHERE id = ${rangeId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("duplicate key value")
    ) {
      return NextResponse.json(
        { error: "A reference range with these parameters already exists" },
        { status: 409 },
      );
    }
    reportError(error, { op: "admin.metric-definitions.ref-ranges.PUT" });
    return NextResponse.json(
      { error: "Failed to update reference range" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/metric-definitions/[id]/ref-ranges/[rangeId]
 * Delete a reference range.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; rangeId: string }> },
) {
  const userId = await requireAdmin();
  if (!userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id, rangeId } = await params;

    if (!isValidUUID(id) || !isValidUUID(rangeId)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Verify ref range exists and belongs to this definition
    const existing = await sql`
      SELECT id FROM metric_ref_ranges
      WHERE id = ${rangeId} AND metric_definition_id = ${id}
    `;
    if (existing.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await sql`DELETE FROM metric_ref_ranges WHERE id = ${rangeId}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    reportError(error, { op: "admin.metric-definitions.ref-ranges.DELETE" });
    return NextResponse.json(
      { error: "Failed to delete reference range" },
      { status: 500 },
    );
  }
}
