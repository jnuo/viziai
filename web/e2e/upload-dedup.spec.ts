import { test, expect } from "@playwright/test";
import { authenticatedContext } from "./helpers/auth";
import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

const sql = neon(process.env.NEON_DATABASE_URL!);

// Unique user for this test file to avoid parallel conflicts
const TEST_EMAIL = "e2e-upload-dedup@viziai.test";
const TEST_NAME = "E2E Upload Dedup User";
const TEST_PROFILE = "E2E Upload Dedup Profile";

let userId: string;
let profileId: string;

// Second profile owned by same user — for cross-profile isolation tests
let secondProfileId: string;
const SECOND_PROFILE_NAME = "E2E Dedup Profile 2";

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

  // Create second profile owned by the same user
  const existingP2 =
    await sql`SELECT id FROM profiles WHERE display_name = ${SECOND_PROFILE_NAME}`;
  if (existingP2.length > 0) {
    secondProfileId = existingP2[0].id;
  } else {
    const [p2] = await sql`
      INSERT INTO profiles (display_name) VALUES (${SECOND_PROFILE_NAME}) RETURNING id
    `;
    secondProfileId = p2.id;
  }
  await sql`
    INSERT INTO user_access (user_id_new, profile_id, access_level, granted_by)
    VALUES (${userId}, ${secondProfileId}, 'owner', ${userId})
    ON CONFLICT (user_id_new, profile_id) DO NOTHING
  `;
});

test.afterAll(async () => {
  // Clean up second profile data
  await sql`DELETE FROM pending_uploads WHERE profile_id = ${secondProfileId}`;
  await sql`DELETE FROM pending_imports WHERE profile_id = ${secondProfileId}`;
  await sql`DELETE FROM api_keys WHERE profile_id = ${secondProfileId}`;
  await sql`DELETE FROM metrics WHERE report_id IN (
    SELECT id FROM reports WHERE profile_id = ${secondProfileId}
  )`;
  await sql`DELETE FROM reports WHERE profile_id = ${secondProfileId}`;
  await sql`DELETE FROM processed_files WHERE profile_id = ${secondProfileId}`;
  await sql`DELETE FROM metric_preferences WHERE profile_id = ${secondProfileId}`;
  await sql`DELETE FROM user_access WHERE profile_id = ${secondProfileId}`;
  await sql`DELETE FROM profiles WHERE id = ${secondProfileId}`;

  // Clean up primary profile
  await sql`DELETE FROM pending_uploads WHERE profile_id = ${profileId}`;
  await sql`DELETE FROM processed_files WHERE profile_id = ${profileId}`;
  await sql`DELETE FROM metrics WHERE report_id IN (
    SELECT id FROM reports WHERE profile_id = ${profileId}
  )`;
  await sql`DELETE FROM reports WHERE profile_id = ${profileId}`;
  await sql`DELETE FROM metric_preferences WHERE profile_id = ${profileId}`;
  await sql`DELETE FROM user_access WHERE user_id_new = ${userId}`;
  await sql`DELETE FROM profiles WHERE id = ${profileId}`;
  await sql`DELETE FROM users WHERE id = ${userId}`;
});

/** Build a minimal valid PDF buffer with unique content. */
function makePdf(uniqueId: string): Buffer {
  return Buffer.from(`%PDF-1.4 dedup-test-content-${uniqueId}`);
}

