import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await requireAdmin();
  if (!userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const [inviteSummary, sharedProfiles, claimTiming, invitesByDay] =
      await Promise.all([
        // Invite stats by status
        sql`
          SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE status = 'claimed')::int AS claimed,
            COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
            COUNT(*) FILTER (WHERE status = 'revoked')::int AS revoked
          FROM profile_invites
        `,

        // Shared profiles (profiles with >1 user in user_access)
        sql`
          SELECT COUNT(*)::int AS count
          FROM (
            SELECT profile_id
            FROM user_access
            GROUP BY profile_id
            HAVING COUNT(DISTINCT user_id_new) > 1
          ) shared
        `,

        // Avg/min/max hours to claim
        sql`
          SELECT
            ROUND(AVG(EXTRACT(EPOCH FROM (claimed_at - created_at)) / 3600)::numeric, 1) AS avg_hours,
            ROUND(MIN(EXTRACT(EPOCH FROM (claimed_at - created_at)) / 3600)::numeric, 1) AS min_hours,
            ROUND(MAX(EXTRACT(EPOCH FROM (claimed_at - created_at)) / 3600)::numeric, 1) AS max_hours
          FROM profile_invites
          WHERE status = 'claimed' AND claimed_at IS NOT NULL
        `,

        // Invites by day
        sql`
          SELECT
            DATE(created_at) AS day,
            COUNT(*)::int AS count
          FROM profile_invites
          GROUP BY DATE(created_at)
          ORDER BY day
        `,
      ]);

    const total = inviteSummary[0].total as number;
    const claimed = inviteSummary[0].claimed as number;
    const claimRate = total > 0 ? Math.round((claimed / total) * 100) : 0;

    return NextResponse.json({
      total: inviteSummary[0].total,
      claimed: inviteSummary[0].claimed,
      pending: inviteSummary[0].pending,
      revoked: inviteSummary[0].revoked,
      claimRate,
      sharedProfiles: sharedProfiles[0].count,
      claimTiming: claimTiming[0],
      invitesByDay,
    });
  } catch (error) {
    reportError(error, { op: "admin.dashboard.referral" });
    return NextResponse.json(
      { error: "Failed to fetch referral data" },
      { status: 500 },
    );
  }
}
