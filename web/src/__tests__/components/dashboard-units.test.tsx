/**
 * PR #160 review (synthetic fixtures only):
 * - "Ortalama", the chart's average line and its y-scale never mix units
 *   (a Glukoz series that switched from mg/dL to mmol/L)
 * - "Kişisel aralık" counts its 90 days back from the latest draw, not today
 */
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { buildMetrics, type DashMetric } from "@/lib/chart/model";
import { DEFAULT_VIEW, makeDateFormats } from "@/components/dashboard/shared";

const captured: { domain?: [number, number]; lines: { y?: number }[] } = {
  lines: [],
};
jest.mock("recharts", () => {
  const Pass = ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  );
  const Null = () => null;
  return {
    ResponsiveContainer: Pass,
    LineChart: Pass,
    CartesianGrid: Null,
    XAxis: Null,
    Line: Null,
    ReferenceArea: Null,
    usePlotArea: () => undefined,
    ReferenceLine: (p: { y?: number }) => {
      captured.lines.push(p);
      return null;
    },
    YAxis: (p: { domain: [number, number] }) => {
      captured.domain = p.domain;
      return null;
    },
  };
});
jest.mock("next-intl", () => ({
  useTranslations: () => (k: string) => k,
  useLocale: () => "tr",
}));

import { MetricChart } from "@/components/dashboard/metric-chart";
import { HomeCards } from "@/components/dashboard/home-cards";
import { DataTable } from "@/components/dashboard/data-table";

const fmt = makeDateFormats("tr");

/** Glukoz: two results in mg/dL, then a lab that reports mmol/L */
function glukoz(): DashMetric {
  const rows: [string, number, string, number, number][] = [
    ["2026-01-05", 92, "mg/dL", 70, 100],
    ["2026-02-02", 96, "mg/dL", 70, 100],
    ["2026-03-02", 5.1, "mmol/L", 3.9, 5.6],
    ["2026-04-06", 5.3, "mmol/L", 3.9, 5.6],
  ];
  const [m] = buildMetrics(
    [
      {
        id: "Glukoz",
        name: "Glukoz",
        unit: "mmol/L",
        ref_min: 3.9,
        ref_max: 5.6,
      },
    ],
    rows.map(([date, value, unit, lo, hi]) => ({
      metric_id: "Glukoz",
      date,
      value,
      unit,
      ref_low: lo,
      ref_high: hi,
    })),
  );
  return m;
}

function chart(m: DashMetric, over: Record<string, unknown> = {}) {
  captured.lines = [];
  captured.domain = undefined;
  return render(
    <MetricChart
      m={m}
      pts={m.pts}
      xDom={[m.pts[0].t, m.pts[m.pts.length - 1].t]}
      height={280}
      hover={null}
      pinned={null}
      setHover={() => {}}
      setPinned={() => {}}
      showAvg
      view={DEFAULT_VIEW}
      anchor={m.pts[m.pts.length - 1].t}
      fmt={fmt}
      onShowNormal={() => {}}
      onRemove={() => {}}
      {...over}
    />,
  );
}

describe("averages and scale never mix units", () => {
  it("card: no 'Ortalama' across a unit change, with a short hint", () => {
    const m = glukoz();
    const { container } = render(
      <HomeCards
        ids={["Glukoz"]}
        byId={new Map([["Glukoz", m]])}
        vis={new Map([["Glukoz", m.pts]])}
        showAvg
        selected={[]}
        toggleChart={() => {}}
        isHome
        canEdit
        onReorder={() => {}}
        onSetHome={() => {}}
        fmt={fmt}
        isPhone={false}
      />,
    );
    const val = container.querySelector(".mc-val")!.textContent!;
    // (92 + 96 + 5.1 + 5.3) / 4 = 49.6 is not a glucose value in any unit
    expect(val).not.toMatch(/49[.,]6/);
    expect(val).toMatch(/—/);
    expect(container.querySelector(".mc-sub")!.textContent).toBe(
      "avgMixedUnits",
    );
  });

  it("card: a window in one unit still shows its average", () => {
    const m = glukoz();
    const { container } = render(
      <HomeCards
        ids={["Glukoz"]}
        byId={new Map([["Glukoz", m]])}
        vis={new Map([["Glukoz", m.pts.slice(2)]])}
        showAvg
        selected={[]}
        toggleChart={() => {}}
        isHome
        canEdit
        onReorder={() => {}}
        onSetHome={() => {}}
        fmt={fmt}
        isPhone={false}
      />,
    );
    expect(container.querySelector(".mc-val")!.textContent).toMatch(/5[.,]2/);
  });

  it("chart: y-scale over the latest unit only, no average line, a hint", () => {
    chart(glukoz());
    expect(captured.domain![1]).toBeLessThan(20);
    expect(captured.lines.filter((l) => l.y != null)).toHaveLength(0);
    expect(screen.getByText("avgMixedUnits")).toBeInTheDocument();
  });

  it("table: no average across a unit change", () => {
    const m = glukoz();
    const { container } = render(
      <DataTable
        metrics={[m]}
        vis={new Map([["Glukoz", m.pts]])}
        pinned={null}
        setPinned={() => {}}
        showAvg
        fmt={fmt}
      />,
    );
    const foot = container.querySelector("tfoot")!.textContent!;
    expect(foot).not.toMatch(/49[.,]6/);
    expect(foot).toContain("avgMixedUnits");
  });
});

describe("Kişisel aralık", () => {
  it("counts 90 days back from the latest draw, not from today", () => {
    // six draws in Jan–Mar 2026; "today" is months later
    const dates = [
      "2026-01-05",
      "2026-01-19",
      "2026-02-02",
      "2026-02-16",
      "2026-03-02",
      "2026-03-16",
    ];
    const [m] = buildMetrics(
      [
        {
          id: "Sodyum",
          name: "Sodyum",
          unit: "mmol/L",
          ref_min: 136,
          ref_max: 146,
        },
      ],
      dates.map((date, i) => ({
        metric_id: "Sodyum",
        date,
        value: 138 + i,
        unit: "mmol/L",
        ref_low: 136,
        ref_high: 146,
      })),
    );
    chart(m, {
      showAvg: false,
      view: { ...DEFAULT_VIEW, pers: true },
      anchor: m.pts[m.pts.length - 1].t,
    });
    expect(screen.getByText("personal")).toBeInTheDocument();
  });
});
