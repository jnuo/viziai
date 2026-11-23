import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// A local test-branch override (.env.test.local, gitignored) wins over
// .env.local, so seeding helpers never default to the production database.
dotenv.config({ path: path.resolve(__dirname, ".env.test.local") });
// Load .env.local so test helpers can access NEON_DATABASE_URL and NEXTAUTH_SECRET
dotenv.config({ path: path.resolve(__dirname, ".env.local") });

// Point at an already running server (e.g. a dev server on :3100 against the
// test branch) instead of starting / reusing one on :3000.
const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: externalBaseURL ?? "http://localhost:3000",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: externalBaseURL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
      },
});
