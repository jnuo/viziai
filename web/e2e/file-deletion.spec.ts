import { test, expect } from "@playwright/test";
import { authenticatedContext, createSessionCookie } from "./helpers/auth";
import { seedTestUser, deleteTestUser } from "./helpers/db";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.NEON_DATABASE_URL!);

let userId: string;
let profileId: string;

// Second user for viewer access tests
let viewerUserId: string;
const VIEWER_EMAIL = "e2e-viewer@viziai.test";
const VIEWER_NAME = "E2E Viewer";

test.beforeAll(async () => {
  const result = await seedTestUser();
  userId = result.userId;
  profileId = result.profileId;

  // Create a viewer user
  const [viewer] = await sql`
    INSERT INTO users (email, name)
    VALUES (${VIEWER_EMAIL}, ${VIEWER_NAME})
    ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `;
  viewerUserId = viewer.id;

  // Grant viewer access to the same profile
  await sql`
    INSERT INTO user_access (user_id_new, profile_id, access_level, granted_by)
    VALUES (${viewerUserId}, ${profileId}, 'viewer', ${userId})
    ON CONFLICT (user_id_new, profile_id) DO UPDATE SET access_level = 'viewer'
  `;
});

test.afterAll(async () => {
  // Clean up viewer user
  await sql`DELETE FROM user_access WHERE user_id_new = ${viewerUserId}`;
  await sql`DELETE FROM users WHERE id = ${viewerUserId}`;

  // Clean up test user + profile
  await deleteTestUser(userId);
});

/**
 * Seed a processed_file + report + metrics for testing deletion.
 * Returns IDs for cleanup/assertion.
 */
let seedCounter = 0;
async function seedFileData(hash: string): Promise<{
  fileId: string;
  reportId: string;
  metricIds: string[];
}> {
  seedCounter += 1;
  const fileName = `test-${hash}.pdf`;
  const day = String(seedCounter).padStart(2, "0");
  const sampleDate = `2020-01-${day}`;

  const [file] = await sql`
    INSERT INTO processed_files (profile_id, content_hash, file_name)
    VALUES (${profileId}, ${hash}, ${fileName})
    RETURNING id
  `;

  const [report] = await sql`
    INSERT INTO reports (profile_id, sample_date, file_name, content_hash, source)
    VALUES (${profileId}, ${sampleDate}, ${fileName}, ${hash}, 'pdf')
    RETURNING id
  `;

  const metrics = await sql`
    INSERT INTO metrics (report_id, name, value, unit) VALUES
      (${report.id}, 'Hemoglobin', 14.5, 'g/dL'),
      (${report.id}, 'WBC', 7200, '/uL'),
      (${report.id}, 'Platelet', 250000, '/uL')
    RETURNING id
  `;

  return {
    fileId: file.id,
    reportId: report.id,
    metricIds: metrics.map((m: { id: string }) => m.id),
  };
}

/** Clean up seeded data (safe to call even if rows already deleted) */
async function cleanupFileData(hash: string, fileId: string): Promise<void> {
  await sql`DELETE FROM metrics WHERE report_id IN (
    SELECT id FROM reports WHERE content_hash = ${hash} AND profile_id = ${profileId}
  )`;
  await sql`DELETE FROM reports WHERE content_hash = ${hash} AND profile_id = ${profileId}`;
  await sql`DELETE FROM processed_files WHERE id = ${fileId}`;
  await sql`DELETE FROM pending_uploads WHERE content_hash = ${hash} AND profile_id = ${profileId}`;
}

