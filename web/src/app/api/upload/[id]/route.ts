import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";
import { del } from "@vercel/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/upload/[id]
 * Get details of a specific upload
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireAuth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please sign in" },
        { status: 401 },
      );
    }

    const { id: uploadId } = await params;

    const uploads = await sql`
      SELECT
        pu.id,
        pu.file_name,
        pu.status,
        pu.sample_date,
        pu.extracted_data,
        pu.file_url,
        pu.error_message,
        pu.created_at,
        pu.updated_at,
        pu.profile_id,
        p.display_name as profile_name
      FROM pending_uploads pu
      JOIN profiles p ON p.id = pu.profile_id
      WHERE pu.id = ${uploadId}
      AND pu.user_id = ${userId}
    `;

    if (uploads.length === 0) {
      return NextResponse.json(
        { error: "Not Found", message: "Upload not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ upload: uploads[0] });
  } catch (error) {
    reportError(error, { op: "upload.get" });
    return NextResponse.json(
      { error: "Failed to fetch upload" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/upload/[id]
 * Reject/cancel an upload
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireAuth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please sign in" },
        { status: 401 },
      );
    }

    const { id: uploadId } = await params;

    const uploads = await sql`
      SELECT id, file_url, status
      FROM pending_uploads
      WHERE id = ${uploadId}
      AND user_id = ${userId}
    `;

    if (uploads.length === 0) {
      return NextResponse.json(
        { error: "Not Found", message: "Upload not found" },
        { status: 404 },
      );
    }

    const upload = uploads[0];

    if (upload.status === "confirmed") {
      return NextResponse.json(
        { error: "Bad Request", message: "Cannot delete a confirmed upload" },
        { status: 400 },
      );
    }

    // Delete from Vercel Blob if URL exists (best-effort)
    if (upload.file_url) {
      try {
        await del(upload.file_url);
      } catch (blobError) {
        console.error("[API] Failed to delete blob:", blobError);
      }
    }

    await sql`
      UPDATE pending_uploads
      SET status = 'rejected', updated_at = NOW()
      WHERE id = ${uploadId}
    `;

    console.log(`[API] Upload rejected: ${uploadId}`);

    return NextResponse.json({ success: true, uploadId });
  } catch (error) {
    reportError(error, { op: "upload.delete" });
    return NextResponse.json(
      { error: "Failed to delete upload" },
      { status: 500 },
    );
  }
}
