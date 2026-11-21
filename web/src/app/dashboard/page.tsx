"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { OnboardingChecklist } from "@/components/onboarding-checklist";
import { GhostedChart } from "@/components/ghosted-chart";
import { Header } from "@/components/header";
import { LoadingState, ErrorState } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { useActiveProfile } from "@/hooks/use-active-profile";
import { track } from "@/lib/track";
import { reportError } from "@/lib/error-reporting";
import type { TrackingMeasurement } from "@/lib/tracking";
import {
  DAY,
  buildMetrics,
  fold,
  mergeVariants,
  orderCharts,
  pickDefaultHome,
  todayUtc,
  SORT_KINDS,
  type DashMetric,
  type Pt,
  type RawMetric,
  type RawValue,
} from "@/lib/chart/model";
import { MetricChart } from "@/components/dashboard/metric-chart";
import { DataTable } from "@/components/dashboard/data-table";
import { ViewMenu } from "@/components/dashboard/view-menu";
import { HomeCards } from "@/components/dashboard/home-cards";
import {
  MetricPicker,
  type PickerPrefs,
} from "@/components/dashboard/metric-picker";
import {
  CHART_HEIGHTS,
  IconList,
  IconSearch,
  IconX,
  loadView,
  makeDateFormats,
  saveView,
  store,
  useMedia,
  type ViewSettings,
} from "@/components/dashboard/shared";
import "@/components/dashboard/dashboard.css";

type ApiMetric = RawMetric;
type ApiData = {
  metrics: ApiMetric[];
  values: RawValue[];
  reportCount: number;
};

const DATE_RANGES = ["all", "90", "30", "15"] as const;
type DateRange = (typeof DATE_RANGES)[number];
const K_RANGE = "viziai.dashboard.range";
type Mode = "chart" | "table";

const K_PICKER = "viziai.dashboard.picker";
const kCharts = (profileId: string) => `viziai.dashboard.charts.${profileId}`;
const HOME_SAVE_DEBOUNCE = 400;

function loadPickerPrefs(): PickerPrefs {
  const v = store.get<Partial<PickerPrefs>>(K_PICKER, {}) || {};
  return {
    sort: v.sort && SORT_KINDS.includes(v.sort) ? v.sort : "change",
    collapsed:
      v.collapsed && typeof v.collapsed === "object" ? v.collapsed : {},
  };
}

