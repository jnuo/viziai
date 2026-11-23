/**
 * Chart geometry helpers: fit-to-data y-axis with nice ticks, time-scaled
 * x ticks and value-label thinning. Pure (unit-tested).
 */
import { DAY } from "./model";

/** Linear time scale: ms -> px inside [x0, x0 + width]. */
export function timeToX(t: number, dom: [number, number], x0: number, width: number): number {
  return x0 + ((t - dom[0]) / (dom[1] - dom[0])) * width;
}

export function niceStep(raw: number): number {
  if (!(raw > 0) || !Number.isFinite(raw)) return 1;
  const e = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / e;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * e;
}

export function decimalsOf(step: number): number {
  const s = String(+step.toPrecision(6));
  return s.includes(".") ? s.split(".")[1].length : 0;
}

function percentile(sorted: number[], f: number): number {
  const i = (sorted.length - 1) * f;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
}

export type YScale = {
  y0: number;
  y1: number;
  ticks: number[];
  decimals: number;
};

export type YScaleOptions = {
  /** extra values that must be visible (average line, personal band) */
  extra?: number[];
  /** include the whole clinical range ("Normal aralığı göster") */
  full?: boolean;
  refMin?: number | null;
  refMax?: number | null;
  nTicks: number;
};

/**
 * Fit-to-data y scale.
 * - Domain from the 5th–95th percentile of the values (linear interpolation)
 *   plus 15% padding (5% when the clinical range is included), so a lab
 *   typo (60.59 in a 4–11 series) doesn't stretch the axis; values outside
 *   are clamped to the edge by the chart, with a marker.
 * - Minimum span = 25% of the normal-range width, so a tiny change
 *   (Kreatinin 0.85 → 0.88) doesn't look like a cliff.
 * - full=true adds the whole clinical range.
 * - Never below 0 for non-negative data. Ticks are round numbers inside
 *   the domain; the domain itself is not stretched to a tick.
 */
export function yScale(vals: number[], opts: YScaleOptions): YScale {
  const { extra = [], full = false, refMin = null, refMax = null, nTicks } = opts;
  const sorted = [...vals].sort((a, b) => a - b);
  let lo = Math.min(percentile(sorted, 0.05), ...extra);
  let hi = Math.max(percentile(sorted, 0.95), ...extra);
  if (full) {
    if (refMin != null) lo = Math.min(lo, refMin);
    if (refMax != null) hi = Math.max(hi, refMax);
  }
  if (hi - lo < 1e-9) {
    const p = Math.abs(lo) * 0.1 || 1;
    lo -= p;
    hi += p;
  }
  const pad = (hi - lo) * (full ? 0.05 : 0.15);
  lo -= pad;
  hi += pad;
  const width =
    refMin != null && refMax != null && refMax > refMin ? refMax - refMin : null;
  const minSpan = width != null ? width * 0.25 : 0;
  if (hi - lo < minSpan) {
    const mid = (hi + lo) / 2;
    lo = mid - minSpan / 2;
    hi = mid + minSpan / 2;
  }
  const nonNeg = sorted[0] >= 0;
  if (nonNeg && lo < 0) {
    hi -= lo;
    lo = 0;
  }
  const step = niceStep((hi - lo) / Math.max(1, nTicks - 1));
  const decimals = decimalsOf(step);
  const ticks: number[] = [];
  for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step) {
    ticks.push(+v.toFixed(decimals));
  }
  const r = (x: number) => +x.toFixed(decimals + 2);
  return { y0: r(lo), y1: r(hi), ticks, decimals };
}

export type TimeTick = {
  t: number;
  unit: "day" | "month" | "year";
  first: boolean;
};

/** Ticks for a real time axis: days, weeks, then months/quarters/years. */
export function timeTicks(
  t0: number,
  t1: number,
  plotWidth: number,
): TimeTick[] {
  const maxT = Math.max(2, Math.floor(plotWidth / 64));
  const spanD = (t1 - t0) / DAY;
  for (const k of [1, 2, 7, 14]) {
    if (spanD / k + 1 <= maxT) {
      let s = Math.ceil(t0 / DAY) * DAY;
      if (k >= 7) {
        const dow = (new Date(s).getUTCDay() + 6) % 7;
        if (dow) s += (7 - dow) * DAY;
      }
      const out: TimeTick[] = [];
      for (let t = s; t <= t1; t += k * DAY) {
        out.push({ t, unit: "day", first: out.length === 0 });
      }
      return out;
    }
  }
  for (const k of [1, 2, 3, 6, 12, 24, 60]) {
    if (spanD / (30.44 * k) + 1 <= maxT || k === 60) {
      const d = new Date(t0);
      let y = d.getUTCFullYear();
      let mo = d.getUTCMonth() + 1;
      if (mo > 11) {
        mo = 0;
        y++;
      }
      while (mo % Math.min(k, 12)) {
        mo++;
        if (mo > 11) {
          mo = 0;
          y++;
        }
      }
      if (k > 12) {
        while (y % (k / 12)) y++;
        mo = 0;
      }
      const out: TimeTick[] = [];
      for (;;) {
        const t = Date.UTC(y, mo, 1);
        if (t > t1) break;
        out.push({
          t,
          unit: k >= 12 ? "year" : "month",
          first: out.length === 0,
        });
        mo += k;
        while (mo > 11) {
          mo -= 12;
          y++;
        }
      }
      return out;
    }
  }
  return [];
}

