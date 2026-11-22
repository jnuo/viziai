/**
 * Dashboard data model: per-metric series, status, change stats, categories,
 * search and sorting. Pure functions only (unit-tested in
 * src/__tests__/lib/dashboard-model.test.ts).
 */

export const DAY = 86_400_000;

export type Status = "ok" | "low" | "high" | "none";

/** One measurement. ref_* / unit are this result's own (labs differ). */
export type Pt = {
  t: number;
  v: number;
  refMin: number | null;
  refMax: number | null;
  unit: string;
};

export type RawMetric = {
  id: string;
  name: string;
  unit: string;
  ref_min: number | null;
  ref_max: number | null;
  category?: string | null;
  aliases?: string[];
  metric_definition_id?: string | null;
};

export type RawValue = {
  metric_id: string;
  date: string;
  value: number;
  ref_low?: number | null;
  ref_high?: number | null;
  unit?: string | null;
};

export type MetricStat = {
  last: Pt | null;
  prev: Pt | null;
  st: Status;
  /** latest value outside its range (metrics without a range are never "out") */
  out: boolean;
  hasRef: boolean;
  /** last - prev, null for a first measurement or across a unit change */
  delta: number | null;
  /** |delta| relative to the values themselves (0..1) */
  rel: number | null;
  /** |delta| / normal-range width; null without a range */
  share: number | null;
  /** status changed between prev and last (into or out of range) */
  crossed: boolean;
  /** how far out of range the latest value is, in range widths */
  sev: number;
  /** days between this metric's last value and the latest report overall */
  ageDays: number;
  /** measured in the most recent report */
  inLatest: boolean;
};

export type DashMetric = {
  id: string;
  /** cleaned display name (ALL-CAPS lab names in title case) */
  name: string;
  /** name as stored */
  full: string;
  unit: string;
  ref_min: number | null;
  ref_max: number | null;
  category: string;
  aliases: string[];
  /** index in the API order (profile display_order) */
  order: number;
  tracking: boolean;
  pts: Pt[];
  idx: Map<number, number>;
  stat: MetricStat;
  /** folded search haystack */
  hay: string;
  fname: string;
  words: string[];
};

/* ---------------------------------------------------------------- dates */

/** "2026-03-09" -> UTC midnight ms */
export function toMs(iso: string): number {
  return Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
}

export function todayUtc(now: Date = new Date()): number {
  return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
}

/* --------------------------------------------------------------- status */

export function statusOf(
  v: number,
  refMin: number | null,
  refMax: number | null,
): Status {
  if (refMin == null && refMax == null) return "none";
  if (refMin != null && v < refMin) return "low";
  if (refMax != null && v > refMax) return "high";
  return "ok";
}

/** Status of a point against its own range, falling back to the metric's latest range. */
export function pointStatus(
  m: Pick<DashMetric, "ref_min" | "ref_max">,
  p: Pt,
): Status {
  const own = p.refMin != null || p.refMax != null;
  return own
    ? statusOf(p.v, p.refMin, p.refMax)
    : statusOf(p.v, m.ref_min, m.ref_max);
}

export function isOut(st: Status): boolean {
  return st === "low" || st === "high";
}

/** Width used to judge whether a change matters. null = no usable range. */
export function rangeWidth(
  refMin: number | null,
  refMax: number | null,
): number | null {
  if (refMin != null && refMax != null) {
    return refMax > refMin ? refMax - refMin : null;
  }
  const b = refMax ?? refMin;
  return b != null && Math.abs(b) > 0 ? Math.abs(b) : null;
}

/* ------------------------------------------------------- personal band */

/**
 * "Kişisel aralık": the middle 80% (p10–p90) of this person's own values in
 * the last 90 days. Needs at least `minPoints` values in that window.
 */
