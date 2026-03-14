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
    const [multiUploaders, returning, activeWindows, uploadsByWeek] =
      await Promise.all([
        // Multi-uploaders vs total confirmed uploaders (exclude admin)
        sql`
          SELECT
            COUNT(DISTINCT user_id)::int AS total_uploaders,
            COUNT(DISTINCT user_id) FILTER (WHERE upload_count > 1)::int AS multi_uploaders
          FROM (
            SELECT pu.user_id, COUNT(*)::int AS upload_count
            FROM pending_uploads pu
            JOIN users u ON u.id = pu.user_id
            WHERE pu.status = 'confirmed' AND u.email != ${EXCLUDED_EMAIL}
            GROUP BY pu.user_id
          ) counts
        `,

        // Users who returned after 7+ days gap (exclude admin)
        sql`
          WITH user_upload_dates AS (
            SELECT
              pu.user_id,
              DATE(pu.created_at) AS upload_date,
              LAG(DATE(pu.created_at)) OVER (PARTITION BY pu.user_id ORDER BY pu.created_at) AS prev_date
            FROM pending_uploads pu
            JOIN users u ON u.id = pu.user_id
            WHERE pu.status = 'confirmed' AND u.email != ${EXCLUDED_EMAIL}
          )
          SELECT COUNT(DISTINCT user_id)::int AS count
          FROM user_upload_dates
          WHERE upload_date - prev_date >= 7
        `,

        // Active users in 7d and 30d windows (exclude admin)
        sql`
          SELECT
            COUNT(DISTINCT uid) FILTER (WHERE last_active >= NOW() - INTERVAL '7 days')::int AS active_7d,
            COUNT(DISTINCT uid) FILTER (WHERE last_active >= NOW() - INTERVAL '30 days')::int AS active_30d
          FROM (
            SELECT pu.user_id AS uid, MAX(pu.created_at) AS last_active
            FROM pending_uploads pu
            JOIN users u ON u.id = pu.user_id
            WHERE u.email != ${EXCLUDED_EMAIL}
            GROUP BY pu.user_id
            UNION ALL
            SELECT ua.user_id_new AS uid, MAX(tm.created_at) AS last_active
            FROM tracking_measurements tm
            JOIN user_access ua ON ua.profile_id = tm.profile_id
            JOIN users u ON u.id = ua.user_id_new
            WHERE u.email != ${EXCLUDED_EMAIL}
            GROUP BY ua.user_id_new
          ) combined
        `,

        // Uploads by week (exclude admin)
        sql`
          SELECT
            DATE_TRUNC('week', pu.created_at)::date AS week,
            COUNT(*)::int AS uploads,
            COUNT(DISTINCT pu.user_id)::int AS unique_users
          FROM pending_uploads pu
          JOIN users u ON u.id = pu.user_id
          WHERE pu.status = 'confirmed' AND u.email != ${EXCLUDED_EMAIL}
          GROUP BY DATE_TRUNC('week', pu.created_at)
          ORDER BY week
        `,
      ]);

    return NextResponse.json({
      totalUploaders: multiUploaders[0].total_uploaders,
      multiUploaders: multiUploaders[0].multi_uploaders,
      returningAfter7d: returning[0].count,
      active7d: activeWindows[0].active_7d,
      active30d: activeWindows[0].active_30d,
      uploadsByWeek,
    });
  } catch (error) {
    reportError(error, { op: "admin.dashboard.retention" });
    return NextResponse.json(
      { error: "Failed to fetch retention data" },
      { status: 500 },
    );
  }
}
