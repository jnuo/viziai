import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";
import { EXCLUDED_EMAIL, parseDateFilter } from "../shared";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const userId = await requireAdmin();
  if (!userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { interval, from, to } = parseDateFilter(request.nextUrl.searchParams);
  const hasRange = from && to;

  try {
    const [funnel, signupsByDay, journeys] = await Promise.all([
      sql`
        SELECT
          (SELECT COUNT(*)::int FROM users WHERE email != ${EXCLUDED_EMAIL}) AS signed_up,
          (SELECT COUNT(DISTINCT pu.user_id)::int FROM pending_uploads pu JOIN users u ON u.id = pu.user_id WHERE u.email != ${EXCLUDED_EMAIL}) AS uploaded,
          (SELECT COUNT(DISTINCT pu.user_id)::int FROM pending_uploads pu JOIN users u ON u.id = pu.user_id WHERE pu.status = 'confirmed' AND u.email != ${EXCLUDED_EMAIL}) AS confirmed
      `,

      interval
        ? sql`
          SELECT DATE(created_at) AS day, COUNT(*)::int AS count
          FROM users
          WHERE email != ${EXCLUDED_EMAIL}
            AND created_at >= NOW() - ${interval}::interval
          GROUP BY DATE(created_at)
          ORDER BY day
        `
        : hasRange
          ? sql`
          SELECT DATE(created_at) AS day, COUNT(*)::int AS count
          FROM users
          WHERE email != ${EXCLUDED_EMAIL}
            AND created_at >= ${from}::date AND created_at < ${to}::date + INTERVAL '1 day'
          GROUP BY DATE(created_at)
          ORDER BY day
        `
          : sql`
          SELECT DATE(created_at) AS day, COUNT(*)::int AS count
          FROM users
          WHERE email != ${EXCLUDED_EMAIL}
          GROUP BY DATE(created_at)
          ORDER BY day
        `,

      sql`
        SELECT
          u.id,
          u.email,
          u.name,
          u.created_at AS signed_up_at,
          MIN(pu.created_at) AS first_upload_at,
          MIN(CASE WHEN pu.status = 'confirmed' THEN pu.updated_at END) AS first_confirmed_at,
          COUNT(DISTINCT CASE WHEN pu.status = 'confirmed' THEN pu.id END)::int AS confirmed_uploads,
          EXTRACT(EPOCH FROM (MIN(pu.created_at) - u.created_at)) / 3600 AS hours_to_upload
        FROM users u
        LEFT JOIN pending_uploads pu ON pu.user_id = u.id
        WHERE u.email != ${EXCLUDED_EMAIL}
        GROUP BY u.id, u.email, u.name, u.created_at
        ORDER BY u.created_at DESC
      `,
    ]);

    const withUpload = journeys.filter((j) => j.hours_to_upload !== null);
    const avgHoursToUpload =
      withUpload.length > 0
        ? Math.round(
            (withUpload.reduce((sum, j) => sum + Number(j.hours_to_upload), 0) /
              withUpload.length) *
              10,
          ) / 10
        : null;

    return NextResponse.json({
      funnel: funnel[0],
      signupsByDay,
      journeys,
      avgHoursToUpload,
    });
  } catch (error) {
    reportError(error, { op: "admin.dashboard.activation" });
    return NextResponse.json(
      { error: "Failed to fetch activation data" },
      { status: 500 },
    );
  }
}
