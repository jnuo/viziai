"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChartLine,
  Check,
  ChevronDown,
  Ellipsis,
  GripVertical,
  List,
  Plus,
  Search,
  SlidersHorizontal,
  X,
  type LucideIcon,
} from "lucide-react";
import { bcp47, toLocale } from "@/i18n/config";
import type { DashMetric, Status } from "@/lib/chart/model";
import { parseRangeChoice, type RangeChoice } from "@/lib/chart/range";
import { fmtV } from "@/lib/chart/scale";

/* ---------------------------------------------------------------- dates */

function dtf(locale: string, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(bcp47[toLocale(locale)], {
    timeZone: "UTC",
    ...opts,
  });
}

export function makeDateFormats(locale: string) {
  const short = dtf(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
  const dayMon = dtf(locale, { day: "numeric", month: "short" });
  const long = dtf(locale, { day: "numeric", month: "short", year: "numeric" });
  const mon = dtf(locale, { month: "short" });
  const monYear = dtf(locale, { month: "short", year: "numeric" });
  const year = dtf(locale, { year: "numeric" });
  const thisYear = new Date().getUTCFullYear();
  return {
    /** 26.10.26 */
    short: (t: number) => short.format(t),
    /** 26 Eki */
    dayMon: (t: number) => dayMon.format(t).replace(/\.$/, ""),
    /** 26 Eki 2026 */
    long: (t: number) => long.format(t),
    /** this year: 26 Eki, else 26.10.25 */
    when: (t: number) =>
      new Date(t).getUTCFullYear() === thisYear
        ? dayMon.format(t).replace(/\.$/, "")
        : short.format(t),
    mon: (t: number) => mon.format(t).replace(/\.$/, ""),
    monYear: (t: number) => monYear.format(t),
    year: (t: number) => year.format(t),
  };
}
export type DateFormats = ReturnType<typeof makeDateFormats>;

/* --------------------------------------------------------------- ranges */

export function rangeText(
  refMin: number | null,
  refMax: number | null,
): string | null {
  if (refMin != null && refMax != null)
    return `${fmtV(refMin)}–${fmtV(refMax)}`;
  if (refMin != null) return `≥ ${fmtV(refMin)}`;
  if (refMax != null) return `≤ ${fmtV(refMax)}`;
  return null;
}

export function metricRangeText(m: DashMetric): string | null {
  return rangeText(m.ref_min, m.ref_max);
}

export function statusClass(st: Status): "" | "out" | "none" {
  return st === "low" || st === "high" ? "out" : st === "none" ? "none" : "";
}

/* -------------------------------------------------------------- storage */

export const store = {
  get<T>(key: string, fallback: T): T {
    try {
      const v = window.localStorage.getItem(key);
      return v == null ? fallback : (JSON.parse(v) as T);
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage blocked: keep in memory only */
    }
  },
};

export type ChartSize = "s" | "m" | "l";
export const CHART_HEIGHTS: Record<ChartSize, number> = {
  s: 200,
  m: 280,
  l: 400,
};

export type ViewSettings = {
  full: boolean;
  pers: boolean;
  labels: boolean;
  cols: 1 | 2 | 3;
  size: ChartSize;
};
export const DEFAULT_VIEW: ViewSettings = {
  full: false,
  pers: false,
  labels: true,
  cols: 2,
  size: "m",
};
const K_VIEW = "viziai.dashboard.view";

export function loadView(): ViewSettings {
  const v = store.get<Partial<ViewSettings>>(K_VIEW, {}) || {};
  return {
    full: typeof v.full === "boolean" ? v.full : DEFAULT_VIEW.full,
    pers: typeof v.pers === "boolean" ? v.pers : DEFAULT_VIEW.pers,
    labels: typeof v.labels === "boolean" ? v.labels : DEFAULT_VIEW.labels,
    cols:
      v.cols === 1 || v.cols === 2 || v.cols === 3 ? v.cols : DEFAULT_VIEW.cols,
    size: v.size && v.size in CHART_HEIGHTS ? v.size : DEFAULT_VIEW.size,
  };
}
export function saveView(v: ViewSettings): void {
  store.set(K_VIEW, v);
}

/** Date range, per profile: an explicit choice, or null = automatic. */
const kRange = (profileId: string) => `viziai.dashboard.range.${profileId}`;
export function loadRangeChoice(profileId: string): RangeChoice | null {
  return parseRangeChoice(store.get<unknown>(kRange(profileId), null));
}
export function saveRangeChoice(
  profileId: string,
  choice: RangeChoice | null,
): void {
  store.set(kRange(profileId), choice);
}

/* ---------------------------------------------------------------- media */

export function useMedia(query: string): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const h = () => setOn(mq.matches);
    h();
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, [query]);
  return on;
}

/* ---------------------------------------------------------------- icons */

type IconProps = { size?: number };
/** lucide icons with the dashboard's default sizes; decorative (aria-hidden) */
const icon =
  (I: LucideIcon, def: number, className?: string) =>
  function DashIcon({ size = def }: IconProps) {
    return (
      <I size={size} strokeWidth={2} aria-hidden="true" className={className} />
    );
  };
export const IconX = icon(X, 12);
export const IconSearch = icon(Search, 14);
export const IconList = icon(List, 14);
export const IconPlus = icon(Plus, 14);
export const IconCheck = icon(Check, 14);
export const IconChev = icon(ChevronDown, 14, "chev");
export const IconGrip = icon(GripVertical, 14);
export const IconUp = icon(ArrowUp, 14);
export const IconDown = icon(ArrowDown, 14);
export const IconLeft = icon(ArrowLeft, 14);
export const IconRight = icon(ArrowRight, 14);
export const IconChart = icon(ChartLine, 14);
export const IconMore = icon(Ellipsis, 16);
export const IconSliders = icon(SlidersHorizontal, 14);
