import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";
import { isValidUUID } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/quality/unmapped/[id]
 * Update an unmapped metric: map to canonical name or accept as new.
 *
 * Body: { action: "map", canonicalName: string } | { action: "accept" }
 */
export async function PATCH(
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
    const action = body.action;

    if (!action || !["map", "accept"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'map' or 'accept'." },
        { status: 400 },
      );
    }

    // Verify unmapped metric exists and is pending
    const rows = await sql`
      SELECT id, metric_name FROM unmapped_metrics WHERE id = ${id} AND status = 'pending'
    `;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const metricName = rows[0].metric_name;

    if (action === "map") {
      const canonicalName = body.canonicalName;
      if (
        !canonicalName ||
        typeof canonicalName !== "string" ||
        canonicalName.length > 200
      ) {
        return NextResponse.json(
          { error: "canonicalName is required" },
          { status: 400 },
        );
      }

      // Create alias mapping (global, not per-user)
      await sql`
        INSERT INTO metric_aliases (alias, canonical_name)
        VALUES (${metricName}, ${canonicalName})
        ON CONFLICT (alias) DO UPDATE SET canonical_name = ${canonicalName}
      `;

      // Mark as mapped
      await sql`
        UPDATE unmapped_metrics
        SET status = 'mapped', suggested_canonical = ${canonicalName}
        WHERE id = ${id}
      `;
    } else {
      // Accept as genuinely new metric
      await sql`
        UPDATE unmapped_metrics SET status = 'accepted' WHERE id = ${id}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    reportError(error, { op: "admin.quality.unmapped.PATCH" });
    return NextResponse.json(
      { error: "Failed to update unmapped metric" },
      { status: 500 },
    );
  }
}
