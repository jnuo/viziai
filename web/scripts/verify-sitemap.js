/**
 * Post-build verification: ensures per-locale sitemaps were generated.
 * Runs automatically after `npm run build`.
 * Fails the build if sitemap routes are missing.
 */

const fs = require("fs");
const path = require("path");

const LOCALES = ["tr", "en", "es", "de", "fr"];

const buildDir = path.join(__dirname, "..", ".next");

if (!fs.existsSync(buildDir)) {
  console.error("FAIL: .next build directory not found");
  process.exit(1);
}

const sitemapDir = path.join(buildDir, "server", "app", "sitemap");
let errors = 0;

if (!fs.existsSync(sitemapDir)) {
  console.error("FAIL: sitemap directory not found in build output");
  process.exit(1);
}

// Check dynamic route handler exists (serves sitemap index + per-locale sitemaps)
const routeHandler = path.join(sitemapDir, "[__metadata_id__]", "route.js");
if (fs.existsSync(routeHandler)) {
  console.log("  PASS sitemap route handler exists");
} else {
  console.error("  FAIL sitemap route handler not found");
  errors++;
}

// Check each locale sitemap body was generated
for (const locale of LOCALES) {
  const bodyFile = path.join(sitemapDir, `${locale}.xml.body`);
  if (fs.existsSync(bodyFile)) {
    const content = fs.readFileSync(bodyFile, "utf-8");
    const urlCount = (content.match(/<loc>/g) || []).length;
    console.log(`  PASS /sitemap/${locale}.xml (${urlCount} URLs)`);
  } else {
    console.error(`  FAIL /sitemap/${locale}.xml not generated`);
    errors++;
  }
}

if (errors > 0) {
  console.error(`\nSitemap verification FAILED with ${errors} errors`);
  process.exit(1);
}

console.log("\nSitemap verification passed.");
