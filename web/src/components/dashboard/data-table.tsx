"use client";

import { useEffect, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  changeBetween,
  displayUnit,
  pointStatus,
  statusOf,
  type DashMetric,
  type Pt,
} from "@/lib/chart/model";
import { fmtDelta, fmtV } from "@/lib/chart/scale";
import { metricRangeText, statusClass, type DateFormats } from "./shared";

type Props = {
  metrics: DashMetric[];
  vis: Map<string, Pt[]>;
  pinned: number | null;
  setPinned: (fn: (cur: number | null) => number | null) => void;
  showAvg: boolean;
  fmt: DateFormats;
};

/** One combined table: dates as rows (newest first), metrics as columns. */
export function DataTable({
  metrics,
  vis,
  pinned,
  setPinned,
  showAvg,
  fmt,
}: Props) {
  const t = useTranslations("pages.dashboard.table");
  const ts = useTranslations("pages.dashboard.status");
  const wrapRef = useRef<HTMLDivElement>(null);
  const dates = useMemo(() => {
    const s = new Set<number>();
    metrics.forEach((m) => (vis.get(m.id) ?? []).forEach((p) => s.add(p.t)));
    return [...s].sort((a, b) => b - a);
  }, [metrics, vis]);

  // bring the pinned row into view when entering table mode
  useEffect(() => {
    if (pinned == null || !wrapRef.current) return;
    const row = wrapRef.current.querySelector<HTMLTableRowElement>(
      `tr[data-t="${pinned}"]`,
    );
    if (row) {
      wrapRef.current.scrollTop =
        row.offsetTop - wrapRef.current.clientHeight / 2 + row.offsetHeight / 2;
    }
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!dates.length) {
    return <div className="vz-card vz-select-hint">{t("noData")}</div>;
  }
  const toggle = (d: number) => setPinned((c) => (c === d ? null : d));

  return (
    <div className="vz-card vz-table-card">
      <div className="vz-twrap" ref={wrapRef}>
        <table>
          <thead>
            <tr>
              <th>
                <div className="th-name">{t("date")}</div>
                <div className="th-sub">
                  {t("days", { count: dates.length })}
                </div>
              </th>
              {metrics.map((m) => {
                const rt = metricRangeText(m);
                return (
                  <th key={m.id} title={m.full}>
                    <div className="th-name">{m.name}</div>
                    <div className="th-sub">
                      {displayUnit(m.unit)}
                      {rt ? ` · ${t("normal", { range: rt })}` : ""}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {dates.map((d) => (
              <tr
                key={d}
                data-t={d}
                className={`row${pinned === d ? " pinned" : ""}`}
                tabIndex={0}
                aria-selected={pinned === d}
                onClick={() => toggle(d)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggle(d);
                  } else if (e.key === "Escape") {
                    setPinned(() => null);
                  } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                    e.preventDefault();
                    const sib =
                      e.key === "ArrowDown"
                        ? e.currentTarget.nextElementSibling
                        : e.currentTarget.previousElementSibling;
                    (sib as HTMLElement | null)?.focus();
                  }
                }}
              >
                <td className="date">
                  <span className="only-desk">{fmt.long(d)}</span>
                  <span className="only-phone">{fmt.short(d)}</span>
                </td>
                {metrics.map((m) => {
                  const i = m.idx.get(d);
                  if (i == null) {
                    return (
                      <td key={m.id} className="na" title={t("notMeasured")}>
                        —
                      </td>
                    );
                  }
                  const p = m.pts[i];
                  const prev = i > 0 ? m.pts[i - 1] : null;
                  const st = pointStatus(m, p);
                  const dl = changeBetween(prev, p);
                  return (
                    <td key={m.id} title={ts(st)}>
                      <span className="cell">
                        <span className={`sdot ${statusClass(st)}`} />
                        <span className="v">{fmtV(p.v)}</span>
                        <span className="d">
                          {dl != null ? fmtDelta(dl) : ""}
                        </span>
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          {showAvg && (
            <tfoot>
              <tr>
                <td>{t("average")}</td>
                {metrics.map((m) => {
                  const v = vis.get(m.id) ?? [];
                  if (!v.length) {
                    return (
                      <td key={m.id} className="na">
                        —
                      </td>
                    );
                  }
                  const a = v.reduce((s, p) => s + p.v, 0) / v.length;
                  const st = statusOf(a, m.ref_min, m.ref_max);
                  return (
                    <td key={m.id}>
                      <span className="cell">
                        <span className={`sdot ${statusClass(st)}`} />
                        <span className="v">{fmtV(a)}</span>
                        <span className="d">
                          {t("nValues", { count: v.length })}
                        </span>
                      </span>
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
