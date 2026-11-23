/**
 * PR #160 review: Ana ekran persistence on the dashboard page (synthetic
 * data, fetch mocked; child components stubbed so only page logic runs).
 *
 * - edits must wait for a SUCCESSFUL GET /api/metric-order: a failed or
 *   pending load must never PUT a partial list as the full Ana ekran
 * - queued saves carry their own profile: a save queued after a profile
 *   switch goes to the new profile, and an old-profile success never
 *   becomes the new profile's revert target
 * - the automatic date range counts lab draws, not daily Kilo readings
 */
import "@testing-library/jest-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import Dashboard from "@/app/dashboard/page";
import type { RawMetric, RawValue } from "@/lib/chart/model";

/* --------------------------------------------------------------- mocks */

const profileState = {
  activeProfile: { id: "A", display_name: "A", access_level: "owner" },
  activeProfileId: "A",
  loading: false,
  needsOnboarding: false,
  error: null as string | null,
};
jest.mock("@/hooks/use-active-profile", () => ({
  useActiveProfile: () => profileState,
}));
jest.mock("next-intl", () => ({
  useTranslations: () => (k: string) => k,
  useLocale: () => "tr",
}));
jest.mock("@/components/ui/toast", () => ({
  useToast: () => ({ addToast: () => {} }),
}));
jest.mock("@/lib/track", () => ({ track: () => {} }));
jest.mock("@/lib/error-reporting", () => ({ reportError: () => {} }));
jest.mock("@/components/header", () => ({ Header: () => null }));
jest.mock("@/components/onboarding-checklist", () => ({
  OnboardingChecklist: () => null,
}));
jest.mock("@/components/ghosted-chart", () => ({ GhostedChart: () => null }));
jest.mock("@/components/empty-state", () => ({ EmptyState: () => null }));
jest.mock("@/components/dashboard/metric-chart", () => ({
  MetricChart: () => null,
}));
jest.mock("@/components/dashboard/data-table", () => ({
  DataTable: () => null,
}));
jest.mock("@/components/dashboard/view-menu", () => ({ ViewMenu: () => null }));
jest.mock("@/components/dashboard/range-control", () => ({
  RangeControl: (p: { auto: string }) => (
    <div data-testid="range" data-auto={p.auto} />
  ),
}));
type CardsProps = {
  ids: string[];
  isHome: boolean;
  canEdit: boolean;
  lockReason?: string | null;
};
jest.mock("@/components/dashboard/home-cards", () => ({
  HomeCards: (p: CardsProps) => (
    <div
      data-testid="cards"
      data-ids={p.ids.join(",")}
      data-home={String(p.isHome)}
      data-can-edit={String(p.canEdit)}
      data-lock={p.lockReason ?? ""}
    />
  ),
}));
type PickerProps = {
  metrics: { id: string }[];
  home: string[];
  canEdit: boolean;
  lockReason?: string | null;
  onToggleHome: (id: string) => void;
};
// the stub's buttons are always clickable, so a missing page-side guard shows
jest.mock("@/components/dashboard/metric-picker", () => ({
  MetricPicker: (p: PickerProps) => (
    <div
      data-testid="picker"
      data-home={p.home.join(",")}
      data-can-edit={String(p.canEdit)}
      data-lock={p.lockReason ?? ""}
    >
      {p.metrics.map((m) => (
        <button key={m.id} type="button" onClick={() => p.onToggleHome(m.id)}>
          {`pick-${m.id}`}
        </button>
      ))}
    </div>
  ),
}));

/* ---------------------------------------------------------------- data */

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (v: T) => void;
};
function deferred<T>(): Deferred<T> {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}
const ok = (body: unknown) =>
  ({ ok: true, status: 200, json: async () => body }) as Response;
const fail = (status = 500) =>
  ({ ok: false, status, json: async () => ({}) }) as Response;

const DRAWS = ["2026-03-02", "2026-04-06", "2026-05-04"];
function labData(names: string[]) {
  const metrics: RawMetric[] = names.map((n) => ({
    id: n,
    name: n,
    unit: "mg/dL",
    ref_min: 1,
    ref_max: 10,
  }));
  const values: RawValue[] = names.flatMap((n, i) =>
    DRAWS.map((date, j) => ({
      metric_id: n,
      date,
      value: 2 + i + j,
      ref_low: 1,
      ref_high: 10,
      unit: "mg/dL",
    })),
  );
  return { metrics, values, reportCount: DRAWS.length };
}

type Route = (method: string, body: unknown) => Promise<Response> | Response;
let routes: Record<string, Route>;
let puts: { profileId: string; home: string[] }[];

