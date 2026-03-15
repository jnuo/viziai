import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";

const ALLOWED_EVENTS = new Set(["metric_selected"]);
const MAX_KEY_LENGTH = 200;

export async function POST(request: NextRequest) {
  const userId = await requireAuth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { event?: string; metricKey?: string };
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const { event, metricKey } = body;
  if (!event || !ALLOWED_EVENTS.has(event)) {
    return new NextResponse(null, { status: 400 });
  }

  const truncatedKey = metricKey?.slice(0, MAX_KEY_LENGTH);

  // Fire-and-forget: resolve metric slug then insert event
  (async () => {
    let key: string | null = null;
    if (truncatedKey) {
      const rows = await sql`
        SELECT md.key FROM metric_definitions md
        JOIN metric_translations mt ON mt.metric_definition_id = md.id
        WHERE mt.display_name = ${truncatedKey}
        LIMIT 1
      `.catch(() => []);
      key = (rows[0]?.key as string) ?? truncatedKey;
    }
    await sql`
      INSERT INTO user_events (user_id, event, metric_key)
      VALUES (${userId}, ${event}, ${key})
    `;
  })().catch((error) => reportError(error, { op: "events.track", event }));

  return new NextResponse(null, { status: 202 });
}
