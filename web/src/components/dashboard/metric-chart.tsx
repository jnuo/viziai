"use client";

/**
 * One metric chart. Recharts draws axes, grid, bands, reference lines, the
 * line and dots; a custom child (<Overlay>) uses the plot area to add what
 * Recharts can't: collision-aware value labels, the off-scale "Normal
 * aralık ↑" edge strip, the average/pin pills and a shared hover/pin hit
 * area. The tooltip is HTML, positioned from the same scales, so every
 * chart can show the hovered / pinned date at once.
 */
import { memo, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
  usePlotArea,
} from "recharts";
import { useTranslations } from "next-intl";
import {
  personalBand,
  latestUnitPts,
  windowAverage,
  pointStatus,
  changeBetween,
  displayUnit,
  prevOf,
  isOut,
  unitKey,
  type DashMetric,
  type Pt,
  type Status,
} from "@/lib/chart/model";
import {
  yScale,
  timeTicks,
  placeLabels,
  fmtV,
  fmtDelta,
  textWidth,
  timeToX,
  type Box,
} from "@/lib/chart/scale";
import {
  IconX,
  rangeText,
  statusClass,
  type DateFormats,
  type ViewSettings,
} from "./shared";

type SetPinned = (fn: (cur: number | null) => number | null) => void;

type Props = {
  m: DashMetric;
  /** points inside the selected date range */
  pts: Pt[];
  xDom: [number, number];
  height: number;
  hover: number | null;
  pinned: number | null;
  setHover: (t: number | null) => void;
  setPinned: SetPinned;
  showAvg: boolean;
  view: ViewSettings;
  /** latest lab draw: "Kişisel aralık" counts its 90 days back from here */
  anchor: number;
  fmt: DateFormats;
  onShowNormal: () => void;
  onRemove: () => void;
};

type Plot = { x: number; y: number; width: number; height: number };
type Datum = {
  t: number;
  y: number;
  v: number;
  st: Status;
  clip: "up" | "down" | null;
};
type BandRun = {
  x0: number;
  x1: number;
  lo: number | null;
  hi: number | null;
};

const STATUS_COLOR: Record<Status, string> = {
  ok: "var(--vz-normal-dot)",
  low: "var(--vz-critical)",
  high: "var(--vz-critical)",
  none: "var(--vz-neutral)",
};

/** Ranges within 2% of their width count as the same (lab rounding). */
function sameRange(r: BandRun, lo: number | null, hi: number | null): boolean {
  if ((r.lo == null) !== (lo == null) || (r.hi == null) !== (hi == null)) return false;
  const width = Math.abs((hi ?? lo ?? 0) - (lo ?? hi ?? 0)) || Math.abs(hi ?? lo ?? 1);
  const tol = width * 0.02;
  return (
    (lo == null || Math.abs(r.lo! - lo) <= tol) && (hi == null || Math.abs(r.hi! - hi) <= tol)
  );
}

/** Consecutive points sharing a reference range form one band segment. */
function bandRuns(m: DashMetric, pts: Pt[], xDom: [number, number]): BandRun[] {
  const runs: BandRun[] = [];
  pts.forEach((p, i) => {
    const own = p.refMin != null || p.refMax != null;
    const lo = own ? p.refMin : m.ref_min;
    const hi = own ? p.refMax : m.ref_max;
    const last = runs[runs.length - 1];
    if (last && sameRange(last, lo, hi)) return;
    const x0 = i === 0 ? xDom[0] : (pts[i - 1].t + p.t) / 2;
    if (last) last.x1 = x0;
    runs.push({ x0, x1: xDom[1], lo, hi });
  });
  return runs.filter((r) => r.lo != null || r.hi != null);
}

