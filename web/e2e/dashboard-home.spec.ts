/**
 * Dashboard redesign e2e (#157 / #158 / #159) — synthetic data only.
 *
 * Seeds its own profile and WRITES to the database, so it refuses to run
 * unless NEON_DATABASE_URL points at the Neon test branch
 * (E2E_DB_HOST_ALLOW, default "ep-raspy-bar"). Run against a dev server
 * that uses the same database:
 *
 *   PLAYWRIGHT_BASE_URL=http://localhost:3100 npx playwright test e2e/dashboard-home.spec.ts
 */
import { test, expect, type Browser, type Page } from "@playwright/test";
import { neon } from "@neondatabase/serverless";
import { createSessionCookie } from "./helpers/auth";
import {
  seedTestUser,
  deleteTestUser,
  TEST_EMAIL,
  TEST_NAME,
} from "./helpers/db";

const DB_URL = process.env.NEON_DATABASE_URL ?? "";
const ALLOWED_HOST = process.env.E2E_DB_HOST_ALLOW ?? "ep-raspy-bar";
const sql = neon(DB_URL);

const VIEWER_EMAIL = "e2e-viewer@viziai.test";
const DATES = [
  "2026-01-05",
  "2026-02-02",
  "2026-03-02",
  "2026-03-23",
  "2026-04-06",
  "2026-04-20",
];
// Synthetic series: [name, unit, refLow, refHigh, values per date (null = not measured)]
const SERIES: [
  string,
  string,
  number | null,
  number | null,
  (number | null)[],
][] = [
  ["Hemoglobin", "g/dL", 10.2, 16.5, [9.1, 9.4, 8.7, 8.9, 9.6, 9.9]],
  ["Trombosit", "10^3/uL", 117, 354, [60, 70, 40, 35, 50, 58]],
  ["Lökosit", "10^3/uL", 4.2, 11.6, [5.1, 6.0, 4.4, null, 7.2, 7.4]],
  ["Kreatinin", "mg/dL", 0.67, 1.17, [0.82, 0.85, 0.84, 0.86, 0.85, 0.88]],
  ["C Reaktif Protein (CRP)", "mg/L", 0, 5, [12, 30, 22, 45, 18, 8]],
  ["Nötrofil#", "10^3/uL", 1.5, 7.7, [3.0, 3.2, 2.1, 2.4, 3.9, 4.1]],
  ["Ferritin", "ng/mL", 30, 400, [210, null, 260, null, 300, 280]],
  ["Sodyum", "mmol/L", 136, 146, [139, 140, 138, 141, 140, 139]],
  ["Glukoz", "mg/dL", 70, 100, [92, 96, 101, 99, 94, 125]],
  ["Ölçüm X", "U", null, null, [1, 2, 3, 4, 5, 90]],
];
const HOME = [
  "Hemoglobin",
  "Trombosit",
  "Lökosit",
  "Kreatinin",
  "C Reaktif Protein (CRP)",
  "Nötrofil#",
];

let userId: string;
let profileId: string;
let viewerId: string;

async function setHome(names: string[]) {
  await sql`
    UPDATE metric_preferences
    SET is_favorite = name = ANY(${names}::text[]),
        display_order = COALESCE(array_position(${names}::text[], name) - 1, 100)
    WHERE profile_id = ${profileId}
  `;
}
async function homeInDb(): Promise<string[]> {
  const rows = await sql`
    SELECT name FROM metric_preferences
    WHERE profile_id = ${profileId} AND is_favorite
    ORDER BY display_order, name
  `;
  return rows.map((r) => r.name as string);
}

