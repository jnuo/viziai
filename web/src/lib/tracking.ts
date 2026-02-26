import type { Locale } from "@/i18n/config";
import { bcp47 } from "@/i18n/config";

export type TrackingMeasurement = {
  id: string;
  profile_id: string;
  type: "blood_pressure" | "weight";
  measured_at: string;
  systolic: number | null;
  diastolic: number | null;
  pulse: number | null;
  weight_kg: number | null;
  notes: string | null;
  created_at: string;
};

export type BPStatusKey = "low" | "high" | "highNormal" | "normal";

export type BPStatus = {
  key: BPStatusKey;
  color: string;
  bg: string;
  borderColor: string;
};

/**
 * Classify blood pressure. Ranges per AHA/ESC 2024 guidelines, simplified.
 * Returns a status key instead of a translated label — callers use t(`common.${key}`) to get the label.
 */
export function getBPStatus(systolic: number, diastolic: number): BPStatus {
  if (systolic < 90 || diastolic < 60) {
    return {
      key: "low",
      color: "text-status-critical",
      bg: "bg-status-critical/10",
      borderColor: "border-l-status-critical",
    };
  }
  if (systolic >= 140 || diastolic >= 90) {
    return {
      key: "high",
      color: "text-status-critical",
      bg: "bg-status-critical/10",
      borderColor: "border-l-status-critical",
    };
  }
  if (systolic >= 120 || diastolic >= 80) {
    return {
      key: "highNormal",
      color: "text-status-warning",
      bg: "bg-status-warning/10",
      borderColor: "border-l-status-warning",
    };
  }
  return {
    key: "normal",
    color: "text-status-normal",
    bg: "bg-status-normal/10",
    borderColor: "border-l-status-normal",
  };
}

/**
 * Format a date string for display in tracking dialogs.
 * @param locale - Locale code ("tr", "en", "es")
 */
export function formatTrackingDate(
  dateStr: string,
  locale: Locale = "tr",
): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(bcp47[locale], {
    day: "numeric",
    month: "short",
  });
}

/**
 * Format a date string with time for blood pressure dialog.
 * @param locale - Locale code ("tr", "en", "es")
 */
export function formatTrackingDateTime(
  dateStr: string,
  locale: Locale = "tr",
): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(bcp47[locale], {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a date string as relative time.
 * Returns a key for "justNow" / "yesterday", or a formatted date string.
 */
export function formatRelativeDate(
  dateStr: string,
  locale: Locale = "tr",
):
  | { type: "key"; key: "justNow" | "yesterday" }
  | { type: "key"; key: "hoursAgo"; count: number }
  | { type: "date"; value: string } {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) return { type: "key", key: "justNow" };
  if (diffHours < 24) {
    return { type: "key", key: "hoursAgo", count: Math.floor(diffHours) };
  }
  if (diffHours < 48) return { type: "key", key: "yesterday" };
  return {
    type: "date",
    value: date.toLocaleDateString(bcp47[locale], {
      day: "numeric",
      month: "short",
    }),
  };
}
