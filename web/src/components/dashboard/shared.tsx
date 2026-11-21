"use client";

import { useEffect, useState } from "react";
import { bcp47, toLocale } from "@/i18n/config";
import type { DashMetric, Status } from "@/lib/chart/model";
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
const svg = (
  size: number,
  children: React.ReactNode,
  extra: React.SVGProps<SVGSVGElement> = {},
) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...extra}
  >
    {children}
  </svg>
);
export const IconX = ({ size = 12 }: IconProps) =>
  svg(size, <path d="M18 6 6 18M6 6l12 12" />);
export const IconSearch = ({ size = 14 }: IconProps) =>
  svg(
    size,
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>,
  );
export const IconList = ({ size = 14 }: IconProps) =>
  svg(size, <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />);
export const IconPlus = ({ size = 14 }: IconProps) =>
  svg(size, <path d="M12 5v14M5 12h14" />);
export const IconCheck = ({ size = 14 }: IconProps) =>
  svg(size, <path d="m5 12 5 5L20 7" />);
export const IconChev = ({ size = 14 }: IconProps) =>
  svg(size, <path d="m6 9 6 6 6-6" />, { className: "chev" });
export const IconGrip = ({ size = 14 }: IconProps) =>
  svg(
    size,
    <>
      <circle cx="9" cy="6" r="1" />
      <circle cx="15" cy="6" r="1" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="9" cy="18" r="1" />
      <circle cx="15" cy="18" r="1" />
    </>,
  );
export const IconUp = ({ size = 14 }: IconProps) =>
  svg(size, <path d="M12 19V5M6 11l6-6 6 6" />);
export const IconDown = ({ size = 14 }: IconProps) =>
  svg(size, <path d="M12 5v14M18 13l-6 6-6-6" />);
export const IconLeft = ({ size = 14 }: IconProps) =>
  svg(size, <path d="M19 12H5M11 6l-6 6 6 6" />);
export const IconRight = ({ size = 14 }: IconProps) =>
  svg(size, <path d="M5 12h14M13 6l6 6-6 6" />);
export const IconChart = ({ size = 14 }: IconProps) =>
  svg(
    size,
    <>
      <path d="M3 3v18h18" />
      <path d="m7 15 4-4 3 3 5-6" />
    </>,
  );
export const IconMore = ({ size = 16 }: IconProps) =>
  svg(
    size,
    <>
      <circle cx="5" cy="12" r="1.2" fill="currentColor" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      <circle cx="19" cy="12" r="1.2" fill="currentColor" />
    </>,
  );
export const IconSliders = ({ size = 14 }: IconProps) =>
  svg(
    size,
    <>
      <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="10" cy="12" r="2" />
      <circle cx="18" cy="18" r="2" />
    </>,
  );
