/**
 * Eval runner for PDF extraction.
 *
 * Pipeline: PDF → mupdf (png) → GPT Vision → JSON.
 *
 * Mirrors the production worker pipeline exactly:
 *   preparePdf() → renderPage() → callOpenAI() → smart merge
 *
 * Image-based pages (large embedded JPEG, e.g. hospital HBYS exports) are
 * detected automatically and processed differently:
 *   - Vector pages: scale 2.5x, detail=auto (1 image per page)
 *   - Image-based pages: adaptive scale (capped at MAX_IMAGE_DIMENSION),
 *     split into top/bottom halves, detail=high
 *
 * Usage:
 *   node evals/run-eval.mjs
 *   node evals/run-eval.mjs --case 2025-06-23_Enabiz-Tahlilleri
 *   node evals/run-eval.mjs --model gpt-4o-mini
 *   node evals/run-eval.mjs --concurrency 5
 */

import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(__dirname, "..", "web", "package.json"));
const TEST_CASES_DIR = path.join(__dirname, "test-cases");
const RUNS_DIR = path.join(__dirname, "runs");

const VECTOR_SCALE = 2.5;
const MAX_IMAGE_DIMENSION = 4000; // Cap rendered dimension for image-based pages (detail=high lets OpenAI upscale)
const IMAGE_PIXEL_THRESHOLD = 1_000_000; // >1M pixels = full-page embedded image (eval-proven value)
const TRANSIENT_STATUS_CODES = new Set([429, 500, 502, 503]);
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const EXTRACTION_PROMPT = `Aşağıdaki laboratuvar sayfasından TÜM güncel 'Sonuç' değerlerini çıkar.

Kurallar:
- Parantezli eski sonuçları alma.
- 10,7 → 10.7 nokta yap.
- H/L bayrağını 'flag' alanına yaz.
- % ve # ayrı anahtar (örn: Nötrofil% / Nötrofil#).
- 'Numune Alım Tarihi'ni tespit et ve sadece tarihi ISO 'YYYY-MM-DD' formatında ver (saatleri atla).
- Her test için mümkünse referans aralığını çıkar: alt sınır ve üst sınır.
- Referans aralığı mevcutsa 'ref_low' ve 'ref_high' alanlarını doldur. Yoksa boş bırak.

ÖNEMLİ - Bölüm Farkındalığı:
- PDF'ler İspanyolca, İngilizce, Türkçe veya başka dillerde olabilir. Bölüm başlıklarını tanı:
  - İspanyolca: Hemograma (Hemogram), Bioquímica/Sangre (Biyokimya), Orina (İdrar), Gasometría (Kan Gazı)
  - İngilizce: CBC/Hematology, Chemistry, Urinalysis, Blood Gas
  - Türkçe: Hemogram, Biyokimya, İdrar, Kan Gazları
- İspanyolca önekleri silip Türkçe karşılığını kullan: Srm-Glukoz → Glukoz, San-/S- (Sangre) → serum testi.
- HİÇBİR bölümü atlama — İdrar (Orina), Eritroblast, Sedimentasyon dahil TÜM bölümleri çıkar.
- UYARI: Serum ve idrar değerlerini karıştırma! Örneğin serum Kreatinin (mg/dL, ~0.7-1.3) ile İdrar Kreatinin (mg/dL, ~24-392) farklı testlerdir.

ÖNEMLİ - İdrar Testleri:
- İdrar/Orina bölümündeki testleri 'İdrar' öneki ile adlandır.
- İdrar Glukoz, İdrar Kreatinin, İdrar pH, İdrar Protein, İdrar Eritrosit, İdrar Dansitesi, İdrar Bilirubin, İdrar Ürobilinojen, İdrar Asetoasetat, İdrar Lökosit Esteraz, İdrar Albümin, İdrar Albümin/Kreatinin, İdrar Nitrit.

ÖNEMLİ - Kan Gazı Testleri:
- Kan gazı bölümünde serumla ortak olan testleri 'Kan Gazı' öneki ile adlandır.
- Kan Gazı Glukoz, Kan Gazı Sodyum, Kan Gazı Potasyum, Kan Gazı Kalsiyum, Kan Gazı Klorür, Kan Gazı Hematokrit, Kan Gazı Magnezyum.
- Kan gazına özgü testler (pH, PCO2, PO2, HCO3, Laktat vb.) önek almaz.

ÖNEMLİ - Test İsimlerini Türkçeye Çevir:
- Rapor hangi dilde olursa olsun (İspanyolca, İngilizce, Almanca vb.), test isimlerini Türkçe tıbbi terminolojiye çevir.
- Kanonik isimler (bu isimleri AYNEN kullan):
  Hemogram:
  - Eritrosit, Hemoglobin, Hematokrit, MCV, MCH, MCHC, RDW, RDW-SD
  - Lökosit, Nötrofil%, Nötrofil#, Lenfosit%, Lenfosit#, Monosit%, Monosit#, Eozinofil%, Eozinofil#, Bazofil%, Bazofil#
  - Eritroblast%, Eritroblast# (Eritroblastos/NRBC)
  - Trombosit, MPV, PDW, PCT
  - Sedimentasyon (ESR/VSG/Velocidad de sedimentación)
  Biyokimya:
  - Glukoz (Glucosa), Üre (Urea), BUN, Kreatinin (Creatinina)
  - eGFR (Glomerüler Filtrasyon Hızı / Filtrado Glomerular / GFR / CKD-EPI)
  - Ürik Asit (Ácido Úrico / Ürat)
  - Total Protein, Albümin (Albumina), Globulin
  - AST (GOT), ALT (GPT), GGT, Alkalen Fosfataz (Fosfatasa Alcalina / ALP), LDH
  - Total Bilirubin (Bilirrubina Total), Direkt Bilirubin (Bilirrubina Directa)
  Elektrolitler:
  - Sodyum (Sodio), Potasyum (Potasio), Kalsiyum (Calcio), Magnezyum (Magnesio), Klorür (Cloruro / Klor)
  Lipid Panel:
  - Kolesterol (Colesterol), HDL Kolesterol, LDL Kolesterol, Non-HDL Kolesterol, Trigliserit (Triglicéridos)
  İnflamatuar:
  - CRP (Proteína C Reactiva / C-reaktif Protein)
  Hormonlar:
  - TSH, T3, T4
  Diğer:
  - Demir (Hierro), Ferritin (Ferritina), D Vitamini, B12 Vitamini
  - Romatoid Faktör (Factor Reumatoide)
- Bilinmeyen testler için orijinal ismi koru.

ÇIKTI: sadece JSON -> {"sample_date": "<YYYY-MM-DD|null>", "tests": { "<Türkçe Ad>": { "value": <number>, "unit": "<unit|null>", "flag": "<H|L|N|null>", "ref_low": <number|null>, "ref_high": <number|null> } } }}`;