test.describe("DELETE /api/settings/files/[id]", () => {
  test.describe.configure({ mode: "serial" });

  test("returns 401 for unauthenticated request", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    const response = await page.request.delete(
      "/api/settings/files/00000000-0000-0000-0000-000000000000",
    );
    expect(response.status()).toBe(401);

    await context.close();
  });

  test("returns 404 for nonexistent file", async ({ browser }) => {
    const { context, page } = await authenticatedContext(
      browser,
      userId,
      profileId,
    );

    const response = await page.request.delete(
      "/api/settings/files/00000000-0000-0000-0000-000000000000",
    );
    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.error).toBe("Not found");

    await context.close();
  });

  test("returns 403 for viewer access", async ({ browser }) => {
    const hash = "viewer-test-hash-001";
    const { fileId } = await seedFileData(hash);

    try {
      // Authenticate as the viewer
      const token = await createSessionCookie(
        viewerUserId,
        VIEWER_EMAIL,
        VIEWER_NAME,
      );
      const context = await browser.newContext();
      await context.addCookies([
        {
          name: "next-auth.session-token",
          value: token,
          domain: "localhost",
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
        },
        {
          name: "viziai_active_profile",
          value: profileId,
          domain: "localhost",
          path: "/",
          httpOnly: false,
          secure: false,
          sameSite: "Lax",
        },
      ]);
      const page = await context.newPage();

      const response = await page.request.delete(
        `/api/settings/files/${fileId}`,
      );
      expect(response.status()).toBe(403);
      const body = await response.json();
      expect(body.error).toBe("Access denied");

      // Verify data was NOT deleted
      const files =
        await sql`SELECT id FROM processed_files WHERE id = ${fileId}`;
      expect(files.length).toBe(1);

      await context.close();
    } finally {
      await cleanupFileData(hash, fileId);
    }
  });

  test("successfully deletes file, report, and metrics for owner", async ({
    browser,
  }) => {
    const hash = "delete-test-hash-001";
    const { fileId, reportId, metricIds } = await seedFileData(hash);

    // Also seed a pending_upload to verify it gets cleaned up
    await sql`
      INSERT INTO pending_uploads (user_id, profile_id, content_hash, file_name, status, expires_at)
      VALUES (${userId}, ${profileId}, ${hash}, 'test-delete-test-hash-001.pdf', 'confirmed', NOW() + INTERVAL '1 hour')
    `;

    const { context, page } = await authenticatedContext(
      browser,
      userId,
      profileId,
    );

    const response = await page.request.delete(`/api/settings/files/${fileId}`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);

    // Verify processed_file is gone
    const files =
      await sql`SELECT id FROM processed_files WHERE id = ${fileId}`;
    expect(files.length).toBe(0);

    // Verify report is gone
    const reports = await sql`SELECT id FROM reports WHERE id = ${reportId}`;
    expect(reports.length).toBe(0);

    // Verify metrics are gone (CASCADE)
    const metrics =
      await sql`SELECT id FROM metrics WHERE id = ANY(${metricIds})`;
    expect(metrics.length).toBe(0);

    // Verify pending_upload is gone
    const pending = await sql`
      SELECT id FROM pending_uploads
      WHERE content_hash = ${hash} AND profile_id = ${profileId}
    `;
    expect(pending.length).toBe(0);

    await context.close();
  });

  test("second DELETE on same file returns 404 (idempotent)", async ({
    browser,
  }) => {
    const hash = "idempotent-test-hash-001";
    const { fileId } = await seedFileData(hash);

    const { context, page } = await authenticatedContext(
      browser,
      userId,
      profileId,
    );

    // First delete succeeds
    const first = await page.request.delete(`/api/settings/files/${fileId}`);
    expect(first.status()).toBe(200);

    // Second delete returns 404
    const second = await page.request.delete(`/api/settings/files/${fileId}`);
    expect(second.status()).toBe(404);

    await context.close();
  });

  test("deletes report using content_hash match", async ({ browser }) => {
    const hash = "hash-match-test-001";
    const fileName = `test-${hash}.pdf`;

    // Seed a file and a report with matching content_hash
    const [file] = await sql`
      INSERT INTO processed_files (profile_id, content_hash, file_name)
      VALUES (${profileId}, ${hash}, ${fileName})
      RETURNING id
    `;
    const [report] = await sql`
      INSERT INTO reports (profile_id, sample_date, file_name, content_hash, source)
      VALUES (${profileId}, '2019-06-15', ${fileName}, ${hash}, 'pdf')
      RETURNING id
    `;
    await sql`
      INSERT INTO metrics (report_id, name, value, unit)
      VALUES (${report.id}, 'Glucose', 95, 'mg/dL')
    `;

    const { context, page } = await authenticatedContext(
      browser,
      userId,
      profileId,
    );

    const response = await page.request.delete(
      `/api/settings/files/${file.id}`,
    );
    expect(response.status()).toBe(200);

    // Report matched by content_hash should be gone
    const reports = await sql`SELECT id FROM reports WHERE id = ${report.id}`;
    expect(reports.length).toBe(0);

    await context.close();
  });
});
