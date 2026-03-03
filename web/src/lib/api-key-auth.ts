import { sql } from "@/lib/db";
import { getProfileAccessLevel } from "@/lib/auth";
import { reportError } from "@/lib/error-reporting";

interface ApiKeyAuth {
  userId: string;
  profileId: string;
}

export async function requireApiKey(
  request: Request,
): Promise<ApiKeyAuth | null> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;

    const key = authHeader.slice(7);
    if (!key || !key.startsWith("viz_")) return null;

    // Hash the key with SHA-256
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const keyHash = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Look up the key
    const rows = await sql`
      SELECT user_id, profile_id
      FROM api_keys
      WHERE key_hash = ${keyHash}
      AND revoked_at IS NULL
    `;

    if (rows.length === 0) return null;

    const { user_id: userId, profile_id: profileId } = rows[0];

    // Verify user still has editor/owner access to the profile
    const level = await getProfileAccessLevel(userId, profileId);
    if (!level || level === "viewer") return null;

    // Update last_used_at (fire-and-forget)
    sql`UPDATE api_keys SET last_used_at = NOW() WHERE key_hash = ${keyHash}`.catch(
      () => {},
    );

    return { userId, profileId };
  } catch (error) {
    reportError(error, { op: "apiKeyAuth.requireApiKey" });
    return null;
  }
}
