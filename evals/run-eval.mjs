/**
 * Eval runner for PDF extraction.
 *
 * Mirrors production flow: PDF → images (mupdf) → GPT → JSON.
 * No queue, no DB, no auth.
 *
 * Usage:
 *   node evals/run-eval.mjs
 *   node evals/run-eval.mjs --case 2025-06-23_Enabiz-Tahlilleri
 *   node evals/run-eval.mjs --model gpt-4o-mini
 */

import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(__dirname, "..", "web", "package.json"));
const TEST_CASES_DIR = path.join(__dirname, "test-cases");
const RUNS_DIR = path.join(__dirname, "runs");

// Same prompt as production
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

// --- PDF to images (same as production) ---

async function pdfToImages(buffer) {
  const mupdfPath = require.resolve("mupdf");
  const mupdf = await import(mupdfPath);
  const images = [];
  const doc = mupdf.Document.openDocument(buffer, "application/pdf");
  const pageCount = doc.countPages();

  for (let i = 0; i < pageCount; i++) {
    const page = doc.loadPage(i);
    const scale = 2.5;
    const pixmap = page.toPixmap(
      mupdf.Matrix.scale(scale, scale),
      mupdf.ColorSpace.DeviceRGB,
      false,
      true,
    );
    const pngData = pixmap.asPNG();
    const base64 = Buffer.from(pngData).toString("base64");
    images.push(`data:image/png;base64,${base64}`);
  }

  return images;
}

// --- Call GPT (same as production) ---

async function extractFromImages(pageImages, model, apiKey) {
  const mergedResult = { sample_date: null, tests: {} };

  for (let i = 0; i < pageImages.length; i++) {
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
                { type: "image_url", image_url: { url: pageImages[i] } },
              ],
            },
          ],
          max_tokens: 4000,
          response_format: { type: "json_object" },
        }),
      },
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`OpenAI error: ${err.error?.message || "Unknown"}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) continue;

    const pageData = JSON.parse(content);
    if (pageData.tests) Object.assign(mergedResult.tests, pageData.tests);
    if (!mergedResult.sample_date && pageData.sample_date) {
      mergedResult.sample_date = pageData.sample_date;
    }
  }

  // Convert to flat metrics array (same as production)
  const metrics = Object.entries(mergedResult.tests).map(([name, test]) => ({
    name,
    value: test.value,
    unit: test.unit || null,
    ref_low: test.ref_low ?? null,
    ref_high: test.ref_high ?? null,
  }));

  return { sample_date: mergedResult.sample_date, metrics };
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

// --- Main ---

async function main() {
  const args = process.argv.slice(2);
  const caseFilter = args.includes("--case") ? args[args.indexOf("--case") + 1] : null;
  const model = args.includes("--model") ? args[args.indexOf("--model") + 1] : "gpt-4o";

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

  console.log(`Running ${cases.length} test case(s) with model: ${model}\n`);

  // Create run directory
  const runId = `${new Date().toISOString().slice(0, 10)}_${model}`;
  const runDir = path.join(RUNS_DIR, runId);
  fs.mkdirSync(runDir, { recursive: true });

  const results = [];

  for (const caseName of cases) {
    const caseDir = path.join(TEST_CASES_DIR, caseName);
    const pdfPath = path.join(caseDir, "input.pdf");

    if (!fs.existsSync(pdfPath)) {
      console.log(`SKIP ${caseName} — no input.pdf`);
      continue;
    }

    console.log(`EXTRACTING ${caseName}...`);
    const pdfBuffer = fs.readFileSync(pdfPath);
    const images = await pdfToImages(pdfBuffer);
    console.log(`  ${images.length} page(s)`);

    const output = await extractFromImages(images, model, apiKey);
    console.log(`  ${output.metrics.length} metrics extracted`);

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
          console.log(`    ✗ ${e.name}: expected ${e.expected}, got ${e.actual}`);
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

    results.push({ case: caseName, output, scores });
    console.log();
  }

  // Save settings (prompt + model + pipeline) for reproducibility
  const settings = {
    model,
    date: new Date().toISOString(),
    pipeline: "pdf → mupdf (png, scale 2.5x) → base64 → openai vision api",
    pdf_renderer: "mupdf",
    pdf_scale: 2.5,
    image_format: "png",
    max_tokens: 4000,
    prompt_hash: simpleHash(EXTRACTION_PROMPT),
    prompt: EXTRACTION_PROMPT,
  };
  fs.writeFileSync(path.join(runDir, "settings.json"), JSON.stringify(settings, null, 2));

  // Save run results
  const runData = {
    config: { model, prompt_hash: settings.prompt_hash, date: settings.date },
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
