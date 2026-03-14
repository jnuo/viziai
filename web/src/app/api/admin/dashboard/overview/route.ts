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
    const [users, reports, profiles, activated, active, invites] =
      await Promise.all([
        // Total users + new in period (exclude admin)
        interval
          ? sql`
            SELECT
              COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE created_at >= NOW() - ${interval}::interval)::int AS new_in_period
            FROM users WHERE email != ${EXCLUDED_EMAIL}
          `
          : sql`
            SELECT COUNT(*)::int AS total, COUNT(*)::int AS new_in_period
            FROM users WHERE email != ${EXCLUDED_EMAIL}
          `,

        // Total reports + new in period
        interval
          ? sql`
            SELECT
              COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE created_at >= NOW() - ${interval}::interval)::int AS new_in_period
            FROM reports
          `
          : sql`
            SELECT COUNT(*)::int AS total, COUNT(*)::int AS new_in_period FROM reports
          `,

        // Total profiles
        sql`SELECT COUNT(*)::int AS total FROM profiles`,

        // Activated users (exclude admin)
        sql`
          SELECT COUNT(DISTINCT pu.user_id)::int AS count
          FROM pending_uploads pu
          JOIN users u ON u.id = pu.user_id
          WHERE pu.status = 'confirmed' AND u.email != ${EXCLUDED_EMAIL}
        `,

        // Active users in period (exclude admin)
        interval
          ? sql`
            SELECT COUNT(DISTINCT uid)::int AS count FROM (
              SELECT pu.user_id AS uid FROM pending_uploads pu
              JOIN users u ON u.id = pu.user_id
              WHERE pu.created_at >= NOW() - ${interval}::interval
                AND u.email != ${EXCLUDED_EMAIL}
              UNION
              SELECT ua.user_id_new AS uid FROM tracking_measurements tm
              JOIN user_access ua ON ua.profile_id = tm.profile_id
              JOIN users u ON u.id = ua.user_id_new
              WHERE tm.created_at >= NOW() - ${interval}::interval
                AND u.email != ${EXCLUDED_EMAIL}
            ) active
          `
          : sql`
            SELECT COUNT(DISTINCT uid)::int AS count FROM (
              SELECT pu.user_id AS uid FROM pending_uploads pu
              JOIN users u ON u.id = pu.user_id
              WHERE u.email != ${EXCLUDED_EMAIL}
              UNION
              SELECT ua.user_id_new AS uid FROM tracking_measurements tm
              JOIN user_access ua ON ua.profile_id = tm.profile_id
              JOIN users u ON u.id = ua.user_id_new
              WHERE u.email != ${EXCLUDED_EMAIL}
            ) active
          `,

        // Invite claim rate (exclude admin-sent invites)
        sql`
          SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE status = 'claimed')::int AS claimed
          FROM profile_invites pi
          JOIN users u ON u.id = pi.invited_by
          WHERE u.email != ${EXCLUDED_EMAIL}
        `,
      ]);

    const inviteTotal = invites[0].total as number;
    const inviteClaimed = invites[0].claimed as number;
    const claimRate =
      inviteTotal > 0 ? Math.round((inviteClaimed / inviteTotal) * 100) : 0;

    return NextResponse.json({
      totalUsers: users[0].total,
      newUsersInPeriod: users[0].new_in_period,
      totalReports: reports[0].total,
      reportsInPeriod: reports[0].new_in_period,
      totalProfiles: profiles[0].total,
      activatedUsers: activated[0].count,
      activeUsersInPeriod: active[0].count,
      inviteClaimRate: claimRate,
    });
  } catch (error) {
    reportError(error, { op: "admin.dashboard.overview" });
    return NextResponse.json(
      { error: "Failed to fetch overview" },
      { status: 500 },
    );
  }
}
