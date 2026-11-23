#!/usr/bin/env bash
# Bump the app version. version.json (repo root) is the single source of truth.
#
# Scheme: DECOUPLED. "version" is human semver, bumped by intent with a flag;
# "build" is a separate counter that goes up by 1 on every run.
#   ./scripts/bump-version.sh           -> build +1 only
#   ./scripts/bump-version.sh --patch   -> 0.2.0 -> 0.2.1, build +1
#   ./scripts/bump-version.sh --minor   -> 0.2.1 -> 0.3.0, build +1
#   ./scripts/bump-version.sh --major   -> 0.3.0 -> 1.0.0, build +1
#
# Synced to: web/package.json and web/package-lock.json (root "version").
# Nothing reads the version at build time today (next.config.ts does not
# read package.json); if that changes, add the new target below.
# Version and build only ever go up.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION_FILE="$ROOT/version.json"
PART="${1:-}"

case "$PART" in
  ""|--major|--minor|--patch) ;;
  *) echo "usage: $0 [--major|--minor|--patch]" >&2; exit 1 ;;
esac

node - "$ROOT" "$PART" <<'NODE'
const fs = require("fs");
const path = require("path");
const [root, part] = process.argv.slice(2);
const vfile = path.join(root, "version.json");
const v = JSON.parse(fs.readFileSync(vfile, "utf8"));
let [maj, min, pat] = v.version.split(".").map(Number);
if (part === "--major") { maj += 1; min = 0; pat = 0; }
if (part === "--minor") { min += 1; pat = 0; }
if (part === "--patch") { pat += 1; }
v.version = `${maj}.${min}.${pat}`;
v.build = Number(v.build) + 1;
fs.writeFileSync(vfile, JSON.stringify(v, null, 2) + "\n");

const setVersion = (file, apply) => {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) return;
  const json = JSON.parse(fs.readFileSync(p, "utf8"));
  apply(json);
  fs.writeFileSync(p, JSON.stringify(json, null, 2) + "\n");
  console.log(`  synced ${file}`);
};
setVersion("web/package.json", (j) => { j.version = v.version; });
setVersion("web/package-lock.json", (j) => {
  j.version = v.version;
  if (j.packages && j.packages[""]) j.packages[""].version = v.version;
});
console.log(`version ${v.version} (build ${v.build})`);
NODE
