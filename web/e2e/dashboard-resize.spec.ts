import {
  test,
  expect,
  devices,
  Page,
  Browser,
  BrowserContext,
} from "@playwright/test";
import { createSessionCookie } from "./helpers/auth";
import {
  seedTestUser,
  deleteTestUser,
  TEST_EMAIL,
  TEST_NAME,
} from "./helpers/db";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.NEON_DATABASE_URL!);

// --- Constants (must match dashboard/page.tsx) ---
const DEFAULT_GRID_HEIGHT = 192;
const MIN_GRID_HEIGHT = 96;
const MAX_GRID_HEIGHT_MOBILE = 480;
const KEYBOARD_STEP = 48;

let userId: string;
let profileId: string;

// --- Metric pool for seeding ---
const ALL_METRICS = [
  {
    name: "Hemoglobin",
    value: 14.2,
    unit: "g/dL",
    ref_low: 12.0,
    ref_high: 17.5,
  },
  { name: "WBC", value: 7.5, unit: "10^3/uL", ref_low: 4.0, ref_high: 11.0 },
  { name: "RBC", value: 5.1, unit: "10^6/uL", ref_low: 4.5, ref_high: 5.5 },
  {
    name: "Platelet",
    value: 250,
    unit: "10^3/uL",
    ref_low: 150,
    ref_high: 400,
  },
  { name: "Glucose", value: 95, unit: "mg/dL", ref_low: 70, ref_high: 100 },
  { name: "ALT", value: 22, unit: "U/L", ref_low: 0, ref_high: 41 },
  { name: "AST", value: 25, unit: "U/L", ref_low: 0, ref_high: 40 },
  {
    name: "Creatinine",
    value: 0.9,
    unit: "mg/dL",
    ref_low: 0.7,
    ref_high: 1.3,
  },
  { name: "Potassium", value: 4.2, unit: "mEq/L", ref_low: 3.5, ref_high: 5.0 },
  { name: "Sodium", value: 140, unit: "mEq/L", ref_low: 136, ref_high: 145 },
  { name: "Calcium", value: 9.5, unit: "mg/dL", ref_low: 8.5, ref_high: 10.5 },
  { name: "Iron", value: 80, unit: "ug/dL", ref_low: 60, ref_high: 170 },
  { name: "TSH", value: 2.5, unit: "mIU/L", ref_low: 0.4, ref_high: 4.0 },
  { name: "Vitamin D", value: 35, unit: "ng/mL", ref_low: 30, ref_high: 100 },
  { name: "B12", value: 450, unit: "pg/mL", ref_low: 200, ref_high: 900 },
  { name: "Ferritin", value: 120, unit: "ng/mL", ref_low: 20, ref_high: 250 },
  { name: "Cholesterol", value: 195, unit: "mg/dL", ref_low: 0, ref_high: 200 },
  {
    name: "Triglycerides",
    value: 150,
    unit: "mg/dL",
    ref_low: 0,
    ref_high: 150,
  },
  { name: "HDL", value: 55, unit: "mg/dL", ref_low: 40, ref_high: 60 },
  { name: "LDL", value: 120, unit: "mg/dL", ref_low: 0, ref_high: 130 },
];

/**
 * Seed 2 reports with N metrics so the dashboard shows:
 * - metric grid cards
 * - resize handle (requires reportCount >= 2)
 * - line charts (requires selectedMetrics.length > 0)
 */
