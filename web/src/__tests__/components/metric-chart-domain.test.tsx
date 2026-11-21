/**
 * #157: chart y-domain for a chronically low series (synthetic fixture:
 * Trombosit [60, 70, 40, 35, 50], range 117–354). Red on origin/main:
 * the domain was forced to include the reference range (max 385.9).
 */
import { render } from "@testing-library/react";
import { buildMetrics } from "@/lib/chart/model";
import { DEFAULT_VIEW, makeDateFormats } from "@/components/dashboard/shared";

const captured: { domain?: [number, number]; areas: unknown[] } = { areas: [] };
jest.mock("recharts", () => {
  const Pass = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  const Null = () => null;
  return {
    ResponsiveContainer: Pass,
    LineChart: Pass,
    CartesianGrid: Null,
    XAxis: Null,
    Line: Null,
    ReferenceLine: Null,
    usePlotArea: () => undefined,
    ReferenceArea: (p: unknown) => {
      captured.areas.push(p);
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

function renderChart(full: boolean) {
  const dates = ["2026-10-26", "2026-11-17", "2026-11-18", "2026-11-19", "2026-11-20"];
  const vals = [60, 70, 40, 35, 50];
  const [m] = buildMetrics(
    [{ id: "Trombosit", name: "Trombosit", unit: "x10³/µL", ref_min: 117, ref_max: 354 }],
    dates.map((date, i) => ({
      metric_id: "Trombosit",
      date,
      value: vals[i],
      ref_low: 117,
      ref_high: 354,
      unit: "x10³/µL",
    })),
  );
  captured.areas = [];
  render(
    <MetricChart
      m={m}
      pts={m.pts}
      xDom={[m.pts[0].t, m.pts[4].t]}
      height={280}
      hover={null}
      pinned={null}
      setHover={() => {}}
      setPinned={() => {}}
      showAvg={false}
      view={{ ...DEFAULT_VIEW, full }}
      today={m.pts[4].t}
      fmt={makeDateFormats("tr")}
      onShowNormal={() => {}}
      onRemove={() => {}}
    />,
  );
}

it("fits the y-domain to the values, not the reference range", () => {
  renderChart(false);
  expect(captured.domain![1]).toBeLessThan(100);
  // band fully off-scale: not shaded (the edge strip points to it instead)
  expect(captured.areas).toHaveLength(0);
});

it("includes the whole range when 'Normal aralığı göster' is on", () => {
  renderChart(true);
  expect(captured.domain![1]).toBeGreaterThanOrEqual(354);
  expect(captured.areas.length).toBeGreaterThan(0);
});
