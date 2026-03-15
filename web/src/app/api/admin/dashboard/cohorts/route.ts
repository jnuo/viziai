import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";
import { EXCLUDED_EMAIL } from "../shared";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await requireAdmin();
  if (!userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const rows = await sql`
      WITH cohorts AS (
        SELECT
          u.id AS user_id,
          DATE_TRUNC('month', u.created_at) AS cohort_month
        FROM users u
        WHERE u.email != ${EXCLUDED_EMAIL}
      ),
      setup AS (
        SELECT DISTINCT c.user_id, c.cohort_month
        FROM cohorts c
        JOIN user_access ua ON ua.user_id_new = c.user_id
        JOIN reports r ON r.profile_id = ua.profile_id
        JOIN users u ON u.id = c.user_id
        WHERE r.created_at <= u.created_at + INTERVAL '24 hours'
      ),
      first_report AS (
        SELECT ua.user_id_new AS user_id, MIN(r.created_at) AS first_report_at
        FROM user_access ua
        JOIN reports r ON r.profile_id = ua.profile_id
        GROUP BY ua.user_id_new
      ),
      report_counts AS (
        SELECT ua.user_id_new AS user_id, COUNT(r.id)::int AS report_count
        FROM user_access ua
        JOIN reports r ON r.profile_id = ua.profile_id
        GROUP BY ua.user_id_new
      ),
      aha AS (
        SELECT DISTINCT ue.user_id, c.cohort_month
        FROM user_events ue
        JOIN cohorts c ON c.user_id = ue.user_id
        JOIN first_report fr ON fr.user_id = ue.user_id
        JOIN report_counts rc ON rc.user_id = ue.user_id
        WHERE ue.event = 'metric_selected'
          AND ue.created_at <= fr.first_report_at + INTERVAL '3 days'
          AND rc.report_count >= 2
        GROUP BY ue.user_id, c.cohort_month
        HAVING COUNT(DISTINCT ue.metric_key) >= 2
      )
      SELECT
        TO_CHAR(c.cohort_month, 'Mon YYYY') AS cohort,
        COUNT(DISTINCT c.user_id)::int AS users,
        COUNT(DISTINCT s.user_id)::int AS setup_count,
        COUNT(DISTINCT a.user_id)::int AS aha_count
      FROM cohorts c
      LEFT JOIN setup s ON s.user_id = c.user_id
      LEFT JOIN aha a ON a.user_id = c.user_id
      GROUP BY c.cohort_month
      ORDER BY c.cohort_month DESC
    `;

    const cohorts = rows.map((r) => {
      const users = r.users as number;
      const setupCount = r.setup_count as number;
      const ahaCount = r.aha_count as number;
      return {
        cohort: r.cohort as string,
        users,
        setupPct: users > 0 ? Math.round((setupCount / users) * 100) : 0,
        ahaPct: users > 0 ? Math.round((ahaCount / users) * 100) : 0,
        habitPct: null,
      };
    });

    return NextResponse.json({ cohorts });
  } catch (error) {
    reportError(error, { op: "admin.dashboard.cohorts" });
    return NextResponse.json(
      { error: "Failed to fetch cohorts" },
      { status: 500 },
    );
  }
}
