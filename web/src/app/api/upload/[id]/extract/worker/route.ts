import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { reportError } from "@/lib/error-reporting";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // QStash can wait up to 5 minutes

const VECTOR_SCALE = 2.5;
const MAX_IMAGE_DIMENSION = 4000; // Cap rendered dimension for image-based pages (detail=high lets OpenAI upscale)
const IMAGE_PIXEL_THRESHOLD = 2_000_000; // >2M pixels = full-page embedded image (avoids false positives on logos)
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

interface ExtractedTest {
  value: number;
  unit?: string | null;
  flag?: string | null;
  ref_low?: number | null;
  ref_high?: number | null;
}

interface PageExtractionResult {
  sample_date: string | null;
  tests: Record<string, ExtractedTest>;
}

interface ExtractedMetric {
  name: string;
  value: number;
  unit?: string;
  ref_low?: number | null;
  ref_high?: number | null;
}

interface ExtractionResult {
  sample_date: string | null;
  metrics: ExtractedMetric[];
}

interface PageImage {
  dataUrl: string;
  detail: "auto" | "high";
  pageIndex: number;
  crop: "top" | "bottom" | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isImageBasedPage(pdfDoc: any, pageIndex: number): boolean {
  try {
    const pageObj = pdfDoc.findPage(pageIndex);
    const resources = pageObj.get("Resources");
    const xobjects = resources?.get("XObject");
    if (!xobjects) return false;

    let largestPixels = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xobjects.forEach((val: any) => {
      const resolved = val.resolve();
      if (resolved.get("Subtype")?.asName() !== "Image") return;
      const w = resolved.get("Width")?.asNumber() || 0;
      const h = resolved.get("Height")?.asNumber() || 0;
      largestPixels = Math.max(largestPixels, w * h);
    });

    return largestPixels > IMAGE_PIXEL_THRESHOLD;
  } catch (err) {
    console.warn(
      `[Worker] isImageBasedPage failed for page ${pageIndex}, treating as vector`,
      err,
    );
    return false;
  }
}

function toDataUrl(pngBuffer: Buffer): string {
  return `data:image/png;base64,${pngBuffer.toString("base64")}`;
}

interface PdfHandle {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mupdf: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sharp: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc: any;
  pageCount: number;
}

async function preparePdf(buffer: Buffer): Promise<PdfHandle> {
  const mupdf = await import("mupdf");
  const sharp = (await import("sharp")).default;
  const doc = mupdf.PDFDocument.openDocument(buffer, "application/pdf");
  return { mupdf, sharp, doc, pageCount: doc.countPages() };
}

async function renderPage(
  { mupdf, sharp, doc }: PdfHandle,
  pageIndex: number,
): Promise<PageImage[]> {
  const imageBased = isImageBasedPage(doc, pageIndex);
  const page = doc.loadPage(pageIndex);
  const detail: PageImage["detail"] = imageBased ? "high" : "auto";

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
    return [
      { dataUrl: toDataUrl(pngBuf), detail: "high", pageIndex, crop: null },
    ];
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

async function callOpenAI(
  apiKey: string,
  img: PageImage,
): Promise<PageExtractionResult | null> {
  const MAX_RETRIES = 2;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
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
        max_completion_tokens: 16384,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      // Retry on transient errors
      if (
        TRANSIENT_STATUS_CODES.has(response.status) &&
        attempt < MAX_RETRIES
      ) {
        const wait = 1000 * 2 ** attempt; // 1s, 2s
        console.warn(
          `[Worker] OpenAI returned ${response.status}, retrying in ${wait}ms...`,
        );
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
      return JSON.parse(content) as PageExtractionResult;
    } catch {
      console.log(
        `[Worker] Page ${img.pageIndex + 1} (${img.crop ?? "full"}): Failed to parse JSON`,
      );
      return null;
    }
  }
  return null; // All retries exhausted
}

function normalizeFlag(
  flag: string | null | undefined,
): "H" | "L" | "N" | null {
  if (!flag) return null;
  const first = flag.charAt(0).toUpperCase();
  if (first === "H" || first === "L" || first === "N") return first;
  return null;
}

function isValidISODate(s: string | null | undefined): boolean {
  if (!s || !ISO_DATE_RE.test(s)) return false;
  const d = new Date(s);
  return !isNaN(d.getTime());
}

async function handler(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: uploadId } = await params;

