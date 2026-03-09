import { test, expect } from "@playwright/test";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.NEON_DATABASE_URL!);

/**
 * DB constraint validation tests.
 *
 * These tests query the actual database to ensure CHECK constraints
 * match the statuses used in application code. Prevents the bug where
 * code uses a status value that the DB constraint rejects.
 */
test.describe("DB CHECK constraints match application code", () => {
  test("pending_uploads status constraint includes all statuses used in code", async () => {
    // Statuses used in application code:
    // - 'pending'     → initial status on upload creation (upload/route.ts)
    // - 'extracting'  → set when extraction starts (upload/[id]/extract/route.ts)
    // - 'review'      → set when extraction completes
    // - 'confirming'  → set atomically in confirm route to prevent double-confirms
    // - 'confirmed'   → set after metrics are saved
    // - 'rejected'    → set when user cancels
    const expectedStatuses = [
      "pending",
      "extracting",
      "review",
      "confirming",
      "confirmed",
      "rejected",
    ];

    const constraints = await sql`
      SELECT check_clause
      FROM information_schema.check_constraints
      WHERE constraint_name = 'pending_uploads_status_check'
    `;

    expect(constraints.length).toBe(1);
    const clause = constraints[0].check_clause as string;

    for (const status of expectedStatuses) {
      expect(
        clause,
        `Status '${status}' must be in pending_uploads CHECK constraint`,
      ).toContain(`'${status}'`);
    }
  });

  test("pending_imports status constraint includes all statuses used in code", async () => {
    // Statuses used in e-Nabız import code:
    // - 'pending'    → initial status
    // - 'confirmed'  → after user confirms import
    // - 'skipped'    → when user skips/rejects
    const expectedStatuses = ["pending", "confirmed", "skipped"];

    const constraints = await sql`
      SELECT check_clause
      FROM information_schema.check_constraints
      WHERE constraint_name = 'pending_imports_status_check'
    `;

    expect(constraints.length).toBe(1);
    const clause = constraints[0].check_clause as string;

    for (const status of expectedStatuses) {
      expect(
        clause,
        `Status '${status}' must be in pending_imports CHECK constraint`,
      ).toContain(`'${status}'`);
    }
  });
});
