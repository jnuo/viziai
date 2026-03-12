import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";
import { isValidUUID } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/metric-definitions/[id]/aliases
 * Add an alias for a metric definition.
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

    // Verify definition exists and get key for canonical_name
    const definition = await sql`
      SELECT id, key FROM metric_definitions WHERE id = ${id}
    `;
    if (definition.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const { alias } = body;

    if (!alias || typeof alias !== "string" || alias.length > 200) {
      return NextResponse.json(
        { error: "alias is required and must be <= 200 characters" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO metric_aliases (alias, canonical_name, metric_definition_id)
      VALUES (${alias}, ${definition[0].key}, ${id})
      RETURNING id
    `;

    return NextResponse.json({ id: result[0].id }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("duplicate key value")
    ) {
      return NextResponse.json(
        { error: "This alias already exists" },
        { status: 409 },
      );
    }
    reportError(error, { op: "admin.metric-definitions.aliases.POST" });
    return NextResponse.json(
      { error: "Failed to create alias" },
      { status: 500 },
    );
  }
}