export function personalBand(
  pts: Pick<Pt, "t" | "v">[],
  today: number,
  minPoints = 5,
): [number, number] | null {
  const v = pts
    .filter((p) => p.t >= today - 90 * DAY && p.t <= today)
    .map((p) => p.v)
    .sort((a, b) => a - b);
  if (v.length < minPoints) return null;
  const q = (f: number) => {
    const i = (v.length - 1) * f;
    const lo = Math.floor(i);
    const hi = Math.ceil(i);
    return v[lo] + (v[hi] - v[lo]) * (i - lo);
  };
  const r = (x: number) => Math.round(x * 100) / 100;
  return [r(q(0.1)), r(q(0.9))];
}

/* ------------------------------------------------------------ names */

/** Turkish-aware fold: İ/I/ı -> i, ş->s, ğ->g, ü->u, ö->o, ç->c, _ -> space */
export function fold(s: string | null | undefined): string {
  return (s || "")
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/_/g, " ");
}

const STRIP = [
  /\s*\((SERUM|Serum)[ /]+(PLAZMA|Plazma)\)/g,
  /\s*\(Mikropartikül.*?\)/g,
  /\s*\(MİKROPARTİKÜL.*?\)/g,
  /\s*\(Kemoluminesans.*?\)/g,
  /\s*\(OTOMATİK SİSTEM\)/g,
  /\s*\(Otomatik sistem \)/g,
];
/**
 * Case-insensitive key for matching stored names against the alias table.
 * Turkish casing turns ASCII "I" into "ı" while Postgres LOWER() gives "i",
 * so İ / I / ı all become "i" here and in the SQL side
 * (translate(lower(translate(x, 'İI', 'ii')), 'ı', 'i')).
 */
export function lowerKey(s: string): string {
  return s.replace(/[İI]/g, "i").toLowerCase().replace(/ı/g, "i");
}

const KEEP_SHORT = new Set(["ÜRE", "ANTİ", "TAYİNİ", "ÜRİK", "ASİT"]);
/**
 * Title-case one all-caps word. A name written with a dotted "İ" uses
 * Turkish capitals, so its plain "I" is a dotless "ı" ("KIRMIZI" -> "Kırmızı").
 * Without any "İ" the lab wrote ASCII capitals: "I" is "i"
 * ("HEMOGLOBIN" -> "Hemoglobin", not "Hemoglobın").
 */
const trCap = (w: string, turkishCaps: boolean) => {
  if (!w) return w;
  const rest = turkishCaps ? w.slice(1) : w.slice(1).replace(/I/g, "i");
  return w[0].toLocaleUpperCase("tr") + rest.toLocaleLowerCase("tr");
};

/**
 * Lab PDFs often shout ("C REAKTİF PROTEİN (CRP)"). Title-case long all-caps
 * words, keep abbreviations ("CRP"), drop method/sample suffixes.
 */
export function prettifyName(name: string): string {
  let s = name;
  for (const p of STRIP) s = s.replace(p, "");
  s = s.replace(/\s+/g, " ").trim();
  const letters = [...name].filter((c) => /\p{L}/u.test(c));
  const upper = letters.filter(
    (c) => c === c.toLocaleUpperCase("tr") && c !== c.toLocaleLowerCase("tr"),
  ).length;
  if (name.length > 5 && letters.length && upper / letters.length > 0.7) {
    const turkishCaps = name.includes("İ");
    s = s
      .split(/(\s+|[(),+\-])/)
      .map((tok) =>
        /^[A-ZÇĞİÖŞÜ]+$/.test(tok) && (tok.length > 4 || KEEP_SHORT.has(tok))
          ? trCap(tok, turkishCaps)
          : tok,
      )
      .join("");
  }
  return s || name;
}

/* -------------------------------------------------------- categories */

export const CATEGORY_ORDER = [
  "takip",
  "hemogram",
  "biyokimya",
  "bobrek",
  "karaciger",
  "enflamasyon",
  "tumor_belirtecleri",
  "demir",
  "koagulasyon",
  "lipid",
  "tiroid",
  "vitamin",
  "kan_gazi",
  "idrar",
  "immunoloji",
  "mikrobiyoloji",
  "kardiyak",
  "hormon",
  "diger",
] as const;
export type CategorySlug = (typeof CATEGORY_ORDER)[number];

