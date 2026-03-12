import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";
import { isValidUUID } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/admin/metric-definitions/[id]/aliases/[aliasId]
 * Delete an alias.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; aliasId: string }> },
) {
  const userId = await requireAdmin();
  if (!userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id, aliasId } = await params;

    if (!isValidUUID(id) || !isValidUUID(aliasId)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Verify alias exists and belongs to this definition
    const existing = await sql`
      SELECT id FROM metric_aliases
      WHERE id = ${aliasId} AND metric_definition_id = ${id}
    `;
    if (existing.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await sql`DELETE FROM metric_aliases WHERE id = ${aliasId}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    reportError(error, { op: "admin.metric-definitions.aliases.DELETE" });
    return NextResponse.json(
      { error: "Failed to delete alias" },
      { status: 500 },
    );
  }
}
