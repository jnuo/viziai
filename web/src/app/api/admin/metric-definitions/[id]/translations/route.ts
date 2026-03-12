import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";
import { isValidUUID } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/metric-definitions/[id]/translations
 * Add a translation for a metric definition.
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
    const { locale, displayName } = body;

    if (!locale || typeof locale !== "string" || locale.length > 10) {
      return NextResponse.json(
        { error: "locale is required and must be <= 10 characters" },
        { status: 400 },
      );
    }

    if (!displayName || typeof displayName !== "string" || displayName.length > 200) {
      return NextResponse.json(
        { error: "displayName is required and must be <= 200 characters" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO metric_translations (metric_definition_id, locale, display_name)
      VALUES (${id}, ${locale}, ${displayName})
      RETURNING id
    `;

    return NextResponse.json({ id: result[0].id }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("duplicate key value")
    ) {
      return NextResponse.json(
        { error: "A translation for this locale already exists" },
        { status: 409 },
      );
    }
    reportError(error, { op: "admin.metric-definitions.translations.POST" });
    return NextResponse.json(
      { error: "Failed to create translation" },
      { status: 500 },
    );
  }
}