async function seedReportsWithMetrics(
  pid: string,
  metricCount: number,
): Promise<void> {
  const [report1] = await sql`
    INSERT INTO reports (profile_id, sample_date, file_name, source)
    VALUES (${pid}, '2025-06-01', 'resize-test-1.pdf', 'pdf')
    RETURNING id
  `;
  const [report2] = await sql`
    INSERT INTO reports (profile_id, sample_date, file_name, source)
    VALUES (${pid}, '2025-09-01', 'resize-test-2.pdf', 'pdf')
    RETURNING id
  `;

  const metrics = ALL_METRICS.slice(0, metricCount);
  for (const m of metrics) {
    await sql`
      INSERT INTO metrics (report_id, name, value, unit, ref_low, ref_high, flag)
      VALUES (${report1.id}, ${m.name}, ${m.value}, ${m.unit}, ${m.ref_low}, ${m.ref_high}, 'N')
    `;
    await sql`
      INSERT INTO metrics (report_id, name, value, unit, ref_low, ref_high, flag)
      VALUES (${report2.id}, ${m.name}, ${m.value * 1.05}, ${m.unit}, ${m.ref_low}, ${m.ref_high}, 'N')
    `;
  }
}

async function cleanupReports(pid: string): Promise<void> {
  await sql`
    DELETE FROM metrics WHERE report_id IN (
      SELECT id FROM reports WHERE profile_id = ${pid}
        AND file_name IN ('resize-test-1.pdf', 'resize-test-2.pdf')
    )
  `;
  await sql`
    DELETE FROM reports WHERE profile_id = ${pid}
      AND file_name IN ('resize-test-1.pdf', 'resize-test-2.pdf')
  `;
}

/**
 * Drag the resize handle by deltaY pixels in `steps` increments.
 * Uses pointer events (works for both mouse and touch emulation).
 */
async function dragResize(
  page: Page,
  handle: ReturnType<Page["locator"]>,
  deltaY: number,
  steps = 30,
): Promise<void> {
  const box = await handle.boundingBox();
  expect(box).not.toBeNull();

  const startX = box!.x + box!.width / 2;
  const startY = box!.y + box!.height / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();

  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(startX, startY + (deltaY * i) / steps, { steps: 1 });
  }

  await page.mouse.up();
}

type SetupResult = {
  context: BrowserContext;
  page: Page;
  pageErrors: Error[];
  consoleErrors: string[];
  resizeHandle: ReturnType<Page["locator"]>;
  cdpSession: Awaited<ReturnType<BrowserContext["newCDPSession"]>>;
};

/**
 * Reusable setup: create context with device emulation, auth cookies,
 * navigate to dashboard, wait for grid and resize handle.
 */
async function setupDashboard(
  browser: Browser,
  device: (typeof devices)[string],
  uid: string,
  pid: string,
  options?: { cpuThrottle?: number },
): Promise<SetupResult> {
  const token = await createSessionCookie(uid, TEST_EMAIL, TEST_NAME);

  const context = await browser.newContext(device);
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
      value: pid,
      domain: "localhost",
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  const page = await context.newPage();

  // Enable CPU throttling via CDP if requested
  const cdpSession = await context.newCDPSession(page);
  if (options?.cpuThrottle) {
    await cdpSession.send("Emulation.setCPUThrottlingRate", {
      rate: options.cpuThrottle,
    });
  }

  // Collect errors
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));

  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  // Navigate and wait for grid
  await page.goto("/dashboard", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForSelector('[role="button"][tabindex="0"]', {
    timeout: 15000,
  });

  // Wait for resize handle
  const resizeHandle = page.locator(
    '[role="separator"][aria-orientation="horizontal"]',
  );
  await resizeHandle.waitFor({ state: "visible", timeout: 10000 });

  return { context, page, pageErrors, consoleErrors, resizeHandle, cdpSession };
}

/** Assert no "Maximum update depth exceeded" errors occurred. */
function assertNoDepthErrors(
  pageErrors: Error[],
  consoleErrors: string[],
): void {
  const depthErrors = pageErrors.filter((e) =>
    e.message.includes("Maximum update depth exceeded"),
  );
  const depthConsoleErrors = consoleErrors.filter((msg) =>
    msg.includes("Maximum update depth exceeded"),
  );

  expect(
    depthErrors,
    `Expected no "Maximum update depth exceeded" page errors, got ${depthErrors.length}`,
  ).toHaveLength(0);
  expect(
    depthConsoleErrors,
    `Expected no "Maximum update depth exceeded" console errors`,
  ).toHaveLength(0);
}

