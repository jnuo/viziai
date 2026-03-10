/**
 * Canonical metric definitions for ViziAI.
 *
 * Source of truth for known blood test metrics. Canonical names are Turkish
 * (the original lab report language). Foreign names map to these via the
 * metric_aliases table in the database.
 *
 * Each metric defines:
 * - canonicalUnit: the standard unit used in Turkish labs
 * - conversions: rules for converting from foreign units
 * - typicalRefRange: adult reference range (for anomaly detection)
 */

export interface UnitConversion {
  /** The unit to convert FROM */
  fromUnit: string;
  /** Multiply the value by this factor */
  factor: number;
  /** Description of the conversion */
  description: string;
}

export interface CanonicalMetric {
  canonicalUnit: string;
  conversions: UnitConversion[];
  typicalRefRange: { low: number; high: number };
}

/**
 * All known canonical metrics with their expected units and conversion rules.
 *
 * Conversion factors sourced from standard clinical chemistry references.
 * Reference ranges are typical adult values — individual labs may vary.
 */
export const CANONICAL_METRICS: Record<string, CanonicalMetric> = {
  // =========================================================================
  // CBC (Tam Kan Sayımı)
  // =========================================================================

  Hemoglobin: {
    canonicalUnit: "g/dL",
    conversions: [
      /** g/L → g/dL: divide by 10 (SI → conventional) */
      { fromUnit: "g/L", factor: 0.1, description: "g/L → g/dL (÷ 10)" },
    ],
    typicalRefRange: { low: 12.0, high: 17.5 },
  },

  Hematokrit: {
    canonicalUnit: "%",
    conversions: [
      /** L/L → %: multiply by 100 */
      { fromUnit: "L/L", factor: 100, description: "L/L → % (× 100)" },
    ],
    typicalRefRange: { low: 36, high: 52 },
  },

  Eritrosit: {
    canonicalUnit: "10^6/µL",
    conversions: [
      /** 10^12/L → 10^6/µL: same numeric value, different notation */
      {
        fromUnit: "10^12/L",
        factor: 1,
        description: "10^12/L → 10^6/µL (same value)",
      },
      {
        fromUnit: "T/L",
        factor: 1,
        description: "T/L → 10^6/µL (same value)",
      },
    ],
    typicalRefRange: { low: 4.0, high: 6.0 },
  },

  Lökosit: {
    canonicalUnit: "10^3/µL",
    conversions: [
      /** 10^9/L → 10^3/µL: same numeric value, different notation */
      {
        fromUnit: "10^9/L",
        factor: 1,
        description: "10^9/L → 10^3/µL (same value)",
      },
      {
        fromUnit: "G/L",
        factor: 1,
        description: "G/L → 10^3/µL (same value)",
      },
    ],
    typicalRefRange: { low: 4.0, high: 11.0 },
  },

  Trombosit: {
    canonicalUnit: "10^3/µL",
    conversions: [
      {
        fromUnit: "10^9/L",
        factor: 1,
        description: "10^9/L → 10^3/µL (same value)",
      },
      {
        fromUnit: "G/L",
        factor: 1,
        description: "G/L → 10^3/µL (same value)",
      },
    ],
    typicalRefRange: { low: 150, high: 400 },
  },

  "MPV (Ortalama Trombosit Hacmi)": {
    canonicalUnit: "fL",
    conversions: [],
    typicalRefRange: { low: 7.0, high: 11.0 },
  },

  "Nötrofil#": {
    canonicalUnit: "10^3/µL",
    conversions: [
      {
        fromUnit: "10^9/L",
        factor: 1,
        description: "10^9/L → 10^3/µL (same value)",
      },
    ],
    typicalRefRange: { low: 2.0, high: 7.0 },
  },

  "Lenfosit#": {
    canonicalUnit: "10^3/µL",
    conversions: [
      {
        fromUnit: "10^9/L",
        factor: 1,
        description: "10^9/L → 10^3/µL (same value)",
      },
    ],
    typicalRefRange: { low: 1.0, high: 3.5 },
  },

  "Monosit#": {
    canonicalUnit: "10^3/µL",
    conversions: [
      {
        fromUnit: "10^9/L",
        factor: 1,
        description: "10^9/L → 10^3/µL (same value)",
      },
    ],
    typicalRefRange: { low: 0.2, high: 0.8 },
  },

  "Eozinofil#": {
    canonicalUnit: "10^3/µL",
    conversions: [
      {
        fromUnit: "10^9/L",
        factor: 1,
        description: "10^9/L → 10^3/µL (same value)",
      },
    ],
    typicalRefRange: { low: 0.0, high: 0.5 },
  },

  "Bazofil#": {
    canonicalUnit: "10^3/µL",
    conversions: [
      {
        fromUnit: "10^9/L",
        factor: 1,
        description: "10^9/L → 10^3/µL (same value)",
      },
    ],
    typicalRefRange: { low: 0.0, high: 0.1 },
  },

  // =========================================================================
  // Metabolic Panel (Biyokimya)
  // =========================================================================

  Glukoz: {
    canonicalUnit: "mg/dL",
    conversions: [
      /** mmol/L → mg/dL: multiply by 18.018 */
      {
        fromUnit: "mmol/L",
        factor: 18.018,
        description: "mmol/L → mg/dL (× 18.018)",
      },
    ],
    typicalRefRange: { low: 70, high: 100 },
  },

  Kreatinin: {
    canonicalUnit: "mg/dL",
    conversions: [
      /** µmol/L → mg/dL: divide by 88.42 */
      {
        fromUnit: "µmol/L",
        factor: 1 / 88.42,
        description: "µmol/L → mg/dL (÷ 88.42)",
      },
      {
        fromUnit: "umol/L",
        factor: 1 / 88.42,
        description: "umol/L → mg/dL (÷ 88.42)",
      },
    ],
    typicalRefRange: { low: 0.6, high: 1.2 },
  },

  "Ürik Asit": {
    canonicalUnit: "mg/dL",
    conversions: [
      /** µmol/L → mg/dL: divide by 59.48 */
      {
        fromUnit: "µmol/L",
        factor: 1 / 59.48,
        description: "µmol/L → mg/dL (÷ 59.48)",
      },
      {
        fromUnit: "umol/L",
        factor: 1 / 59.48,
        description: "umol/L → mg/dL (÷ 59.48)",
      },
    ],
    typicalRefRange: { low: 3.5, high: 7.2 },
  },

  "Kan Üre Azotu": {
    canonicalUnit: "mg/dL",
    conversions: [
      /** mmol/L → mg/dL: multiply by 2.801 */
      {
        fromUnit: "mmol/L",
        factor: 2.801,
        description: "mmol/L → mg/dL (× 2.801)",
      },
    ],
    typicalRefRange: { low: 7, high: 20 },
  },

  Potasyum: {
    canonicalUnit: "mEq/L",
    conversions: [
      /** mmol/L ≡ mEq/L for monovalent ions */
      {
        fromUnit: "mmol/L",
        factor: 1,
        description: "mmol/L → mEq/L (same for K+)",
      },
    ],
    typicalRefRange: { low: 3.5, high: 5.5 },
  },

  Sodyum: {
    canonicalUnit: "mEq/L",
    conversions: [
      {
        fromUnit: "mmol/L",
        factor: 1,
        description: "mmol/L → mEq/L (same for Na+)",
      },
    ],
    typicalRefRange: { low: 136, high: 145 },
  },

  Kalsiyum: {
    canonicalUnit: "mg/dL",
    conversions: [
      /** mmol/L → mg/dL: multiply by 4.008 */
      {
        fromUnit: "mmol/L",
        factor: 4.008,
        description: "mmol/L → mg/dL (× 4.008)",
      },
    ],
    typicalRefRange: { low: 8.5, high: 10.5 },
  },

  Klorür: {
    canonicalUnit: "mEq/L",
    conversions: [
      {
        fromUnit: "mmol/L",
        factor: 1,
        description: "mmol/L → mEq/L (same for Cl-)",
      },
    ],
    typicalRefRange: { low: 98, high: 106 },
  },

  Magnezyum: {
    canonicalUnit: "mg/dL",
    conversions: [
      /** mmol/L → mg/dL: multiply by 2.431 */
      {
        fromUnit: "mmol/L",
        factor: 2.431,
        description: "mmol/L → mg/dL (× 2.431)",
      },
    ],
    typicalRefRange: { low: 1.7, high: 2.2 },
  },

  Fosfor: {
    canonicalUnit: "mg/dL",
    conversions: [
      /** mmol/L → mg/dL: multiply by 3.097 */
      {
        fromUnit: "mmol/L",
        factor: 3.097,
        description: "mmol/L → mg/dL (× 3.097)",
      },
    ],
    typicalRefRange: { low: 2.5, high: 4.5 },
  },

  // =========================================================================
  // Liver Panel (Karaciğer)
  // =========================================================================

  "ALT (Alanin Aminotransferaz)": {
    canonicalUnit: "U/L",
    conversions: [
      /** µkat/L → U/L: multiply by 60 */
      {
        fromUnit: "µkat/L",
        factor: 60,
        description: "µkat/L → U/L (× 60)",
      },
    ],
    typicalRefRange: { low: 7, high: 56 },
  },

  "AST (Aspartat Transaminaz)": {
    canonicalUnit: "U/L",
    conversions: [
      {
        fromUnit: "µkat/L",
        factor: 60,
        description: "µkat/L → U/L (× 60)",
      },
    ],
    typicalRefRange: { low: 10, high: 40 },
  },

  "GGT (Gamma Glutamil Transferaz)": {
    canonicalUnit: "U/L",
    conversions: [
      {
        fromUnit: "µkat/L",
        factor: 60,
        description: "µkat/L → U/L (× 60)",
      },
    ],
    typicalRefRange: { low: 9, high: 48 },
  },

  "ALP (Alkalen Fosfataz)": {
    canonicalUnit: "U/L",
    conversions: [
      {
        fromUnit: "µkat/L",
        factor: 60,
        description: "µkat/L → U/L (× 60)",
      },
    ],
    typicalRefRange: { low: 44, high: 147 },
  },

  "LDH (Laktik Dehidrogenaz)": {
    canonicalUnit: "U/L",
    conversions: [
      {
        fromUnit: "µkat/L",
        factor: 60,
        description: "µkat/L → U/L (× 60)",
      },
    ],
    typicalRefRange: { low: 140, high: 280 },
  },

  "Total Bilirubin": {
    canonicalUnit: "mg/dL",
    conversions: [
      /** µmol/L → mg/dL: divide by 17.1 */
      {
        fromUnit: "µmol/L",
        factor: 1 / 17.1,
        description: "µmol/L → mg/dL (÷ 17.1)",
      },
      {
        fromUnit: "umol/L",
        factor: 1 / 17.1,
        description: "umol/L → mg/dL (÷ 17.1)",
      },
    ],
    typicalRefRange: { low: 0.1, high: 1.2 },
  },

  "Direkt Bilirubin": {
    canonicalUnit: "mg/dL",
    conversions: [
      {
        fromUnit: "µmol/L",
        factor: 1 / 17.1,
        description: "µmol/L → mg/dL (÷ 17.1)",
      },
      {
        fromUnit: "umol/L",
        factor: 1 / 17.1,
        description: "umol/L → mg/dL (÷ 17.1)",
      },
    ],
    typicalRefRange: { low: 0.0, high: 0.3 },
  },

  Albümin: {
    canonicalUnit: "g/dL",
    conversions: [
      /** g/L → g/dL: divide by 10 */
      { fromUnit: "g/L", factor: 0.1, description: "g/L → g/dL (÷ 10)" },
    ],
    typicalRefRange: { low: 3.5, high: 5.5 },
  },

  "Total Protein": {
    canonicalUnit: "g/dL",
    conversions: [
      { fromUnit: "g/L", factor: 0.1, description: "g/L → g/dL (÷ 10)" },
    ],
    typicalRefRange: { low: 6.0, high: 8.3 },
  },

  // =========================================================================
  // Kidney (Böbrek)
  // =========================================================================

  "eGFR (Glomerüler Filtrasyon Hızı)": {
    canonicalUnit: "mL/min/1.73m²",
    conversions: [],
    typicalRefRange: { low: 90, high: 120 },
  },

  // =========================================================================
  // Lipids (Lipidler)
  // =========================================================================

  "Total Kolesterol": {
    canonicalUnit: "mg/dL",
    conversions: [
      /** mmol/L → mg/dL: multiply by 38.67 */
      {
        fromUnit: "mmol/L",
        factor: 38.67,
        description: "mmol/L → mg/dL (× 38.67)",
      },
    ],
    typicalRefRange: { low: 0, high: 200 },
  },

  "LDL Kolesterol": {
    canonicalUnit: "mg/dL",
    conversions: [
      {
        fromUnit: "mmol/L",
        factor: 38.67,
        description: "mmol/L → mg/dL (× 38.67)",
      },
    ],
    typicalRefRange: { low: 0, high: 100 },
  },

  "HDL Kolesterol": {
    canonicalUnit: "mg/dL",
    conversions: [
      {
        fromUnit: "mmol/L",
        factor: 38.67,
        description: "mmol/L → mg/dL (× 38.67)",
      },
    ],
    typicalRefRange: { low: 40, high: 60 },
  },

  Trigliserid: {
    canonicalUnit: "mg/dL",
    conversions: [
      /** mmol/L → mg/dL: multiply by 88.57 */
      {
        fromUnit: "mmol/L",
        factor: 88.57,
        description: "mmol/L → mg/dL (× 88.57)",
      },
    ],
    typicalRefRange: { low: 0, high: 150 },
  },

  // =========================================================================
  // Thyroid (Tiroid)
  // =========================================================================

  TSH: {
    canonicalUnit: "µIU/mL",
    conversions: [
      {
        fromUnit: "mIU/L",
        factor: 1,
        description: "mIU/L → µIU/mL (same value)",
      },
    ],
    typicalRefRange: { low: 0.4, high: 4.0 },
  },

  "Serbest T3": {
    canonicalUnit: "pg/mL",
    conversions: [
      /** pmol/L → pg/mL: divide by 1.536 */
      {
        fromUnit: "pmol/L",
        factor: 1 / 1.536,
        description: "pmol/L → pg/mL (÷ 1.536)",
      },
    ],
    typicalRefRange: { low: 2.0, high: 4.4 },
  },

  "Serbest T4": {
    canonicalUnit: "ng/dL",
    conversions: [
      /** pmol/L → ng/dL: divide by 12.87 */
      {
        fromUnit: "pmol/L",
        factor: 1 / 12.87,
        description: "pmol/L → ng/dL (÷ 12.87)",
      },
    ],
    typicalRefRange: { low: 0.93, high: 1.7 },
  },

  // =========================================================================
  // Iron (Demir)
  // =========================================================================

  Demir: {
    canonicalUnit: "µg/dL",
    conversions: [
      /** µmol/L → µg/dL: multiply by 5.585 */
      {
        fromUnit: "µmol/L",
        factor: 5.585,
        description: "µmol/L → µg/dL (× 5.585)",
      },
      {
        fromUnit: "umol/L",
        factor: 5.585,
        description: "umol/L → µg/dL (× 5.585)",
      },
    ],
    typicalRefRange: { low: 60, high: 170 },
  },

  Ferritin: {
    canonicalUnit: "ng/mL",
    conversions: [
      /** µg/L ≡ ng/mL */
      {
        fromUnit: "µg/L",
        factor: 1,
        description: "µg/L → ng/mL (same value)",
      },
      {
        fromUnit: "pmol/L",
        factor: 1 / 2.247,
        description: "pmol/L → ng/mL (÷ 2.247)",
      },
    ],
    typicalRefRange: { low: 20, high: 250 },
  },

  "Transferrin Satürasyonu": {
    canonicalUnit: "%",
    conversions: [],
    typicalRefRange: { low: 20, high: 50 },
  },

  // =========================================================================
  // Inflammation (İltihap)
  // =========================================================================

  "CRP (C-Reaktif Protein)": {
    canonicalUnit: "mg/L",
    conversions: [
      /** mg/dL → mg/L: multiply by 10 */
      {
        fromUnit: "mg/dL",
        factor: 10,
        description: "mg/dL → mg/L (× 10)",
      },
    ],
    typicalRefRange: { low: 0, high: 5 },
  },

  Sedimantasyon: {
    canonicalUnit: "mm/saat",
    conversions: [
      {
        fromUnit: "mm/h",
        factor: 1,
        description: "mm/h → mm/saat (same value)",
      },
    ],
    typicalRefRange: { low: 0, high: 20 },
  },

  // =========================================================================
  // Vitamins
  // =========================================================================

  "Vitamin B12": {
    canonicalUnit: "pg/mL",
    conversions: [
      /** pmol/L → pg/mL: divide by 0.738 */
      {
        fromUnit: "pmol/L",
        factor: 1 / 0.738,
        description: "pmol/L → pg/mL (÷ 0.738)",
      },
    ],
    typicalRefRange: { low: 200, high: 900 },
  },

  "Folik Asit": {
    canonicalUnit: "ng/mL",
    conversions: [
      /** nmol/L → ng/mL: divide by 2.266 */
      {
        fromUnit: "nmol/L",
        factor: 1 / 2.266,
        description: "nmol/L → ng/mL (÷ 2.266)",
      },
    ],
    typicalRefRange: { low: 3.0, high: 17.0 },
  },

  "Vitamin D": {
    canonicalUnit: "ng/mL",
    conversions: [
      /** nmol/L → ng/mL: divide by 2.496 */
      {
        fromUnit: "nmol/L",
        factor: 1 / 2.496,
        description: "nmol/L → ng/mL (÷ 2.496)",
      },
    ],
    typicalRefRange: { low: 30, high: 100 },
  },

  // =========================================================================
  // Coagulation (Koagülasyon)
  // =========================================================================

  "APTT (Parsiyel Tromboplastin Zamanı)": {
    canonicalUnit: "saniye",
    conversions: [
      {
        fromUnit: "s",
        factor: 1,
        description: "s → saniye (same value)",
      },
      {
        fromUnit: "sec",
        factor: 1,
        description: "sec → saniye (same value)",
      },
    ],
    typicalRefRange: { low: 25, high: 35 },
  },

  "Protrombin Zamanı": {
    canonicalUnit: "saniye",
    conversions: [
      {
        fromUnit: "s",
        factor: 1,
        description: "s → saniye (same value)",
      },
      {
        fromUnit: "sec",
        factor: 1,
        description: "sec → saniye (same value)",
      },
    ],
    typicalRefRange: { low: 11, high: 13.5 },
  },

  // =========================================================================
  // Other common metrics
  // =========================================================================

  "HbA1c (Glikozile Hemoglobin)": {
    canonicalUnit: "%",
    conversions: [
      /** mmol/mol → %: (mmol/mol / 10.929) + 2.15 — non-linear, handled specially */
      {
        fromUnit: "mmol/mol",
        factor: 1 / 10.929,
        description:
          "mmol/mol → % (÷ 10.929 + 2.15, approximate linear portion)",
      },
    ],
    typicalRefRange: { low: 4.0, high: 5.6 },
  },
} as const satisfies Record<string, CanonicalMetric>;

/** Set of all canonical metric names for fast lookup */
export const CANONICAL_METRIC_NAMES = new Set(Object.keys(CANONICAL_METRICS));
