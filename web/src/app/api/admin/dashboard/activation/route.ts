import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";
import { EXCLUDED_EMAIL, periodToInterval } from "../shared";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const userId = await requireAdmin();
  if (!userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const period = request.nextUrl.searchParams.get("period") || "30d";
  const interval = periodToInterval(period);

  try {
    const [funnel, signupsByDay, journeys] = await Promise.all([
      // Activation funnel counts (exclude admin)
      sql`
        SELECT
          (SELECT COUNT(*)::int FROM users WHERE email != ${EXCLUDED_EMAIL}) AS signed_up,
          (SELECT COUNT(DISTINCT pu.user_id)::int FROM pending_uploads pu JOIN users u ON u.id = pu.user_id WHERE u.email != ${EXCLUDED_EMAIL}) AS uploaded,
          (SELECT COUNT(DISTINCT pu.user_id)::int FROM pending_uploads pu JOIN users u ON u.id = pu.user_id WHERE pu.status = 'confirmed' AND u.email != ${EXCLUDED_EMAIL}) AS confirmed
      `,

      // Signups by day (exclude admin)
      interval
        ? sql`
          SELECT DATE(created_at) AS day, COUNT(*)::int AS count
          FROM users
          WHERE email != ${EXCLUDED_EMAIL}
            AND created_at >= NOW() - ${interval}::interval
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

      // Per-user journey table (exclude admin)
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

    // Average hours to first upload (excluding nulls)
    const withUpload = journeys.filter(
      (j: Record<string, unknown>) => j.hours_to_upload !== null,
    );
    const avgHoursToUpload =
      withUpload.length > 0
        ? Math.round(
            (withUpload.reduce(
              (sum: number, j: Record<string, unknown>) =>
                sum + Number(j.hours_to_upload),
              0,
            ) /
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
