import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(request: NextRequest) {
  const userId = await requireAuth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { event, metricKey } = await request.json();

  // Fire-and-forget: resolve metric key then insert event
  (async () => {
    let key: string | null = null;
    if (metricKey) {
      const rows = await sql`
        SELECT md.key FROM metric_definitions md
        JOIN metric_translations mt ON mt.metric_definition_id = md.id
        WHERE mt.display_name = ${metricKey}
        LIMIT 1
      `.catch(() => []);
      key = (rows[0]?.key as string) ?? metricKey;
    }
    await sql`
      INSERT INTO user_events (user_id, event, metric_key)
      VALUES (${userId}, ${event}, ${key})
    `;
  })().catch(() => {});

  return new NextResponse(null, { status: 202 });
}