export default function Dashboard(): React.ReactElement | null {
  const router = useRouter();
  const { addToast } = useToast();
  const t = useTranslations("pages.dashboard");
  const locale = useLocale();
  const fmt = useMemo(() => makeDateFormats(locale), [locale]);

  const {
    activeProfile,
    activeProfileId,
    loading: profileLoading,
    needsOnboarding,
    error: profileError,
  } = useActiveProfile();
  const canEdit = !!activeProfile && activeProfile.access_level !== "viewer";

  const [data, setData] = useState<ApiData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackingData, setTrackingData] = useState<TrackingMeasurement[]>([]);
  /** Ana ekran (metric ids, ordered); null until loaded */
  const [home, setHome] = useState<string[] | null>(null);
  const [selected, setSelectedState] = useState<string[] | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    if (typeof window === "undefined") return "all";
    const v = store.get<string>(K_RANGE, "all");
    return (DATE_RANGES as readonly string[]).includes(v) ? (v as DateRange) : "all";
  });
  const [showAvg, setShowAvg] = useState(false);
  const [mode, setMode] = useState<Mode>("chart");
  const [hover, setHover] = useState<number | null>(null);
  const [pinned, setPinnedState] = useState<number | null>(null);
  const [view, setViewState] = useState<ViewSettings>(() =>
    typeof window === "undefined"
      ? { full: false, pers: false, labels: true, cols: 2, size: "m" }
      : loadView(),
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [prefs, setPrefsState] = useState<PickerPrefs>(() =>
    typeof window === "undefined"
      ? { sort: "change", collapsed: {} }
      : loadPickerPrefs(),
  );
  const isPhone = useMedia("(max-width: 639px)");
  const isWide = useMedia("(min-width: 1280px)");
  const openerRef = useRef<HTMLElement | null>(null);
  const allValuesBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (needsOnboarding) router.push("/onboarding");
  }, [needsOnboarding, router]);

  useEffect(() => {
    if (profileError)
      addToast({ type: "error", message: profileError, duration: 5000 });
  }, [profileError, addToast]);

  /* ------------------------------------------------------------ loading */

  const [homeNames, setHomeNames] = useState<string[] | null>(null);
  useEffect(() => {
    if (profileLoading || !activeProfileId) return;
    let ignore = false;
    setHome(null);
    setHomeNames(null);
    setSelectedState(null);
    setPinnedState(null);
    async function load() {
      try {
        const [res, prefRes] = await Promise.all([
          fetch(`/api/metrics?profileId=${activeProfileId}`, {
            cache: "no-store",
          }),
          fetch(`/api/metric-order?profileId=${activeProfileId}`, {
            cache: "no-store",
          }),
        ]);
        if (!res.ok) throw new Error("Failed to load data");
        const json = (await res.json()) as ApiData;
        let names: string[] = [];
        if (prefRes.ok) {
          const p = await prefRes.json();
          names = Array.isArray(p.home) ? p.home : [];
        } else if (!ignore) {
          addToast({
            type: "error",
            message: t("metricOrderFailed"),
            duration: 5000,
          });
        }
        if (!ignore) {
          setData({ ...json, ...mergeVariants(json.metrics, json.values) });
          setHomeNames(names);
        }
      } catch (e: unknown) {
        const msg = (e as Error)?.message ?? t("dataLoadFailed");
        reportError(e, {
          op: "dashboard.loadMetrics",
          profileId: activeProfileId,
        });
        if (!ignore) {
          setError(msg);
          addToast({
            type: "error",
            message: `${t("dataLoadFailed")}: ${msg}`,
            duration: 5000,
          });
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfileId, profileLoading]);

  useEffect(() => {
    if (profileLoading || !activeProfileId) return;
    let ignore = false;
    async function loadTracking() {
      try {
        const res = await fetch(
          `/api/tracking?profileId=${activeProfileId}&limit=200`,
        );
        if (res.ok) {
          const json = await res.json();
          if (!ignore) setTrackingData(json.measurements || []);
        }
      } catch (e) {
        reportError(e, {
          op: "dashboard.loadTracking",
          profileId: activeProfileId,
        });
      }
    }
    loadTracking();
    const handler = () => loadTracking();
    window.addEventListener("tracking-updated", handler);
    return () => {
      ignore = true;
      window.removeEventListener("tracking-updated", handler);
    };
  }, [activeProfileId, profileLoading]);

  /* -------------------------------------------------------------- model */

  const metrics = useMemo<DashMetric[]>(() => {
    if (!data) return [];
    const raw: RawMetric[] = [];
    const vals: RawValue[] = [];
    const trackingIds = new Set<string>();
    const weight = trackingData.filter((m) => m.type === "weight");
    const bp = trackingData.filter((m) => m.type === "blood_pressure");
    const day = (iso: string) => new Date(iso).toISOString().split("T")[0];
    if (weight.length) {
      trackingIds.add("__tracking_weight");
      raw.push({
        id: "__tracking_weight",
        name: t("weight"),
        unit: "kg",
        ref_min: null,
        ref_max: null,
      });
      for (const e of weight) {
        vals.push({
          metric_id: "__tracking_weight",
          date: day(e.measured_at),
          value: Number(e.weight_kg),
          unit: "kg",
        });
      }
    }
    if (bp.length) {
      trackingIds.add("__tracking_bp_systolic");
      trackingIds.add("__tracking_bp_diastolic");
      raw.push({
        id: "__tracking_bp_systolic",
        name: t("bpSystolic"),
        unit: "mmHg",
        ref_min: null,
        ref_max: 130,
      });
      raw.push({
        id: "__tracking_bp_diastolic",
        name: t("bpDiastolic"),
        unit: "mmHg",
        ref_min: null,
        ref_max: 85,
      });
      // measurements come newest first; oldest first so the latest of a day wins
      for (const e of [...bp].reverse()) {
        const d = day(e.measured_at);
        vals.push({
          metric_id: "__tracking_bp_systolic",
          date: d,
          value: e.systolic!,
          ref_high: 130,
          unit: "mmHg",
        });
        vals.push({
          metric_id: "__tracking_bp_diastolic",
          date: d,
          value: e.diastolic!,
          ref_high: 85,
          unit: "mmHg",
        });
      }
    }
    return buildMetrics([...raw, ...data.metrics], [...vals, ...data.values], {
      trackingIds,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, trackingData]);

  const byId = useMemo(() => new Map(metrics.map((m) => [m.id, m])), [metrics]);
  const today = useMemo(() => todayUtc(), []);

  // server names -> metric ids (variants of a name map to the shown metric)
  useEffect(() => {
    if (homeNames == null || !data || home != null) return;
    // merged spellings are aliases of the shown metric
    const byFold = new Map<string, string>();
    for (const m of metrics) {
      for (const n of [m.id, m.full, ...m.aliases]) {
        if (!byFold.has(fold(n))) byFold.set(fold(n), m.id);
      }
    }
    const ids: string[] = [];
    for (const n of homeNames) {
      const id = byId.has(n) ? n : byFold.get(fold(n));
      if (id && !ids.includes(id)) ids.push(id);
    }
    setHome(ids);
    confirmedHome.current = ids;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeNames, data, metrics]);

  const defaultHome = useMemo(() => pickDefaultHome(metrics), [metrics]);
  const savedHome = useMemo(
    () => (home ?? []).filter((id) => byId.has(id)),
    [home, byId],
  );
  const isEmpty = savedHome.length === 0;
  const dashIds = isEmpty ? defaultHome : savedHome;

  /* ------------------------------------------------------ open charts */

  useEffect(() => {
    if (selected != null || home == null || !activeProfileId || !metrics.length)
      return;
    const stored = store.get<unknown>(kCharts(activeProfileId), null);
    const initial = Array.isArray(stored)
      ? stored.filter(
          (id): id is string => typeof id === "string" && byId.has(id),
        )
      : dashIds.slice(0, 2);
    setSelectedState(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [home, metrics, activeProfileId]);

  const setSelected = useCallback(
    (fn: (s: string[]) => string[]) => {
      setSelectedState((s) => {
        const next = fn(s ?? []);
        if (activeProfileId) store.set(kCharts(activeProfileId), next);
        return next;
      });
    },
    [activeProfileId],
  );
  const toggleChart = useCallback(
    (id: string) =>
      setSelected((s) => {
        if (s.includes(id)) return s.filter((x) => x !== id);
        const m = byId.get(id);
        if (m && !m.tracking) track("metric_selected", m.full);
        return [...s, id];
      }),
    [setSelected, byId],
  );

  /* -------------------------------------------------- home persistence */

  const confirmedHome = useRef<string[]>([]);
  const pendingHome = useRef<string[] | null>(null);
  const inflight = useRef(false);
  const saveTimer = useRef<number | undefined>(undefined);

  const flushHome = useCallback(async () => {
    if (inflight.current || !pendingHome.current || !activeProfileId) return;
    const next = pendingHome.current;
    pendingHome.current = null;
    inflight.current = true;
    try {
      const res = await fetch("/api/metric-order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: activeProfileId, home: next }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      confirmedHome.current = next;
    } catch (err) {
      reportError(err, { op: "dashboard.saveHome" });
      pendingHome.current = null;
      setHome(confirmedHome.current);
      addToast({ type: "error", message: t("saveFailed"), duration: 5000 });
    } finally {
      inflight.current = false;
      if (pendingHome.current) void flushHome();
    }
  }, [activeProfileId, addToast, t]);

  const commitHome = useCallback(
    (next: string[], debounce = 0) => {
      if (!canEdit) return;
      setHome(next);
      pendingHome.current = next;
      window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => void flushHome(), debounce);
    },
    [canEdit, flushHome],
  );
  useEffect(() => () => window.clearTimeout(saveTimer.current), []);

  const setHomeFor = useCallback(
    (id: string, on: boolean) => {
      const before = savedHome;
      if (on === before.includes(id)) return;
      const next = on ? [...before, id] : before.filter((x) => x !== id);
      commitHome(next);
      const m = byId.get(id);
      track(on ? "ana_ekran_add" : "ana_ekran_remove", m?.full);
      addToast({
        type: "info",
        message: on
          ? t("toastAdded", { name: m?.name ?? id })
          : t("toastRemoved", { name: m?.name ?? id }),
        duration: 5000,
        action: { label: t("undo"), onClick: () => commitHome(before) },
      });
    },
    [savedHome, commitHome, byId, addToast, t],
  );
  const toggleHome = useCallback(
    (id: string) => setHomeFor(id, !savedHome.includes(id)),
    [setHomeFor, savedHome],
  );
  const reorderHome = useCallback(
    (next: string[], source: "dashboard" | "picker") => {
      commitHome(next, HOME_SAVE_DEBOUNCE);
      track("ana_ekran_reorder", source);
    },
    [commitHome],
  );

  /* ---------------------------------------------------------- settings */

  const setView = useCallback((patch: Partial<ViewSettings>) => {
    setViewState((v) => {
      const n = { ...v, ...patch };
      saveView(n);
      return n;
    });
    if ("full" in patch) track("chart_scale_toggle", patch.full ? "full" : "fit");
    else track("view_setting_change", Object.keys(patch).join(","));
  }, []);
  const setPrefs = useCallback((patch: Partial<PickerPrefs>) => {
    setPrefsState((p) => {
      const n = { ...p, ...patch };
      store.set(K_PICKER, n);
      return n;
    });
  }, []);
  const setPinned = useCallback(
    (fn: (cur: number | null) => number | null) => setPinnedState(fn),
    [],
  );

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    track("view_mode_toggle", next);
  };
  // one event per pin (not per arrow-key step)
  const wasPinned = useRef(false);
  useEffect(() => {
    if (pinned != null && !wasPinned.current) track("date_pin");
    wasPinned.current = pinned != null;
  }, [pinned]);

  /* -------------------------------------------------------------- picker */

  const openPicker = (q: string, el: HTMLElement | null) => {
    openerRef.current = el;
    setQuery(q);
    setPickerOpen(true);
    track("picker_open");
  };
  const closePicker = () => {
    setPickerOpen(false);
    if (query.trim()) track("picker_search");
  };
  const returnFocus = useCallback(() => {
    const el = openerRef.current;
    requestAnimationFrame(() => {
      const target =
        el && el.tagName !== "INPUT" && document.contains(el)
          ? el
          : allValuesBtnRef.current;
      target?.focus();
    });
  }, []);
  const pushed = pickerOpen && isWide;

  /* ---------------------------------------------------- visible ranges */

  const cutoff =
    dateRange === "all" ? -Infinity : today - Number(dateRange) * DAY;
  const vis = useMemo(() => {
    const map = new Map<string, Pt[]>();
    for (const m of metrics)
      map.set(
        m.id,
        m.pts.filter((p) => p.t >= cutoff),
      );
    return map;
  }, [metrics, cutoff]);

  const chartIds = useMemo(
    () =>
      orderCharts(
        (selected ?? []).filter((id) => byId.has(id)),
        dashIds,
      ),
    [selected, dashIds, byId],
  );
  const chartMetrics = useMemo(
    () => chartIds.map((id) => byId.get(id)!),
    [chartIds, byId],
  );

  const xDom = useMemo<[number, number]>(() => {
    const ts = chartMetrics.flatMap((m) =>
      (vis.get(m.id) ?? []).map((p) => p.t),
    );
    if (!ts.length) return [today - 30 * DAY, today];
    const a = Math.min(...ts);
    const b = Math.max(...ts);
    if (a === b) return [a - 3 * DAY, b + 3 * DAY];
    const pad = Math.max((b - a) * 0.035, DAY * 0.6);
    return [a - pad, b + pad];
  }, [chartMetrics, vis, today]);

  // drop a pin that is no longer visible
  useEffect(() => {
    if (
      pinned != null &&
      !chartMetrics.some((m) =>
        (vis.get(m.id) ?? []).some((p) => p.t === pinned),
      )
    ) {
      setPinnedState(null);
    }
  }, [vis, chartMetrics, pinned]);
  useEffect(() => setHover(null), [mode]);

  const latestT = useMemo(
    () =>
      Math.max(
        0,
        ...metrics
          .filter((m) => !m.tracking && m.stat.last)
          .map((m) => m.stat.last!.t),
      ),
    [metrics],
  );
  const dateLabel = useMemo(() => {
    const ts = dashIds.flatMap((id) => (vis.get(id) ?? []).map((p) => p.t));
    if (!ts.length) return t("noDataInRange");
    const a = Math.min(...ts);
    const b = Math.max(...ts);
    return a === b ? fmt.short(a) : `${fmt.short(a)} - ${fmt.short(b)}`;
  }, [dashIds, vis, fmt, t]);

  /* ------------------------------------------------------------- render */

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingState message={t("loadingData")} />
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }
  if (!data) return null;

  const reportCount = data.reportCount;
  const listedCount = metrics.filter((m) => m.pts.length > 0).length;
  const effCols =
    isPhone || pushed
      ? 1
      : Math.min(view.cols, Math.max(1, chartMetrics.length));
  const height = CHART_HEIGHTS[view.size];

  return (
    <div
      className={`vzd min-h-screen bg-background${pushed ? " vz-pushed" : ""}`}
    >
      <Header
        profileName={activeProfile?.display_name}
        currentProfileId={activeProfileId || undefined}
      />

      <main className="vz-main">
        {data.metrics.length === 0 && (
          <Card className="rounded-xl">
            <EmptyState profileName={activeProfile?.display_name} />
          </Card>
        )}

        {reportCount >= 1 && reportCount <= 2 && (
          <OnboardingChecklist
            reportCount={reportCount}
            hasWeight={trackingData.some((m) => m.type === "weight")}
            hasBloodPressure={trackingData.some(
              (m) => m.type === "blood_pressure",
            )}
          />
        )}

        {metrics.length > 0 && (
          <section
            className="vz-card vz-values"
            aria-labelledby="vz-dash-title"
          >
            <div className="vz-values-head">
              <h2 className="vz-values-title" id="vz-dash-title">
                {isEmpty && latestT
                  ? t("latestReport", { date: fmt.long(latestT) })
                  : t("values")}
              </h2>
              <div className="vz-tgl">
                <label htmlFor="vz-avg" className={!showAvg ? "on" : ""}>
                  <span className="only-desk">{t("lastValue")}</span>
                  <span className="only-phone">{t("lastValueShort")}</span>
                </label>
                <Switch
                  id="vz-avg"
                  checked={showAvg}
                  onCheckedChange={setShowAvg}
                  aria-label={t("showAverage")}
                  className="touch-manipulation"
                />
                <label htmlFor="vz-avg" className={showAvg ? "on" : ""}>
                  <span className="only-desk">{t("average")}</span>
                  <span className="only-phone">{t("averageShort")}</span>
                </label>
              </div>
              <Select
                value={dateRange}
                onValueChange={(v: DateRange) => {
                  setDateRange(v);
                  store.set(K_RANGE, v);
                }}
              >
                <SelectTrigger
                  className="w-auto h-7 text-xs ml-auto"
                  aria-label={t("dateRange")}
                  style={{ touchAction: "manipulation" }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all")}</SelectItem>
                  <SelectItem value="90">{t("last90")}</SelectItem>
                  <SelectItem value="30">{t("last30")}</SelectItem>
                  <SelectItem value="15">{t("last15")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="vz-tools">
              <div className="vz-search vz-dash-search">
                <IconSearch />
                <input
                  type="search"
                  value=""
                  placeholder={t("searchPlaceholder")}
                  aria-label={t("searchOpensPicker")}
                  autoComplete="off"
                  onFocus={(e) => !pickerOpen && openPicker("", e.target)}
                  onChange={(e) => openPicker(e.target.value, e.target)}
                />
              </div>
              <button
                ref={allValuesBtnRef}
                id="vz-all-values"
                type="button"
                className="vz-btn"
                aria-haspopup="dialog"
                aria-expanded={pickerOpen}
                onClick={(e) => openPicker("", e.currentTarget)}
              >
                <IconList />
                <span>{t("allValues")}</span>
                <span className="count">{listedCount}</span>
              </button>
              <span className="vz-date-label">{dateLabel}</span>
            </div>
            {isEmpty && (
              <p className="vz-empty-hint">
                {t("emptyHint", { count: dashIds.length })}{" "}
                {canEdit && (
                  <button
                    type="button"
                    className="vz-link"
                    onClick={(e) => openPicker("", e.currentTarget)}
                  >
                    {t("emptyLink")}
                  </button>
                )}
              </p>
            )}
            {!canEdit && (
              <p className="vz-empty-hint vz-readonly">{t("viewerReadOnly")}</p>
            )}
            <HomeCards
              ids={dashIds}
              byId={byId}
              vis={vis}
              showAvg={showAvg}
              selected={selected ?? []}
              toggleChart={toggleChart}
              isHome={!isEmpty}
              canEdit={canEdit}
              onReorder={(next) => reorderHome(next, "dashboard")}
              onSetHome={(id, on) => {
                setHomeFor(id, on);
                if (!on) {
                  window.setTimeout(() => {
                    const next = document.querySelector<HTMLElement>(
                      ".vz-mcard-wrap .mc-more",
                    );
                    (next ?? allValuesBtnRef.current)?.focus();
                  }, 0);
                }
              }}
              fmt={fmt}
              isPhone={isPhone}
            />
          </section>
        )}

        {reportCount === 1 && metrics.length > 0 && <GhostedChart />}

        {reportCount >= 2 && metrics.length > 0 && (
          <>
            {chartMetrics.length > 0 && (
              <div className="vz-toolbar">
                <div className="vz-seg" role="group" aria-label={t("mode")}>
                  <button
                    type="button"
                    aria-pressed={mode === "chart"}
                    onClick={() => switchMode("chart")}
                  >
                    {t("modeChart")}
                  </button>
                  <button
                    type="button"
                    aria-pressed={mode === "table"}
                    onClick={() => switchMode("table")}
                  >
                    {t("modeTable")}
                  </button>
                </div>
                {pinned != null ? (
                  <span className="vz-chip">
                    {t("pinnedDate")} <b>{fmt.long(pinned)}</b>
                    <button
                      type="button"
                      aria-label={t("unpin")}
                      onClick={() => setPinnedState(null)}
                    >
                      <IconX size={11} />
                    </button>
                  </span>
                ) : (
                  <span className="vz-hint only-desk">
                    {mode === "chart" ? t("pinHintChart") : t("pinHintTable")}
                  </span>
                )}
                <span className="spacer" />
                {mode === "chart" && (
                  <ViewMenu view={view} setView={setView} isPhone={isPhone} />
                )}
              </div>
            )}

            {chartMetrics.length === 0 ? (
              <div className="vz-card vz-select-hint">{t("selectHint")}</div>
            ) : mode === "chart" ? (
              <div
                className="vz-cgrid"
                style={{
                  gridTemplateColumns: `repeat(${effCols}, minmax(0, 1fr))`,
                }}
              >
                {chartMetrics.map((m) => (
                  <MetricChart
                    key={m.id}
                    m={m}
                    pts={vis.get(m.id) ?? []}
                    xDom={xDom}
                    height={height}
                    hover={hover}
                    pinned={pinned}
                    setHover={setHover}
                    setPinned={setPinned}
                    showAvg={showAvg}
                    view={view}
                    today={today}
                    fmt={fmt}
                    onShowNormal={() => setView({ full: true })}
                    onRemove={() => toggleChart(m.id)}
                  />
                ))}
              </div>
            ) : (
              <DataTable
                metrics={chartMetrics}
                vis={vis}
                pinned={pinned}
                setPinned={setPinned}
                showAvg={showAvg}
                fmt={fmt}
              />
            )}
          </>
        )}
      </main>

      <MetricPicker
        open={pickerOpen}
        onClose={closePicker}
        wide={isWide}
        isPhone={isPhone}
        metrics={metrics}
        home={savedHome}
        canEdit={canEdit}
        onToggleHome={toggleHome}
        onReorderHome={(next) => reorderHome(next, "picker")}
        selected={selected ?? []}
        toggleChart={toggleChart}
        query={query}
        setQuery={setQuery}
        prefs={prefs}
        setPrefs={setPrefs}
        fmt={fmt}
        returnFocus={returnFocus}
      />
    </div>
  );
}