async function open(
  browser: Browser,
  uid: string,
  email: string,
  viewport = { width: 1280, height: 900 },
  beforeGoto?: (page: Page) => Promise<void>,
) {
  const token = await createSessionCookie(uid, email, TEST_NAME);
  const context = await browser.newContext({ viewport, locale: "tr-TR" });
  await context.addCookies([
    {
      name: "next-auth.session-token",
      value: token,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
    {
      name: "viziai_active_profile",
      value: profileId,
      domain: "localhost",
      path: "/",
      sameSite: "Lax",
    },
    {
      name: "locale",
      value: "tr",
      domain: "localhost",
      path: "/",
      sameSite: "Lax",
    },
  ]);
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  if (beforeGoto) await beforeGoto(page);
  await page.goto("/dashboard");
  await expect(page.getByTestId("home-cards")).toBeVisible({ timeout: 60_000 });
  return { context, page, errors };
}

const cardNames = (page: Page) =>
  page.locator("[data-testid=home-cards] .mc-name").allInnerTexts();
const chartIds = (page: Page) =>
  page
    .locator(".vz-chart-card")
    .evaluateAll((els) => els.map((e) => e.getAttribute("data-metric")));

test.describe("Dashboard: Ana ekran, picker, charts", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async () => {
    if (!DB_URL || !new URL(DB_URL).host.includes(ALLOWED_HOST)) {
      throw new Error(
        `Refusing to seed: NEON_DATABASE_URL is not the test branch (${ALLOWED_HOST}).`,
      );
    }
    ({ userId, profileId } = await seedTestUser());
    await sql`DELETE FROM metrics WHERE report_id IN (SELECT id FROM reports WHERE profile_id = ${profileId})`;
    await sql`DELETE FROM reports WHERE profile_id = ${profileId}`;
    await sql`DELETE FROM metric_preferences WHERE profile_id = ${profileId}`;
    for (const [i, date] of DATES.entries()) {
      const [r] = await sql`
        INSERT INTO reports (profile_id, sample_date, file_name, source)
        VALUES (${profileId}, ${date}, ${`e2e-dash-${i}.pdf`}, 'pdf') RETURNING id`;
      for (const [name, unit, lo, hi, vals] of SERIES) {
        if (vals[i] == null) continue;
        await sql`
          INSERT INTO metrics (report_id, name, value, unit, ref_low, ref_high)
          VALUES (${r.id}, ${name}, ${vals[i]}, ${unit}, ${lo}, ${hi})`;
      }
    }
    // the latest Hemoglobin result comes from a lab that writes "gr/dL"
    await sql`
      UPDATE metrics SET unit = 'gr/dL'
      WHERE name = 'Hemoglobin' AND report_id = (
        SELECT id FROM reports WHERE profile_id = ${profileId}
        ORDER BY sample_date DESC LIMIT 1)`;
    await sql`
      INSERT INTO metric_preferences (profile_id, name, display_order)
      SELECT ${profileId}, n, (o - 1)::int FROM unnest(${SERIES.map((s) => s[0])}::text[]) WITH ORDINALITY AS t(n, o)`;
    const [v] = await sql`
      INSERT INTO users (email, name) VALUES (${VIEWER_EMAIL}, 'E2E Viewer')
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING id`;
    viewerId = v.id;
    await sql`
      INSERT INTO user_access (user_id_new, profile_id, access_level, granted_by)
      VALUES (${viewerId}, ${profileId}, 'viewer', ${userId})
      ON CONFLICT (user_id_new, profile_id) DO UPDATE SET access_level = 'viewer'`;
  });

  test.afterAll(async () => {
    if (!profileId) return;
    await sql`DELETE FROM user_access WHERE user_id_new = ${viewerId}`;
    await sql`DELETE FROM users WHERE id = ${viewerId}`;
    await deleteTestUser(userId);
  });

  test.beforeEach(async ({ page }) => {
    await setHome(HOME);
    void page;
  });

  test("shows only the Ana ekran cards in saved order and opens the first 2 charts", async ({
    browser,
  }) => {
    const { context, page, errors } = await open(browser, userId, TEST_EMAIL);
    expect(await cardNames(page)).toEqual(HOME);
    await expect(page.locator(".vz-chart-card")).toHaveCount(2);
    expect(await chartIds(page)).toEqual(["Hemoglobin", "Trombosit"]);
    // #157: Trombosit chart is fitted to its values; the range is off-scale
    await expect(page.locator('[data-metric="Trombosit"]')).toContainText(
      "Ölçek: değerlere göre",
    );
    await expect(
      page.locator('[data-metric="Trombosit"] .vz-edge-lbl'),
    ).toHaveText("Normal aralık ↑ 117–354");
    // 6 values, last one "gr/dL": a change, never "İlk ölçüm"
    const hb = page.locator('[data-id="Hemoglobin"] .mc-sub');
    await expect(hb).toContainText("↑0.3");
    await expect(hb).not.toContainText("İlk ölçüm");
    expect(errors).toEqual([]);
    await context.close();
  });

  test("a plain click toggles the chart and does not reorder", async ({
    browser,
  }) => {
    const { context, page } = await open(browser, userId, TEST_EMAIL);
    await page.locator('[data-id="Kreatinin"] .vz-mcard').click();
    await expect(page.locator('[data-metric="Kreatinin"]')).toBeVisible();
    expect(await cardNames(page)).toEqual(HOME);
    await page.waitForTimeout(800);
    expect(await homeInDb()).toEqual(HOME);
    await context.close();
  });

  test("a short drag that ends on the same card does not toggle its chart", async ({ browser }) => {
    const { context, page } = await open(browser, userId, TEST_EMAIL);
    const card = await page.locator('[data-id="Kreatinin"] .vz-mcard').boundingBox();
    await page.mouse.move(card!.x + 20, card!.y + 20);
    await page.mouse.down();
    await page.mouse.move(card!.x + 45, card!.y + 22, { steps: 5 }); // > 6px: a drag
    await page.mouse.move(card!.x + 30, card!.y + 20, { steps: 3 });
    await page.mouse.up();
    await page.waitForTimeout(300);
    await expect(page.locator('[data-metric="Kreatinin"]')).toHaveCount(0);
    expect(await cardNames(page)).toEqual(HOME);
    await context.close();
  });

  test("drag reorders cards, charts and the picker section, and persists", async ({
    browser,
  }) => {
    const { context, page } = await open(browser, userId, TEST_EMAIL);
    // open a third chart so the chart order can follow the card order
    await page.locator('[data-id="Lökosit"] .vz-mcard').click();
    expect(await chartIds(page)).toEqual([
      "Hemoglobin",
      "Trombosit",
      "Lökosit",
    ]);
    const from = await page.locator('[data-id="Lökosit"]').boundingBox();
    const to = await page.locator('[data-id="Hemoglobin"]').boundingBox();
    await page.mouse.move(from!.x + 40, from!.y + 20);
    await page.mouse.down();
    await page.mouse.move(from!.x + 30, from!.y + 20, { steps: 3 }); // > 6px: drag starts
    await page.mouse.move(to!.x + 10, to!.y + 20, { steps: 12 });
    await page.mouse.up();
    const expected = [
      "Lökosit",
      "Hemoglobin",
      "Trombosit",
      "Kreatinin",
      "C Reaktif Protein (CRP)",
      "Nötrofil#",
    ];
    await expect.poll(() => cardNames(page)).toEqual(expected);
    // the drag did not toggle a chart, and charts follow the new order
    expect(await chartIds(page)).toEqual([
      "Lökosit",
      "Hemoglobin",
      "Trombosit",
    ]);
    await page.getByRole("button", { name: /Tüm değerler/ }).click();
    const section = page.locator(".f-row .pk-name .nm");
    await expect(section).toHaveText(expected);
    await page.keyboard.press("Escape");
    await expect.poll(homeInDb, { timeout: 5000 }).toEqual(expected);
    await page.reload();
    await expect.poll(() => cardNames(page)).toEqual(expected);
    await context.close();
  });

  test("picker: add Ferritin with toast + Geri al, Escape returns focus, persists", async ({
    browser,
  }) => {
    const { context, page } = await open(browser, userId, TEST_EMAIL);
    const btn = page.getByRole("button", { name: /Tüm değerler/ });
    await btn.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("searchbox")).toBeFocused();
    await dialog.getByRole("searchbox").fill("ferr");
    await dialog
      .getByRole("button", { name: "Ana ekranda göster: Ferritin" })
      .click();
    await expect(
      page.getByRole("status").filter({ hasText: "Ana ekrana eklendi: Ferritin" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Geri al" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(btn).toBeFocused();
    await expect.poll(homeInDb).toEqual([...HOME, "Ferritin"]);
    await page.reload();
    await expect.poll(() => cardNames(page)).toEqual([...HOME, "Ferritin"]);

    // remove via the card menu, then undo
    await page.getByRole("button", { name: "Ferritin seçenekleri" }).click();
    await page.getByRole("menuitem", { name: "Ana ekrandan çıkar" }).click();
    await expect.poll(() => cardNames(page)).toEqual(HOME);
    await page.getByRole("button", { name: "Geri al" }).click();
    await expect.poll(() => cardNames(page)).toEqual([...HOME, "Ferritin"]);
    await expect.poll(homeInDb).toEqual([...HOME, "Ferritin"]);
    await context.close();
  });

  test("Geri al reverses only its own change; a later add survives", async ({
    browser,
  }) => {
    const { context, page } = await open(browser, userId, TEST_EMAIL);
    await page.getByRole("button", { name: /Tüm değerler/ }).click();
    const box = page.getByRole("dialog").getByRole("searchbox");
    await box.fill("ferr");
    await page.getByRole("button", { name: "Ana ekranda göster: Ferritin" }).click();
    await box.fill("sodyum");
    await page.getByRole("button", { name: "Ana ekranda göster: Sodyum" }).click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    expect(await cardNames(page)).toEqual([...HOME, "Ferritin", "Sodyum"]);
    // undo the FIRST toast (Ferritin): Sodyum, added after it, stays
    await page
      .locator("[role=status] > div")
      .filter({ hasText: "Ferritin" })
      .getByRole("button", { name: "Geri al" })
      .click();
    await expect.poll(() => cardNames(page)).toEqual([...HOME, "Sodyum"]);
    await expect.poll(homeInDb).toEqual([...HOME, "Sodyum"]);
    await context.close();
  });

  test("a saved Kilo card survives tracking data that loads late", async ({
    browser,
  }) => {
    await sql`
      INSERT INTO tracking_measurements (profile_id, type, weight_kg, measured_at)
      VALUES (${profileId}, 'weight', 72.5, '2026-04-18T09:00:00Z')`;
    await sql`
      INSERT INTO metric_preferences (profile_id, name, display_order)
      VALUES (${profileId}, '__tracking_weight', 99)
      ON CONFLICT (profile_id, name) DO NOTHING`;
    const withKilo = [HOME[0], "__tracking_weight", ...HOME.slice(1)];
    await setHome(withKilo);
    try {
      const { context, page } = await open(
        browser,
        userId,
        TEST_EMAIL,
        undefined,
        // /api/tracking answers well after /api/metrics and /api/metric-order
        (p) =>
          p.route("**/api/tracking?*", async (route) => {
            await new Promise((r) => setTimeout(r, 2500));
            await route.continue();
          }),
      );
      const expected = [HOME[0], "Kilo", ...HOME.slice(1)];
      await expect.poll(() => cardNames(page), { timeout: 15_000 }).toEqual(expected);
      // an edit after the late load keeps it on the server too
      await page.getByRole("button", { name: /Tüm değerler/ }).click();
      await page.getByRole("dialog").getByRole("searchbox").fill("ferr");
      await page.getByRole("button", { name: "Ana ekranda göster: Ferritin" }).click();
      await expect.poll(homeInDb).toEqual([...withKilo, "Ferritin"]);
      await context.close();
    } finally {
      await sql`DELETE FROM tracking_measurements WHERE profile_id = ${profileId}`;
      await sql`DELETE FROM metric_preferences WHERE profile_id = ${profileId} AND name = '__tracking_weight'`;
    }
  });

  test("names with an ASCII 'I' find their definition (alias match)", async ({
    browser,
  }) => {
    const [r] = await sql`
      SELECT id FROM reports WHERE profile_id = ${profileId}
      ORDER BY sample_date DESC LIMIT 1`;
    await sql`
      INSERT INTO metrics (report_id, name, value, unit, ref_low, ref_high)
      VALUES (${r.id}, 'INR', 1.1, '', 0.8, 1.2)`;
    try {
      const { context, page } = await open(browser, userId, TEST_EMAIL);
      const res = await page.request.get(`/api/metrics?profileId=${profileId}`);
      const json = await res.json();
      const inr = json.metrics.find((m: { name: string }) => m.name === "INR");
      expect(inr?.metric_definition_id).toBeTruthy();
      await context.close();
    } finally {
      await sql`DELETE FROM metrics WHERE report_id = ${r.id} AND name = 'INR'`;
    }
  });

  test("a reorder made right before leaving the page is still saved", async ({
    browser,
  }) => {
    const { context, page } = await open(browser, userId, TEST_EMAIL);
    await page.getByRole("button", { name: "Hemoglobin seçenekleri" }).click();
    await page.getByRole("menuitem", { name: "Sağa taşı" }).click();
    // client-side navigation inside the 400 ms save debounce
    await page.getByRole("button", { name: "Tahlil Yükle" }).first().click();
    await page.waitForURL(/\/upload/);
    await expect
      .poll(homeInDb, { timeout: 5000 })
      .toEqual([HOME[1], HOME[0], ...HOME.slice(2)]);
    await context.close();
  });

  test("#157: the edge strip switches every chart to full scale with the band", async ({
    browser,
  }) => {
    const { context, page, errors } = await open(browser, userId, TEST_EMAIL);
    const cards = page.locator(".vz-chart-card");
    await expect(cards).toHaveCount(2);
    // fit-to-data: both ranges are off-scale, no band drawn
    await expect(page.locator(".vz-chart-card .vz-edge-btn")).toHaveCount(2);
    await expect(page.locator(".vz-chart-card .recharts-reference-area")).toHaveCount(0);
    await page.locator('[data-metric="Trombosit"] .vz-edge-btn').click();
    // all charts: full scale, band visible, no "fit" caption, no strip
    for (const id of ["Hemoglobin", "Trombosit"]) {
      const c = page.locator(`[data-metric="${id}"]`);
      await expect(c.locator(".recharts-reference-area").first()).toBeVisible();
      await expect(c).not.toContainText("Ölçek: değerlere göre");
      await expect(c.locator(".vz-edge-btn")).toHaveCount(0);
    }
    await page.getByRole("button", { name: /Görünüm/ }).click();
    await expect(page.getByLabel("Normal aralığı göster")).toBeChecked();
    await page.getByLabel("Normal aralığı göster").uncheck(); // restore default
    await page.keyboard.press("Escape");
    expect(errors).toEqual([]);
    await context.close();
  });

  test("#159: a date pinned on one of 4 charts shows on all; a gap says so", async ({
    browser,
  }) => {
    const { context, page, errors } = await open(browser, userId, TEST_EMAIL);
    await page.locator('[data-id="Lökosit"] .vz-mcard').click();
    await page.locator('[data-id="Kreatinin"] .vz-mcard').click();
    await expect(page.locator(".vz-chart-card")).toHaveCount(4);
    // click 2026-03-23 on the Hemoglobin chart (Lökosit was not measured then)
    const ms = (d: string) => Date.parse(`${d}T00:00:00Z`);
    const a = ms(DATES[0]);
    const b = ms(DATES[DATES.length - 1]);
    const pad = Math.max((b - a) * 0.035, 0.6 * 86_400_000);
    const f = (ms(DATES[3]) - a + pad) / (b - a + 2 * pad);
    const hit = page.locator('[data-metric="Hemoglobin"] .vz-hit');
    const box = await hit.boundingBox();
    await hit.click({ position: { x: box!.width * f, y: box!.height / 2 } });
    await expect(page.locator(".vz-chip")).toContainText("Sabit tarih");
    await expect(page.locator(".vz-chart-card .vz-tip")).toHaveCount(4);
    await expect(page.locator('[data-metric="Lökosit"] .vz-tip')).toContainText(
      "Bu tarihte ölçüm yok",
    );
    for (const id of ["Hemoglobin", "Trombosit", "Kreatinin"]) {
      await expect(page.locator(`[data-metric="${id}"] .vz-tip`)).not.toContainText(
        "Bu tarihte ölçüm yok",
      );
    }
    // clicking the same date again unpins it everywhere
    await hit.click({ position: { x: box!.width * f, y: box!.height / 2 } });
    await page.mouse.move(0, 0);
    await expect(page.locator(".vz-chip")).toHaveCount(0);
    await expect(page.locator(".vz-chart-card .vz-tip")).toHaveCount(0);
    expect(errors).toEqual([]);
    await context.close();
  });

  test("#159: Görünüm on a phone is a bottom sheet; Escape / outside tap close it and focus returns", async ({
    browser,
  }) => {
    const { context, page } = await open(browser, userId, TEST_EMAIL, {
      width: 390,
      height: 844,
    });
    const btn = page.getByRole("button", { name: /Görünüm/ });
    await btn.click();
    const sheet = page.getByRole("dialog");
    await expect(sheet).toBeVisible();
    const sb = await sheet.boundingBox();
    expect(sb!.y + sb!.height).toBeGreaterThanOrEqual(844 - 1); // anchored to the bottom
    await expect(page.getByRole("button", { name: "1 sütun" })).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
    await expect(btn).toBeFocused();
    await btn.click();
    await expect(sheet).toBeVisible();
    await page.mouse.click(195, 40); // the scrim above the sheet
    await expect(sheet).toBeHidden();
    await expect(btn).toBeFocused();
    await context.close();
  });

  test("Ana ekran PUT rejects names the profile does not have", async ({
    browser,
  }) => {
    const { context, page } = await open(browser, userId, TEST_EMAIL);
    const res = await page.request.put("/api/metric-order", {
      data: { profileId, home: [...HOME, "Uydurma Değer"] },
    });
    expect(res.status()).toBe(400);
    const rows = await sql`
      SELECT 1 FROM metric_preferences
      WHERE profile_id = ${profileId} AND name = 'Uydurma Değer'`;
    expect(rows).toHaveLength(0);
    expect(await homeInDb()).toEqual(HOME);
    await context.close();
  });

  test("search ranks abbreviations and Turkish case first", async ({
    browser,
  }) => {
    const { context, page } = await open(browser, userId, TEST_EMAIL);
    await page.getByRole("button", { name: /Tüm değerler/ }).click();
    const box = page.getByRole("dialog").getByRole("searchbox");
    for (const [q, first] of [
      ["plt", "Trombosit"],
      ["Hb", "Hemoglobin"],
      ["wbc", "Lökosit"],
      ["LÖKOSİT", "Lökosit"],
      ["HEMOGLOBIN", "Hemoglobin"],
      ["KREATININ", "Kreatinin"],
    ]) {
      await box.fill(q);
      await expect(page.locator(".pk-row .pk-name .nm").first()).toHaveText(
        first,
      );
    }
    await context.close();
  });

  test("empty state: top changes by range width, no unranged metric, hint link", async ({
    browser,
  }) => {
    await setHome([]);
    const { context, page } = await open(browser, userId, TEST_EMAIL);
    await expect(page.getByText(/Henüz değer seçmediniz/)).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Kendiniz seçin" }),
    ).toBeVisible();
    const names = await cardNames(page);
    expect(names.length).toBeGreaterThan(0);
    expect(names.length).toBeLessThanOrEqual(8);
    expect(names).not.toContain("Ölçüm X");
    // Glukoz crossed out of range (101/99 -> 94 -> 125): crossings rank first
    expect(names[0]).toBe("Glukoz");
    await context.close();
  });

  test("Görünüm settings persist; pin carries between Grafik and Tablo", async ({
    browser,
  }) => {
    const { context, page, errors } = await open(browser, userId, TEST_EMAIL);
    await page.getByRole("button", { name: /Görünüm/ }).click();
    await page.getByRole("button", { name: "1 sütun" }).click();
    await page.getByRole("button", { name: "Büyük" }).click();
    await page.getByLabel("Değerleri noktalarda göster").uncheck();
    await page.keyboard.press("Escape");
    await page.reload();
    await expect(page.locator(".vz-chart-card").first()).toBeVisible();
    await page.getByRole("button", { name: /Görünüm/ }).click();
    await expect(page.getByRole("button", { name: "1 sütun" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.getByRole("button", { name: "Büyük" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(
      page.getByLabel("Değerleri noktalarda göster"),
    ).not.toBeChecked();
    await page.keyboard.press("Escape");

    // pin a date on the Hemoglobin chart: every chart shows it
    const hit = page.locator('[data-metric="Hemoglobin"] .vz-hit');
    const b = await hit.boundingBox();
    await hit.click({ position: { x: b!.width - 4, y: b!.height / 2 } });
    await expect(page.locator(".vz-chip")).toContainText("Sabit tarih");
    await expect(page.locator(".vz-tip")).toHaveCount(2);
    // Tablo: pinned row highlighted, newest first, "—" for unmeasured
    await page.getByRole("button", { name: "Tablo" }).click();
    await expect(page.locator("tr.row.pinned")).toHaveCount(1);
    const firstDate = await page
      .locator("tr.row")
      .first()
      .getAttribute("data-t");
    const lastDate = await page.locator("tr.row").last().getAttribute("data-t");
    expect(Number(firstDate)).toBeGreaterThan(Number(lastDate));
    await page.locator("tr.row").nth(2).click();
    const picked = await page.locator("tr.row").nth(2).getAttribute("data-t");
    await page.getByRole("button", { name: "Grafik" }).click();
    await expect(page.locator(".vz-chip")).toContainText("Sabit tarih");
    expect(picked).not.toBeNull();
    expect(errors).toEqual([]);
    await context.close();
  });

  test("viewer: writes get 403 and Ana ekran controls are read-only", async ({
    browser,
  }) => {
    const { context, page } = await open(browser, viewerId, VIEWER_EMAIL);
    const res = await page.request.put("/api/metric-order", {
      data: { profileId, home: ["Sodyum"] },
    });
    expect(res.status()).toBe(403);
    const res2 = await page.request.put("/api/metric-order", {
      data: { profileId, order: ["Sodyum"] },
    });
    expect(res2.status()).toBe(403);
    await expect(
      page
        .getByText(
          "Ana ekranı yalnızca profil sahibi ve düzenleyiciler değiştirebilir.",
        )
        .first(),
    ).toBeVisible();
    await page.getByRole("button", { name: /Tüm değerler/ }).click();
    await expect(page.locator(".home-btn").first()).toBeDisabled();
    // "Grafiğe ekle" still works locally
    await page.getByRole("dialog").getByRole("searchbox").fill("sodyum");
    await page.getByRole("button", { name: "Sodyum: Grafiğe ekle" }).click();
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-metric="Sodyum"]')).toBeVisible();
    expect(await homeInDb()).toEqual(HOME);
    await context.close();
  });
});