function installFetch() {
  puts = [];
  global.fetch = jest.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? "GET";
      const body = init?.body ? JSON.parse(String(init.body)) : undefined;
      if (method === "PUT") puts.push(body);
      // the most specific route wins ("/api/metric-order" = the PUT)
      const key = Object.keys(routes)
        .filter((k) => url.includes(k))
        .sort((a, b) => b.length - a.length)[0];
      if (!key) throw new Error(`unrouted ${method} ${url}`);
      return routes[key](method, body);
    },
  ) as unknown as typeof fetch;
}

function setProfile(id: string) {
  profileState.activeProfile = { id, display_name: id, access_level: "owner" };
  profileState.activeProfileId = id;
}

const cards = () => screen.getByTestId("cards");
const picker = () => screen.getByTestId("picker");
const pick = (id: string) =>
  act(async () => {
    screen.getByRole("button", { name: `pick-${id}` }).click();
    await new Promise((r) => setTimeout(r, 0));
  });

beforeAll(() => {
  window.matchMedia = ((q: string) => ({
    matches: false,
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
});

beforeEach(() => {
  window.localStorage.clear();
  setProfile("A");
  routes = {
    "/api/metrics?profileId=A": () => ok(labData(["Hemoglobin", "Ferritin"])),
    "/api/metrics?profileId=B": () => ok(labData(["Sodyum", "Glukoz"])),
    "/api/metric-order?profileId=A": () => ok({ home: ["Hemoglobin"] }),
    "/api/metric-order?profileId=B": () => ok({ home: ["Sodyum"] }),
    "/api/metric-order": () => ok({ success: true }),
    "/api/tracking?profileId=": () => ok({ measurements: [] }),
  };
  installFetch();
});

/* --------------------------------------------- #1: no save before load */

describe("Ana ekran edits wait for a successful load", () => {
  it("a failed GET locks edits with a reason and a retry, and never saves", async () => {
    let getOk = false;
    routes["/api/metric-order?profileId=A"] = () =>
      getOk ? ok({ home: ["Hemoglobin"] }) : fail(500);
    render(<Dashboard />);
    await screen.findByTestId("picker");
    expect(picker()).toHaveAttribute("data-can-edit", "false");
    expect(picker()).toHaveAttribute("data-lock", "homeLoadFailed");
    expect(cards()).toHaveAttribute("data-can-edit", "false");

    await pick("Ferritin");
    await new Promise((r) => setTimeout(r, 20));
    expect(puts).toEqual([]);

    // retry: a successful load unlocks, and the next save is the FULL list
    getOk = true;
    await act(async () => {
      screen.getByRole("button", { name: "retry" }).click();
    });
    await waitFor(() =>
      expect(picker()).toHaveAttribute("data-can-edit", "true"),
    );
    expect(cards()).toHaveAttribute("data-ids", "Hemoglobin");
    await pick("Ferritin");
    await waitFor(() => expect(puts).toHaveLength(1));
    expect(puts[0]).toEqual({
      profileId: "A",
      home: ["Hemoglobin", "Ferritin"],
    });
  });

  it("an edit before the saved list has loaded does not save", async () => {
    // tracking never answers: the saved Ana ekran is not resolved yet
    routes["/api/tracking?profileId="] = () => new Promise<Response>(() => {});
    render(<Dashboard />);
    await screen.findByTestId("picker");
    expect(picker()).toHaveAttribute("data-can-edit", "false");
    expect(picker()).toHaveAttribute("data-lock", "homeLoading");
    await pick("Ferritin");
    await new Promise((r) => setTimeout(r, 20));
    expect(puts).toEqual([]);
  });
});

/* ---------------------------------------------- #2: per-profile queue */

describe("Ana ekran saves stay with their profile", () => {
  it("a save queued after a profile switch goes to the new profile", async () => {
    const putA = deferred<Response>();
    routes["/api/metric-order"] = (_m, body) =>
      (body as { profileId: string }).profileId === "A"
        ? putA.promise
        : ok({ success: true });
    const { rerender } = render(<Dashboard />);
    await waitFor(() =>
      expect(cards()).toHaveAttribute("data-ids", "Hemoglobin"),
    );
    await pick("Ferritin"); // PUT for A, still in flight
    await waitFor(() => expect(puts).toHaveLength(1));

    setProfile("B");
    rerender(<Dashboard />);
    await waitFor(() => expect(cards()).toHaveAttribute("data-ids", "Sodyum"));
    await waitFor(() =>
      expect(picker()).toHaveAttribute("data-can-edit", "true"),
    );
    await pick("Glukoz"); // queued behind A's request

    await act(async () => {
      putA.resolve(ok({ success: true }));
      await new Promise((r) => setTimeout(r, 10));
    });
    await waitFor(() => expect(puts).toHaveLength(2));
    expect(puts[0]).toEqual({
      profileId: "A",
      home: ["Hemoglobin", "Ferritin"],
    });
    expect(puts[1]).toEqual({ profileId: "B", home: ["Sodyum", "Glukoz"] });
  });

  it("an old-profile success never becomes the new profile's revert target", async () => {
    const putA = deferred<Response>();
    let failB = true;
    routes["/api/metric-order"] = (_m, body) => {
      if ((body as { profileId: string }).profileId === "A")
        return putA.promise;
      return failB ? fail(500) : ok({ success: true });
    };
    const { rerender } = render(<Dashboard />);
    await waitFor(() =>
      expect(cards()).toHaveAttribute("data-ids", "Hemoglobin"),
    );
    await pick("Ferritin");
    await waitFor(() => expect(puts).toHaveLength(1));

    setProfile("B");
    rerender(<Dashboard />);
    await waitFor(() => expect(cards()).toHaveAttribute("data-ids", "Sodyum"));
    await act(async () => {
      putA.resolve(ok({ success: true })); // A's success lands on B's screen
      await new Promise((r) => setTimeout(r, 10));
    });
    await waitFor(() =>
      expect(picker()).toHaveAttribute("data-can-edit", "true"),
    );

    await pick("Glukoz"); // fails: B goes back to B's own saved list
    await waitFor(() => expect(puts).toHaveLength(2));
    await waitFor(() =>
      expect(picker()).toHaveAttribute("data-home", "Sodyum"),
    );
    expect(cards()).toHaveAttribute("data-home", "true");

    failB = false;
    await pick("Glukoz");
    await waitFor(() => expect(puts).toHaveLength(3));
    expect(puts[2]).toEqual({ profileId: "B", home: ["Sodyum", "Glukoz"] });
  });
});

/* ------------------------------------------ #3: auto range, lab draws */

describe("automatic date range", () => {
  const DAY = 86_400_000;
  const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
  const LAST = Date.UTC(2026, 5, 15);
  // 12 monthly lab draws: "1y" is the smallest preset with 8+ of them
  const MONTHLY = Array.from({ length: 12 }, (_, i) =>
    iso(Date.UTC(2025, 6 + i, 15)),
  );

  function seed(home: string[], withLabs = true) {
    const metrics: RawMetric[] = withLabs
      ? [
          {
            id: "Hemoglobin",
            name: "Hemoglobin",
            unit: "g/dL",
            ref_min: 12,
            ref_max: 16,
          },
        ]
      : [];
    const values: RawValue[] = withLabs
      ? MONTHLY.map((date, i) => ({
          metric_id: "Hemoglobin",
          date,
          value: 13 + (i % 3) * 0.1,
          ref_low: 12,
          ref_high: 16,
          unit: "g/dL",
        }))
      : [];
    // a daily weight log: 30 readings in the month before the last draw
    const measurements = Array.from({ length: 30 }, (_, i) => ({
      id: `w${i}`,
      type: "weight",
      weight_kg: 70 + (i % 4) * 0.2,
      measured_at: new Date(LAST - i * DAY + 12 * 3600_000).toISOString(),
    }));
    routes["/api/metrics?profileId=A"] = () =>
      ok({ metrics, values, reportCount: withLabs ? MONTHLY.length : 0 });
    routes["/api/metric-order?profileId=A"] = () => ok({ home });
    routes["/api/tracking?profileId="] = () => ok({ measurements });
  }

  it("ignores daily Kilo readings when the Ana ekran has lab values", async () => {
    seed(["__tracking_weight", "Hemoglobin"]);
    render(<Dashboard />);
    await waitFor(() =>
      expect(cards()).toHaveAttribute(
        "data-ids",
        "__tracking_weight,Hemoglobin",
      ),
    );
    expect(screen.getByTestId("range")).toHaveAttribute("data-auto", "1y");
  });

  it("falls back to tracking readings when there are no lab values", async () => {
    seed(["__tracking_weight"], false);
    render(<Dashboard />);
    await waitFor(() =>
      expect(cards()).toHaveAttribute("data-ids", "__tracking_weight"),
    );
    expect(screen.getByTestId("range")).toHaveAttribute("data-auto", "1m");
  });
});