/** Get the current grid container height in pixels. */
async function getGridHeight(page: Page): Promise<number> {
  return page.evaluate(() => {
    const el = document.querySelector(
      ".overflow-y-auto.max-h-\\[var\\(--grid-h\\)\\]",
    );
    return el ? el.clientHeight : 0;
  });
}

// All tests share a single user/profile — must run serially in one worker
test.describe.configure({ mode: "serial" });

// ─── Lifecycle ───────────────────────────────────────────────────────
test.beforeAll(async () => {
  const result = await seedTestUser();
  userId = result.userId;
  profileId = result.profileId;
});

test.afterAll(async () => {
  await cleanupReports(profileId);
  await deleteTestUser(userId);
});

// ═══════════════════════════════════════════════════════════════════════
// Group 1: Multi-Device Rapid Resize (the Sentry bug scenario)
// ═══════════════════════════════════════════════════════════════════════

test.describe("Group 1: Multi-Device Rapid Resize", () => {
  test.beforeAll(async () => {
    await seedReportsWithMetrics(profileId, 12);
  });

  test.afterAll(async () => {
    await cleanupReports(profileId);
  });

  const rapidResizeDevices = [
    { name: "Pixel 5", device: devices["Pixel 5"] },
    { name: "iPhone SE", device: devices["iPhone SE"] },
    { name: "Galaxy S5", device: devices["Galaxy S III"] }, // Closest to Galaxy S5 in Playwright
    { name: "iPad Mini", device: devices["iPad Mini"] },
  ];

  for (const { name, device } of rapidResizeDevices) {
    test(`Test: Rapid drag on ${name} does not cause Maximum update depth exceeded`, async ({
      browser,
    }) => {
      test.setTimeout(90000);

      const {
        context,
        page,
        pageErrors,
        consoleErrors,
        resizeHandle,
        cdpSession,
      } = await setupDashboard(browser, device, userId, profileId, {
        cpuThrottle: 6,
      });

      // Click a metric card to show charts (so ResponsiveContainer is active)
      const firstCard = page.locator('[role="button"][tabindex="0"]').first();
      await firstCard.click();
      await page.waitForTimeout(500); // Let chart render

      // Rapid drag down 150px
      await dragResize(page, resizeHandle, 150, 30);
      await page.waitForTimeout(1000);

      // Rapid drag back up 150px
      await dragResize(page, resizeHandle, -150, 30);
      await page.waitForTimeout(2000);

      // Disable CPU throttling
      await cdpSession.send("Emulation.setCPUThrottlingRate", { rate: 1 });

      // Assertions
      assertNoDepthErrors(pageErrors, consoleErrors);
      await expect(resizeHandle).toBeVisible();

      // Page is still functional — cards are still visible
      await expect(
        page.locator('[role="button"][tabindex="0"]').first(),
      ).toBeVisible();

      await context.close();
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// Group 2: Boundary Conditions
// ═══════════════════════════════════════════════════════════════════════

test.describe("Group 2: Boundary Conditions", () => {
  test("Test 5: Drag to minimum height (96px) clamps correctly", async ({
    browser,
  }) => {
    test.setTimeout(60000);

    await seedReportsWithMetrics(profileId, 12);

    const { context, page, pageErrors, consoleErrors, resizeHandle } =
      await setupDashboard(browser, devices["Pixel 5"], userId, profileId);

    // Drag UP a lot — well past minimum
    await dragResize(page, resizeHandle, -500, 30);
    await page.waitForTimeout(1000);

    // Grid height should clamp at MIN_GRID_HEIGHT
    const height = await getGridHeight(page);
    expect(height).toBeGreaterThanOrEqual(MIN_GRID_HEIGHT - 2); // Allow 2px tolerance
    expect(height).toBeLessThanOrEqual(MIN_GRID_HEIGHT + 10);

    // Drag up even further — should do nothing
    await dragResize(page, resizeHandle, -200, 15);
    await page.waitForTimeout(500);

    const height2 = await getGridHeight(page);
    expect(height2).toBeGreaterThanOrEqual(MIN_GRID_HEIGHT - 2);

    assertNoDepthErrors(pageErrors, consoleErrors);
    await cleanupReports(profileId);
    await context.close();
  });

  test("Test 6: Drag beyond content height with few metrics clamps to content", async ({
    browser,
  }) => {
    test.setTimeout(60000);

    // Only 2 metrics — 1 row on mobile
    await seedReportsWithMetrics(profileId, 2);

    const { context, page, pageErrors, consoleErrors, resizeHandle } =
      await setupDashboard(browser, devices["Pixel 5"], userId, profileId);

    // Get initial content height (should be small for just 2 metrics)
    const contentHeight = await page.evaluate(() => {
      const inner = document.querySelector(".grid.grid-cols-2");
      return inner ? inner.scrollHeight : 0;
    });

    // Try to drag down way beyond content
    await dragResize(page, resizeHandle, 300, 30);
    await page.waitForTimeout(1000);

    // Grid height should not massively exceed content height
    const height = await getGridHeight(page);
    // It should clamp to content height (or at least not go to 300+ px for 2 metrics)
    expect(height).toBeLessThanOrEqual(contentHeight + 50); // Generous tolerance for padding

    assertNoDepthErrors(pageErrors, consoleErrors);
    await cleanupReports(profileId);
    await context.close();
  });

  test("Test 7: Drag to MAX_GRID_HEIGHT_MOBILE (480px cap)", async ({
    browser,
  }) => {
    test.setTimeout(60000);

    // 20 metrics — many rows, scrollHeight well above 480px
    await seedReportsWithMetrics(profileId, 20);

    const { context, page, pageErrors, consoleErrors, resizeHandle } =
      await setupDashboard(browser, devices["iPhone 12"], userId, profileId);

    // Drag down as far as possible
    await dragResize(page, resizeHandle, 600, 30);
    await page.waitForTimeout(1000);

    // Grid height should not exceed MAX_GRID_HEIGHT_MOBILE on mobile
    const height = await getGridHeight(page);
    expect(height).toBeLessThanOrEqual(MAX_GRID_HEIGHT_MOBILE + 5); // Small tolerance

    assertNoDepthErrors(pageErrors, consoleErrors);
    await cleanupReports(profileId);
    await context.close();
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Group 3: State Change During/After Resize
// ═══════════════════════════════════════════════════════════════════════

test.describe("Group 3: State Change During/After Resize", () => {
  test("Test 8: Resize then filter triggers clamping without infinite loop", async ({
    browser,
  }) => {
    test.setTimeout(60000);

    await seedReportsWithMetrics(profileId, 12);

    const { context, page, pageErrors, consoleErrors, resizeHandle } =
      await setupDashboard(browser, devices["Pixel 5"], userId, profileId);

    // Drag grid down to ~350px
    await dragResize(page, resizeHandle, 200, 20);
    await page.waitForTimeout(500);

    const heightBefore = await getGridHeight(page);
    expect(heightBefore).toBeGreaterThan(250);

    // Type in search box to filter down to very few metrics
    // First, open the search input if it exists
    const searchToggle = page.locator('button:has([class*="lucide-search"])');
    if (await searchToggle.isVisible()) {
      await searchToggle.click();
      await page.waitForTimeout(200);
    }

    const searchInput = page.locator('input[type="text"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("Hemoglobin");
      await page.waitForTimeout(1000);

      // Grid height should auto-clamp to smaller content
      const heightAfter = await getGridHeight(page);
      expect(heightAfter).toBeLessThanOrEqual(heightBefore);
    }

    // No infinite loop from the clamping useEffect
    assertNoDepthErrors(pageErrors, consoleErrors);
    await cleanupReports(profileId);
    await context.close();
  });

  test("Test 9: 5 repeated rapid resize cycles without errors", async ({
    browser,
  }) => {
    test.setTimeout(120000);

    await seedReportsWithMetrics(profileId, 12);

    const {
      context,
      page,
      pageErrors,
      consoleErrors,
      resizeHandle,
      cdpSession,
    } = await setupDashboard(
      browser,
      devices["Galaxy S III"],
      userId,
      profileId,
      {
        cpuThrottle: 6,
      },
    );

    // Click a metric card to show charts
    const firstCard = page.locator('[role="button"][tabindex="0"]').first();
    await firstCard.click();
    await page.waitForTimeout(500);

    // Perform 5 rapid drag cycles
    for (let cycle = 0; cycle < 5; cycle++) {
      await dragResize(page, resizeHandle, 120, 30);
      await dragResize(page, resizeHandle, -120, 30);
    }

    await page.waitForTimeout(2000);

    // Disable CPU throttling
    await cdpSession.send("Emulation.setCPUThrottlingRate", { rate: 1 });

    // Assertions
    assertNoDepthErrors(pageErrors, consoleErrors);
    await expect(resizeHandle).toBeVisible();
    await expect(
      page.locator('[role="button"][tabindex="0"]').first(),
    ).toBeVisible();

    await cleanupReports(profileId);
    await context.close();
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Group 4: Keyboard Resize
// ═══════════════════════════════════════════════════════════════════════

test.describe("Group 4: Keyboard Resize", () => {
  test("Test 10: Keyboard ArrowDown to max, then ArrowUp to min", async ({
    browser,
  }) => {
    test.setTimeout(60000);

    await seedReportsWithMetrics(profileId, 12);

    const { context, page, pageErrors, consoleErrors, resizeHandle } =
      await setupDashboard(browser, devices["Pixel 5"], userId, profileId);

    // Focus the resize handle
    await resizeHandle.focus();
    await page.waitForTimeout(200);

    // Press ArrowDown 20 times rapidly — should grow by KEYBOARD_STEP each press, cap at max
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press("ArrowDown");
    }
    await page.waitForTimeout(500);

    const heightAfterDown = await getGridHeight(page);
    // On Pixel 5 (mobile), max is min(contentH, 480)
    expect(heightAfterDown).toBeLessThanOrEqual(MAX_GRID_HEIGHT_MOBILE + 5);
    expect(heightAfterDown).toBeGreaterThan(DEFAULT_GRID_HEIGHT);

    // Press ArrowUp 20 times rapidly — should shrink, cap at MIN_GRID_HEIGHT
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press("ArrowUp");
    }
    await page.waitForTimeout(500);

    const heightAfterUp = await getGridHeight(page);
    expect(heightAfterUp).toBeGreaterThanOrEqual(MIN_GRID_HEIGHT - 2);
    expect(heightAfterUp).toBeLessThanOrEqual(MIN_GRID_HEIGHT + KEYBOARD_STEP);

    assertNoDepthErrors(pageErrors, consoleErrors);
    await cleanupReports(profileId);
    await context.close();
  });

  test("Test 11: Keyboard resize with charts visible does not cause errors", async ({
    browser,
  }) => {
    test.setTimeout(60000);

    await seedReportsWithMetrics(profileId, 12);

    const { context, page, pageErrors, consoleErrors, resizeHandle } =
      await setupDashboard(browser, devices["iPhone SE"], userId, profileId);

    // Click a card to show chart (ResponsiveContainer active)
    const firstCard = page.locator('[role="button"][tabindex="0"]').first();
    await firstCard.click();
    await page.waitForTimeout(500);

    // Focus resize handle and rapid ArrowDown presses
    await resizeHandle.focus();
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press("ArrowDown");
    }
    await page.waitForTimeout(1000);

    // No Maximum update depth exceeded from chart ResponsiveContainer during resize
    assertNoDepthErrors(pageErrors, consoleErrors);

    // Page still functional
    await expect(resizeHandle).toBeVisible();
    await expect(firstCard).toBeVisible();

    await cleanupReports(profileId);
    await context.close();
  });
});