  try {
    console.log(`[Worker] Starting extraction for upload: ${uploadId}`);

    const uploads = await sql`
      SELECT id, profile_id, file_url, status, user_id
      FROM pending_uploads
      WHERE id = ${uploadId}
    `;

    if (uploads.length === 0) {
      console.error(`[Worker] Upload not found: ${uploadId}`);
      return NextResponse.json({ error: "Upload not found" }, { status: 404 });
    }

    const upload = uploads[0];

    if (upload.status !== "extracting") {
      console.log(
        `[Worker] Upload ${uploadId} is not in extracting status: ${upload.status}`,
      );
      return NextResponse.json({ status: upload.status });
    }

    try {
      let pdfBuffer: Buffer;

      if (upload.file_url.startsWith("data:")) {
        const base64Data = upload.file_url.split(",")[1];
        pdfBuffer = Buffer.from(base64Data, "base64");
      } else {
        const pdfResponse = await fetch(upload.file_url);
        if (!pdfResponse.ok) {
          throw new Error("Failed to fetch PDF from storage");
        }
        pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());
      }

      console.log(`[Worker] Opening PDF...`);
      const pdf = await preparePdf(pdfBuffer);
      console.log(`[Worker] PDF has ${pdf.pageCount} page(s)`);

      if (pdf.pageCount === 0) {
        throw new Error("PDF has no pages");
      }

      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        throw new Error("OpenAI API key not configured");
      }

      const mergedResult: PageExtractionResult = {
        sample_date: null,
        tests: {},
      };
      const testSourcePage: Record<string, number> = {};

      for (let p = 0; p < pdf.pageCount; p++) {
        // Render one page at a time to keep memory low
        const pageImages = await renderPage(pdf, p);

        // Send all images from this page in parallel (1 for vector, 2 for split image-based)
        // allSettled so one failed half doesn't discard the other
        const settled = await Promise.allSettled(
          pageImages.map(async (img) => {
            console.log(
              `[Worker] Processing page ${img.pageIndex + 1} (${img.crop ?? "full"}, detail=${img.detail})...`,
            );
            const data = await callOpenAI(openaiApiKey, img);
            return data ? { img, data } : null;
          }),
        );

        // Merge results from this page
        for (const outcome of settled) {
          if (outcome.status === "rejected") {
            console.warn(
              `[Worker] Page ${p + 1} image failed:`,
              outcome.reason,
            );
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
                const existingFields =
                  (existing.ref_low != null ? 1 : 0) +
                  (existing.ref_high != null ? 1 : 0) +
                  (existing.unit ? 1 : 0);
                const newFields =
                  (val.ref_low != null ? 1 : 0) +
                  (val.ref_high != null ? 1 : 0) +
                  (val.unit ? 1 : 0);
                if (newFields > existingFields) {
                  mergedResult.tests[name] = val;
                  accepted++;
                }
              }
              // Different page — first-writer-wins (prevents footer page hallucinations)
            }
            console.log(
              `[Worker] Page ${img.pageIndex + 1} (${img.crop ?? "full"}): ${accepted} tests accepted`,
            );
          }

          if (
            !mergedResult.sample_date &&
            isValidISODate(pageData.sample_date)
          ) {
            mergedResult.sample_date = pageData.sample_date;
          }
        }
      }

      const metrics: ExtractedMetric[] = Object.entries(mergedResult.tests).map(
        ([name, { value, unit, ref_low, ref_high }]) => ({
          name,
          value,
          unit: unit ?? undefined,
          ref_low,
          ref_high,
        }),
      );

      const extractedData: ExtractionResult = {
        sample_date: mergedResult.sample_date,
        metrics,
      };

      if (metrics.length === 0) {
        throw new Error("No test results could be extracted from the PDF");
      }

      await sql`
        UPDATE pending_uploads
        SET
          status = 'review',
          extracted_data = ${JSON.stringify(extractedData)},
          sample_date = ${extractedData.sample_date || null},
          updated_at = NOW()
        WHERE id = ${uploadId}
      `;

      console.log(
        `[Worker] Extraction completed: ${uploadId}, ${metrics.length} metrics`,
      );

      return NextResponse.json({
        uploadId,
        status: "review",
        metricCount: metrics.length,
      });
    } catch (extractionError) {
      reportError(extractionError, { op: "worker.extraction", uploadId });

      await sql`
        UPDATE pending_uploads
        SET
          status = 'pending',
          error_message = 'Veri çıkarma başarısız',
          updated_at = NOW()
        WHERE id = ${uploadId}
      `;

      return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
    }
  } catch (error) {
    reportError(error, { op: "worker.handler", uploadId });
    return NextResponse.json({ error: "Worker failed" }, { status: 500 });
  }
}

const isLocalDev = process.env.NODE_ENV === "development";
const hasSigningKey = !!process.env.QSTASH_CURRENT_SIGNING_KEY;

// verifySignatureAppRouter reads keys at import time, so only call it when keys exist.
// In local dev, skip verification. In production without keys, fail closed.
export const POST = hasSigningKey
  ? verifySignatureAppRouter(handler)
  : async (...args: Parameters<typeof handler>) => {
      if (!isLocalDev) {
        console.error(
          "[Worker] Production deploy missing QSTASH_CURRENT_SIGNING_KEY",
        );
        return NextResponse.json(
          { error: "Server misconfigured" },
          { status: 500 },
        );
      }
      return handler(...args);
    };
