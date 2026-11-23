import { sql } from "@/lib/db";

/**
 * Preference rows for metrics a confirm (upload or e-Nabız) just saved.
 * New names go to the END of the profile's order: max(display_order) + 1,
 * + 2, … in the given order, so they never jump ahead of the Ana ekran (the
 * column default 0 tied them with its first item). Existing rows keep their
 * order. One statement (the Neon HTTP driver has no transactions).
 */
export async function appendMetricPreferences(
  profileId: string,
  names: string[],
): Promise<void> {
  if (names.length === 0) return;
  await sql`
    INSERT INTO metric_preferences (profile_id, name, display_order)
    SELECT ${profileId}, t.name,
           (SELECT COALESCE(MAX(display_order), -1)
              FROM metric_preferences WHERE profile_id = ${profileId}) + t.ord::int
    FROM unnest(${names}::text[]) WITH ORDINALITY AS t(name, ord)
    ON CONFLICT (profile_id, name) DO NOTHING
  `;
}
