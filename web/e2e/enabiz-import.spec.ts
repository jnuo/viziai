import { test, expect } from "@playwright/test";
import { authenticatedContext, createSessionCookie } from "./helpers/auth";
import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

const sql = neon(process.env.NEON_DATABASE_URL!);

// Unique user for this test file to avoid parallel conflicts
const TEST_EMAIL = "e2e-enabiz-import@viziai.test";
const TEST_NAME = "E2E Enabiz Import User";
const TEST_PROFILE = "E2E Enabiz Import Profile";

let userId: string;
let profileId: string;

// Viewer user — cannot confirm imports
let viewerUserId: string;
const VIEWER_EMAIL = "e2e-viewer-import@viziai.test";
const VIEWER_NAME = "E2E Viewer Import";

// API key for the extension auth
let apiKey: string;

function generateApiKey() {
  const raw = crypto.randomBytes(32).toString("hex");
  const key = `viz_${raw}`;
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  const prefix = key.slice(0, 12);
  return { key, hash, prefix };
}

const SAMPLE_METRICS = [
  {
    name: "Hemoglobin",
    value: 14.5,
    unit: "g/dL",
    ref_low: 12.0,
    ref_high: 17.5,
  },
  { name: "WBC", value: 7200, unit: "/uL", ref_low: 4000, ref_high: 11000 },
  {
    name: "Platelet",
    value: 250000,
    unit: "/uL",
    ref_low: 150000,
    ref_high: 400000,
  },
];

test.beforeAll(async () => {
  // Create unique user + profile for this test file
  const [user] = await sql`
    INSERT INTO users (email, name)
    VALUES (${TEST_EMAIL}, ${TEST_NAME})
    ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `;
  userId = user.id;

  const existing =
    await sql`SELECT id FROM profiles WHERE display_name = ${TEST_PROFILE}`;
  if (existing.length > 0) {
    profileId = existing[0].id;
  } else {
    const [profile] = await sql`
      INSERT INTO profiles (display_name) VALUES (${TEST_PROFILE}) RETURNING id
    `;
    profileId = profile.id;
  }

  await sql`
    INSERT INTO user_access (user_id_new, profile_id, access_level, granted_by)
    VALUES (${userId}, ${profileId}, 'owner', ${userId})
    ON CONFLICT (user_id_new, profile_id) DO NOTHING
  `;

  // Create API key in DB
  const generated = generateApiKey();
  apiKey = generated.key;
  await sql`
    INSERT INTO api_keys (user_id, profile_id, name, key_hash, key_prefix)
    VALUES (${userId}, ${profileId}, 'E2E Import Key', ${generated.hash}, ${generated.prefix})
  `;

  // Create viewer user with viewer access
  const [viewer] = await sql`
    INSERT INTO users (email, name)
    VALUES (${VIEWER_EMAIL}, ${VIEWER_NAME})
    ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `;
  viewerUserId = viewer.id;
  await sql`
    INSERT INTO user_access (user_id_new, profile_id, access_level, granted_by)
    VALUES (${viewerUserId}, ${profileId}, 'viewer', ${userId})
    ON CONFLICT (user_id_new, profile_id) DO UPDATE SET access_level = 'viewer'
  `;
});

test.afterAll(async () => {
  // Clean up all data for this test's profile
  await sql`DELETE FROM pending_imports WHERE profile_id = ${profileId}`;
  await sql`DELETE FROM api_keys WHERE profile_id = ${profileId}`;
  await sql`DELETE FROM metrics WHERE report_id IN (
    SELECT id FROM reports WHERE profile_id = ${profileId}
  )`;
  await sql`DELETE FROM processed_files WHERE profile_id = ${profileId}`;
  await sql`DELETE FROM reports WHERE profile_id = ${profileId}`;
  await sql`DELETE FROM metric_preferences WHERE profile_id = ${profileId}`;

  // Clean up viewer
  await sql`DELETE FROM user_access WHERE user_id_new = ${viewerUserId}`;
  await sql`DELETE FROM users WHERE id = ${viewerUserId}`;

  // Clean up user + profile
  await sql`DELETE FROM user_access WHERE user_id_new = ${userId}`;
  await sql`DELETE FROM profiles WHERE id = ${profileId}`;
  await sql`DELETE FROM users WHERE id = ${userId}`;
});

