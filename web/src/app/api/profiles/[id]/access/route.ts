import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import {
  requireAuth,
  requireProfileOwner,
  getProfileAccessLevel,
} from "@/lib/auth";
import { sql } from "@/lib/db";
import { sendInviteEmail, sendAccessGrantedEmail } from "@/lib/email";
import { reportError } from "@/lib/error-reporting";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildBaseUrl(): string {
  return process.env.NEXTAUTH_URL || "http://localhost:3000";
}

/**
 * GET /api/profiles/[id]/access
 * List members for a profile (any member can view, owner gets full details)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: profileId } = await params;
    const userId = await requireAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessLevel = await getProfileAccessLevel(userId, profileId);
    if (!accessLevel) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const members = await sql`
      SELECT
        u.id as user_id,
        u.email,
        u.name,
        u.avatar_url,
        ua.access_level,
        ua.granted_at
      FROM user_access ua
      JOIN users u ON u.id = ua.user_id_new
      WHERE ua.profile_id = ${profileId}
      ORDER BY
        CASE ua.access_level WHEN 'owner' THEN 0 WHEN 'editor' THEN 1 ELSE 2 END,
        ua.granted_at ASC
    `;

    if (accessLevel !== "owner") {
      return NextResponse.json({
        members,
        invites: [],
        allowedEmails: [],
        accessLevel,
      });
    }

    const invites = await sql`
      SELECT
        id,
        email,
        access_level,
        token,
        status,
        created_at,
        expires_at
      FROM profile_invites
      WHERE profile_id = ${profileId}
      AND status = 'pending'
      AND expires_at > NOW()
      ORDER BY created_at DESC
    `;

    const allowedEmails = await sql`
      SELECT pae.id, pae.email, pae.created_at
      FROM profile_allowed_emails pae
      WHERE pae.profile_id = ${profileId}
      AND pae.claimed_at IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM user_access ua
        JOIN users u ON u.id = ua.user_id_new
        WHERE ua.profile_id = pae.profile_id
        AND LOWER(u.email) = LOWER(pae.email)
      )
      AND NOT EXISTS (
        SELECT 1 FROM profile_invites pi
        WHERE pi.profile_id = pae.profile_id
        AND LOWER(pi.email) = LOWER(pae.email)
        AND pi.status = 'pending'
        AND pi.expires_at > NOW()
      )
      ORDER BY pae.created_at ASC
    `;

    return NextResponse.json({
      members,
      invites,
      allowedEmails,
      accessLevel,
    });
  } catch (error) {
    reportError(error, { op: "api.profiles.access.GET" });
    return NextResponse.json(
      { error: "Failed to fetch access list" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/profiles/[id]/access
 * Create an invite (owner only)
 * Body: { email: string, accessLevel: 'viewer' | 'editor' }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: profileId } = await params;
    const userId = await requireProfileOwner(profileId);
    if (!userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { email, accessLevel: inviteLevel, locale } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "E-posta adresi gerekli" },
        { status: 400 },
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Geçersiz e-posta adresi" },
        { status: 400 },
      );
    }

    if (!inviteLevel || !["viewer", "editor"].includes(inviteLevel)) {
      return NextResponse.json(
        { error: "Erişim seviyesi 'viewer' veya 'editor' olmalı" },
        { status: 400 },
      );
    }

    const existingAccess = await sql`
      SELECT ua.id FROM user_access ua
      JOIN users u ON u.id = ua.user_id_new
      WHERE ua.profile_id = ${profileId}
      AND LOWER(u.email) = ${trimmedEmail}
    `;

    if (existingAccess.length > 0) {
      return NextResponse.json(
        { error: "Bu kullanıcının zaten erişimi var" },
        { status: 409 },
      );
    }

    const [inviter] = await sql`
      SELECT name, email FROM users WHERE id = ${userId}
    `;
    const [profile] = await sql`
      SELECT display_name FROM profiles WHERE id = ${profileId}
    `;

    const existingUser = await sql`
      SELECT id, name FROM users WHERE LOWER(email) = ${trimmedEmail}
    `;

    if (existingUser.length > 0) {
      await sql`
        INSERT INTO user_access (user_id_new, profile_id, access_level, granted_by)
        VALUES (${existingUser[0].id}, ${profileId}, ${inviteLevel}, ${userId})
        ON CONFLICT (user_id_new, profile_id) DO NOTHING
      `;

      const dashboardUrl = `${buildBaseUrl()}/dashboard`;

      sendAccessGrantedEmail({
        to: trimmedEmail,
        inviterName: inviter?.name || "Someone",
        inviterEmail: inviter?.email || "",
        profileName: profile?.display_name || "a profile",
        accessLevel: inviteLevel,
        dashboardUrl,
        locale: locale || "en",
      }).catch(() => {});

      return NextResponse.json(
        {
          directAccess: true,
          email: trimmedEmail,
          name: existingUser[0].name,
          accessLevel: inviteLevel,
        },
        { status: 201 },
      );
    }

    const existingInvite = await sql`
      SELECT id FROM profile_invites
      WHERE profile_id = ${profileId}
      AND LOWER(email) = ${trimmedEmail}
      AND status = 'pending'
      AND expires_at > NOW()
    `;

    if (existingInvite.length > 0) {
      return NextResponse.json(
        { error: "Bu e-posta için bekleyen bir davet zaten var" },
        { status: 409 },
      );
    }

    const token = randomBytes(32).toString("hex");

    await sql`
      INSERT INTO profile_allowed_emails (profile_id, email)
      VALUES (${profileId}, ${trimmedEmail})
      ON CONFLICT (email, profile_id) DO NOTHING
    `;

    const invite = await sql`
      INSERT INTO profile_invites (profile_id, email, access_level, token, invited_by)
      VALUES (${profileId}, ${trimmedEmail}, ${inviteLevel}, ${token}, ${userId})
      RETURNING id, token, created_at, expires_at
    `;

    const inviteUrl = `${buildBaseUrl()}/invite/${token}`;

    sendInviteEmail({
      to: trimmedEmail,
      inviterName: inviter?.name || "Someone",
      inviterEmail: inviter?.email || "",
      profileName: profile?.display_name || "a profile",
      accessLevel: inviteLevel,
      inviteUrl,
      locale: locale || "en",
    }).catch(() => {});

    return NextResponse.json(
      {
        invite: {
          id: invite[0].id,
          email: trimmedEmail,
          accessLevel: inviteLevel,
          inviteUrl,
          createdAt: invite[0].created_at,
          expiresAt: invite[0].expires_at,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    reportError(error, { op: "api.profiles.access.POST" });
    return NextResponse.json(
      { error: "Davet oluşturulamadı" },
      { status: 500 },
    );
  }
}
