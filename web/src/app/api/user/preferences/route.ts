import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, getDbUserId } from "@/lib/auth";
import { sql } from "@/lib/db";
import { locales, type Locale } from "@/i18n/config";
import { reportError } from "@/lib/error-reporting";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_THEMES = ["light", "dark", "system"] as const;
type Theme = (typeof VALID_THEMES)[number];

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

    // Try with preference columns first; fall back to name+email only
    // if the migration hasn't been applied yet
    let user: Record<string, unknown> | undefined;
    try {
      const rows = await sql`
        SELECT name, email, locale, timezone, theme
        FROM users
        WHERE id = ${userId}
      `;
      user = rows[0];
    } catch {
      // Columns don't exist yet — query without them
      const rows = await sql`
        SELECT name, email
        FROM users
        WHERE id = ${userId}
      `;
      user = rows[0];
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      locale: (user.locale as string) || "tr",
      timezone: (user.timezone as string) || "Europe/Istanbul",
      theme: (user.theme as string) || "system",
    });
  } catch (error) {
    reportError(error, { op: "api.user.preferences.GET" });
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 },
    );
  }
}

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
        return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
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
      if (!VALID_THEMES.includes(theme as Theme)) {
        return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
      }
    }

    // Try full update; fall back to name-only if columns don't exist yet
    try {
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
    } catch {
      // Migration not applied — only update name
      if (name !== undefined) {
        await sql`
          UPDATE users
          SET name = ${name.trim()}, updated_at = NOW()
          WHERE id = ${userId}
        `;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    reportError(error, { op: "api.user.preferences.PUT" });
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 },
    );
  }
}
