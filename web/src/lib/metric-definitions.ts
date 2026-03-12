import { sql } from "@/lib/db";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MetricDefinition {
  id: string;
  key: string;
  category: string | null;
  canonicalUnit: string | null;
  valueType: "quantitative" | "qualitative";
}

export interface RefRange {
  refLow: number | null;
  refHigh: number | null;
  sex: string | null;
  ageMin: number | null;
  ageMax: number | null;
}

export interface UnitConversionResult {
  value: number;
  unit: string;
  converted: boolean;
  description?: string;
}

// ---------------------------------------------------------------------------
// Module-level caches
// ---------------------------------------------------------------------------

interface AliasEntry {
  alias: string;
  canonicalName: string;
  definitionId: string | null;
}

interface TranslationEntry {
  definitionId: string;
  locale: string;
  displayName: string;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let cachedAliases: AliasEntry[] | null = null;
let cachedTranslations: TranslationEntry[] | null = null;
let cachedUnitAliases: Map<string, string> | null = null;
let cacheTimestamp = 0;

function invalidateIfStale(): void {
  if (Date.now() - cacheTimestamp > CACHE_TTL_MS) {
    cachedAliases = null;
    cachedTranslations = null;
    cachedUnitAliases = null;
  }
}

function touchCache(): void {
  if (!cacheTimestamp) cacheTimestamp = Date.now();
}

export function clearCache(): void {
  cachedAliases = null;
  cachedTranslations = null;
  cachedUnitAliases = null;
  cacheTimestamp = 0;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function turkishNormalize(s: string): string {
  return s
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .replace(/ı/g, "i")
    .replace(/Ğ/g, "g")
    .replace(/ğ/g, "g")
    .replace(/Ü/g, "u")
    .replace(/ü/g, "u")
    .replace(/Ş/g, "s")
    .replace(/ş/g, "s")
    .replace(/Ö/g, "o")
    .replace(/ö/g, "o")
    .replace(/Ç/g, "c")
    .replace(/ç/g, "c")
    .toLowerCase()
    .trim();
}

function normalizeUnitString(unit: string): string {
  return unit
    .trim()
    .toLowerCase()
    .replace(/\u00b5/g, "u") // µ → u
    .replace(/\s+/g, " ");
}

function stripParenthetical(s: string): string {
  return s.replace(/\s*\([^)]*\)/g, "").trim();
}

function normalizeForMatching(s: string): string {
  const stripped = stripParenthetical(s);
  const commasToSpaces = stripped.replace(/,/g, " ");
  return turkishNormalize(commasToSpaces).replace(/\s+/g, " ");
}

function extractAbbreviation(s: string): string | null {
  const match = s.match(/\(([A-ZÇĞİÖŞÜ]{2,})\)/);
  return match ? match[1] : null;
}

function roundToSignificantDecimals(
  converted: number,
  original: number,
): number {
  const originalStr = original.toString();
  const decimalIndex = originalStr.indexOf(".");
  const originalDecimals =
    decimalIndex >= 0 ? originalStr.length - decimalIndex - 1 : 0;
  const decimals = Math.max(originalDecimals, 1);
  return Number(converted.toFixed(decimals));
}

// ---------------------------------------------------------------------------
// Cache loaders
// ---------------------------------------------------------------------------

async function loadAliases(): Promise<AliasEntry[]> {
  invalidateIfStale();
  if (cachedAliases) return cachedAliases;

  const rows = await sql`
    SELECT alias, canonical_name, metric_definition_id
    FROM metric_aliases
  `;

  cachedAliases = rows.map((r) => ({
    alias: r.alias as string,
    canonicalName: r.canonical_name as string,
    definitionId: (r.metric_definition_id as string) ?? null,
  }));
  touchCache();

  return cachedAliases;
}

async function loadTranslations(): Promise<TranslationEntry[]> {
  invalidateIfStale();
  if (cachedTranslations) return cachedTranslations;

  const rows = await sql`
    SELECT metric_definition_id, locale, display_name
    FROM metric_translations
  `;

  cachedTranslations = rows.map((r) => ({
    definitionId: r.metric_definition_id as string,
    locale: r.locale as string,
    displayName: r.display_name as string,
  }));
  touchCache();

  return cachedTranslations;
}

async function loadUnitAliases(): Promise<Map<string, string>> {
  invalidateIfStale();
  if (cachedUnitAliases) return cachedUnitAliases;

  const rows = await sql`
    SELECT alias, canonical_unit FROM metric_unit_aliases
  `;

  cachedUnitAliases = new Map();
  for (const r of rows) {
    cachedUnitAliases.set(
      (r.alias as string).toLowerCase().trim(),
      r.canonical_unit as string,
    );
  }
  touchCache();

  return cachedUnitAliases;
}

/** Resolve a unit string to its canonical form via unit aliases. */
async function resolveUnitAlias(unit: string): Promise<string> {
  const unitAliases = await loadUnitAliases();
  return unitAliases.get(unit.toLowerCase().trim()) ?? unit;
}

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

export async function resolveMetricName(
  name: string,
): Promise<{ definitionId: string; canonicalName: string } | null> {
  const aliases = await loadAliases();
  const translations = await loadTranslations();

  const lowerName = name.toLowerCase().trim();

  // Pass 1: exact match against aliases (case-insensitive)
  const aliasMatch = aliases.find(
    (a) => a.alias.toLowerCase().trim() === lowerName,
  );
  if (aliasMatch?.definitionId) {
    return {
      definitionId: aliasMatch.definitionId,
      canonicalName:
        getTurkishName(aliasMatch.definitionId, translations) ??
        aliasMatch.canonicalName,
    };
  }

  // Pass 2: exact match against translations (case-insensitive)
  const translationMatch = translations.find(
    (t) => t.displayName.toLowerCase().trim() === lowerName,
  );
  if (translationMatch) {
    return {
      definitionId: translationMatch.definitionId,
      canonicalName:
        getTurkishName(translationMatch.definitionId, translations) ??
        translationMatch.displayName,
    };
  }

  // Pass 3: normalized match
  const normalizedName = normalizeForMatching(name);

  const normalizedAliasMatch = aliases.find(
    (a) => normalizeForMatching(a.alias) === normalizedName,
  );
  if (normalizedAliasMatch?.definitionId) {
    return {
      definitionId: normalizedAliasMatch.definitionId,
      canonicalName:
        getTurkishName(normalizedAliasMatch.definitionId, translations) ??
        normalizedAliasMatch.canonicalName,
    };
  }

  const normalizedTranslationMatch = translations.find(
    (t) => normalizeForMatching(t.displayName) === normalizedName,
  );
  if (normalizedTranslationMatch) {
    return {
      definitionId: normalizedTranslationMatch.definitionId,
      canonicalName:
        getTurkishName(normalizedTranslationMatch.definitionId, translations) ??
        normalizedTranslationMatch.displayName,
    };
  }

  // Pass 4: abbreviation extraction — e.g. "Alanin aminotransferaz (ALT)" → "ALT"
  const abbr = extractAbbreviation(name);
  if (abbr) {
    const abbrLower = abbr.toLowerCase();

    const abbrAliasMatch = aliases.find(
      (a) => a.alias.toLowerCase().trim() === abbrLower,
    );
    if (abbrAliasMatch?.definitionId) {
      return {
        definitionId: abbrAliasMatch.definitionId,
        canonicalName:
          getTurkishName(abbrAliasMatch.definitionId, translations) ??
          abbrAliasMatch.canonicalName,
      };
    }

    const abbrTranslationMatch = translations.find(
      (t) => t.displayName.toLowerCase().trim() === abbrLower,
    );
    if (abbrTranslationMatch) {
      return {
        definitionId: abbrTranslationMatch.definitionId,
        canonicalName:
          getTurkishName(abbrTranslationMatch.definitionId, translations) ??
          abbrTranslationMatch.displayName,
      };
    }
  }

  return null;
}

function getTurkishName(
  definitionId: string,
  translations: TranslationEntry[],
): string | null {
  const tr = translations.find(
    (t) => t.definitionId === definitionId && t.locale === "tr",
  );
  return tr?.displayName ?? null;
}

export async function getRefRange(
  definitionId: string,
  sex?: string | null,
  age?: number | null,
): Promise<RefRange | null> {
  const rows = await sql`
    SELECT ref_low, ref_high, sex, age_min, age_max
    FROM metric_ref_ranges
    WHERE metric_definition_id = ${definitionId}
    ORDER BY
      CASE
        WHEN sex IS NOT NULL AND age_min IS NOT NULL THEN 0
        WHEN sex IS NOT NULL THEN 1
        ELSE 2
      END
  `;

  if (rows.length === 0) return null;

  // Pass 1: exact match — sex + age within range
  if (sex && age != null) {
    const exact = rows.find(
      (r) =>
        r.sex === sex &&
        r.age_min != null &&
        r.age_max != null &&
        age >= Number(r.age_min) &&
        age <= Number(r.age_max),
    );
    if (exact) return toRefRange(exact);
  }

  // Pass 2: sex-only fallback — matching sex, no age constraints
  if (sex) {
    const sexOnly = rows.find(
      (r) => r.sex === sex && r.age_min == null && r.age_max == null,
    );
    if (sexOnly) return toRefRange(sexOnly);
  }

  // Pass 3: universal fallback — no sex, no age
  const universal = rows.find(
    (r) => r.sex == null && r.age_min == null && r.age_max == null,
  );
  if (universal) return toRefRange(universal);

  // If no fallback found, return the first available range
  return toRefRange(rows[0]);
}

function toRefRange(r: Record<string, unknown>): RefRange {
  return {
    refLow: r.ref_low != null ? Number(r.ref_low) : null,
    refHigh: r.ref_high != null ? Number(r.ref_high) : null,
    sex: (r.sex as string) ?? null,
    ageMin: r.age_min != null ? Number(r.age_min) : null,
    ageMax: r.age_max != null ? Number(r.age_max) : null,
  };
}

export async function convertUnit(
  definitionId: string,
  value: number,
  fromUnit: string,
): Promise<UnitConversionResult> {
  const defRows = await sql`
    SELECT canonical_unit FROM metric_definitions
    WHERE id = ${definitionId}
    LIMIT 1
  `;

  if (defRows.length === 0) {
    return { value, unit: fromUnit, converted: false };
  }

  const canonicalUnit = defRows[0].canonical_unit as string | null;

  // Check 1: direct string match (case/whitespace normalized)
  if (
    canonicalUnit &&
    normalizeUnitString(fromUnit) === normalizeUnitString(canonicalUnit)
  ) {
    return { value, unit: canonicalUnit, converted: false };
  }

  // Check 2: unit alias — different notation, same unit (no value change)
  if (canonicalUnit) {
    const resolvedUnit = await resolveUnitAlias(fromUnit);
    if (
      normalizeUnitString(resolvedUnit) === normalizeUnitString(canonicalUnit)
    ) {
      return { value, unit: canonicalUnit, converted: false };
    }
  }

  // Check 3: numeric conversion via metric_unit_conversions
  const convRows = await sql`
    SELECT from_unit, factor
    FROM metric_unit_conversions
    WHERE metric_definition_id = ${definitionId}
  `;

  const normalizedFrom = normalizeUnitString(fromUnit);
  // Also try matching after resolving the unit alias
  const resolvedFrom = await resolveUnitAlias(fromUnit);
  const normalizedResolved = normalizeUnitString(resolvedFrom);

  const match = convRows.find((r) => {
    const n = normalizeUnitString(r.from_unit as string);
    return n === normalizedFrom || n === normalizedResolved;
  });

  if (!match) {
    return { value, unit: fromUnit, converted: false };
  }

  const factor = Number(match.factor);
  const convertedValue = roundToSignificantDecimals(value * factor, value);
  const targetUnit = canonicalUnit ?? fromUnit;

  return {
    value: convertedValue,
    unit: targetUnit,
    converted: true,
    description: `${fromUnit} \u2192 ${targetUnit} (\u00D7 ${factor})`,
  };
}

export async function getAliasMap(): Promise<
  Record<string, { canonicalName: string; definitionId: string | null }>
> {
  const aliases = await loadAliases();

  const map: Record<
    string,
    { canonicalName: string; definitionId: string | null }
  > = {};

  for (const a of aliases) {
    map[a.alias] = {
      canonicalName: a.canonicalName,
      definitionId: a.definitionId,
    };
  }

  return map;
}
