import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, getDbUserId } from "@/lib/auth";
import { sql } from "@/lib/db";
import { locales, type Locale } from "@/i18n/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_THEMES = ["light", "dark", "system"] as const;

/**
 * GET /api/user/preferences
 * Returns current user's preferences (name, locale, timezone, theme)
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = getDbUserId(session);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await sql`
      SELECT name, email, locale, timezone, theme
      FROM users
      WHERE id = ${userId}
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = rows[0];
    return NextResponse.json({
      name: user.name,
      email: user.email,
      locale: user.locale || "tr",
      timezone: user.timezone || "Europe/Istanbul",
      theme: user.theme || "system",
    });
  } catch (error) {
    console.error("[API] GET /api/user/preferences error:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/user/preferences
 * Update current user's preferences
 */
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = getDbUserId(session);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, locale, timezone, theme } = body;

    // Validate name
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Name cannot be empty" },
          { status: 400 },
        );
      }
      if (name.trim().length > 100) {
        return NextResponse.json(
          { error: "Name must be 100 characters or less" },
          { status: 400 },
        );
      }
    }

    // Validate locale
    if (locale !== undefined) {
      if (!locales.includes(locale as Locale)) {
        return NextResponse.json(
          { error: "Invalid locale" },
          { status: 400 },
        );
      }
    }

    // Validate timezone
    if (timezone !== undefined) {
      if (typeof timezone !== "string" || timezone.length === 0) {
        return NextResponse.json(
          { error: "Invalid timezone" },
          { status: 400 },
        );
      }
    }

    // Validate theme
    if (theme !== undefined) {
      if (
        !(VALID_THEMES as readonly string[]).includes(theme)
      ) {
        return NextResponse.json(
          { error: "Invalid theme" },
          { status: 400 },
        );
      }
    }

    await sql`
      UPDATE users
      SET
        name = COALESCE(${name?.trim() ?? null}, name),
        locale = COALESCE(${locale ?? null}, locale),
        timezone = COALESCE(${timezone ?? null}, timezone),
        theme = COALESCE(${theme ?? null}, theme),
        updated_at = NOW()
      WHERE id = ${userId}
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[API] PUT /api/user/preferences error:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 },
    );
  }
}