function MetricChartImpl(props: Props) {
  const {
    m,
    pts,
    xDom,
    height,
    hover,
    pinned,
    setHover,
    setPinned,
    showAvg,
    view,
    anchor,
    fmt,
    onShowNormal,
    onRemove,
  } = props;
  const t = useTranslations("pages.dashboard.chart");
  const ts = useTranslations("pages.dashboard.status");
  const td = useTranslations("pages.dashboard");
  const [plot, setPlot] = useState<Plot | null>(null);

  const refMin = m.ref_min;
  const refMax = m.ref_max;
  const rt = rangeText(refMin, refMax);
  const unit = displayUnit(m.unit);
  // Kilo / Tansiyon end at their own latest reading, lab metrics at the draw
  const bandEnd = m.tracking ? (m.stat.last?.t ?? anchor) : anchor;
  const pers = useMemo(
    () => (view.pers && pts.length > 1 ? personalBand(latestUnitPts(m.pts).pts, bandEnd) : null),
    [view.pers, pts.length, m.pts, bandEnd],
  );
  // average and y-scale only over the latest unit: a window that switched
  // from mg/dL to mmol/L gets no average line rather than a wrong one
  const sameUnit = latestUnitPts(pts);
  const vals = sameUnit.pts.map((p) => p.v);
  const avg = windowAverage(pts);
  const avgMixed = showAvg && pts.length > 0 && avg == null;
  const latestVisible = pts[pts.length - 1];
  const badgeSt = latestVisible ? pointStatus(m, latestVisible) : "none";

  const head = (
    <div className="ch-row">
      <span className="ch-title" title={m.full}>
        {m.name}
      </span>
      {latestVisible && (
        <span className={`vz-badge ${statusClass(badgeSt)}`}>
          {fmtV(latestVisible.v)} {displayUnit(latestVisible.unit || m.unit)}
        </span>
      )}
      <button
        type="button"
        className="vz-icon-btn"
        aria-label={t("remove")}
        title={t("remove")}
        onClick={onRemove}
      >
        <IconX size={13} />
      </button>
    </div>
  );
  const caption = (
    <div className="vz-caption">
      {rt && (
        <span className="it">
          <span className="vz-swatch" />
          {t("normal", { range: rt, unit })}
        </span>
      )}
      {pers && (
        <span className="it" title={t("personalTitle")}>
          <span className="vz-swatch pers" />
          {t("personal", { range: `${fmtV(pers[0])}–${fmtV(pers[1])}` })}
        </span>
      )}
      {!view.full && pts.length > 0 && (
        <span className="it scale">{t("scale")}</span>
      )}
      {avgMixed && <span className="it">{td("avgMixedUnits")}</span>}
    </div>
  );

  if (!pts.length) {
    return (
      <div className="vz-card vz-chart-card" data-metric={m.id}>
        {head}
        {caption}
        <div className="vz-empty" style={{ height }}>
          {t("noData")}
        </div>
      </div>
    );
  }

  const H = height;
  const nT = H < 240 ? 4 : H < 340 ? 5 : 6;
  const extra: number[] = [];
  if (showAvg && avg != null) extra.push(avg);
  if (pers) extra.push(...pers);
  const ys = yScale(vals, {
    extra,
    full: view.full,
    refMin,
    refMax,
    nTicks: nT,
  });
  const fmtY = (v: number) => v.toFixed(ys.decimals);
  const labW = Math.max(
    26,
    Math.max(...ys.ticks.map((v) => fmtY(v).length)) * 6 + 10,
  );

  const data: Datum[] = pts.map((p) => ({
    t: p.t,
    v: p.v,
    y: Math.min(ys.y1, Math.max(ys.y0, p.v)),
    st: pointStatus(m, p),
    clip: p.v > ys.y1 ? "up" : p.v < ys.y0 ? "down" : null,
  }));
  const runs = bandRuns(m, pts, xDom);

  const pw = plot?.width ?? 400;
  const xt = timeTicks(xDom[0], xDom[1], pw);
  const tickLabel = (v: number) => {
    const tk = xt.find((x) => x.t === v);
    if (!tk || tk.unit === "day") return fmt.dayMon(v);
    if (tk.unit === "year") return fmt.year(v);
    return tk.first || new Date(v).getUTCMonth() === 0
      ? fmt.monYear(v)
      : fmt.mon(v);
  };
  const xTicks = xt
    .filter((tk) => {
      if (!plot) return true;
      const x = timeToX(tk.t, xDom, plot.x, plot.width);
      const w = tickLabel(tk.t).length * 5.6;
      return x - w / 2 >= 2 && x + w / 2 <= plot.x + plot.width + 12 - 2;
    })
    .map((tk) => tk.t);

  const active = hover ?? pinned;
  const inDom = (v: number | null): v is number =>
    v != null && v >= xDom[0] && v <= xDom[1];
  const big = pts.length > 40;
  const single = pts.length === 1;

  const renderDot = (dp: { cx?: number; cy?: number; payload?: Datum }) => {
    const { cx, cy, payload } = dp;
    if (cx == null || cy == null || !payload)
      return <g key={`d-${dp.payload?.t ?? Math.random()}`} />;
    const act = payload.t === active;
    const r = act ? 6 : big ? 3 : 4;
    const c = STATUS_COLOR[payload.st];
    const out = isOut(payload.st);
    if (payload.clip) {
      // inside the plot (Recharts clips dots to it), apex on the edge
      const dir = payload.clip === "up" ? 1 : -1;
      return (
        <g key={`d-${payload.t}`}>
          <path
            d={`M${cx - 6},${cy + dir * 9} L${cx + 6},${cy + dir * 9} L${cx},${cy + dir} Z`}
            fill={c}
            stroke="var(--vz-card)"
            strokeWidth={1}
          >
            <title>{t("outlier", { value: fmtV(payload.v) })}</title>
          </path>
        </g>
      );
    }
    // in range = hollow ring, out of range = filled terracotta, no range = filled grey
    return (
      <g key={`d-${payload.t}`}>
        <circle cx={cx} cy={cy} r={r + 2} fill="var(--vz-card)" />
        <circle
          cx={cx}
          cy={cy}
          r={payload.st === "ok" ? r - 0.75 : r}
          fill={payload.st === "ok" ? "var(--vz-card)" : c}
          stroke={payload.st === "ok" ? c : "none"}
          strokeWidth={payload.st === "ok" ? 2 : 0}
        />
        {out && act && (
          <circle
            cx={cx}
            cy={cy}
            r={r + 3}
            fill="none"
            stroke={c}
            strokeOpacity={0.35}
          />
        )}
      </g>
    );
  };

  // HTML tooltip from the same scales
  let tip: React.ReactNode = null;
  if (plot && inDom(active)) {
    const X = (v: number) => timeToX(v, xDom, plot.x, plot.width);
    const Y = (v: number) =>
      plot.y + (1 - (v - ys.y0) / (ys.y1 - ys.y0)) * plot.height;
    const p = m.idx.has(active) ? m.pts[m.idx.get(active)!] : null;
    const visibleP = p && pts.some((q) => q.t === p.t) ? p : null;
    const ax = X(active);
    const right = ax < (plot.x + plot.width) * 0.58;
    const ty = visibleP
      ? Y(Math.min(ys.y1, Math.max(ys.y0, visibleP.v)))
      : plot.y + 4;
    const below = ty < 64;
    const st = visibleP ? pointStatus(m, visibleP) : null;
    const prev = visibleP ? prevOf(m, visibleP.t) : null;
    const dl = visibleP && prev ? changeBetween(prev, visibleP) : null;
    tip = (
      <div
        className="vz-tip"
        style={{
          left: ax + (right ? 12 : -12),
          top: below ? ty + 10 : ty - 10,
          transform: `translate(${right ? "0" : "-100%"}, ${below ? "0" : "-100%"})`,
        }}
      >
        <div className="tip-date">
          {fmt.long(active)}
          {pinned === active ? ` · ${t("pinned")}` : ""}
        </div>
        {visibleP && st ? (
          <>
            <div className="tip-val">
              {fmtV(visibleP.v)}
              <span className="u">{displayUnit(visibleP.unit || m.unit)}</span>
            </div>
            <div className="tip-meta">
              <span className={`sdot ${statusClass(st)}`} />
              {ts(st)}
              {dl != null ? ` · ${t("vsPrev", { delta: fmtDelta(dl) })}` : ""}
            </div>
          </>
        ) : (
          <div className="tip-meta">{t("noMeasurementOnDate")}</div>
        )}
      </div>
    );
  }

  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Escape") {
      setPinned(() => null);
      return;
    }
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    setPinned((cur) => {
      let i = cur != null ? pts.findIndex((p) => p.t >= cur) : pts.length;
      if (i < 0) i = pts.length;
      const exact = cur != null && pts[i] && pts[i].t === cur;
      i = e.key === "ArrowLeft" ? i - 1 : exact ? i + 1 : i;
      return pts[Math.max(0, Math.min(pts.length - 1, i))].t;
    });
  };

  return (
    <div className="vz-card vz-chart-card" data-metric={m.id}>
      {head}
      {caption}
      <div
        className="vz-plot"
        tabIndex={0}
        role="group"
        aria-label={t("aria", { name: m.name, count: pts.length })}
        onKeyDown={onKey}
      >
        <ResponsiveContainer width="100%" height={H} debounce={50}>
          <LineChart
            data={data}
            margin={{ top: 20, right: 12, bottom: 0, left: 0 }}
            accessibilityLayer={false}
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--vz-grid)"
              strokeDasharray="0"
            />
            <XAxis
              dataKey="t"
              type="number"
              scale="time"
              domain={xDom}
              allowDataOverflow
              ticks={xTicks}
              interval={0}
              tickFormatter={tickLabel}
              tick={{ fontSize: 10, fill: "var(--vz-muted-fg)" }}
              tickLine={false}
              axisLine={false}
              height={24}
            />
            <YAxis
              type="number"
              domain={[ys.y0, ys.y1]}
              ticks={ys.ticks}
              interval={0}
              allowDataOverflow
              tickFormatter={fmtY}
              tick={{ fontSize: 10, fill: "var(--vz-muted-fg)" }}
              tickLine={false}
              axisLine={false}
              width={labW}
            />
            {pers && !single && (
              <ReferenceArea
                y1={Math.max(pers[0], ys.y0)}
                y2={Math.min(pers[1], ys.y1)}
                fill="var(--vz-personal)"
                fillOpacity={1}
                stroke="var(--vz-personal-edge)"
                ifOverflow="hidden"
              />
            )}
            {runs.map((r, i) => {
              const lo = r.lo ?? -Infinity;
              const hi = r.hi ?? Infinity;
              if (lo > ys.y1 || hi < ys.y0) return null;
              return (
                <ReferenceArea
                  key={`band-${i}`}
                  x1={Math.max(r.x0, xDom[0])}
                  x2={Math.min(r.x1, xDom[1])}
                  y1={Math.max(lo, ys.y0)}
                  y2={Math.min(hi, ys.y1)}
                  fill="var(--vz-band)"
                  fillOpacity={1}
                  stroke="none"
                  ifOverflow="hidden"
                />
              );
            })}
            {runs.flatMap((r, i) =>
              [r.lo, r.hi]
                .filter(
                  (b): b is number => b != null && b >= ys.y0 && b <= ys.y1,
                )
                .map((b, j) => (
                  <ReferenceLine
                    key={`edge-${i}-${j}`}
                    segment={[
                      { x: Math.max(r.x0, xDom[0]), y: b },
                      { x: Math.min(r.x1, xDom[1]), y: b },
                    ]}
                    stroke="var(--vz-band-edge)"
                    strokeWidth={1}
                    ifOverflow="hidden"
                  />
                )),
            )}
            {showAvg && avg != null && (
              <ReferenceLine
                y={avg}
                stroke="var(--vz-fg)"
                strokeOpacity={0.5}
                strokeWidth={1.25}
                ifOverflow="hidden"
              />
            )}
            {inDom(pinned) && (
              <ReferenceLine
                x={pinned}
                stroke="var(--vz-primary)"
                strokeWidth={1.5}
              />
            )}
            {hover != null && hover !== pinned && inDom(hover) && (
              <ReferenceLine
                x={hover}
                stroke="var(--vz-fg)"
                strokeOpacity={0.3}
                strokeWidth={1}
              />
            )}
            <Line
              dataKey="y"
              type="linear"
              stroke={single ? "none" : "var(--vz-line)"}
              strokeOpacity={0.8}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              dot={renderDot}
              activeDot={false}
              isAnimationActive={false}
            />
            <Overlay
              m={m}
              pts={pts}
              data={data}
              xDom={xDom}
              y0={ys.y0}
              y1={ys.y1}
              runs={runs}
              latestRange={rt}
              unit={unit}
              showAvg={showAvg}
              avg={avg}
              labels={view.labels}
              pinned={pinned}
              hover={hover}
              setHover={setHover}
              setPinned={setPinned}
              onShowNormal={onShowNormal}
              onPlot={setPlot}
              fmt={fmt}
            />
          </LineChart>
        </ResponsiveContainer>
        {tip}
      </div>
    </div>
  );
}

