import { test, expect } from "@playwright/test";
import { authenticatedContext, createSessionCookie } from "./helpers/auth";
import { seedTestUser, deleteTestUser } from "./helpers/db";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.NEON_DATABASE_URL!);

let userId: string;
let profileId: string;

// Viewer user — cannot create keys
let viewerUserId: string;
const VIEWER_EMAIL = "e2e-viewer-apikey@viziai.test";
const VIEWER_NAME = "E2E Viewer ApiKey";

// Second profile on same account — for cross-profile isolation tests
let secondProfileId: string;

test.beforeAll(async () => {
  const result = await seedTestUser();
  userId = result.userId;
  profileId = result.profileId;

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

  // Create second profile owned by the same user
  const [p2] = await sql`
    INSERT INTO profiles (display_name) VALUES ('E2E Second Profile')
    RETURNING id
  `;
  secondProfileId = p2.id;
  await sql`
    INSERT INTO user_access (user_id_new, profile_id, access_level, granted_by)
    VALUES (${userId}, ${secondProfileId}, 'owner', ${userId})
    ON CONFLICT (user_id_new, profile_id) DO NOTHING
  `;
});

test.afterAll(async () => {
  // Clean up second profile
  await sql`DELETE FROM api_keys WHERE profile_id = ${secondProfileId}`;
  await sql`DELETE FROM user_access WHERE profile_id = ${secondProfileId}`;
  await sql`DELETE FROM profiles WHERE id = ${secondProfileId}`;

  // Clean up viewer
  await sql`DELETE FROM user_access WHERE user_id_new = ${viewerUserId}`;
  await sql`DELETE FROM users WHERE id = ${viewerUserId}`;

  await deleteTestUser(userId);
});

test.describe("API Keys CRUD", () => {
  test.describe.configure({ mode: "serial" });

  let createdKey: string;
  let createdKeyId: string;

  test("POST /api/settings/api-keys — creates key for owner", async ({
    browser,
  }) => {
    const { context, page } = await authenticatedContext(
      browser,
      userId,
      profileId,
    );

    const response = await page.request.post("/api/settings/api-keys", {
      data: { profileId, name: "Test Key" },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.key).toMatch(/^viz_/);
    expect(body.keyPrefix).toBeTruthy();
    expect(body.profileId).toBe(profileId);

    createdKey = body.key;
    createdKeyId = body.id;

    await context.close();
  });

  test("GET /api/settings/api-keys — lists keys without exposing full key", async ({
    browser,
  }) => {
    const { context, page } = await authenticatedContext(
      browser,
      userId,
      profileId,
    );

    const response = await page.request.get("/api/settings/api-keys");
    expect(response.status()).toBe(200);
    const body = await response.json();

    const key = body.keys.find((k: { id: string }) => k.id === createdKeyId);
    expect(key).toBeTruthy();
    expect(key.key_prefix).toBeTruthy();
    // Full key should NOT be in the list response
    expect(key.key_hash).toBeUndefined();

    await context.close();
  });

  test("GET /api/settings/api-keys/verify — valid key returns profile info", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    const response = await page.request.get("/api/settings/api-keys/verify", {
      headers: { Authorization: `Bearer ${createdKey}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.valid).toBe(true);
    expect(body.profileId).toBe(profileId);
    expect(body.profileName).toBeTruthy();

    await context.close();
  });

  test("GET /api/settings/api-keys/verify — garbage key returns 401", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    const response = await page.request.get("/api/settings/api-keys/verify", {
      headers: { Authorization: "Bearer viz_deadbeefdeadbeef" },
    });

    expect(response.status()).toBe(401);
    await context.close();
  });

  test("GET /api/settings/api-keys/verify — no auth header returns 401", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    const response = await page.request.get("/api/settings/api-keys/verify");
    expect(response.status()).toBe(401);

    await context.close();
  });

  test("DELETE /api/settings/api-keys — revokes key", async ({ browser }) => {
    const { context, page } = await authenticatedContext(
      browser,
      userId,
      profileId,
    );

    const response = await page.request.delete(
      `/api/settings/api-keys?id=${createdKeyId}`,
    );
    expect(response.status()).toBe(200);

    await context.close();
  });

  test("GET /api/settings/api-keys/verify — revoked key returns 401", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    const response = await page.request.get("/api/settings/api-keys/verify", {
      headers: { Authorization: `Bearer ${createdKey}` },
    });

    expect(response.status()).toBe(401);
    await context.close();
  });

  test("POST /api/settings/api-keys — viewer gets 403", async ({ browser }) => {
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
    ]);
    const page = await context.newPage();

    const response = await page.request.post("/api/settings/api-keys", {
      data: { profileId, name: "Viewer Key" },
    });
    expect(response.status()).toBe(403);

    await context.close();
  });
});
