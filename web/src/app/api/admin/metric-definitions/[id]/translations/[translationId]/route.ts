import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";
import { isValidUUID } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * PUT /api/admin/metric-definitions/[id]/translations/[translationId]
 * Update a translation.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; translationId: string }> },
) {
  const userId = await requireAdmin();
  if (!userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id, translationId } = await params;

    if (!isValidUUID(id) || !isValidUUID(translationId)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Verify translation exists and belongs to this definition
    const existing = await sql`
      SELECT id FROM metric_translations
      WHERE id = ${translationId} AND metric_definition_id = ${id}
    `;
    if (existing.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const { locale, displayName } = body;

    if (locale !== undefined && (typeof locale !== "string" || locale.length > 10)) {
      return NextResponse.json(
        { error: "locale must be <= 10 characters" },
        { status: 400 },
      );
    }

    if (displayName !== undefined && (typeof displayName !== "string" || displayName.length > 200)) {
      return NextResponse.json(
        { error: "displayName must be <= 200 characters" },
        { status: 400 },
      );
    }

    await sql`
      UPDATE metric_translations
      SET
        locale = COALESCE(${locale || null}, locale),
        display_name = COALESCE(${displayName || null}, display_name)
      WHERE id = ${translationId}
    `;

    return NextResponse.json({ success: true });
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
    reportError(error, { op: "admin.metric-definitions.translations.PUT" });
    return NextResponse.json(
      { error: "Failed to update translation" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/metric-definitions/[id]/translations/[translationId]
 * Delete a translation.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; translationId: string }> },
) {
  const userId = await requireAdmin();
  if (!userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id, translationId } = await params;

    if (!isValidUUID(id) || !isValidUUID(translationId)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Verify translation exists and belongs to this definition
    const existing = await sql`
      SELECT id FROM metric_translations
      WHERE id = ${translationId} AND metric_definition_id = ${id}
    `;
    if (existing.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await sql`DELETE FROM metric_translations WHERE id = ${translationId}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    reportError(error, { op: "admin.metric-definitions.translations.DELETE" });
    return NextResponse.json(
      { error: "Failed to delete translation" },
      { status: 500 },
    );
  }
}
