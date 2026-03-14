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
    const [
      totalUsers,
      pdfUploaders,
      bpTrackers,
      weightTrackers,
      enabizUsers,
      favoriteUsers,
      inviteSenders,
    ] = await Promise.all([
      sql`SELECT COUNT(*)::int AS count FROM users WHERE email != ${EXCLUDED_EMAIL}`,

      // PDF upload (exclude admin)
      sql`
        SELECT
          COUNT(DISTINCT pu.user_id)::int AS users,
          COUNT(*)::int AS total
        FROM pending_uploads pu
        JOIN users u ON u.id = pu.user_id
        WHERE pu.status = 'confirmed' AND u.email != ${EXCLUDED_EMAIL}
      `,

      // BP tracking (exclude admin)
      sql`
        SELECT
          COUNT(DISTINCT ua.user_id_new)::int AS users,
          COUNT(*)::int AS total
        FROM tracking_measurements tm
        JOIN user_access ua ON ua.profile_id = tm.profile_id
        JOIN users u ON u.id = ua.user_id_new
        WHERE tm.type = 'blood_pressure' AND u.email != ${EXCLUDED_EMAIL}
      `,

      // Weight tracking (exclude admin)
      sql`
        SELECT
          COUNT(DISTINCT ua.user_id_new)::int AS users,
          COUNT(*)::int AS total
        FROM tracking_measurements tm
        JOIN user_access ua ON ua.profile_id = tm.profile_id
        JOIN users u ON u.id = ua.user_id_new
        WHERE tm.type = 'weight' AND u.email != ${EXCLUDED_EMAIL}
      `,

      // e-Nabız (exclude admin)
      sql`
        SELECT
          (SELECT COUNT(DISTINCT ak.user_id)::int FROM api_keys ak JOIN users u ON u.id = ak.user_id WHERE ak.revoked_at IS NULL AND u.email != ${EXCLUDED_EMAIL}) AS users,
          (SELECT COUNT(*)::int FROM pending_imports pi JOIN users u ON u.id = pi.user_id WHERE pi.status = 'confirmed' AND u.email != ${EXCLUDED_EMAIL}) AS total
      `,

      // Favorites (exclude admin-owned profiles)
      sql`
        SELECT
          COUNT(DISTINCT mp.profile_id)::int AS users,
          COUNT(*)::int AS total
        FROM metric_preferences mp
        WHERE mp.is_favorite = true
          AND mp.profile_id NOT IN (
            SELECT ua.profile_id FROM user_access ua
            JOIN users u ON u.id = ua.user_id_new
            WHERE u.email = ${EXCLUDED_EMAIL} AND ua.access_level = 'owner'
          )
      `,

      // Invites sent (exclude admin)
      sql`
        SELECT
          COUNT(DISTINCT pi.invited_by)::int AS users,
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE pi.status = 'claimed')::int AS claimed
        FROM profile_invites pi
        JOIN users u ON u.id = pi.invited_by
        WHERE u.email != ${EXCLUDED_EMAIL}
      `,
    ]);

    const total = totalUsers[0].count as number;

    function featureRow(
      feature: string,
      row: Record<string, unknown>,
      label: string,
    ) {
      const users = row.users as number;
      return {
        feature,
        users,
        pct: total > 0 ? Math.round((users / total) * 100) : 0,
        actions: row.total as number,
        label,
      };
    }

    const features = [
      featureRow("PDF Upload", pdfUploaders[0], "uploads"),
      featureRow("e-Nabız Import", enabizUsers[0], "imports"),
      featureRow("Weight Tracking", weightTrackers[0], "entries"),
      featureRow("BP Tracking", bpTrackers[0], "entries"),
      featureRow(
        "Invites Sent",
        inviteSenders[0],
        `sent (${inviteSenders[0].claimed} accepted)`,
      ),
      featureRow("Favorites", favoriteUsers[0], "saved"),
    ];

    return NextResponse.json({ totalUsers: total, features });
  } catch (error) {
    reportError(error, { op: "admin.dashboard.adoption" });
    return NextResponse.json(
      { error: "Failed to fetch adoption data" },
      { status: 500 },
    );
  }
}
