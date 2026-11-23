"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
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
  keepHidden,
  mergeVariants,
  orderCharts,
  pickDefaultHome,
  resolveHome,
  todayUtc,
  undoHomeToggle,
  SORT_KINDS,
  type DashMetric,
  type Pt,
  type RawMetric,
  type RawValue,
} from "@/lib/chart/model";
import {
  autoPreset,
  rangeAnchor,
  rangeBounds,
  type RangeChoice,
} from "@/lib/chart/range";
import { MetricChart } from "@/components/dashboard/metric-chart";
import { DataTable } from "@/components/dashboard/data-table";
import { ViewMenu } from "@/components/dashboard/view-menu";
import { HomeCards } from "@/components/dashboard/home-cards";
import { RangeControl } from "@/components/dashboard/range-control";
import {
  MetricPicker,
  type PickerPrefs,
} from "@/components/dashboard/metric-picker";
import {
  CHART_HEIGHTS,
  IconList,
  IconSearch,
  IconX,
  loadRangeChoice,
  loadView,
  makeDateFormats,
  saveRangeChoice,
  saveView,
  store,
  useMedia,
  type ViewSettings,
} from "@/components/dashboard/shared";
import "@/components/dashboard/dashboard.css";

type ApiData = {
  metrics: RawMetric[];
  values: RawValue[];
  reportCount: number;
};
type Data = ApiData & { idMap: Map<string, string> };

type Mode = "chart" | "table";

const K_PICKER = "viziai.dashboard.picker";
const kCharts = (profileId: string) => `viziai.dashboard.charts.${profileId}`;
const HOME_SAVE_DEBOUNCE = 400;

