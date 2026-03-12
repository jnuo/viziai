export interface ExtractedMetric {
  name: string;
  value: number | null;
  unit?: string;
  ref_low?: number | null;
  ref_high?: number | null;
}

export interface EditableMetric extends ExtractedMetric {
  _key: string;
}

export interface RenameInfo {
  original: string;
  canonical: string;
  applied: boolean;
}

export interface ConversionInfo {
  originalValue: number;
  originalUnit: string;
  convertedValue: number;
  convertedUnit: string;
  description: string;
  applied: boolean;
}

export type MetricField = "name" | "value" | "unit" | "ref_low" | "ref_high";

export function formatRefRange(
  low: number | null | undefined,
  high: number | null | undefined,
): string {
  const hasLow = low != null && !isNaN(Number(low));
  const hasHigh = high != null && !isNaN(Number(high));
  if (hasLow && hasHigh) return `${low}\u2013${high}`;
  if (hasLow) return `\u2265${low}`;
  if (hasHigh) return `\u2264${high}`;
  return "\u2014";
}

export function checkOutOfRange(
  value: number | string | null,
  refLow: number | string | null,
  refHigh: number | string | null,
): boolean {
  if (value == null) return false;
  const v = Number(value);
  if (isNaN(v)) return false;
  if (refLow != null && !isNaN(Number(refLow)) && v < Number(refLow))
    return true;
  if (refHigh != null && !isNaN(Number(refHigh)) && v > Number(refHigh))
    return true;
  return false;
}
