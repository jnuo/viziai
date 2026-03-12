import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";
import { isValidUUID } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/metric-definitions/[id]/ref-ranges
 * Add a reference range for a metric definition.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireAdmin();
  if (!userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Verify definition exists
    const existing = await sql`
      SELECT id FROM metric_definitions WHERE id = ${id}
    `;
    if (existing.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const { sex, ageMin, ageMax, refLow, refHigh } = body;

    // Validate sex
    if (sex !== null && sex !== undefined && !["M", "F"].includes(sex)) {
      return NextResponse.json(
        { error: "sex must be null, 'M', or 'F'" },
        { status: 400 },
      );
    }

    // Validate age bounds
    if (ageMin !== null && ageMin !== undefined && (typeof ageMin !== "number" || ageMin < 0)) {
      return NextResponse.json(
        { error: "ageMin must be a non-negative number or null" },
        { status: 400 },
      );
    }
    if (ageMax !== null && ageMax !== undefined && (typeof ageMax !== "number" || ageMax < 0)) {
      return NextResponse.json(
        { error: "ageMax must be a non-negative number or null" },
        { status: 400 },
      );
    }

    // At least one of refLow or refHigh should be provided
    if (
      (refLow === null || refLow === undefined) &&
      (refHigh === null || refHigh === undefined)
    ) {
      return NextResponse.json(
        { error: "At least one of refLow or refHigh is required" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
      VALUES (
        ${id},
        ${sex || null},
        ${ageMin ?? null},
        ${ageMax ?? null},
        ${refLow ?? null},
        ${refHigh ?? null}
      )
      RETURNING id
    `;

    return NextResponse.json({ id: result[0].id }, { status: 201 });
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
    reportError(error, { op: "admin.metric-definitions.ref-ranges.POST" });
    return NextResponse.json(
      { error: "Failed to create reference range" },
      { status: 500 },
    );
  }
}
