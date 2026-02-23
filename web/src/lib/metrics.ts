export interface ExtractedMetric {
  name: string;
  value: number;
  unit?: string;
  ref_low?: number | null;
  ref_high?: number | null;
  _key?: string;
}

export type MetricField = "name" | "value" | "unit" | "ref_low" | "ref_high";

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
