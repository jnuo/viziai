import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";
import { isValidUUID } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/metric-definitions/[id]
 * Get a single metric definition with all related data.
 */
export async function GET(
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

    // Fetch definition
    const definitions = await sql`
      SELECT id, key, category, canonical_unit, value_type, created_at
      FROM metric_definitions
      WHERE id = ${id}
    `;

    if (definitions.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Fetch related data in parallel
    const [translations, aliases, refRanges] = await Promise.all([
      sql`
        SELECT id, locale, display_name
        FROM metric_translations
        WHERE metric_definition_id = ${id}
        ORDER BY locale ASC
      `,
      sql`
        SELECT id, alias, canonical_name
        FROM metric_aliases
        WHERE metric_definition_id = ${id}
        ORDER BY alias ASC
      `,
      sql`
        SELECT id, sex, age_min, age_max, ref_low, ref_high
        FROM metric_ref_ranges
        WHERE metric_definition_id = ${id}
        ORDER BY sex NULLS FIRST, age_min NULLS FIRST
      `,
    ]);

    return NextResponse.json({
      ...definitions[0],
      translations,
      aliases,
      refRanges,
    });
  } catch (error) {
    reportError(error, { op: "admin.metric-definitions.GET.single" });
    return NextResponse.json(
      { error: "Failed to fetch metric definition" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/admin/metric-definitions/[id]
 * Update a metric definition.
 */
export async function PUT(
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

    const body = await request.json();
    const { key, category, canonicalUnit, valueType } = body;

    // Verify exists
    const existing = await sql`
      SELECT id FROM metric_definitions WHERE id = ${id}
    `;
    if (existing.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Build update - only update fields that were explicitly passed
    await sql`
      UPDATE metric_definitions
      SET
        key = COALESCE(${key || null}, key),
        category = CASE WHEN ${category === undefined} THEN category ELSE ${category || null} END,
        canonical_unit = CASE WHEN ${canonicalUnit === undefined} THEN canonical_unit ELSE ${canonicalUnit || null} END,
        value_type = COALESCE(${valueType || null}, value_type)
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("duplicate key value")
    ) {
      return NextResponse.json(
        { error: "A metric definition with this key already exists" },
        { status: 409 },
      );
    }
    reportError(error, { op: "admin.metric-definitions.PUT" });
    return NextResponse.json(
      { error: "Failed to update metric definition" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/metric-definitions/[id]
 * Delete a metric definition and cascade to related data.
 */
export async function DELETE(
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

    // Verify exists
    const existing = await sql`
      SELECT id FROM metric_definitions WHERE id = ${id}
    `;
    if (existing.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Delete related data first (foreign keys may not cascade)
    await sql`DELETE FROM metric_translations WHERE metric_definition_id = ${id}`;
    await sql`DELETE FROM metric_ref_ranges WHERE metric_definition_id = ${id}`;
    await sql`UPDATE metric_aliases SET metric_definition_id = NULL WHERE metric_definition_id = ${id}`;

    // Delete definition
    await sql`DELETE FROM metric_definitions WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    reportError(error, { op: "admin.metric-definitions.DELETE" });
    return NextResponse.json(
      { error: "Failed to delete metric definition" },
      { status: 500 },
    );
  }
}
