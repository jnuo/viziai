/**
 * Dashboard date range (#159): presets anchored to the latest draw date, the
 * automatic pick, and custom-range validation. Timestamps are UTC midnight
 * ms (see toMs), so whole calendar days compare exactly.
 */
import { DAY } from "./model";

export const RANGE_PRESETS = ["2w", "1m", "3m", "6m", "1y", "all"] as const;
export type RangePreset = (typeof RANGE_PRESETS)[number];

export type RangeChoice =
  | { kind: "preset"; preset: RangePreset }
  | { kind: "custom"; from: number; to: number };
export type CustomRange = Extract<RangeChoice, { kind: "custom" }>;

/** The automatic pick wants at least this many distinct draw dates. */
export const AUTO_MIN_DATES = 8;
/** Smallest first; "2 hafta" is never picked automatically. */
const AUTO_CANDIDATES: RangePreset[] = ["1m", "3m", "6m", "1y"];

const MONTHS: Partial<Record<RangePreset, number>> = {
  "1m": 1,
  "3m": 3,
  "6m": 6,
  "1y": 12,
};

/** Calendar months back from a UTC day, clamped to the target month's last day. */
function monthsBack(t: number, n: number): number {
  const d = new Date(t);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() - n;
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return Date.UTC(y, m, Math.min(d.getUTCDate(), last));
}

/**
 * What ranges count back from: the latest lab draw, not today, so a profile
 * whose last test was months ago never opens on an empty "1 ay". Falls back
 * to the latest tracking reading, then to today.
 */
export function rangeAnchor(
  labTs: number[],
  otherTs: number[],
  today: number,
): number {
  if (labTs.length) return Math.max(...labTs);
  if (otherTs.length) return Math.max(...otherTs);
  return today;
}

/** First day a preset shows, counted back from `anchor` (the latest draw). */
export function presetStart(preset: RangePreset, anchor: number): number {
  if (preset === "all") return -Infinity;
  if (preset === "2w") return anchor - 14 * DAY;
  return monthsBack(anchor, MONTHS[preset]!);
}

/**
 * The smallest preset (never below "1 ay") whose window holds at least
 * AUTO_MIN_DATES distinct dates of `ts`; "Tümü" when none does.
 */
export function autoPreset(
  ts: number[],
  anchor: number,
  min = AUTO_MIN_DATES,
): RangePreset {
  const days = [...new Set(ts)];
  for (const p of AUTO_CANDIDATES) {
    const start = presetStart(p, anchor);
    if (days.filter((t) => t >= start).length >= min) return p;
  }
  return "all";
}

/** Inclusive [from, to] of the visible window. Presets are open-ended. */
export function rangeBounds(
  choice: RangeChoice,
  anchor: number,
): [number, number] {
  if (choice.kind === "custom") return [choice.from, choice.to];
  return [presetStart(choice.preset, anchor), Infinity];
}

/**
 * A custom range from the calendar: null unless both ends are set and
 * start <= end after clamping to the data span (so a range entirely
 * outside the data is null too).
 */
export function normalizeCustom(
  from: number | undefined,
  to: number | undefined,
  span: [number, number] | null,
): CustomRange | null {
  if (
    from == null ||
    to == null ||
    !Number.isFinite(from) ||
    !Number.isFinite(to)
  )
    return null;
  const a = span ? Math.max(from, span[0]) : from;
  const b = span ? Math.min(to, span[1]) : to;
  if (a > b) return null;
  return { kind: "custom", from: a, to: b };
}

/** A stored choice, validated; anything else means automatic (null). */
export function parseRangeChoice(v: unknown): RangeChoice | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  if (o.kind === "preset")
    return (RANGE_PRESETS as readonly unknown[]).includes(o.preset)
      ? { kind: "preset", preset: o.preset as RangePreset }
      : null;
  if (o.kind === "custom")
    return normalizeCustom(
      typeof o.from === "number" ? o.from : undefined,
      typeof o.to === "number" ? o.to : undefined,
      null,
    );
  return null;
}

/** UTC-midnight day -> local Date on the same calendar day (for the calendar). */
export function utcToLocalDate(t: number): Date {
  const d = new Date(t);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** Local calendar Date -> UTC-midnight ms of the same day. */
export function localDateToUtc(d: Date): number {
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
}
