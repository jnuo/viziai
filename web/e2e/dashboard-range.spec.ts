/**
 * Dashboard date range (#159) e2e — synthetic data only.
 *
 * Seeds its own profile and WRITES to the database, so it refuses to run
 * unless NEON_DATABASE_URL points at the Neon test branch
 * (E2E_DB_HOST_ALLOW, default "ep-raspy-bar"). Run against a dev server
 * that uses the same database:
 *
 *   PLAYWRIGHT_BASE_URL=http://localhost:3100 npx playwright test e2e/dashboard-range.spec.ts
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

const DAY = 86_400_000;
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
// The last draw is months before "today": ranges must count back from it.
const LAST = Date.UTC(2026, 5, 15); // 2026-06-15
// 12 draws every 3 days up to LAST: 11 of them within "1 ay" (from 16.05.26)
const DENSE = Array.from({ length: 12 }, (_, i) => iso(LAST - i * 3 * DAY));
const OLD = ["2025-07-01", "2025-10-01", "2026-01-10", "2026-03-20"];
const DATES = [...OLD, ...DENSE.slice().reverse()];
const HOME = ["Hemoglobin", "Kreatinin", "Glukoz"];
const SERIES: [string, string, number, number, number][] = [
  // name, unit, refLow, refHigh, base value
  ["Hemoglobin", "g/dL", 12, 16, 13],
  ["Kreatinin", "mg/dL", 0.67, 1.17, 0.9],
  ["Glukoz", "mg/dL", 70, 100, 90],
];
const RANGE_KEY = (profileId: string) => `viziai.dashboard.range.${profileId}`;

let userId: string;
let profileId: string;

async function open(browser: Browser, viewport = { width: 1280, height: 900 }) {
  const token = await createSessionCookie(userId, TEST_EMAIL, TEST_NAME);
  const context = await browser.newContext({ viewport, locale: "tr-TR" });
  await context.addCookies(
    [
      ["next-auth.session-token", token, true],
      ["viziai_active_profile", profileId, false],
      ["locale", "tr", false],
    ].map(([name, value, httpOnly]) => ({
      name: name as string,
      value: value as string,
      domain: "localhost",
      path: "/",
      httpOnly: httpOnly as boolean,
      sameSite: "Lax" as const,
    })),
  );
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto("/dashboard");
  await expect(page.getByTestId("home-cards")).toBeVisible({ timeout: 60_000 });
  return { context, page, errors };
}

const rangeGroup = (page: Page) =>
  page.getByRole("group", { name: "Tarih aralığı" });
const preset = (page: Page, name: string) =>
  rangeGroup(page).getByRole("button", { name: new RegExp(`^${name}`) });
/** rows of the Tablo view (one per draw date in range) */
async function tableRows(page: Page): Promise<number> {
  await page.getByRole("button", { name: "Tablo" }).click();
  const n = await page.locator("tr.row").count();
  await page.getByRole("button", { name: "Grafik" }).click();
  return n;
}
const hbDots = (page: Page) =>
  page.locator('[data-metric="Hemoglobin"] .recharts-line-dots > g');