/** Save the complete Ana ekran of one profile; an empty list is an explicit clear. */
function putHome(profileId: string, home: string[], keepalive = false) {
  return fetch("/api/metric-order", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      home.length ? { profileId, home } : { profileId, home, clear: true },
    ),
    keepalive,
  });
}

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

  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackingData, setTrackingData] = useState<TrackingMeasurement[]>([]);
  /** saved Ana ekran may hold Kilo/Tansiyon ids: map names only after this */
  const [trackingLoaded, setTrackingLoaded] = useState(false);
  /** Ana ekran (metric ids, ordered); null until loaded */
  const [home, setHome] = useState<string[] | null>(null);
  const [selected, setSelectedState] = useState<string[] | null>(null);
  /** explicit date range for this profile; null = automatic */
  const [rangeChoice, setRangeChoiceState] = useState<RangeChoice | null>(
    null,
  );
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
  const isDesk = useMedia("(min-width: 768px)");
  const openerRef = useRef<HTMLElement | null>(null);

  /* ---------------------------------------- home persistence: state */
  // Saves are queued PER PROFILE: a list always goes to the profile it was
  // made for, even when the user switched profiles while a save was in flight.
  /** per profile: the last list the server accepted (revert target) */
  const confirmedHome = useRef(new Map<string, string[]>());
  /** per profile: the newest list still to save (it supersedes older ones) */
  const pendingHome = useRef(new Map<string, string[]>());
  const inflight = useRef(false);
  const saveTimer = useRef<number | undefined>(undefined);
  const flushRef = useRef<() => Promise<void>>(async () => {});
  /** latest full home of the active profile (incl. ids not shown yet) */
  const homeRef = useRef<string[]>([]);
  const profileRef = useRef(activeProfileId);
  useEffect(() => {
    profileRef.current = activeProfileId;
  }, [activeProfileId]);
  const allValuesBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (needsOnboarding) router.push("/onboarding");
  }, [needsOnboarding, router]);

  useEffect(() => {
    if (profileError)
      addToast({ type: "error", message: profileError, duration: 5000 });
  }, [profileError, addToast]);

  /* ------------------------------------------------------------ loading */

  /** saved Ana ekran names; null until a SUCCESSFUL GET /api/metric-order */
  const [homeNames, setHomeNames] = useState<string[] | null>(null);
  /** the saved Ana ekran could not be loaded: edits stay off until a retry works */
  const [homeLoadFailed, setHomeLoadFailed] = useState(false);
  useEffect(() => {
    if (profileLoading || !activeProfileId) return;
    let ignore = false;
    // an edit of the previous profile still in the debounce is saved now
    // (each queued list carries its own profile id)
    if (pendingHome.current.size) {
      window.clearTimeout(saveTimer.current);
      void flushRef.current();
    }
    homeRef.current = [];
    setHome(null);
    setHomeNames(null);
    setHomeLoadFailed(false);
    setSelectedState(null);
    setPinnedState(null);
    setRangeChoiceState(loadRangeChoice(activeProfileId));
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
        // a failed load is NOT an empty Ana ekran: saving one would wipe it
        let names: string[] | null = null;
        if (prefRes.ok) {
          const p = await prefRes.json();
          names = Array.isArray(p.home) ? p.home : [];
        } else {
          reportError(new Error(`HTTP ${prefRes.status}`), {
            op: "dashboard.loadHome",
            profileId: activeProfileId,
          });
        }
        if (!ignore) {
          setData({ ...json, ...mergeVariants(json.metrics, json.values) });
          if (names) setHomeNames(names);
          else setHomeLoadFailed(true);
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
    // a new profile: its saved Ana ekran waits for its own tracking data
    setTrackingData([]);
    setTrackingLoaded(false);
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
      } finally {
        if (!ignore) setTrackingLoaded(true);
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
    // local calendar day (a reading at 01:30 in Istanbul is that day, not the UTC one)
    const day = (iso: string) => new Date(iso).toLocaleDateString("en-CA");
    if (weight.length) {
      trackingIds.add("__tracking_weight");
      raw.push({
        id: "__tracking_weight",
        name: t("weight"),
        unit: "kg",
        ref_min: null,
        ref_max: null,
      });
      // newest first from the API; oldest first so the latest of a day wins
      for (const e of [...weight].reverse()) {
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

  // server names -> metric ids. Waits for the tracking data so a saved
  // Kilo / Tansiyon card is there on first paint; unresolved names are kept
  // (see resolveHome), so a late or failed tracking load never drops them.
  useEffect(() => {
    if (
      homeNames == null ||
      !data ||
      !trackingLoaded ||
      home != null ||
      !activeProfileId
    )
      return;
    const ids = resolveHome(homeNames, metrics, data.idMap);
    setHome(ids);
    homeRef.current = ids;
    confirmedHome.current.set(activeProfileId, ids);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeNames, data, metrics, trackingLoaded]);

  const retryHomeLoad = useCallback(async () => {
    const pid = activeProfileId;
    if (!pid) return;
    setHomeLoadFailed(false);
    try {
      const res = await fetch(`/api/metric-order?profileId=${pid}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const p = await res.json();
      if (profileRef.current === pid)
        setHomeNames(Array.isArray(p.home) ? p.home : []);
    } catch (e) {
      reportError(e, { op: "dashboard.loadHome", profileId: pid });
      if (profileRef.current === pid) setHomeLoadFailed(true);
    }
  }, [activeProfileId]);
  /** edits only once the saved list is in (never build on a partial one) */
  const homeEditable = canEdit && home != null;
  const lockReason =
    !canEdit || homeEditable
      ? null
      : homeLoadFailed
        ? t("homeLoadFailed")
        : t("homeLoading");

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

  const flushHome = useCallback(async () => {
    if (inflight.current) return;
    const first = pendingHome.current.entries().next();
    if (first.done) return;
    const [profileId, next] = first.value;
    pendingHome.current.delete(profileId);
    inflight.current = true;
    try {
      const res = await putHome(profileId, next);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      confirmedHome.current.set(profileId, next);
    } catch (err) {
      reportError(err, { op: "dashboard.saveHome", profileId });
      // later edits of this profile were built on the failed list
      pendingHome.current.delete(profileId);
      if (profileRef.current === profileId) {
        const back = confirmedHome.current.get(profileId) ?? [];
        setHome(back);
        homeRef.current = back;
      }
      addToast({ type: "error", message: t("saveFailed"), duration: 5000 });
    } finally {
      inflight.current = false;
      // the latest flush, never a closure from an earlier render
      if (pendingHome.current.size) void flushRef.current();
    }
  }, [addToast, t]);
  useEffect(() => {
    flushRef.current = flushHome;
  }, [flushHome]);

  const commitHome = useCallback(
    (next: string[], debounce = 0) => {
      if (!homeEditable || !activeProfileId) return;
      setHome(next);
      homeRef.current = next;
      pendingHome.current.set(activeProfileId, next);
      window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(
        () => void flushRef.current(),
        debounce,
      );
    },
    [homeEditable, activeProfileId],
  );
  // leaving within the reorder debounce must not lose the reorder
  useEffect(
    () => () => {
      window.clearTimeout(saveTimer.current);
      const queued = [...pendingHome.current];
      pendingHome.current.clear();
      for (const [profileId, next] of queued) {
        putHome(profileId, next, true).catch((err) =>
          reportError(err, { op: "dashboard.saveHome.unload" }),
        );
      }
    },
    [],
  );

  const setHomeFor = useCallback(
    (id: string, on: boolean) => {
      const cur = homeRef.current;
      if (!homeEditable || on === cur.includes(id)) return;
      const oldIndex = cur.indexOf(id);
      const pid = activeProfileId;
      commitHome(on ? [...cur, id] : cur.filter((x) => x !== id));
      const m = byId.get(id);
      track(on ? "ana_ekran_add" : "ana_ekran_remove", m?.full);
      addToast({
        type: "info",
        message: on
          ? t("toastAdded", { name: m?.name ?? id })
          : t("toastRemoved", { name: m?.name ?? id }),
        duration: 5000,
        // reverse only this change; later adds / removes / reorders stay
        action: {
          label: t("undo"),
          // a toast from another profile must not edit this one
          onClick: () =>
            profileRef.current === pid &&
            commitHome(undoHomeToggle(homeRef.current, id, on, oldIndex)),
        },
      });
    },
    [commitHome, byId, addToast, t, activeProfileId, homeEditable],
  );
  const toggleHome = useCallback(
    (id: string) => setHomeFor(id, !homeRef.current.includes(id)),
    [setHomeFor],
  );
  const reorderHome = useCallback(
    (next: string[], source: "dashboard" | "picker") => {
      if (!homeEditable) return;
      commitHome(keepHidden(next, homeRef.current), HOME_SAVE_DEBOUNCE);
      track("ana_ekran_reorder", source);
    },
    [commitHome, homeEditable],
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
  const setRange = useCallback(
    (next: RangeChoice | null) => {
      setRangeChoiceState(next);
      if (activeProfileId) saveRangeChoice(activeProfileId, next);
      track(
        "date_range_change",
        next == null ? "auto" : next.kind === "custom" ? "custom" : next.preset,
      );
    },
    [activeProfileId],
  );
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

  // ranges count back from the latest lab draw, not from today
  const anchor = useMemo(
    () =>
      rangeAnchor(
        metrics.filter((m) => !m.tracking).flatMap((m) => m.pts.map((p) => p.t)),
        metrics.filter((m) => m.tracking).flatMap((m) => m.pts.map((p) => p.t)),
        today,
      ),
    [metrics, today],
  );
  /** first and last day with any data: custom ranges are clamped to it */
  const span = useMemo<[number, number] | null>(() => {
    const ts = metrics.flatMap((m) => m.pts.map((p) => p.t));
    return ts.length ? [Math.min(...ts), Math.max(...ts)] : null;
  }, [metrics]);
  // automatic: smallest preset with 8+ draw dates across the Ana ekran
  // (or empty-state) values, never below "1 ay"
  // (lab draws only: a daily Kilo log must not force "1 ay"; tracking
  // readings count only when the Ana ekran has no lab values at all)
  const auto = useMemo(() => {
    const ms = dashIds
      .map((id) => byId.get(id))
      .filter((m): m is DashMetric => !!m);
    const times = (list: DashMetric[]) =>
      list.flatMap((m) => m.pts.map((p) => p.t));
    const lab = times(ms.filter((m) => !m.tracking));
    return autoPreset(lab.length ? lab : times(ms), anchor);
  }, [dashIds, byId, anchor]);
  const [lo, hi] = rangeBounds(
    rangeChoice ?? { kind: "preset", preset: auto },
    anchor,
  );
  const vis = useMemo(() => {
    const map = new Map<string, Pt[]>();
    for (const m of metrics)
      map.set(
        m.id,
        m.pts.filter((p) => p.t >= lo && p.t <= hi),
      );
    return map;
  }, [metrics, lo, hi]);

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
    return a === b ? fmt.short(a) : `${fmt.short(a)} – ${fmt.short(b)}`;
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
              <RangeControl
                choice={rangeChoice}
                auto={auto}
                span={span}
                bounds={[lo, hi]}
                onChange={setRange}
                isDesk={isDesk}
                fmt={fmt}
              />
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
            {homeLoadFailed && (
              <p className="vz-empty-hint vz-readonly" role="alert">
                {t("homeLoadFailed")}{" "}
                <button
                  type="button"
                  className="vz-link"
                  onClick={() => void retryHomeLoad()}
                >
                  {t("retry")}
                </button>
              </p>
            )}
            {isEmpty && home != null && (
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
              canEdit={homeEditable}
              lockReason={lockReason}
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
                    anchor={anchor}
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
        canEdit={homeEditable}
        lockReason={lockReason}
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