// --- Helpers ---

function normalizeFlag(flag) {
  if (!flag) return null;
  const first = flag.charAt(0).toUpperCase();
  if (first === "H" || first === "L" || first === "N") return first;
  return null;
}

function isValidISODate(s) {
  if (!s || !ISO_DATE_RE.test(s)) return false;
  const d = new Date(s);
  return !isNaN(d.getTime());
}

function toDataUrl(pngBuffer) {
  return `data:image/png;base64,${pngBuffer.toString("base64")}`;
}

// --- Page type detection ---

function isImageBasedPage(pdfDoc, pageIndex) {
  try {
    const pageObj = pdfDoc.findPage(pageIndex);
    const resources = pageObj.get("Resources");
    const xobjects = resources?.get("XObject");
    if (!xobjects) return false;

    let largestPixels = 0;
    xobjects.forEach((val) => {
      const resolved = val.resolve();
      if (resolved.get("Subtype")?.asName() !== "Image") return;
      const w = resolved.get("Width")?.asNumber() || 0;
      const h = resolved.get("Height")?.asNumber() || 0;
      largestPixels = Math.max(largestPixels, w * h);
    });

    return largestPixels > IMAGE_PIXEL_THRESHOLD;
  } catch (err) {
    console.warn(`[Eval] isImageBasedPage failed for page ${pageIndex}, treating as vector`, err);
    return false;
  }
}

