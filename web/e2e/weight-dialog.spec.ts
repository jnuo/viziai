import { test, expect, type Page } from "@playwright/test";
import { authenticatedContext } from "./helpers/auth";
import {
  seedTestUser,
  cleanupTrackingData,
  deleteTestUser,
} from "./helpers/db";

let userId: string;
let profileId: string;

test.beforeAll(async () => {
  const result = await seedTestUser();
  userId = result.userId;
  profileId = result.profileId;
});

test.afterAll(async () => {
  await deleteTestUser(userId);
});

test.afterEach(async () => {
  await cleanupTrackingData(profileId);
});

/** Navigate to dashboard and wait for it to be interactive */
async function openWeightDialog(page: Page) {
  await page.goto("/dashboard");
  const ekleButton = page.getByRole("button", { name: /Ekle/ });
  await ekleButton.waitFor({ state: "visible", timeout: 15000 });
  await ekleButton.click();
  await page.getByText("Kilo Ekle").click();
  await page.locator("#weight").waitFor({ state: "visible", timeout: 10000 });
}

test.describe("Weight Dialog", () => {
  // Tests share DB state — must run serially in one worker
  test.describe.configure({ mode: "serial" });

  test("opens weight dialog from Ekle menu", async ({ browser }) => {
    const { context, page } = await authenticatedContext(
      browser,
      userId,
      profileId,
    );

    await openWeightDialog(page);

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.locator("#weight")).toBeVisible();

    await context.close();
  });

  test("accepts comma as decimal separator", async ({ browser }) => {
    const { context, page } = await authenticatedContext(
      browser,
      userId,
      profileId,
    );

    await openWeightDialog(page);

    await page.locator("#weight").fill("82,5");
    await expect(page.getByRole("button", { name: "Kaydet" })).toBeEnabled();

    await context.close();
  });

  test("accepts period as decimal separator", async ({ browser }) => {
    const { context, page } = await authenticatedContext(
      browser,
      userId,
      profileId,
    );

    await openWeightDialog(page);

    await page.locator("#weight").fill("82.5");
    await expect(page.getByRole("button", { name: "Kaydet" })).toBeEnabled();

    await context.close();
  });

  test("saves weight entry", async ({ browser }) => {
    const { context, page } = await authenticatedContext(
      browser,
      userId,
      profileId,
    );

    await openWeightDialog(page);

    await page.locator("#weight").fill("75.5");
    await page.getByRole("button", { name: "Kaydet" }).click();

    await expect(page.getByText("Kilo kaydedildi")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByRole("dialog")).not.toBeVisible();

    await context.close();
  });

  test("shows replace confirmation for same-day entry", async ({ browser }) => {
    const { context, page } = await authenticatedContext(
      browser,
      userId,
      profileId,
    );

    await openWeightDialog(page);

    // First entry
    await page.locator("#weight").fill("75.5");
    await page.getByRole("button", { name: "Kaydet" }).click();
    await expect(page.getByText("Kilo kaydedildi")).toBeVisible({
      timeout: 10000,
    });

    // Second entry — same day
    await openWeightDialog(page);
    await page.locator("#weight").fill("76.0");
    await page.getByRole("button", { name: "Kaydet" }).click();

    await expect(page.getByText("Bugün zaten kayıt var")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByRole("button", { name: "Değiştir" })).toBeVisible();

    await context.close();
  });

  test("replaces existing entry", async ({ browser }) => {
    const { context, page } = await authenticatedContext(
      browser,
      userId,
      profileId,
    );

    await openWeightDialog(page);

    // First entry
    await page.locator("#weight").fill("75.5");
    await page.getByRole("button", { name: "Kaydet" }).click();
    await expect(page.getByText("Kilo kaydedildi")).toBeVisible({
      timeout: 10000,
    });

    // Second entry — triggers conflict
    await openWeightDialog(page);
    await page.locator("#weight").fill("76.0");
    await page.getByRole("button", { name: "Kaydet" }).click();
    await expect(page.getByText("Bugün zaten kayıt var")).toBeVisible({
      timeout: 10000,
    });

    // Replace
    await page.getByRole("button", { name: "Değiştir" }).click();
    await expect(page.getByText("Kilo kaydedildi")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByRole("dialog")).not.toBeVisible();

    await context.close();
  });
});
