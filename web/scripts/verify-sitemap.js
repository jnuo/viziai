/**
 * Post-build verification: ensures sitemap route handlers were generated.
 * Runs automatically after `npm run build`.
 * Fails the build if sitemap routes are missing.
 */

const fs = require("fs");
const path = require("path");

const buildDir = path.join(__dirname, "..", ".next");

if (!fs.existsSync(buildDir)) {
  console.error("FAIL: .next build directory not found");
  process.exit(1);
}

let errors = 0;

// Check sitemap index route handler
const indexRoute = path.join(
  buildDir,
  "server",
  "app",
  "sitemap.xml",
  "route.js",
);
if (fs.existsSync(indexRoute)) {
  console.log("  PASS /sitemap.xml route handler exists");
} else {
  console.error("  FAIL /sitemap.xml route handler not found");
  errors++;
}

// Check per-locale sitemap route handler
const localeRoute = path.join(
  buildDir,
  "server",
  "app",
  "sitemap",
  "[locale]",
  "route.js",
);
if (fs.existsSync(localeRoute)) {
  console.log("  PASS /sitemap/[locale] route handler exists");
} else {
  console.error("  FAIL /sitemap/[locale] route handler not found");
  errors++;
}

if (errors > 0) {
  console.error(`\nSitemap verification FAILED with ${errors} errors`);
  process.exit(1);
}

console.log("\nSitemap verification passed.");
