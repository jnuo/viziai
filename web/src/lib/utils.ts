import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUUID(value: string): boolean {
  return UUID_RE.test(value);
}

/**
 * Add colloquial Turkish names to medical terms for readability.
 * e.g. "Tansiyon (Sistolik)" → "Büyük Tansiyon (Sistolik)"
 */
const FRIENDLY_NAMES: [RegExp, string][] = [
  [/sistolik/i, "Büyük Tansiyon (Sistolik)"],
  [/diastolik/i, "Küçük Tansiyon (Diastolik)"],
];

export function friendlyMetricName(name: string): string {
  for (const [pattern, friendly] of FRIENDLY_NAMES) {
    if (pattern.test(name)) return friendly;
  }
  return name;
}
