import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";
import { isValidUUID } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface MetricCorrection {
  metricId: string;
  name?: string;
  value?: number;
  unit?: string;
  refLow?: number | null;
  refHigh?: number | null;
}

interface ReviewBody {
  status: "approved" | "corrected";
  notes?: string;
  corrections?: MetricCorrection[];
}

/**
 * POST /api/admin/reports/[id]/review
 * Submit a review decision (approved/corrected) with optional metric corrections.
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
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const body: ReviewBody = await request.json();

    if (
      typeof body.status !== "string" ||
      !["approved", "corrected"].includes(body.status)
    ) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'approved' or 'corrected'." },
        { status: 400 },
      );
    }

    if (body.notes && body.notes.length > 2000) {
      return NextResponse.json({ error: "Notes too long" }, { status: 400 });
    }

    if (body.corrections && body.corrections.length > 200) {
      return NextResponse.json(
        { error: "Too many corrections" },
        { status: 400 },
      );
    }

    // Verify report exists
    const reports = await sql`
      SELECT id FROM reports WHERE id = ${id}
    `;
    if (reports.length === 0) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Apply metric corrections if provided
    // The WHERE clause guards ownership — no separate SELECT needed
    if (body.corrections && body.corrections.length > 0) {
      for (const c of body.corrections) {
        if (!c.metricId || !isValidUUID(c.metricId)) continue;

        // Validate correction field types
        if (
          c.name !== undefined &&
          (typeof c.name !== "string" ||
            c.name.length === 0 ||
            c.name.length > 200)
        )
          continue;
        if (
          c.value !== undefined &&
          (typeof c.value !== "number" || !Number.isFinite(c.value))
        )
          continue;
        if (
          c.unit !== undefined &&
          (typeof c.unit !== "string" || c.unit.length > 50)
        )
          continue;
        if (
          c.refLow !== undefined &&
          c.refLow !== null &&
          (typeof c.refLow !== "number" || !Number.isFinite(c.refLow))
        )
          continue;
        if (
          c.refHigh !== undefined &&
          c.refHigh !== null &&
          (typeof c.refHigh !== "number" || !Number.isFinite(c.refHigh))
        )
          continue;

        const hasName = c.name !== undefined;
        const hasValue = c.value !== undefined;
        const hasUnit = c.unit !== undefined;
        const hasRefLow = c.refLow !== undefined;
        const hasRefHigh = c.refHigh !== undefined;

        if (!hasName && !hasValue && !hasUnit && !hasRefLow && !hasRefHigh)
          continue;

        await sql`
          UPDATE metrics SET
            name = CASE WHEN ${hasName} THEN ${c.name ?? null} ELSE name END,
            value = CASE WHEN ${hasValue} THEN ${c.value ?? null} ELSE value END,
            unit = CASE WHEN ${hasUnit} THEN ${c.unit ?? null} ELSE unit END,
            ref_low = CASE WHEN ${hasRefLow} THEN ${c.refLow ?? null} ELSE ref_low END,
            ref_high = CASE WHEN ${hasRefHigh} THEN ${c.refHigh ?? null} ELSE ref_high END
          WHERE id = ${c.metricId} AND report_id = ${id}
        `;
      }
    }

    // Upsert extraction review (one review per report)
    await sql`
      INSERT INTO extraction_reviews (report_id, reviewer_user_id, status, notes, reviewed_at)
      VALUES (${id}, ${userId}, ${body.status}, ${body.notes ?? null}, NOW())
      ON CONFLICT (report_id)
      DO UPDATE SET
        reviewer_user_id = ${userId},
        status = ${body.status},
        notes = ${body.notes ?? null},
        reviewed_at = NOW()
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    reportError(error, { op: "admin.reports.review.POST" });
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 },
    );
  }
}
