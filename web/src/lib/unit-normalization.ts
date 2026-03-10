/**
 * Unit normalization module for ViziAI.
 *
 * Converts metric values from foreign/alternative units to the canonical
 * Turkish lab units defined in canonical-metrics.ts. Pure TypeScript,
 * no DB or API dependencies.
 */

import { CANONICAL_METRICS } from "./canonical-metrics";

export interface NormalizationResult {
  /** The (possibly converted) numeric value */
  value: number;
  /** The (possibly converted) unit string */
  unit: string;
  /** Whether a conversion was applied */
  converted: boolean;
  /** Human-readable description of the conversion (if converted) */
  conversionDescription?: string;
}

/**
 * Normalize a metric's value and unit to the canonical unit.
 *
 * If the metric name is known and the unit matches a conversion rule,
 * the value is converted. Otherwise, returns the original value unchanged.
 *
 * @param metricName - The canonical metric name (Turkish)
 * @param value - The numeric value from the lab report
 * @param unit - The unit from the lab report
 * @returns The normalized value, unit, and whether conversion was applied
 *
 * @example
 * ```ts
 * normalizeUnit("Hemoglobin", 159, "g/L")
 * // → { value: 15.9, unit: "g/dL", converted: true, conversionDescription: "g/L → g/dL (÷ 10)" }
 *
 * normalizeUnit("Hemoglobin", 15.9, "g/dL")
 * // → { value: 15.9, unit: "g/dL", converted: false }
 *
 * normalizeUnit("UnknownMetric", 42, "mg/dL")
 * // → { value: 42, unit: "mg/dL", converted: false }
 * ```
 */
export function normalizeUnit(
  metricName: string,
  value: number,
  unit: string,
): NormalizationResult {
  const metric = CANONICAL_METRICS[metricName];

  // Unknown metric — return as-is
  if (!metric) {
    return { value, unit, converted: false };
  }

  // Already in canonical unit — return as-is
  if (normalizeUnitString(unit) === normalizeUnitString(metric.canonicalUnit)) {
    return { value, unit: metric.canonicalUnit, converted: false };
  }

  // Look for a matching conversion rule
  const conversion = metric.conversions.find(
    (c) => normalizeUnitString(c.fromUnit) === normalizeUnitString(unit),
  );

  if (!conversion) {
    // No conversion rule found — return as-is
    return { value, unit, converted: false };
  }

  // Apply conversion
  const convertedValue = roundToSignificantDecimals(
    value * conversion.factor,
    value,
  );

  return {
    value: convertedValue,
    unit: metric.canonicalUnit,
    converted: true,
    conversionDescription: conversion.description,
  };
}

/**
 * Check if a metric's unit needs conversion.
 *
 * Useful for the upload review UI to show conversion suggestions
 * without actually converting the value.
 */
export function needsConversion(
  metricName: string,
  unit: string,
): { needs: boolean; targetUnit?: string; description?: string } {
  const metric = CANONICAL_METRICS[metricName];

  if (!metric) {
    return { needs: false };
  }

  if (normalizeUnitString(unit) === normalizeUnitString(metric.canonicalUnit)) {
    return { needs: false };
  }

  const conversion = metric.conversions.find(
    (c) => normalizeUnitString(c.fromUnit) === normalizeUnitString(unit),
  );

  if (!conversion) {
    return { needs: false };
  }

  return {
    needs: true,
    targetUnit: metric.canonicalUnit,
    description: conversion.description,
  };
}

/**
 * Normalize a unit string for comparison.
 * Handles common variations: case, whitespace, unicode µ vs u.
 */
function normalizeUnitString(unit: string): string {
  return unit
    .trim()
    .toLowerCase()
    .replace(/\u00b5/g, "u") // µ → u
    .replace(/\s+/g, "");
}

/**
 * Round a converted value to a reasonable number of decimal places.
 * Preserves the precision of the original value.
 */
function roundToSignificantDecimals(
  converted: number,
  original: number,
): number {
  // Determine decimals from original value
  const originalStr = original.toString();
  const decimalIndex = originalStr.indexOf(".");
  const originalDecimals =
    decimalIndex >= 0 ? originalStr.length - decimalIndex - 1 : 0;

  // Use at least as many decimals as the original, minimum 1 for converted values
  const decimals = Math.max(originalDecimals, 1);

  return Number(converted.toFixed(decimals));
}
