/**
 * Score an existing run against expected values.
 * No API calls — just compares results.json outputs vs expected.json files.
 *
 * Usage:
 *   node evals/score-run.mjs 2026-02-25_gpt-4o
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_CASES_DIR = path.join(__dirname, "test-cases");
const RUNS_DIR = path.join(__dirname, "runs");

function score(actual, expected) {
  if (!expected) return null;

  const expMap = {};
  for (const m of expected.metrics) expMap[m.name] = m;

  const actMap = {};
  for (const m of actual.metrics) actMap[m.name] = m;

  const expNames = new Set(Object.keys(expMap));
  const actNames = new Set(Object.keys(actMap));

  const matched = [...expNames].filter((n) => actNames.has(n));
  const missed = [...expNames].filter((n) => !actNames.has(n));
  const hallucinated = [...actNames].filter((n) => !expNames.has(n));

  let valueCorrect = 0;
  let valueWrong = 0;
  const valueErrors = [];

  for (const name of matched) {
    if (actMap[name].value === expMap[name].value) {
      valueCorrect++;
    } else {
      valueWrong++;
      valueErrors.push({
        name,
        expected: expMap[name].value,
        actual: actMap[name].value,
      });
    }
  }

  const dateMatch = actual.sample_date === expected.sample_date;

  return {
    date: { expected: expected.sample_date, actual: actual.sample_date, match: dateMatch },
    metrics: {
      expected: expNames.size,
      extracted: actNames.size,
      matched: matched.length,
      missed,
      hallucinated,
    },
    values: {
      correct: valueCorrect,
      wrong: valueWrong,
      accuracy: matched.length > 0 ? ((valueCorrect / matched.length) * 100).toFixed(1) + "%" : "N/A",
      errors: valueErrors,
    },
  };
}

const runId = process.argv[2];
if (!runId) {
  console.error("Usage: node evals/score-run.mjs <run-id>");
  process.exit(1);
}

const runPath = path.join(RUNS_DIR, runId, "results.json");
const runData = JSON.parse(fs.readFileSync(runPath, "utf-8"));

console.log(`Scoring run: ${runId} (${runData.results.length} cases)\n`);

let totalExpected = 0, totalMatched = 0, totalCorrect = 0, totalWrong = 0;
let totalMissed = 0, totalHallucinated = 0;

for (const result of runData.results) {
  const expectedPath = path.join(TEST_CASES_DIR, result.case, "expected.json");
  if (!fs.existsSync(expectedPath)) {
    console.log(`SKIP ${result.case} — no expected.json`);
    continue;
  }

  const expected = JSON.parse(fs.readFileSync(expectedPath, "utf-8"));
  const scores = score(result.output, expected);

  console.log(`${result.case}`);
  console.log(`  Date: ${scores.date.match ? "✓" : "✗"} (expected: ${scores.date.expected}, got: ${scores.date.actual})`);
  console.log(`  Metrics: ${scores.metrics.matched}/${scores.metrics.expected} matched, ${scores.metrics.extracted} extracted`);
  console.log(`  Values: ${scores.values.accuracy} (${scores.values.correct}/${scores.values.correct + scores.values.wrong})`);

  if (scores.values.errors.length > 0) {
    for (const e of scores.values.errors) {
      console.log(`    ✗ ${e.name}: expected ${e.expected}, got ${e.actual}`);
    }
  }
  if (scores.metrics.missed.length > 0) {
    console.log(`  Missed (${scores.metrics.missed.length}): ${scores.metrics.missed.join(", ")}`);
  }
  if (scores.metrics.hallucinated.length > 0) {
    console.log(`  Extra (${scores.metrics.hallucinated.length}): ${scores.metrics.hallucinated.join(", ")}`);
  }
  console.log();

  totalExpected += scores.metrics.expected;
  totalMatched += scores.metrics.matched;
  totalCorrect += scores.values.correct;
  totalWrong += scores.values.wrong;
  totalMissed += scores.metrics.missed.length;
  totalHallucinated += scores.metrics.hallucinated.length;

  // Update scores in run data
  result.scores = scores;
}

console.log("=== SUMMARY ===");
console.log(`Metric match rate: ${totalMatched}/${totalExpected} (${((totalMatched / totalExpected) * 100).toFixed(1)}%)`);
console.log(`Value accuracy (matched): ${totalCorrect}/${totalMatched} (${((totalCorrect / totalMatched) * 100).toFixed(1)}%)`);
console.log(`Missed: ${totalMissed}, Hallucinated: ${totalHallucinated}`);

// Save updated results with scores
fs.writeFileSync(runPath, JSON.stringify(runData, null, 2));
console.log(`\nScores saved to ${runPath}`);