const LEGACY_CATEGORY: Record<string, CategorySlug> = {
  cbc: "hemogram",
  chemistry: "biyokimya",
  liver: "karaciger",
  lipid: "lipid",
  coagulation: "koagulasyon",
  iron: "demir",
  vitamins: "vitamin",
  thyroid: "tiroid",
  inflammation: "enflamasyon",
  other: "diger",
  tumor_marker: "tumor_belirtecleri",
  kardiyoloji: "kardiyak",
};

const INFER_RULES: [RegExp, CategorySlug][] = [
  [
    /gfr|gfh|^kreatinin$|kreatinin \(serum|^ure\b|^ure \(|kan ure azotu|^bun$|urik asit/,
    "bobrek",
  ],
  [/spot idrar|triple fosfat|^vitamin c$|idrar/, "idrar"],
  [/kultur|duyarlilik|tanimlanmasi/, "mikrobiyoloji"],
  [/ebv|cmv|parvovirus|anti hbs|anti hcv|hbsag|^ig[agm]$/, "immunoloji"],
  [
    /methemoglobin|karboksihemoglobin|^hco3|^so2|baz acigi|ozmolarite/,
    "kan_gazi",
  ],
  [
    /^hemogram |^bas[%#]|^lymph|^img[%#]|^p-lcc|^mono[%#]|eritroblast/,
    "hemogram",
  ],
  [/psa|prostat spesifik/, "tumor_belirtecleri"],
  [/pro-bnp|troponin/, "kardiyak"],
  [/tiroglobulin|tiroid peroksidaz|anti tpo/, "tiroid"],
  [/tdbk|uibc|transferrin/, "demir"],
  [/aspartat|bilirubin|laktat dehidrogenaz/, "karaciger"],
  [/haptoglobin|fosfor|klor|prealbumin|homosistein|glike|hba1c/, "biyokimya"],
  [/abo/, "diger"],
];
const KIDNEY =
  /gfr|gfh|^kreatinin$|kreatinin \(serum|^ure$|^ure \(|kan ure azotu|^bun$|urik asit/;

/**
 * DB category (metric_definitions.category, legacy English names mapped),
 * else inferred from the name (rules from the approved mock). Kidney tests
 * filed under biyokimya get their own "bobrek" group.
 */
export function normalizeCategory(
  raw: string | null | undefined,
  name: string,
): CategorySlug {
  const n = fold(name);
  let cat: CategorySlug | null = null;
  if (raw) {
    const key = raw.trim().toLowerCase();
    cat =
      LEGACY_CATEGORY[key] ??
      ((CATEGORY_ORDER as readonly string[]).includes(key)
        ? (key as CategorySlug)
        : null);
  }
  if (!cat) cat = INFER_RULES.find(([re]) => re.test(n))?.[1] ?? "diger";
  if (
    cat === "biyokimya" &&
    KIDNEY.test(fold(prettifyName(name))) &&
    !n.includes("spot")
  ) {
    cat = "bobrek";
  }
  return cat;
}

/* ------------------------------------------------------------ model */

/** Extraction leaves flags or dashes in the unit column ("H", "N", "-"). */
const JUNK_UNITS = new Set(["", "-", "–", ".", "h", "l", "n", "none", "null", "yok"]);
export function cleanUnit(u: string | null | undefined): string {
  let s = (u ?? "").trim();
  // a lab flag glued in front of the unit: "N.%", "H %"
  s = s.replace(/^[HLN][.\s]+(?=\S)/, "");
  return JUNK_UNITS.has(s.toLowerCase()) ? "" : s;
}
/** Comparable form: case, spaces, µ/μ/u, ³/^3 and a leading "x" don't make a different unit. */
export function unitKey(u: string): string {
  return cleanUnit(u)
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[µμ]/g, "u")
    .replace(/³/g, "^3")
    .replace(/⁶/g, "^6")
    .replace(/\*/g, "x")
    .replace(/^x(?=10)/, "")
    .replace(/^gr(?=\/)/, "g");
}

export function buildMetrics(
  raw: RawMetric[],
  values: RawValue[],
  opts: { trackingIds?: Set<string> } = {},
): DashMetric[] {
  const byMetric = new Map<string, Map<number, Pt>>();
  for (const v of values) {
    const t = toMs(v.date);
    if (!Number.isFinite(t) || !Number.isFinite(v.value)) continue;
    let series = byMetric.get(v.metric_id);
    if (!series) byMetric.set(v.metric_id, (series = new Map()));
    // one value per date: later entries (later uploads) win
    series.set(t, {
      t,
      v: v.value,
      refMin: v.ref_low ?? null,
      refMax: v.ref_high ?? null,
      unit: cleanUnit(v.unit),
    });
  }

  const tracking = opts.trackingIds ?? new Set<string>();
  const base = raw.map((m, order) => {
    const pts = [...(byMetric.get(m.id)?.values() ?? [])].sort(
      (a, b) => a.t - b.t,
    );
    return { m, order, pts, tracking: tracking.has(m.id) };
  });

  // "latest report" = most recent lab date (home measurements excluded)
  let latestT = 0;
  for (const b of base) {
    if (!b.tracking && b.pts.length) {
      latestT = Math.max(latestT, b.pts[b.pts.length - 1].t);
    }
  }

  return base.map(({ m, order, pts, tracking: isTracking }) => {
    const name = isTracking ? m.name : prettifyName(m.name);
    const aliases = m.aliases ?? [];
    // "the" range of a metric = the most recent result's own range
    const withRef = pts.findLast((p) => p.refMin != null || p.refMax != null);
    const ref_min = withRef ? withRef.refMin : m.ref_min;
    const ref_max = withRef ? withRef.refMax : m.ref_max;
    const dm: DashMetric = {
      id: m.id,
      name,
      full: m.name,
      unit: pts.findLast((p) => p.unit)?.unit ?? cleanUnit(m.unit),
      ref_min,
      ref_max,
      category: isTracking ? "takip" : normalizeCategory(m.category, m.name),
      aliases,
      order,
      tracking: isTracking,
      pts,
      idx: new Map(pts.map((p, i) => [p.t, i])),
      stat: computeStat({ ...m, ref_min, ref_max }, pts, latestT, isTracking),
      hay: "",
      fname: fold(name),
      words: [],
    };
    dm.hay = fold([name, m.name, ...aliases].join(" "));
    dm.words = dm.hay.split(/[^a-z0-9#%+]+/).filter(Boolean);
    return dm;
  });
}

/** Change between two points; null across a unit switch. */
export function changeBetween(prev: Pt | null, cur: Pt): number | null {
  if (!prev) return null;
  if (prev.unit && cur.unit && unitKey(prev.unit) !== unitKey(cur.unit)) return null;
  return cur.v - prev.v;
}

/**
 * What a card / picker row shows next to point `p`: the change since the
 * previous value, "first" when the series has exactly one value ("İlk
 * ölçüm"), or null when there is no comparable previous value (a unit
 * switch, or the earliest point of a longer series): show nothing then.
 */
export function changeAt(
  m: Pick<DashMetric, "idx" | "pts">,
  p: Pt,
): number | "first" | null {
  if (m.pts.length === 1) return "first";
  return changeBetween(prevOf(m, p.t), p);
}

export function prevOf(
  m: Pick<DashMetric, "idx" | "pts">,
  t: number,
): Pt | null {
  const i = m.idx.get(t);
  return i != null && i > 0 ? m.pts[i - 1] : null;
}

function computeStat(
  m: RawMetric,
  pts: Pt[],
  latestT: number,
  isTracking: boolean,
): MetricStat {
  const n = pts.length;
  const last = n ? pts[n - 1] : null;
  const prev = n > 1 ? pts[n - 2] : null;
  const refMin =
    last && (last.refMin != null || last.refMax != null)
      ? last.refMin
      : m.ref_min;
  const refMax =
    last && (last.refMin != null || last.refMax != null)
      ? last.refMax
      : m.ref_max;
  const hasRef = refMin != null || refMax != null;
  const st: Status = last ? statusOf(last.v, refMin, refMax) : "none";
  const out = isOut(st);
  const delta = last ? changeBetween(prev, last) : null;
  const rel =
    delta != null && last && prev
      ? Math.abs(delta) / Math.max(Math.abs(prev.v), Math.abs(last.v), 1e-9)
      : null;
  const width = rangeWidth(refMin, refMax);
  const share = delta != null && width != null ? Math.abs(delta) / width : null;
  const prevSt =
    prev && delta != null
      ? statusOf(
          prev.v,
          prev.refMin != null || prev.refMax != null ? prev.refMin : refMin,
          prev.refMin != null || prev.refMax != null ? prev.refMax : refMax,
        )
      : null;
  const crossed = !!prevSt && hasRef && isOut(prevSt) !== out;
  let sev = 0;
  if (out && last && width != null) {
    const dist = st === "low" ? refMin! - last.v : last.v - refMax!;
    sev = dist / width;
  }
  const ageDays = last && latestT ? (latestT - last.t) / DAY : Infinity;
  return {
    last,
    prev,
    st,
    out,
    hasRef,
    delta,
    rel,
    share,
    crossed,
    sev,
    ageDays: isTracking ? Math.max(0, ageDays) : ageDays,
    inLatest: !isTracking && !!last && last.t === latestT,
  };
}

/* ----------------------------------------------------- name variants */

/**
 * The same test under several names becomes one metric: names equal after
 * Turkish folding ("Potasyum" / "POTASYUM"), or names mapped to the same
 * metric definition with the same unit. Different units stay apart (BUN vs
 * Üre are different numbers). The first variant (profile order) is kept as
 * the id; the others become search aliases and their values move over.
 */
export function mergeVariants(
  metrics: RawMetric[],
  values: RawValue[],
): { metrics: RawMetric[]; values: RawValue[]; idMap: Map<string, string> } {
  const out: RawMetric[] = [];
  const byKey = new Map<string, RawMetric>();
  const idMap = new Map<string, string>();
  for (const m of metrics) {
    const keys = [`n:${fold(m.name)}`];
    if (m.metric_definition_id) {
      keys.push(`d:${m.metric_definition_id}:${unitKey(cleanUnit(m.unit))}`);
    }
    const first = keys.map((k) => byKey.get(k)).find(Boolean);
    if (!first) {
      const c = { ...m, aliases: [...(m.aliases ?? [])] };
      out.push(c);
      keys.forEach((k) => byKey.set(k, c));
      idMap.set(m.id, m.id);
    } else {
      idMap.set(m.id, first.id);
      first.aliases!.push(m.name, ...(m.aliases ?? []));
      // show the most descriptive spelling ("Monosit%" over "MON%"); the id stays
      if (m.name.length > first.name.length) {
        first.aliases!.push(first.name);
        first.name = m.name;
      }
      if (!first.category && m.category) first.category = m.category;
      keys.forEach((k) => !byKey.has(k) && byKey.set(k, first));
    }
  }
  return {
    metrics: out,
    values: values.map((v) => ({
      ...v,
      metric_id: idMap.get(v.metric_id) ?? v.metric_id,
    })),
    idMap,
  };
}

/* --------------------------------------------------------- empty state */

/** A change must move at least this share of the normal-range width to count. */
export const MIN_SHARE = 0.15;
/** ...or this much when the value crossed into or out of range. */
export const MIN_SHARE_CROSSED = 0.05;

/**
 * Empty-state "Ana ekran": metrics in the latest report that changed in a
 * way that matters, ranked by |Δ| / normal-range width; crossings first.
 * Metrics without a reference range are excluded (no yardstick).
 * Fallbacks when nothing qualifies: latest-report out-of-range values, then
 * the first latest-report metrics in profile order.
 */
export function pickDefaultHome(metrics: DashMetric[], n = 8): string[] {
  const latest = metrics.filter((m) => !m.tracking && m.stat.inLatest);
  const qualifies = (m: DashMetric) =>
    m.stat.share != null &&
    m.stat.share >= (m.stat.crossed ? MIN_SHARE_CROSSED : MIN_SHARE);
  const ranked = latest
    .filter(qualifies)
    .sort(
      (a, b) =>
        Number(b.stat.crossed) - Number(a.stat.crossed) ||
        b.stat.share! - a.stat.share! ||
        a.order - b.order,
    );
  if (ranked.length) return ranked.slice(0, n).map((m) => m.id);
  const out = latest
    .filter((m) => m.stat.out)
    .sort((a, b) => b.stat.sev - a.stat.sev || a.order - b.order);
  if (out.length) return out.slice(0, n).map((m) => m.id);
  return latest
    .sort((a, b) => a.order - b.order)
    .slice(0, n)
    .map((m) => m.id);
}

/* ------------------------------------------------------------- order */

/**
 * Charts follow the Ana ekran order; charts opened for other metrics come
 * after, in the order they were opened.
 */
export function orderCharts(selected: string[], home: string[]): string[] {
  const sel = new Set(selected);
  const fromHome = home.filter((id) => sel.has(id));
  const homeSet = new Set(home);
  return [...fromHome, ...selected.filter((id) => !homeSet.has(id))];
}

export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (from < 0 || from >= list.length || to < 0 || to >= list.length) {
    return list;
  }
  const next = list.slice();
  const [it] = next.splice(from, 1);
  next.splice(to, 0, it);
  return next;
}

/* --------------------------------------------------------- Ana ekran */

/**
 * Saved Ana ekran names -> metric ids. Variant spellings map to the merged
 * metric (`idMap`, then Turkish-folded names; a name shared by several
 * metrics goes to the one with the most results). Names that match nothing
 * yet are KEPT as they are: Kilo / Tansiyon ids appear only once the
 * tracking data has loaded, and dropping them here would delete them from
 * the server on the next edit.
 */
export function resolveHome(
  names: string[],
  metrics: Pick<DashMetric, "id" | "full" | "aliases" | "pts">[],
  idMap: Map<string, string> = new Map(),
): string[] {
  const ids = new Set(metrics.map((m) => m.id));
  const byFold = new Map<string, string>();
  const byData = [...metrics].sort((x, y) => y.pts.length - x.pts.length);
  for (const m of byData) {
    for (const n of [m.id, m.full, ...m.aliases]) {
      if (!byFold.has(fold(n))) byFold.set(fold(n), m.id);
    }
  }
  const out: string[] = [];
  for (const n of names) {
    const id = ids.has(n) ? n : (idMap.get(n) ?? byFold.get(fold(n)) ?? n);
    if (!out.includes(id)) out.push(id);
  }
  return out;
}

/**
 * A reorder only covers the cards on screen; ids not shown (not resolved
 * yet) keep their place at the end instead of being dropped.
 */
export function keepHidden(next: string[], full: string[]): string[] {
  const seen = new Set(next);
  return [...next, ...full.filter((id) => !seen.has(id))];
}

/**
 * "Geri al" for one add / remove: reverse only that toggle against the
 * current list, so changes made after it survive. A removed id goes back
 * to its old position (clamped).
 */
export function undoHomeToggle(
  current: string[],
  id: string,
  added: boolean,
  oldIndex: number,
): string[] {
  if (added) return current.filter((x) => x !== id);
  if (current.includes(id)) return current;
  const next = current.slice();
  next.splice(Math.max(0, Math.min(oldIndex, next.length)), 0, id);
  return next;
}

/* ------------------------------------------------------------- sort */

export type SortKind = "change" | "out" | "recent" | "az" | "own";
export const SORT_KINDS: SortKind[] = ["change", "out", "recent", "az", "own"];

const collator = new Intl.Collator("tr", {
  sensitivity: "base",
  numeric: true,
});

export function sorter(
  kind: SortKind,
  home: string[] = [],
): (a: DashMetric, b: DashMetric) => number {
  const homeIdx = new Map(home.map((id, i) => [id, i]));
  const name = (a: DashMetric, b: DashMetric) =>
    collator.compare(a.name, b.name);
  switch (kind) {
    case "change": {
      // recent changes first; ranged by share of range, unranged below them
      const sc = (s: MetricStat) =>
        s.delta == null || s.ageDays > 30
          ? -2
          : s.share != null
            ? s.share + (s.crossed ? 1 : 0)
            : (s.rel ?? 0) - 1.5;
      return (a, b) =>
        sc(b.stat) - sc(a.stat) ||
        a.stat.ageDays - b.stat.ageDays ||
        name(a, b);
    }
    case "out": {
      // out of range (recent first) > in range > no range
      const r = (s: MetricStat) =>
        s.out ? (s.ageDays <= 30 ? 3 : 2) : s.st === "none" ? 0 : 1;
      return (a, b) =>
        r(b.stat) - r(a.stat) ||
        b.stat.sev - a.stat.sev ||
        a.stat.ageDays - b.stat.ageDays ||
        name(a, b);
    }
    case "recent":
      return (a, b) =>
        a.stat.ageDays - b.stat.ageDays ||
        (b.stat.rel ?? 0) - (a.stat.rel ?? 0) ||
        name(a, b);
    case "az":
      return name;
    case "own":
      return (a, b) =>
        (homeIdx.get(a.id) ?? Infinity) - (homeIdx.get(b.id) ?? Infinity) ||
        a.order - b.order ||
        name(a, b);
  }
}

/* ------------------------------------------------------------ search */

/** Abbreviations / everyday names -> folded terms (from the approved mock). */
export const SEARCH_ALIASES: Record<string, string[]> = {
  hb: ["hemoglobin", "hgb"],
  hgb: ["hemoglobin"],
  hemoglobin: ["hgb"],
  plt: ["trombosit"],
  tromb: ["trombosit"],
  trombosit: ["plt"],
  platelet: ["trombosit"],
  wbc: ["lokosit"],
  bk: ["lokosit"],
  "beyaz kure": ["lokosit", "wbc"],
  lokosit: ["wbc"],
  rbc: ["eritrosit"],
  "kirmizi kure": ["eritrosit", "rbc"],
  eritrosit: ["rbc"],
  hct: ["hematokrit"],
  htc: ["hematokrit"],
  neu: ["notrofil"],
  neut: ["notrofil"],
  notrofil: ["neu"],
  lym: ["lenfosit"],
  lymph: ["lenfosit"],
  lenfosit: ["lym"],
  mono: ["monosit"],
  mon: ["monosit"],
  eos: ["eozinofil"],
  baso: ["bazofil"],
  bas: ["bazofil"],
  crp: ["c reaktif"],
  sgpt: ["alanin", "alt"],
  sgot: ["aspartat", "ast"],
  alt: ["alanin"],
  ast: ["aspartat"],
  ggt: ["gamma glutamil"],
  alp: ["alkalen fosfataz"],
  ldh: ["laktat dehidrogenaz", "laktik dehidrogenaz"],
  bun: ["kan ure azotu"],
  ure: ["bun", "kan ure azotu"],
  cr: ["kreatinin"],
  krea: ["kreatinin"],
  kreat: ["kreatinin"],
  gfr: ["egfr", "gfh", "glomeruler"],
  na: ["sodyum"],
  k: ["potasyum"],
  cl: ["klorur", "klor"],
  ca: ["kalsiyum"],
  mg: ["magnezyum"],
  p: ["fosfor"],
  fe: ["demir"],
  glu: ["glukoz"],
  seker: ["glukoz", "hba1c", "glike"],
  "kan sekeri": ["glukoz"],
  alb: ["albumin"],
  tp: ["total protein"],
  bil: ["bilirubin"],
  tbil: ["bilirubin"],
  dbil: ["bilirubin, direkt", "direkt bilirubin"],
  inr: ["inr"],
  pt: ["protrombin"],
  aptt: ["aptt"],
  sedim: ["sedimantasyon"],
  esr: ["sedimantasyon"],
  "vit d": ["vitamin d"],
  "d vit": ["vitamin d"],
  "d vitamini": ["vitamin d"],
  b12: ["b12"],
  tsh: ["tsh"],
  psa: ["psa", "prostat"],
  cea: ["karsinoembriyonik", "cea"],
  "ca 19": ["ca 19-9"],
  ca19: ["ca 19-9"],
  ca199: ["ca 19-9"],
  pct: ["plateletkrit", "prokalsitonin"],
  prokalsitonin: ["procalcitonin"],
  ferritin: ["ferritin"],
};

/** Shown as "“hb” = Hemoglobin" above the results. */
export const SEARCH_ALIAS_LABEL: Record<string, string> = {
  hb: "Hemoglobin",
  hgb: "Hemoglobin",
  plt: "Trombosit",
  wbc: "Lökosit",
  bk: "Lökosit",
  rbc: "Eritrosit",
  hct: "Hematokrit",
  neu: "Nötrofil",
  lym: "Lenfosit",
  crp: "C-reaktif protein",
  sgpt: "ALT",
  sgot: "AST",
  bun: "Kan üre azotu",
  cr: "Kreatinin",
  na: "Sodyum",
  k: "Potasyum",
  cl: "Klorür",
  ca: "Kalsiyum",
  mg: "Magnezyum",
  p: "Fosfor",
  fe: "Demir",
  glu: "Glukoz",
  seker: "Glukoz, HbA1c",
  alb: "Albümin",
  esr: "Sedimantasyon",
  pct: "Plateletkrit / Prokalsitonin",
  gfr: "eGFR",
  sedim: "Sedimantasyon",
  ldh: "Laktat dehidrogenaz",
  ggt: "GGT",
  alp: "Alkalen fosfataz",
};

export type SearchResult = {
  q: string;
  list: DashMetric[];
  alias: string | null;
};

/**
 * Turkish-aware search over display name, stored name, translations and
 * aliases. Ranks name-prefix > word-prefix > alias > substring; ties use
 * the current sort.
 */
export function searchMetrics(
  metrics: DashMetric[],
  qRaw: string,
  sort: (a: DashMetric, b: DashMetric) => number = () => 0,
): SearchResult | null {
  const q = fold(qRaw).trim().replace(/\s+/g, " ");
  if (!q) return null;
  const terms = new Set(SEARCH_ALIASES[q] || []);
  if (q.length >= 3) {
    for (const k in SEARCH_ALIASES) {
      if (k !== q && k.startsWith(q))
        SEARCH_ALIASES[k].forEach((t) => terms.add(t));
    }
  }
  const exact = !!SEARCH_ALIASES[q];
  const out: [DashMetric, number][] = [];
  for (const m of metrics) {
    let score = 0;
    if (q.length === 1) {
      if (m.words.includes(q)) score = 55;
    } else if (m.fname.startsWith(q)) score = q.length >= 4 ? 125 : 100;
    else if (m.words.some((w) => w.startsWith(q))) score = 85;
    else if (m.hay.includes(q)) score = q.length >= 3 ? 60 : 0;
    for (const t of terms) {
      if (m.fname.startsWith(t)) score = Math.max(score, exact ? 120 : 95);
      else if (t.length <= 4 && m.words.includes(t))
        score = Math.max(score, exact ? 110 : 80);
      else if (t.length > 4 && m.hay.includes(t)) score = Math.max(score, 75);
    }
    if (score) out.push([m, score]);
  }
  out.sort((x, y) => y[1] - x[1] || sort(x[0], y[0]));
  return {
    q,
    list: out.map((x) => x[0]),
    alias: SEARCH_ALIAS_LABEL[q] ?? null,
  };
}

/** Index range of the folded query inside the display name, for <mark>. */
export function highlightRange(
  name: string,
  q: string,
): [number, number] | null {
  if (!q || q.length < 2) return null;
  const i = fold(name).indexOf(q);
  return i < 0 ? null : [i, i + q.length];
}