test.describe("Dashboard: date range", () => {
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
        VALUES (${profileId}, ${date}, ${`e2e-range-${i}.pdf`}, 'pdf') RETURNING id`;
      for (const [name, unit, lo, hi, base] of SERIES) {
        const v = Math.round(base * (1 + ((i % 5) - 2) * 0.03) * 100) / 100;
        await sql`
          INSERT INTO metrics (report_id, name, value, unit, ref_low, ref_high)
          VALUES (${r.id}, ${name}, ${v}, ${unit}, ${lo}, ${hi})`;
      }
    }
    await sql`
      INSERT INTO metric_preferences (profile_id, name, display_order, is_favorite)
      SELECT ${profileId}, n, (o - 1)::int, true
      FROM unnest(${HOME}::text[]) WITH ORDINALITY AS t(n, o)`;
  });

  test.afterAll(async () => {
    if (userId) await deleteTestUser(userId);
  });

  test("default is automatic: 1 ay anchored to the last draw, with the hint", async ({
    browser,
  }) => {
    const { context, page, errors } = await open(browser);
    const oneMonth = preset(page, "1 ay");
    await expect(oneMonth).toHaveAttribute("aria-pressed", "true");
    await expect(oneMonth).toContainText("otomatik");
    await expect(rangeGroup(page).getByText("otomatik")).toHaveCount(1);
    await expect(
      page.getByRole("button", { name: "Otomatik seçime dön" }),
    ).toHaveCount(0);
    // anchored to 15.06.26, not to today (which would leave "1 ay" empty)
    await expect(page.locator(".vz-date-label")).toHaveText(
      "16.05.26 – 15.06.26",
    );
    await expect(hbDots(page)).toHaveCount(11);
    expect(await tableRows(page)).toBe(11);
    expect(
      await page.evaluate((k) => localStorage.getItem(k), RANGE_KEY(profileId)),
    ).toBeNull();
    expect(errors).toEqual([]);
    await context.close();
  });

  test('choosing "6 ay" persists after reload; "Otomatik seçime dön" goes back', async ({
    browser,
  }) => {
    const { context, page, errors } = await open(browser);
    await preset(page, "6 ay").click();
    const sixMonths = preset(page, "6 ay");
    await expect(sixMonths).toHaveAttribute("aria-pressed", "true");
    await expect(sixMonths).not.toContainText("otomatik");
    await expect(rangeGroup(page).getByText("otomatik")).toHaveCount(0);
    // 15.12.25 – 15.06.26: the 12 dense draws + 10.01.26 + 20.03.26
    await expect(hbDots(page)).toHaveCount(14);

    await page.reload();
    await expect(page.getByTestId("home-cards")).toBeVisible();
    await expect(preset(page, "6 ay")).toHaveAttribute("aria-pressed", "true");
    await expect(preset(page, "6 ay")).not.toContainText("otomatik");
    await expect(page.locator(".vz-date-label")).toHaveText(
      "10.01.26 – 15.06.26",
    );
    expect(await tableRows(page)).toBe(14);

    const back = page.getByRole("button", { name: "Otomatik seçime dön" });
    await back.click();
    await expect(preset(page, "1 ay")).toHaveAttribute("aria-pressed", "true");
    await expect(preset(page, "1 ay")).toContainText("otomatik");
    await page.reload();
    await expect(page.getByTestId("home-cards")).toBeVisible();
    await expect(preset(page, "1 ay")).toContainText("otomatik");
    expect(errors).toEqual([]);
    await context.close();
  });

  test("a custom range filters the charts and the table, and clears an outside pin", async ({
    browser,
  }) => {
    const { context, page, errors } = await open(browser);
    // pin the last date (15.06.26), which the custom range below leaves out
    const hit = page.locator('[data-metric="Hemoglobin"] .vz-hit');
    const b = await hit.boundingBox();
    await hit.click({ position: { x: b!.width - 4, y: b!.height / 2 } });
    await expect(page.locator(".vz-chip")).toContainText("Sabit tarih");

    await rangeGroup(page).getByRole("button", { name: "Özel…" }).click();
    const pop = page.getByRole("dialog", { name: "Tarih aralığını seçin" });
    await expect(pop).toBeVisible();
    const day = async (y: number, m: number, d: number) =>
      pop.locator(
        `button[data-day="${await page.evaluate(
          ([yy, mm, dd]) => new Date(yy, mm, dd).toLocaleDateString(),
          [y, m, d],
        )}"]`,
      );
    // days outside the data are disabled
    const prev = pop.locator(".rdp-button_previous");
    for (let i = 0; i < 4; i++) await prev.click(); // Ocak + Şubat 2026
    await (await day(2026, 0, 5)).click();
    await pop.locator(".rdp-button_next").click(); // Şubat + Mart
    await (await day(2026, 2, 25)).click();
    await expect(pop.locator(".vz-range-sel")).toHaveText(
      "05.01.26 – 25.03.26",
    );
    await pop.getByRole("button", { name: "Uygula" }).click();
    await expect(pop).toBeHidden();

    await expect(
      rangeGroup(page).getByRole("button", { name: "Özel…" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".vz-date-label")).toHaveText(
      "10.01.26 – 20.03.26",
    );
    await expect(hbDots(page)).toHaveCount(2);
    // the pinned 15.06.26 is outside the range: the pin is gone
    await expect(page.locator(".vz-chip")).toHaveCount(0);
    expect(await tableRows(page)).toBe(2);
    // the explicit custom choice is stored for this profile
    const stored = await page.evaluate(
      (k) => JSON.parse(localStorage.getItem(k) ?? "null"),
      RANGE_KEY(profileId),
    );
    expect(stored).toEqual({
      kind: "custom",
      from: Date.UTC(2026, 0, 5),
      to: Date.UTC(2026, 2, 25),
    });
    // reopening: days after the last draw cannot be picked
    await rangeGroup(page).getByRole("button", { name: "Özel…" }).click();
    for (let i = 0; i < 3; i++) await pop.locator(".rdp-button_next").click();
    await expect(await day(2026, 5, 20)).toBeDisabled();
    await pop.getByRole("button", { name: "Vazgeç" }).click();
    await page.getByRole("button", { name: "Otomatik seçime dön" }).click();
    expect(errors).toEqual([]);
    await context.close();
  });

  test("phone: a compact Select with the automatic choice first", async ({
    browser,
  }) => {
    const { context, page, errors } = await open(browser, {
      width: 390,
      height: 844,
    });
    await expect(rangeGroup(page)).toHaveCount(0);
    const trigger = page.getByRole("combobox", { name: "Tarih aralığı" });
    await expect(trigger).toHaveText("Otomatik: 1 ay");
    await trigger.click();
    await page.getByRole("option", { name: "3 ay" }).click();
    await expect(trigger).toHaveText("3 ay");
    await expect(page.locator(".vz-date-label")).toBeVisible();
    await trigger.click();
    await page.getByRole("option", { name: /^Otomatik/ }).click();
    await expect(trigger).toHaveText("Otomatik: 1 ay");
    // "Özel…" opens the calendar from the Select
    await trigger.click();
    await page.getByRole("option", { name: "Özel…" }).click();
    await expect(
      page.getByRole("dialog", { name: "Tarih aralığını seçin" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("dialog", { name: "Tarih aralığını seçin" }),
    ).toBeHidden();
    expect(errors).toEqual([]);
    await context.close();
  });
});
