import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  requireAuth,
  hasProfileAccess,
  getProfileAccessLevel,
} from "@/lib/auth";
import { reportError } from "@/lib/error-reporting";
import { parseNameList } from "@/lib/chart/name-list";

export const runtime = "nodejs";

/** Kilo / Tansiyon cards (home measurements, not lab metrics) */
const TRACKING_IDS = new Set([
  "__tracking_weight",
  "__tracking_bp_systolic",
  "__tracking_bp_diastolic",
]);
export const dynamic = "force-dynamic";

/**
 * GET /api/metric-order?profileId=xxx
 * Returns { order, home }:
 * - order: all metric names in display_order
 * - home: names shown on the dashboard ("Ana ekran", is_favorite), in order
 */
export async function GET(request: Request) {
  try {
    const userId = await requireAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json(
        { error: "profileId is required" },
        { status: 400 },
      );
    }

    const hasAccess = await hasProfileAccess(userId, profileId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const preferences = await sql`
      SELECT name, display_order, is_favorite
      FROM metric_preferences
      WHERE profile_id = ${profileId}
      ORDER BY display_order ASC, name ASC
    `;

    const rows = preferences || [];
    const order = rows.map((d) => d.name as string);
    const home = rows.filter((d) => d.is_favorite).map((d) => d.name as string);

    return NextResponse.json({ order, home });
  } catch (error) {
    reportError(error, { op: "api.metricOrder.GET" });
    return NextResponse.json(
      { error: "Failed to fetch metric order" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/metric-order
 * Body: { profileId: string, home?: string[], clear?: true, order?: string[] }
 *
 * - home: the complete "Ana ekran" list, in order. Listed names become
 *   is_favorite with display_order 0..n-1; every other metric of the profile
 *   loses is_favorite and keeps its relative order after them. An empty
 *   list clears the whole Ana ekran, so it needs `clear: true` (the client
 *   sends it only when the user removes the last item); without it the
 *   request is refused with 409, so a client that never loaded the saved
 *   list cannot wipe it.
 * - order: legacy full ordering (display_order only).
 *
 * Each write is a single batched upsert (Neon HTTP driver has no
 * transactions; one statement is atomic). Requires owner or editor:
 * preferences are per profile, shared by everyone who can see it.
 * Concurrent editors: last write wins.
 */
export async function PUT(request: Request) {
  try {
    const userId = await requireAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const profileId = body?.profileId;

    if (!profileId || typeof profileId !== "string") {
      return NextResponse.json(
        { error: "profileId is required" },
        { status: 400 },
      );
    }

    const home = body.home === undefined ? undefined : parseNameList(body.home);
    const order =
      body.order === undefined ? undefined : parseNameList(body.order);

    if (home === null || order === null || (!home && !order)) {
      return NextResponse.json(
        { error: "home or order must be an array of metric names" },
        { status: 400 },
      );
    }

    const level = await getProfileAccessLevel(userId, profileId);
    if (level !== "owner" && level !== "editor") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (home && home.length === 0 && body.clear !== true) {
      return NextResponse.json(
        { error: "An empty Ana ekran needs clear: true" },
        { status: 409 },
      );
    }

    // Only names this profile has: its measured metrics, rows it already
    // has a preference for, or the Kilo / Tansiyon pseudo-ids. Anything
    // else would create preference rows for made-up names.
    const names = (home ?? order)!;
    const asked = names.filter((n) => !TRACKING_IDS.has(n));
    if (asked.length > 0) {
      const known = await sql`
        SELECT DISTINCT m.name
        FROM metrics m JOIN reports r ON r.id = m.report_id
        WHERE r.profile_id = ${profileId} AND m.name = ANY(${asked}::text[])
        UNION
        SELECT name FROM metric_preferences
        WHERE profile_id = ${profileId} AND name = ANY(${asked}::text[])
      `;
      const ok = new Set((known || []).map((r) => r.name as string));
      const unknown = asked.filter((n) => !ok.has(n));
      if (unknown.length > 0) {
        return NextResponse.json(
          { error: "Unknown metric names for this profile", unknown: unknown.length },
          { status: 400 },
        );
      }
    }

    if (home) {
      await sql`
        WITH h AS (
          SELECT name, (ord - 1)::int AS pos
          FROM unnest(${home}::text[]) WITH ORDINALITY AS t(name, ord)
        ), up AS (
          INSERT INTO metric_preferences (profile_id, name, display_order, is_favorite)
          SELECT ${profileId}, name, pos, true FROM h
          ON CONFLICT (profile_id, name) DO UPDATE
            SET display_order = EXCLUDED.display_order, is_favorite = true
          RETURNING name
        ), rest AS (
          SELECT id,
                 (row_number() OVER (ORDER BY display_order, name) - 1)::int AS rn
          FROM metric_preferences
          WHERE profile_id = ${profileId}
            AND NOT (name = ANY(${home}::text[]))
        )
        UPDATE metric_preferences mp
        SET is_favorite = false, display_order = ${home.length}::int + rest.rn
        FROM rest
        WHERE mp.id = rest.id
          AND (mp.is_favorite OR mp.display_order <> ${home.length}::int + rest.rn)
      `;
      return NextResponse.json({ success: true, home: home.length });
    }

    await sql`
      INSERT INTO metric_preferences (profile_id, name, display_order)
      SELECT ${profileId}, name, (ord - 1)::int
      FROM unnest(${order!}::text[]) WITH ORDINALITY AS t(name, ord)
      ON CONFLICT (profile_id, name) DO UPDATE
        SET display_order = EXCLUDED.display_order
    `;
    return NextResponse.json({ success: true, updated: order!.length });
  } catch (error) {
    reportError(error, { op: "api.metricOrder.PUT" });
    return NextResponse.json(
      { error: "Failed to update metric order" },
      { status: 500 },
    );
  }
}
