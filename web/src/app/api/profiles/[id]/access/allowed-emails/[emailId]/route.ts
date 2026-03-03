import { NextResponse } from "next/server";
import { requireProfileOwner } from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * DELETE /api/profiles/[id]/access/allowed-emails/[emailId]
 * Remove an allowed email entry (owner only)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; emailId: string }> },
) {
  try {
    const { id: profileId, emailId } = await params;
    const userId = await requireProfileOwner(profileId);
    if (!userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await sql`
      DELETE FROM profile_allowed_emails
      WHERE id = ${emailId}
      AND profile_id = ${profileId}
      AND claimed_at IS NULL
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Entry not found or already claimed" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    reportError(error, {
      op: "api.profiles.access.allowedEmails.DELETE",
    });
    return NextResponse.json(
      { error: "Failed to remove allowed email" },
      { status: 500 },
    );
  }
}