// --- PDF pipeline (mirrors production) ---

async function preparePdf(buffer) {
  const mupdfPath = require.resolve("mupdf");
  const mupdf = await import(mupdfPath);
  const sharpPath = require.resolve("sharp");
  const sharp = (await import(sharpPath)).default;
  const doc = mupdf.PDFDocument.openDocument(buffer, "application/pdf");
  return { mupdf, sharp, doc, pageCount: doc.countPages() };
}

async function renderPage({ mupdf, sharp, doc }, pageIndex) {
  const imageBased = isImageBasedPage(doc, pageIndex);
  const page = doc.loadPage(pageIndex);
  const detail = imageBased ? "high" : "auto";

  // For image-based pages, compute scale that caps the longest edge at MAX_IMAGE_DIMENSION.
  // OpenAI's detail=high handles further upscaling internally.
  let scale = VECTOR_SCALE;
  if (imageBased) {
    const [, , pw, ph] = page.getBounds();
    const longestEdge = Math.max(pw, ph);
    scale = Math.min(MAX_IMAGE_DIMENSION / longestEdge, VECTOR_SCALE * 2);
  }

  const pixmap = page.toPixmap(
    mupdf.Matrix.scale(scale, scale),
    mupdf.ColorSpace.DeviceRGB,
    false,
    true,
  );
  const pngBuf = Buffer.from(pixmap.asPNG());
  // Free native mupdf memory immediately
  pixmap.destroy();

  if (!imageBased) {
    return [{ dataUrl: toDataUrl(pngBuf), detail, pageIndex, crop: null }];
  }

  // Split into top and bottom halves for better OCR readability
  const meta = await sharp(pngBuf).metadata();
  if (!meta.width || !meta.height) {
    return [{ dataUrl: toDataUrl(pngBuf), detail: "high", pageIndex, crop: null }];
  }
  const { width, height } = meta;
  const halfH = Math.floor(height / 2);

  const topBuf = await sharp(pngBuf)
    .extract({ left: 0, top: 0, width, height: halfH })
    .png()
    .toBuffer();
  const botBuf = await sharp(pngBuf)
    .extract({ left: 0, top: halfH, width, height: height - halfH })
    .png()
    .toBuffer();

  return [
    { dataUrl: toDataUrl(topBuf), detail, pageIndex, crop: "top" },
    { dataUrl: toDataUrl(botBuf), detail, pageIndex, crop: "bottom" },
  ];
}