/** Compute SHA-256 hex hash of a buffer. */
function hashOf(buf: Buffer): string {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

test.describe("Upload deduplication and cross-profile isolation", () => {
  test.describe.configure({ mode: "serial" });

  // ---------------------------------------------------------------
  // 1. Same hash, same profile -> 409
  // ---------------------------------------------------------------
  test("same hash, same profile returns 409 Duplicate", async ({ browser }) => {
    const pdf = makePdf("same-hash-same-profile");
    const contentHash = hashOf(pdf);

    // Seed processed_files as if this content was already confirmed
    await sql`
      INSERT INTO processed_files (profile_id, content_hash, file_name)
      VALUES (${profileId}, ${contentHash}, 'already-uploaded.pdf')
    `;

    try {
      const { context, page } = await authenticatedContext(
        browser,
        userId,
        profileId,
      );

      const response = await page.request.post("/api/upload", {
        multipart: {
          file: {
            name: "test.pdf",
            mimeType: "application/pdf",
            buffer: pdf,
          },
          profileId: profileId,
        },
      });

      expect(response.status()).toBe(409);
      const body = await response.json();
      expect(body.error).toBe("Duplicate");

      await context.close();
    } finally {
      await sql`DELETE FROM processed_files WHERE profile_id = ${profileId} AND content_hash = ${contentHash}`;
    }
  });

  // ---------------------------------------------------------------
  // 2. Same hash, different profile -> 201 (allowed)
  // ---------------------------------------------------------------
  test("same hash, different profile returns 201", async ({ browser }) => {
    const pdf = makePdf("same-hash-diff-profile");
    const contentHash = hashOf(pdf);

    // Seed processed_files for profileId only
    await sql`
      INSERT INTO processed_files (profile_id, content_hash, file_name)
      VALUES (${profileId}, ${contentHash}, 'profile1.pdf')
    `;

    try {
      const { context, page } = await authenticatedContext(
        browser,
        userId,
        secondProfileId,
      );

      const response = await page.request.post("/api/upload", {
        multipart: {
          file: {
            name: "test.pdf",
            mimeType: "application/pdf",
            buffer: pdf,
          },
          profileId: secondProfileId,
        },
      });

      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.uploadId).toBeTruthy();

      // Clean up the pending_upload created
      await sql`DELETE FROM pending_uploads WHERE id = ${body.uploadId}`;

      await context.close();
    } finally {
      await sql`DELETE FROM processed_files WHERE profile_id = ${profileId} AND content_hash = ${contentHash}`;
    }
  });

  // ---------------------------------------------------------------
  // 3. e-Nabiz import hash blocks PDF upload
  // ---------------------------------------------------------------
  test("e-Nabiz import hash blocks PDF upload with 409", async ({
    browser,
  }) => {
    const pdf = makePdf("enabiz-blocks-pdf");
    const contentHash = hashOf(pdf);

    // Seed as if e-Nabiz import created this processed_files entry
    await sql`
      INSERT INTO processed_files (profile_id, content_hash, file_name)
      VALUES (${profileId}, ${contentHash}, 'e-Nabız')
    `;

    try {
      const { context, page } = await authenticatedContext(
        browser,
        userId,
        profileId,
      );

      const response = await page.request.post("/api/upload", {
        multipart: {
          file: {
            name: "blood-test.pdf",
            mimeType: "application/pdf",
            buffer: pdf,
          },
          profileId: profileId,
        },
      });

      expect(response.status()).toBe(409);
      const body = await response.json();
      expect(body.error).toBe("Duplicate");
      expect(body.existingFileName).toBe("e-Nabız");

      await context.close();
    } finally {
      await sql`DELETE FROM processed_files WHERE profile_id = ${profileId} AND content_hash = ${contentHash}`;
    }
  });

  // ---------------------------------------------------------------
  // 4. Overwritten report — both old and new hash block uploads
  // ---------------------------------------------------------------
  test("overwritten report — both old and new hashes block uploads", async ({
    browser,
  }) => {
    const oldPdf = makePdf("overwrite-old-hash");
    const newPdf = makePdf("overwrite-new-hash");
    const freshPdf = makePdf("overwrite-fresh-hash");
    const oldHash = hashOf(oldPdf);
    const newHash = hashOf(newPdf);

    // Seed two processed_files rows simulating an overwrite scenario:
    // - original PDF upload created oldHash
    // - e-Nabiz overwrite created newHash (report content_hash updated, but oldHash stays in processed_files)
    await sql`
      INSERT INTO processed_files (profile_id, content_hash, file_name)
      VALUES (${profileId}, ${oldHash}, 'original.pdf')
    `;
    await sql`
      INSERT INTO processed_files (profile_id, content_hash, file_name)
      VALUES (${profileId}, ${newHash}, 'e-Nabız')
    `;

    try {
      const { context, page } = await authenticatedContext(
        browser,
        userId,
        profileId,
      );

      // Upload content matching oldHash -> 409
      const resp1 = await page.request.post("/api/upload", {
        multipart: {
          file: {
            name: "old.pdf",
            mimeType: "application/pdf",
            buffer: oldPdf,
          },
          profileId: profileId,
        },
      });
      expect(resp1.status()).toBe(409);

      // Upload content matching newHash -> 409
      const resp2 = await page.request.post("/api/upload", {
        multipart: {
          file: {
            name: "new.pdf",
            mimeType: "application/pdf",
            buffer: newPdf,
          },
          profileId: profileId,
        },
      });
      expect(resp2.status()).toBe(409);

      // Upload content with a fresh hash -> 201
      const resp3 = await page.request.post("/api/upload", {
        multipart: {
          file: {
            name: "fresh.pdf",
            mimeType: "application/pdf",
            buffer: freshPdf,
          },
          profileId: profileId,
        },
      });
      expect(resp3.status()).toBe(201);
      const body = await resp3.json();
      expect(body.uploadId).toBeTruthy();

      // Clean up the pending_upload created
      await sql`DELETE FROM pending_uploads WHERE id = ${body.uploadId}`;

      await context.close();
    } finally {
      await sql`DELETE FROM processed_files WHERE profile_id = ${profileId} AND content_hash = ${oldHash}`;
      await sql`DELETE FROM processed_files WHERE profile_id = ${profileId} AND content_hash = ${newHash}`;
    }
  });

  // ---------------------------------------------------------------
  // 5. Same PDF to two profiles — both succeed
  // ---------------------------------------------------------------
  test("upload same PDF to two profiles owned by same user — both succeed", async ({
    browser,
  }) => {
    const pdf = makePdf("two-profiles-same-user");
    const contentHash = hashOf(pdf);

    // Ensure no processed_files exist for either profile with this hash
    await sql`DELETE FROM processed_files WHERE content_hash = ${contentHash} AND profile_id IN (${profileId}, ${secondProfileId})`;

    const { context, page } = await authenticatedContext(
      browser,
      userId,
      profileId,
    );

    try {
      // Upload to first profile -> 201
      const resp1 = await page.request.post("/api/upload", {
        multipart: {
          file: {
            name: "shared.pdf",
            mimeType: "application/pdf",
            buffer: pdf,
          },
          profileId: profileId,
        },
      });
      expect(resp1.status()).toBe(201);
      const body1 = await resp1.json();
      expect(body1.uploadId).toBeTruthy();

      // Clean up the pending_upload so dedup only checks processed_files
      await sql`DELETE FROM pending_uploads WHERE id = ${body1.uploadId}`;

      // Upload to second profile -> 201
      const resp2 = await page.request.post("/api/upload", {
        multipart: {
          file: {
            name: "shared.pdf",
            mimeType: "application/pdf",
            buffer: pdf,
          },
          profileId: secondProfileId,
        },
      });
      expect(resp2.status()).toBe(201);
      const body2 = await resp2.json();
      expect(body2.uploadId).toBeTruthy();

      // Clean up pending_uploads
      await sql`DELETE FROM pending_uploads WHERE id = ${body2.uploadId}`;

      await context.close();
    } finally {
      // Clean up any processed_files or pending_uploads created
      await sql`DELETE FROM processed_files WHERE content_hash = ${contentHash} AND profile_id IN (${profileId}, ${secondProfileId})`;
      await sql`DELETE FROM pending_uploads WHERE content_hash = ${contentHash} AND profile_id IN (${profileId}, ${secondProfileId})`;
    }
  });
});