test.describe("e-Nabız Import Flow", () => {
  test.describe.configure({ mode: "serial" });

  let pendingId: string;
  let confirmedReportId: string;

  test("1. Create pending import — happy path", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    const response = await page.request.post("/api/import/enabiz/pending", {
      headers: { Authorization: `Bearer ${apiKey}` },
      data: {
        date: "2020-06-15",
        hospital: "Test Hospital",
        contentHash: "test-enabiz-hash-001",
        metrics: SAMPLE_METRICS,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.id).toBeTruthy();
    expect(body.collision).toBeNull();

    pendingId = body.id;

    await context.close();
  });

  test("2. Duplicate pending — same hash returns same ID", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    const response = await page.request.post("/api/import/enabiz/pending", {
      headers: { Authorization: `Bearer ${apiKey}` },
      data: {
        date: "2020-06-15",
        hospital: "Test Hospital",
        contentHash: "test-enabiz-hash-001",
        metrics: SAMPLE_METRICS,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.id).toBe(pendingId);

    await context.close();
  });

  test("3. GET pending import — returns data", async ({ browser }) => {
    const { context, page } = await authenticatedContext(
      browser,
      userId,
      profileId,
    );

    const response = await page.request.get(
      `/api/import/enabiz/pending/${pendingId}`,
    );

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.import.metrics).toBeInstanceOf(Array);
    expect(body.import.metrics.length).toBeGreaterThan(0);
    expect(body.processed).toBe(false);

    await context.close();
  });

  test("4. Confirm import — creates report and metrics", async ({
    browser,
  }) => {
    const { context, page } = await authenticatedContext(
      browser,
      userId,
      profileId,
    );

    const response = await page.request.post(
      `/api/import/enabiz/pending/${pendingId}/confirm`,
      {
        data: {
          sampleDate: "2020-06-15",
          metrics: SAMPLE_METRICS,
        },
      },
    );

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.reportId).toBeTruthy();

    confirmedReportId = body.reportId;

    // Verify report exists in DB
    const reports =
      await sql`SELECT id FROM reports WHERE id = ${confirmedReportId}`;
    expect(reports.length).toBe(1);

    // Verify metrics exist in DB
    const metrics =
      await sql`SELECT id FROM metrics WHERE report_id = ${confirmedReportId}`;
    expect(metrics.length).toBe(SAMPLE_METRICS.length);

    // Verify processed_files row exists
    const processed = await sql`
      SELECT id FROM processed_files
      WHERE profile_id = ${profileId} AND content_hash = 'test-enabiz-hash-001'
    `;
    expect(processed.length).toBe(1);

    await context.close();
  });

  test("5. Duplicate detection after confirm — 409", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    const response = await page.request.post("/api/import/enabiz/pending", {
      headers: { Authorization: `Bearer ${apiKey}` },
      data: {
        date: "2020-06-15",
        hospital: "Test Hospital",
        contentHash: "test-enabiz-hash-001",
        metrics: SAMPLE_METRICS,
      },
    });

    expect(response.status()).toBe(409);

    await context.close();
  });

  test("6. Collision detection — same date, similar metrics", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    const response = await page.request.post("/api/import/enabiz/pending", {
      headers: { Authorization: `Bearer ${apiKey}` },
      data: {
        date: "2020-06-15",
        hospital: "Another Hospital",
        contentHash: "test-enabiz-hash-002",
        metrics: SAMPLE_METRICS,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.id).toBeTruthy();
    expect(body.collision).not.toBeNull();
    expect(body.collision.similarity).toBeGreaterThan(0);

    await context.close();
  });

  test("7. Confirm with overwrite — replaces existing report", async ({
    browser,
  }) => {
    // Get the pending ID for hash-002
    const pending = await sql`
      SELECT id FROM pending_imports
      WHERE profile_id = ${profileId}
        AND content_hash = 'test-enabiz-hash-002'
        AND status = 'pending'
    `;
    const overwritePendingId = pending[0].id;

    const OVERWRITE_METRICS = [
      {
        name: "Hemoglobin",
        value: 15.0,
        unit: "g/dL",
        ref_low: 12.0,
        ref_high: 17.5,
      },
      { name: "Glucose", value: 95, unit: "mg/dL", ref_low: 70, ref_high: 110 },
    ];

    const { context, page } = await authenticatedContext(
      browser,
      userId,
      profileId,
    );

    const response = await page.request.post(
      `/api/import/enabiz/pending/${overwritePendingId}/confirm`,
      {
        data: {
          sampleDate: "2020-06-15",
          metrics: OVERWRITE_METRICS,
          collisionAction: "overwrite",
          collisionReportId: confirmedReportId,
        },
      },
    );

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.action).toBe("overwrite");

    // Verify old metrics are gone, new metrics are present
    const metrics = await sql`
      SELECT name FROM metrics WHERE report_id = ${confirmedReportId} ORDER BY name
    `;
    expect(metrics.length).toBe(OVERWRITE_METRICS.length);
    const names = metrics.map((m: { name: string }) => m.name).sort();
    expect(names).toEqual(["Glucose", "Hemoglobin"]);

    await context.close();
  });

  test("8. Confirm skip — no report created", async ({ browser }) => {
    // Create a new pending import with another unique hash
    const ctxForCreate = await browser.newContext();
    const pageForCreate = await ctxForCreate.newPage();

    const createRes = await pageForCreate.request.post(
      "/api/import/enabiz/pending",
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        data: {
          date: "2020-06-15",
          hospital: "Skip Hospital",
          contentHash: "test-enabiz-hash-003",
          metrics: SAMPLE_METRICS,
        },
      },
    );
    expect(createRes.status()).toBe(200);
    const createBody = await createRes.json();
    const skipPendingId = createBody.id;
    await ctxForCreate.close();

    // Confirm with skip
    const { context, page } = await authenticatedContext(
      browser,
      userId,
      profileId,
    );

    const response = await page.request.post(
      `/api/import/enabiz/pending/${skipPendingId}/confirm`,
      {
        data: {
          sampleDate: "2020-06-15",
          metrics: [],
          collisionAction: "skip",
        },
      },
    );

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.action).toBe("skipped");

    // Verify pending_imports status is 'skipped'
    const rows = await sql`
      SELECT status FROM pending_imports WHERE id = ${skipPendingId}
    `;
    expect(rows[0].status).toBe("skipped");

    // Verify no report was created for this hash
    const reports = await sql`
      SELECT id FROM reports WHERE content_hash = 'test-enabiz-hash-003' AND profile_id = ${profileId}
    `;
    expect(reports.length).toBe(0);

    await context.close();
  });

  test("9. Expired import — 410", async ({ browser }) => {
    // Insert an already-expired pending import directly
    const [expired] = await sql`
      INSERT INTO pending_imports (profile_id, user_id, source, content_hash, sample_date, metrics, expires_at)
      VALUES (${profileId}, ${userId}, 'enabiz', 'test-enabiz-hash-004', '2020-06-15', ${JSON.stringify(SAMPLE_METRICS)}, NOW() - INTERVAL '1 minute')
      RETURNING id
    `;

    const { context, page } = await authenticatedContext(
      browser,
      userId,
      profileId,
    );

    const response = await page.request.post(
      `/api/import/enabiz/pending/${expired.id}/confirm`,
      {
        data: {
          sampleDate: "2020-06-15",
          metrics: SAMPLE_METRICS,
        },
      },
    );

    expect(response.status()).toBe(410);

    await context.close();
  });

  test("10. Viewer cannot confirm — 403", async ({ browser }) => {
    // Create a pending import for the viewer to attempt confirming
    const ctxForCreate = await browser.newContext();
    const pageForCreate = await ctxForCreate.newPage();

    const createRes = await pageForCreate.request.post(
      "/api/import/enabiz/pending",
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        data: {
          date: "2020-06-15",
          hospital: "Viewer Test Hospital",
          contentHash: "test-enabiz-hash-005",
          metrics: SAMPLE_METRICS,
        },
      },
    );
    expect(createRes.status()).toBe(200);
    const createBody = await createRes.json();
    const viewerPendingId = createBody.id;
    await ctxForCreate.close();

    // Authenticate as viewer
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

    const response = await page.request.post(
      `/api/import/enabiz/pending/${viewerPendingId}/confirm`,
      {
        data: {
          sampleDate: "2020-06-15",
          metrics: SAMPLE_METRICS,
        },
      },
    );

    expect(response.status()).toBe(403);

    await context.close();
  });

  test("11. Already confirmed — 400", async ({ browser }) => {
    // Use the pending import from test 4 which was already confirmed
    const confirmed = await sql`
      SELECT id FROM pending_imports
      WHERE profile_id = ${profileId}
        AND content_hash = 'test-enabiz-hash-001'
        AND status = 'confirmed'
    `;
    expect(confirmed.length).toBeGreaterThan(0);
    const alreadyConfirmedId = confirmed[0].id;

    const { context, page } = await authenticatedContext(
      browser,
      userId,
      profileId,
    );

    const response = await page.request.post(
      `/api/import/enabiz/pending/${alreadyConfirmedId}/confirm`,
      {
        data: {
          sampleDate: "2020-06-15",
          metrics: SAMPLE_METRICS,
        },
      },
    );

    expect(response.status()).toBe(400);

    await context.close();
  });
});