async function callOpenAI(apiKey, img, model) {
  const MAX_RETRIES = 2;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: EXTRACTION_PROMPT },
                {
                  type: "image_url",
                  image_url: { url: img.dataUrl, detail: img.detail },
                },
              ],
            },
          ],
          max_tokens: 16384,
          response_format: { type: "json_object" },
        }),
      },
    );

    if (!response.ok) {
      // Retry on transient errors
      if (TRANSIENT_STATUS_CODES.has(response.status) && attempt < MAX_RETRIES) {
        const wait = 1000 * 2 ** attempt; // 1s, 2s
        console.warn(`[Eval] OpenAI returned ${response.status}, retrying in ${wait}ms...`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      // Parse error safely — OpenAI sometimes returns HTML on 502/503
      let message = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        message = errorData.error?.message || message;
      } catch {
        // Non-JSON error body, use status code
      }
      throw new Error(`OpenAI API error: ${message}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    try {
      return JSON.parse(content);
    } catch {
      console.log(`[Eval] Page ${img.pageIndex + 1} (${img.crop ?? "full"}): Failed to parse JSON`);
      return null;
    }
  }
  return null; // All retries exhausted
}

async function extractFromPdf(pdfBuffer, model, apiKey) {
  const pdf = await preparePdf(pdfBuffer);

  if (pdf.pageCount === 0) {
    throw new Error("PDF has no pages");
  }

  const mergedResult = { sample_date: null, tests: {} };
  const testSourcePage = {};

  for (let p = 0; p < pdf.pageCount; p++) {
    // Render one page at a time to keep memory low
    const pageImages = await renderPage(pdf, p);

    // Send all images from this page in parallel (1 for vector, 2 for split image-based)
    // allSettled so one failed half doesn't discard the other
    const settled = await Promise.allSettled(
      pageImages.map(async (img) => {
        console.log(
          `  Processing page ${img.pageIndex + 1} (${img.crop ?? "full"}, detail=${img.detail})...`,
        );
        const data = await callOpenAI(apiKey, img, model);
        return data ? { img, data } : null;
      }),
    );

    // Merge results from this page
    for (const outcome of settled) {
      if (outcome.status === "rejected") {
        console.warn(`  Page ${p + 1} image failed:`, outcome.reason);
        continue;
      }
      const result = outcome.value;
      if (!result) continue;
      const { img, data: pageData } = result;

      if (pageData.tests) {
        let accepted = 0;
        for (const [name, val] of Object.entries(pageData.tests)) {
          // Skip non-numeric values (GPT hallucination guard)
          if (typeof val.value !== "number") continue;

          // Normalize flag to H/L/N
          val.flag = normalizeFlag(val.flag);

          if (!(name in mergedResult.tests)) {
            mergedResult.tests[name] = val;
            testSourcePage[name] = img.pageIndex;
            accepted++;
          } else if (testSourcePage[name] === img.pageIndex) {
            // Same page (other half of a split) — prefer the more complete entry
            const existing = mergedResult.tests[name];
            const existingFields = (existing.ref_low != null ? 1 : 0) + (existing.ref_high != null ? 1 : 0) + (existing.unit ? 1 : 0);
            const newFields = (val.ref_low != null ? 1 : 0) + (val.ref_high != null ? 1 : 0) + (val.unit ? 1 : 0);
            if (newFields > existingFields) {
              mergedResult.tests[name] = val;
              accepted++;
            }
          }
          // Different page — first-writer-wins (prevents footer page hallucinations)
        }
        console.log(`  Page ${img.pageIndex + 1} (${img.crop ?? "full"}): ${accepted} tests accepted`);
      }

      if (!mergedResult.sample_date && isValidISODate(pageData.sample_date)) {
        mergedResult.sample_date = pageData.sample_date;
      }
    }
  }

  // Convert to flat metrics array
  const metrics = Object.entries(mergedResult.tests).map(([name, { value, unit, ref_low, ref_high }]) => ({
    name,
    value,
    unit: unit ?? null,
    ref_low: ref_low ?? null,
    ref_high: ref_high ?? null,
  }));

  return {
    sample_date: mergedResult.sample_date,
    metrics,
    pageCount: pdf.pageCount,
  };
}

// --- Scoring ---

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

// --- Concurrency-limited worker pool ---

async function runWithConcurrency(tasks, concurrency) {
  const results = new Array(tasks.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < tasks.length) {
      const i = nextIndex++;
      results[i] = await tasks[i]();
    }
  }

  const workers = [];
  for (let w = 0; w < Math.min(concurrency, tasks.length); w++) {
    workers.push(worker());
  }
  await Promise.all(workers);
  return results;
}

// --- Main ---

async function main() {
  const args = process.argv.slice(2);
  const caseFilter = args.includes("--case") ? args[args.indexOf("--case") + 1] : null;
  const model = args.includes("--model") ? args[args.indexOf("--model") + 1] : "gpt-4o";
  const concurrency = args.includes("--concurrency")
    ? parseInt(args[args.indexOf("--concurrency") + 1], 10) || 3
    : 3;

  // Load API key
  const envPath = path.join(__dirname, "..", ".env");
  const envContent = fs.readFileSync(envPath, "utf-8");
  const apiKey = envContent.match(/OPENAI_API_KEY=(.+)/)?.[1]?.trim();
  if (!apiKey) {
    console.error("OPENAI_API_KEY not found in .env");
    process.exit(1);
  }

  // Find test cases
  let cases = fs.readdirSync(TEST_CASES_DIR).filter((d) =>
    fs.statSync(path.join(TEST_CASES_DIR, d)).isDirectory(),
  );
  if (caseFilter) cases = cases.filter((c) => c.includes(caseFilter));

  console.log(`Running ${cases.length} test case(s) with model: ${model}, concurrency: ${concurrency}\n`);

  // Create run directory — append suffix if dir already exists
  let runId = `${new Date().toISOString().slice(0, 10)}_${model}`;
  let runDir = path.join(RUNS_DIR, runId);
  let suffix = 2;
  while (fs.existsSync(runDir)) {
    runId = `${new Date().toISOString().slice(0, 10)}_${model}_${suffix}`;
    runDir = path.join(RUNS_DIR, runId);
    suffix++;
  }
  fs.mkdirSync(runDir, { recursive: true });

  // Build tasks for the concurrency pool
  const tasks = cases.map((caseName) => async () => {
    const caseDir = path.join(TEST_CASES_DIR, caseName);
    const pdfPath = path.join(caseDir, "input.pdf");

    if (!fs.existsSync(pdfPath)) {
      console.log(`SKIP ${caseName} — no input.pdf`);
      return null;
    }

    console.log(`EXTRACTING ${caseName}...`);
    const startTime = Date.now();
    const pdfBuffer = fs.readFileSync(pdfPath);

    const output = await extractFromPdf(pdfBuffer, model, apiKey);
    const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);

    const pageType = output.metrics.some((m) => m) ? "extracted" : "empty"; // simplified; real detection below
    console.log(`  ${output.pageCount} page(s), ${output.metrics.length} metrics extracted (${elapsedSeconds}s)`);

    // Score against expected if available
    const expectedPath = path.join(caseDir, "expected.json");
    const expected = fs.existsSync(expectedPath)
      ? JSON.parse(fs.readFileSync(expectedPath, "utf-8"))
      : null;

    const scores = score(output, expected);
    if (scores) {
      console.log(`  Date match: ${scores.date.match}`);
      console.log(`  Value accuracy: ${scores.values.accuracy}`);
      if (scores.values.errors.length > 0) {
        for (const e of scores.values.errors) {
          console.log(`    x ${e.name}: expected ${e.expected}, got ${e.actual}`);
        }
      }
      if (scores.metrics.missed.length > 0) {
        console.log(`  Missed: ${scores.metrics.missed.join(", ")}`);
      }
      if (scores.metrics.hallucinated.length > 0) {
        console.log(`  Hallucinated: ${scores.metrics.hallucinated.join(", ")}`);
      }
    } else {
      console.log(`  No expected.json — saving output for manual review`);
    }

    console.log();
    return { case: caseName, output, scores, elapsed_seconds: parseFloat(elapsedSeconds) };
  });

  const rawResults = await runWithConcurrency(tasks, concurrency);
  const results = rawResults.filter((r) => r !== null);

  // Save settings
  const settings = {
    model,
    concurrency,
    date: new Date().toISOString(),
    pipeline: {
      pdf_renderer: "mupdf (PDFDocument.openDocument only)",
      image_format: "png",
      image_cropper: "sharp",
      vector_pages: {
        scale: VECTOR_SCALE,
        detail: "auto",
        strategy: "1 image per page",
      },
      image_based_pages: {
        scale: `adaptive: min(${MAX_IMAGE_DIMENSION}/longestEdge, ${VECTOR_SCALE * 2})`,
        detail: "high",
        strategy: "split into top/bottom halves",
        detection: `PDF XObject inspection: largest embedded image > ${IMAGE_PIXEL_THRESHOLD} pixels`,
      },
      merge_strategy: "first-writer-wins across pages, prefer-more-complete within same page splits",
      guards: "non-numeric value filter, flag normalization (H/L/N), ISO date validation",
      retry: "2 retries with exponential backoff on transient status codes (429, 500, 502, 503)",
    },
    max_tokens: 16384,
    prompt_hash: simpleHash(EXTRACTION_PROMPT),
    prompt: EXTRACTION_PROMPT,
  };
  fs.writeFileSync(path.join(runDir, "settings.json"), JSON.stringify(settings, null, 2));

  // Save run results
  const runData = {
    config: { model, concurrency, prompt_hash: settings.prompt_hash, date: settings.date },
    results,
  };
  fs.writeFileSync(path.join(runDir, "results.json"), JSON.stringify(runData, null, 2));
  console.log(`Results saved to evals/runs/${runId}/`);
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash.toString(16);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
