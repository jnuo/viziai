import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MESSAGES_DIR = path.join(__dirname, "../web/messages");

function getKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, val]) => {
    const p = prefix ? `${prefix}.${key}` : key;
    return typeof val === "object" && val !== null
      ? getKeys(val as Record<string, unknown>, p)
      : [p];
  });
}

const files = fs.readdirSync(MESSAGES_DIR).filter((f) => f.endsWith(".json"));
const all = files.map((f) => ({
  locale: f.replace(".json", ""),
  keys: new Set(
    getKeys(JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, f), "utf-8"))),
  ),
}));

const source = all.find((a) => a.locale === "tr")!;
let errors = 0;

for (const other of all.filter((a) => a.locale !== "tr")) {
  for (const key of source.keys) {
    if (!other.keys.has(key)) {
      console.error(`MISSING in ${other.locale}.json: ${key}`);
      errors++;
    }
  }
  for (const key of other.keys) {
    if (!source.keys.has(key)) {
      console.warn(`EXTRA in ${other.locale}.json (not in tr): ${key}`);
    }
  }
}

if (errors > 0) {
  console.error(`\n${errors} missing key(s) found.`);
  process.exit(1);
} else {
  console.log(
    `All ${files.length} locale files have matching keys (${source.keys.size} keys each).`,
  );
}