type OverlayProps = {
  m: DashMetric;
  pts: Pt[];
  data: Datum[];
  xDom: [number, number];
  y0: number;
  y1: number;
  runs: BandRun[];
  latestRange: string | null;
  unit: string;
  showAvg: boolean;
  avg: number | null;
  labels: boolean;
  pinned: number | null;
  hover: number | null;
  setHover: (t: number | null) => void;
  setPinned: SetPinned;
  onShowNormal: () => void;
  onPlot: (p: Plot | null) => void;
  fmt: DateFormats;
};

function Overlay(p: OverlayProps) {
  const t = useTranslations("pages.dashboard.chart");
  const plot = usePlotArea();
  const { onPlot } = p;
  const px = plot?.x ?? 0;
  const py = plot?.y ?? 0;
  const pwid = plot?.width ?? 0;
  const phei = plot?.height ?? 0;
  useEffect(() => {
    if (!pwid) return;
    onPlot({ x: px, y: py, width: pwid, height: phei });
  }, [px, py, pwid, phei, onPlot]);
  if (!plot || plot.width <= 0) return null;

  const { xDom, y0, y1 } = p;
  const X = (v: number) => timeToX(v, xDom, plot.x, plot.width);
  const Y = (v: number) => plot.y + (1 - (v - y0) / (y1 - y0)) * plot.height;
  const right = plot.x + plot.width;
  const bottom = plot.y + plot.height;
  const obstacles: Box[] = [];
  const nodes: React.ReactNode[] = [];

  // Off-scale normal range: a thin strip at the edge for each such segment,
  // and a clickable label for the latest one ("Normal aralık ↑ 117–354").
  p.runs.forEach((r, i) => {
    const lo = r.lo ?? -Infinity;
    const hi = r.hi ?? Infinity;
    if (!(lo > y1 || hi < y0)) return;
    const up = lo > y1;
    const x0 = Math.max(X(r.x0), plot.x);
    const x1 = Math.min(X(r.x1), right);
    nodes.push(
      <rect
        key={`strip-${i}`}
        x={x0}
        y={up ? plot.y - 3 : bottom}
        width={Math.max(0, x1 - x0)}
        height={3}
        rx={1.5}
        fill="var(--vz-normal-dot)"
        fillOpacity={0.55}
      />,
    );
    if (i === p.runs.length - 1 && p.latestRange) {
      const txt = t("normalEdge", {
        arrow: up ? "↑" : "↓",
        range: p.latestRange,
      });
      const w = txt.length * 5.6 + 8;
      const ty = up ? plot.y + 11 : bottom - 6;
      // left end of the latest strip: the newest points (and their labels,
      // which are never dropped) sit at the right
      const hx = Math.max(plot.x, Math.min(x0, right - w));
      obstacles.push({ x0: hx, x1: hx + w, y0: ty - 11, y1: ty + 4 });
      const act = (e: React.SyntheticEvent) => {
        e.stopPropagation();
        p.onShowNormal();
      };
      nodes.push(
        <g
          key="edge-btn"
          className="vz-edge-btn"
          role="button"
          tabIndex={0}
          aria-label={`${t("showNormal")} (${p.latestRange} ${p.unit})`}
          onClick={act}
          onPointerMove={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              act(e);
            }
          }}
        >
          <title>{t("showNormal")}</title>
          <rect
            className="vz-edge-hit"
            x={hx}
            y={ty - 16}
            width={w}
            height={24}
            rx={6}
          />
          <text className="vz-edge-lbl" x={hx + 4} y={ty} textAnchor="start">
            {txt}
          </text>
        </g>,
      );
    }
  });

  // Average pill
  if (p.showAvg && p.avg != null) {
    const txt = t("avg", { value: fmtV(p.avg) });
    const w = txt.length * 5.8 + 10;
    const ay = Y(p.avg);
    const bx = right - w - 2;
    if (ay >= plot.y && ay <= bottom) {
      obstacles.push({ x0: bx, x1: bx + w, y0: ay - 8, y1: ay + 8 });
      nodes.push(
        <g key="avg">
          <rect
            x={bx}
            y={ay - 8}
            width={w}
            height={16}
            rx={8}
            fill="var(--vz-card)"
            stroke="var(--vz-fg)"
            strokeOpacity={0.35}
          />
          <text
            className="vz-avg-pill"
            x={bx + w / 2}
            y={ay + 3.5}
            textAnchor="middle"
          >
            {txt}
          </text>
        </g>,
      );
    }
  }

  // Unit switches: a small tick on the x-axis (tooltip says what changed);
  // no change is computed across it
  p.pts.forEach((pt, i) => {
    const prev = p.pts[i - 1];
    if (!prev || !prev.unit || !pt.unit || unitKey(prev.unit) === unitKey(pt.unit)) return;
    const x = X((prev.t + pt.t) / 2);
    nodes.push(
      <g key={`unit-${pt.t}`}>
        <title>
          {t("unitChanged", {
            from: displayUnit(prev.unit),
            to: displayUnit(pt.unit),
          })}
        </title>
        <line x1={x} x2={x} y1={bottom - 5} y2={bottom + 3} stroke="var(--vz-muted-fg)" strokeWidth={1.5} />
        <rect x={x - 6} y={bottom - 8} width={12} height={14} fill="transparent" />
      </g>,
    );
  });

  // Value labels ("9.8 ↑0.1"), thinned, never overlapping
  const labels = p.labels
    ? placeLabels(
        p.data.map((d) => {
          const full = p.m.pts[p.m.idx.get(d.t)!];
          const prev = prevOf(p.m, d.t);
          const dl = full && prev ? changeBetween(prev, full) : null;
          return {
            x: X(d.t),
            y: Y(d.y),
            v: d.v,
            txt: fmtV(d.v),
            dl: dl != null ? fmtDelta(dl) : "",
          };
        }),
        { x0: plot.x + 1, x1: right + 10, y0: 0, y1: bottom },
        obstacles,
        p.pinned != null ? p.data.findIndex((d) => d.t === p.pinned) : null,
      )
    : [];

  const inDom = (v: number | null): v is number =>
    v != null && v >= xDom[0] && v <= xDom[1];
  const nearest = (
    e: React.PointerEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>,
  ) => {
    const svgEl = e.currentTarget.ownerSVGElement;
    if (!svgEl) return null;
    const r = svgEl.getBoundingClientRect();
    const x = e.clientX - r.left;
    let best: Datum | null = null;
    let bd = Infinity;
    for (const d of p.data) {
      const dd = Math.abs(X(d.t) - x);
      if (dd < bd) {
        bd = dd;
        best = d;
      }
    }
    return best;
  };

  let pinPill: React.ReactNode = null;
  if (inDom(p.pinned)) {
    const txt = p.fmt.dayMon(p.pinned);
    const w = textWidth(txt, 5.9) + 12;
    const x = Math.max(1, Math.min(X(p.pinned) - w / 2, right + 10 - w));
    pinPill = (
      <g key="pin-pill" pointerEvents="none">
        <rect
          x={x}
          y={bottom + 4}
          width={w}
          height={16}
          rx={8}
          fill="var(--vz-primary)"
        />
        <text
          className="vz-pin-pill"
          x={x + w / 2}
          y={bottom + 15.5}
          textAnchor="middle"
        >
          {txt}
        </text>
      </g>
    );
  }

  return (
    <g className="vz-overlay">
      <rect
        className="vz-hit"
        x={plot.x}
        y={plot.y - 6}
        width={plot.width}
        height={plot.height + 6}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const d = nearest(e);
          if (d && d.t !== p.hover) p.setHover(d.t);
        }}
        onPointerLeave={() => p.setHover(null)}
        onClick={(e) => {
          const d = nearest(e);
          if (d) p.setPinned((cur) => (cur === d.t ? null : d.t));
        }}
      />
      {nodes}
      {labels.map((l) => (
        <text
          key={`l-${l.i}`}
          className="vz-lbl"
          x={l.x}
          y={l.y}
          textAnchor="middle"
        >
          {l.txt}
          {l.dl && (
            <tspan className="dl" dx={3}>
              {l.dl}
            </tspan>
          )}
        </text>
      ))}
      {pinPill}
    </g>
  );
}

export const MetricChart = memo(MetricChartImpl);
