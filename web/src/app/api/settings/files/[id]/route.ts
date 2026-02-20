import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  authOptions,
  getDbUserId,
  hasProfileAccess,
  requireAuth,
  getProfileAccessLevel,
} from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/settings/files/[id]
 * Get file details and all metrics for a processed file
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = getDbUserId(session);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please sign in" },
        { status: 401 },
      );
    }

    const { id: fileId } = await params;

    // Get the processed file
    const files = await sql`
      SELECT id, profile_id, file_name, content_hash, created_at
      FROM processed_files
      WHERE id = ${fileId}
    `;

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Not Found", message: "File not found" },
        { status: 404 },
      );
    }

    const file = files[0];

    // Verify user has access to this profile
    const hasAccess = await hasProfileAccess(userId, file.profile_id);
    if (!hasAccess) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "You don't have access to this file",
        },
        { status: 403 },
      );
    }

    // Get metrics for this file through reports
    const metrics = await sql`
      SELECT
        m.id,
        m.name,
        m.value,
        m.unit,
        m.ref_low,
        m.ref_high,
        m.flag,
        r.sample_date,
        r.id as report_id
      FROM metrics m
      JOIN reports r ON r.id = m.report_id
      WHERE r.profile_id = ${file.profile_id}
      AND r.file_name = ${file.file_name}
      ORDER BY m.name ASC
    `;

    return NextResponse.json({
      file: {
        id: file.id,
        file_name: file.file_name,
        created_at: file.created_at,
        sample_date: metrics[0]?.sample_date ?? null,
        profile_id: file.profile_id,
      },
      metrics,
    });
  } catch (error) {
    console.error("[API] GET /api/settings/files/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch file details" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/settings/files/[id]
 * Delete a processed file and its associated report/metrics
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const userId = await requireAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch the processed_file
    const files = await sql`
      SELECT id, profile_id, file_name, content_hash
      FROM processed_files WHERE id = ${id}
    `;
    if (files.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const file = files[0];

    // 2. Check access level (owner/editor only)
    const level = await getProfileAccessLevel(userId, file.profile_id);
    if (!level || !["owner", "editor"].includes(level)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // 3. Delete report(s) — CASCADE handles metrics automatically
    //    Use content_hash with file_name fallback for old records
    await sql`
      DELETE FROM reports
      WHERE profile_id = ${file.profile_id}
      AND (
        (content_hash IS NOT NULL AND content_hash = ${file.content_hash})
        OR (content_hash IS NULL AND file_name = ${file.file_name})
      )
    `;

    // 4. Delete processed_files record
    await sql`DELETE FROM processed_files WHERE id = ${id}`;

    // 5. Clean up pending_uploads (best-effort)
    await sql`
      DELETE FROM pending_uploads
      WHERE profile_id = ${file.profile_id}
        AND content_hash = ${file.content_hash}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    reportError(error, { op: "settings.files.delete", fileId: id });
    return NextResponse.json(
      { error: "Dosya silinirken hata olustu" },
      { status: 500 },
    );
  }
}
