import type { Locale } from "@/i18n/config";
import { bcp47 } from "@/i18n/config";

const TURKEY_TIMEZONE = "Europe/Istanbul";

function isValidISODate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export function parseToISO(dateStr: string): string | null {
  // Support ISO (YYYY-MM-DD) and US (MM/DD/YYYY)
  if (isValidISODate(dateStr)) return dateStr;
  const mdy = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const m = dateStr.match(mdy);
  if (m) {
    const [, mm, dd, yyyy] = m;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  return null;
}

export function compareDateAsc(a: string, b: string): number {
  // Parse to ISO first to ensure proper comparison regardless of input format
  const isoA = parseToISO(a) ?? a;
  const isoB = parseToISO(b) ?? b;
  if (isoA === isoB) return 0;
  return isoA < isoB ? -1 : 1;
}

/**
 * Format date as short format: "15.01.26"
 * Used in charts
 */
export function formatTR(dateStr: string, locale: Locale = "tr"): string {
  const iso = parseToISO(dateStr);
  if (!iso) return dateStr;
  const [year, month, day] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(year, month - 1, day));
  return dt.toLocaleDateString(bcp47[locale], {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    timeZone: TURKEY_TIMEZONE,
  });
}

/**
 * Format date: "29 Oca 2025" (TR) / "Jan 29, 2025" (EN)
 * Always uses Turkey timezone
 */
export function formatDateTR(
  dateString: string | null,
  locale: Locale = "tr",
): string {
  if (!dateString) return "—";
  const localeStr = bcp47[locale];

  // For date-only strings like "2026-01-15", parse directly to avoid timezone shift
  if (!dateString.includes("T")) {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toLocaleDateString(localeStr, {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: TURKEY_TIMEZONE,
    });
  }

  // For full ISO strings, use timezone conversion
  const date = new Date(dateString);
  return date.toLocaleDateString(localeStr, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TURKEY_TIMEZONE,
  });
}

/**
 * Format datetime: "29 Oca 2025, 10:30" (TR) / "Jan 29, 2025, 10:30 AM" (EN)
 * Always uses Turkey timezone
 */
export function formatDateTimeTR(
  dateString: string | null,
  locale: Locale = "tr",
): string {
  if (!dateString) return "—";

  const date = new Date(dateString);
  return date.toLocaleString(bcp47[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TURKEY_TIMEZONE,
  });
}
