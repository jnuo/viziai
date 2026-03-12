import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/metric-definitions
 * List all metric definitions with counts of translations, aliases, and ref ranges.
 */
export async function GET(request: Request) {
  const userId = await requireAdmin();
  if (!userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const category = url.searchParams.get("category") || "";

    const rows = await sql`
      SELECT
        md.id,
        md.key,
        md.category,
        md.canonical_unit,
        md.value_type,
        md.created_at,
        COALESCE(t.cnt, 0)::int AS translation_count,
        COALESCE(a.cnt, 0)::int AS alias_count,
        COALESCE(r.cnt, 0)::int AS ref_range_count
      FROM metric_definitions md
      LEFT JOIN (
        SELECT metric_definition_id, COUNT(*)::int AS cnt
        FROM metric_translations
        GROUP BY metric_definition_id
      ) t ON t.metric_definition_id = md.id
      LEFT JOIN (
        SELECT metric_definition_id, COUNT(*)::int AS cnt
        FROM metric_aliases
        WHERE metric_definition_id IS NOT NULL
        GROUP BY metric_definition_id
      ) a ON a.metric_definition_id = md.id
      LEFT JOIN (
        SELECT metric_definition_id, COUNT(*)::int AS cnt
        FROM metric_ref_ranges
        GROUP BY metric_definition_id
      ) r ON r.metric_definition_id = md.id
      WHERE
        (${search} = '' OR md.key ILIKE '%' || ${search} || '%')
        AND (${category} = '' OR md.category = ${category})
      ORDER BY md.key ASC
    `;

    // Get distinct categories for filter dropdown
    const categories = await sql`
      SELECT DISTINCT category FROM metric_definitions
      WHERE category IS NOT NULL
      ORDER BY category ASC
    `;

    return NextResponse.json({
      items: rows,
      categories: categories.map((c) => c.category),
    });
  } catch (error) {
    reportError(error, { op: "admin.metric-definitions.GET" });
    return NextResponse.json(
      { error: "Failed to fetch metric definitions" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/metric-definitions
 * Create a new metric definition.
 */
export async function POST(request: Request) {
  const userId = await requireAdmin();
  if (!userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const { key, category, canonicalUnit, valueType } = body;

    if (!key || typeof key !== "string" || key.length > 100) {
      return NextResponse.json(
        { error: "key is required and must be <= 100 characters" },
        { status: 400 },
      );
    }

    const vt = valueType || "quantitative";
    if (!["quantitative", "qualitative"].includes(vt)) {
      return NextResponse.json(
        { error: "valueType must be 'quantitative' or 'qualitative'" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO metric_definitions (key, category, canonical_unit, value_type)
      VALUES (${key}, ${category || null}, ${canonicalUnit || null}, ${vt})
      RETURNING id
    `;

    return NextResponse.json({ id: result[0].id }, { status: 201 });
  } catch (error) {
    // Check for unique constraint violation
    if (
      error instanceof Error &&
      error.message.includes("duplicate key value")
    ) {
      return NextResponse.json(
        { error: "A metric definition with this key already exists" },
        { status: 409 },
      );
    }
    reportError(error, { op: "admin.metric-definitions.POST" });
    return NextResponse.json(
      { error: "Failed to create metric definition" },
      { status: 500 },
    );
  }
}