export type Box = { x0: number; x1: number; y0: number; y1: number };
export const boxesHit = (a: Box, b: Box) =>
  a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

export type LabelInput = {
  x: number;
  y: number;
  v: number;
  txt: string;
  dl: string;
};
export type PlacedLabel = {
  i: number;
  x: number;
  y: number;
  txt: string;
  dl: string;
};

/** Rough text width for 10.5px Inter, tabular digits. */
export function textWidth(s: string, charW: number): number {
  return s.replace(/[.]/g, "").length * charW + (s.includes(".") ? 3 : 0);
}

/**
 * Value labels ("9.8 ↑0.1") on points: every point when ≤ 8 are visible,
 * otherwise only last/max/min/first plus the pinned point. Each label goes
 * above its dot (below for a valley), else left or right of it, and is
 * dropped — never overlapped — when nothing fits. The last and the pinned
 * point are never dropped: with no free spot they take the in-bounds spot
 * that overlaps least.
 */
export function placeLabels(
  pts: LabelInput[],
  bounds: Box,
  obstacles: Box[] = [],
  pinnedIndex: number | null = null,
): PlacedLabel[] {
  const n = pts.length;
  if (!n) return [];
  let mi = 0;
  let ma = 0;
  pts.forEach((p, i) => {
    if (p.v < pts[mi].v) mi = i;
    if (p.v > pts[ma].v) ma = i;
  });
  const rest = n <= 8 ? pts.map((_, i) => n - 1 - i) : [];
  const pin =
    pinnedIndex != null && pinnedIndex >= 0 && pinnedIndex < n
      ? [pinnedIndex]
      : [];
  const must = new Set([...pin, n - 1]);
  const order = [...new Set([...pin, n - 1, ma, mi, 0, ...rest])];
  const placed = [...obstacles];
  const dots = pts.map((p) => ({
    x0: p.x - 5,
    x1: p.x + 5,
    y0: p.y - 5,
    y1: p.y + 5,
  }));
  const out: PlacedLabel[] = [];
  const h = 12;
  const clampX = (x0: number, w: number) =>
    Math.max(bounds.x0, Math.min(x0, bounds.x1 - w));
  for (const i of order) {
    const p = pts[i];
    const w =
      textWidth(p.txt, 6.4) + (p.dl ? textWidth(p.dl, 5.6) + 4 : 0) + 4;
    const a = pts[i - 1];
    const b = pts[i + 1];
    const valley = (a || b) && (!a || p.v <= a.v) && (!b || p.v <= b.v);
    const above = { x0: clampX(p.x - w / 2, w), y0: p.y - 7 - h };
    const below = { x0: clampX(p.x - w / 2, w), y0: p.y + 7 };
    const left = { x0: p.x - 8 - w, y0: p.y - h / 2 };
    const right = { x0: p.x + 8, y0: p.y - h / 2 };
    const spots = (valley ? [below, above] : [above, below])
      .concat([left, right])
      .map((c) => ({ x0: c.x0, x1: c.x0 + w, y0: c.y0, y1: c.y0 + h }))
      .filter(
        (bx) =>
          bx.x0 >= bounds.x0 &&
          bx.x1 <= bounds.x1 &&
          bx.y0 >= bounds.y0 &&
          bx.y1 <= bounds.y1,
      );
    const hits = (bx: Box) =>
      placed.filter((o) => boxesHit(o, bx)).length +
      dots.filter((o, j) => j !== i && boxesHit(o, bx)).length;
    let bx = spots.find((c) => hits(c) === 0);
    if (!bx && must.has(i) && spots.length) {
      bx = spots.reduce((best, c) => (hits(c) < hits(best) ? c : best));
    }
    if (!bx) continue;
    placed.push(bx);
    out.push({
      i,
      x: bx.x0 + w / 2,
      y: bx.y0 + h - 2.5,
      txt: p.txt,
      dl: p.dl,
    });
  }
  return out;
}

/** "9.8", "47", "0.03" — at most 2 decimals, "." separator (app-wide). */
export const fmtV = (v: number) => String(Math.round(v * 100) / 100);

/** "↑0.1" / "↓5" / "±0" */
export const fmtDelta = (dv: number) => {
  const a = Math.round(Math.abs(dv) * 100) / 100;
  return a === 0 ? "±0" : (dv > 0 ? "↑" : "↓") + a;
};
