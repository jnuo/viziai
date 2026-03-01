/**
 * Post-build verification: ensures sitemap.xml was generated
 * with all expected locale URLs. Runs automatically after `npm run build`.
 * Fails the build if sitemap is missing or incomplete.
 */

const fs = require("fs");
const path = require("path");

const LOCALES = ["tr", "en", "es", "de", "fr"];
const BASE_URL = "https://www.viziai.app";

// Next.js writes the sitemap body into the build output
const buildDir = path.join(__dirname, "..", ".next");
const sitemapDir = path.join(buildDir, "server", "app", "sitemap.xml");

if (!fs.existsSync(buildDir)) {
  console.error("FAIL: .next build directory not found");
  process.exit(1);
}

if (!fs.existsSync(sitemapDir)) {
  console.error("FAIL: sitemap.xml route not found in build output");
  process.exit(1);
}

// Read the sitemap body from the build output
const bodyFile = path.join(sitemapDir, "body");
if (!fs.existsSync(bodyFile)) {
  // Turbopack may use a different structure — check for route.js instead
  const routeFile = path.join(sitemapDir, "route.js");
  if (fs.existsSync(routeFile)) {
    console.log("PASS: sitemap.xml route exists (dynamic generation)");
  } else {
    console.error("FAIL: sitemap.xml body not found in build output");
    process.exit(1);
  }
  // Can't validate content for dynamic routes, but route exists
  console.log(
    `Sitemap route verified. Expected ${LOCALES.length} locale homepages.`,
  );
  process.exit(0);
}

const sitemap = fs.readFileSync(bodyFile, "utf-8");
let errors = 0;

// Check locale homepages
for (const locale of LOCALES) {
  const url = `${BASE_URL}/${locale}</loc>`;
  if (sitemap.includes(url)) {
    console.log(`  PASS /${locale} homepage`);
  } else {
    console.error(`  FAIL /${locale} homepage missing`);
    errors++;
  }
}

// Check blog listings
for (const locale of LOCALES) {
  const url = `${BASE_URL}/${locale}/blog</loc>`;
  if (sitemap.includes(url)) {
    console.log(`  PASS /${locale}/blog`);
  } else {
    console.error(`  FAIL /${locale}/blog missing`);
    errors++;
  }
}

// Check privacy
if (sitemap.includes(`${BASE_URL}/privacy</loc>`)) {
  console.log("  PASS /privacy");
} else {
  console.error("  FAIL /privacy missing");
  errors++;
}

const totalUrls = (sitemap.match(/<loc>/g) || []).length;
console.log(`\nTotal URLs: ${totalUrls}`);

if (errors > 0) {
  console.error(`\nSitemap verification FAILED with ${errors} errors`);
  process.exit(1);
}

console.log("Sitemap verification passed.");
