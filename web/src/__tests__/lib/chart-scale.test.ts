import {
  niceStep,
  yScale,
  placeLabels,
  timeTicks,
  fmtDelta,
  fmtV,
  timeToX,
} from "@/lib/chart/scale";
import { DAY } from "@/lib/chart/model";

describe("niceStep", () => {
  it("rounds to 1/2/2.5/5/10 × 10^n", () => {
    expect(niceStep(0.37)).toBe(0.5);
    expect(niceStep(1.2)).toBe(2);
    expect(niceStep(2.3)).toBe(2.5);
    expect(niceStep(7)).toBe(10);
    expect(niceStep(42)).toBe(50);
  });
});

describe("yScale (fit to data)", () => {
  it("#157: a chronically low Trombosit series is not flattened by its range", () => {
    // synthetic fixture
    const s = yScale([60, 70, 40, 35, 50], {
      nTicks: 5,
      refMin: 117,
      refMax: 354,
    });
    expect(s.y1).toBeLessThan(100);
    expect(s.y0).toBeGreaterThanOrEqual(20);
    expect(s.y1).toBeLessThanOrEqual(90);
  });

  it("fits the data, not the clinical range, with nice ticks", () => {
    // Hemoglobin 7.9–9.8 with normal 10.2–16.5: band must not be forced in
    const s = yScale([9.7, 9.8, 8.1, 7.9, 8.8], {
      nTicks: 5,
      refMin: 10.2,
      refMax: 16.5,
    });
    expect(s.y0).toBeLessThanOrEqual(7.9);
    expect(s.y1).toBeGreaterThanOrEqual(9.8);
    expect(s.y1).toBeLessThan(10.2 + 1);
    const steps = s.ticks.slice(1).map((t, i) => +(t - s.ticks[i]).toFixed(6));
    expect(new Set(steps).size).toBe(1);
    expect(
      [1, 2, 2.5, 5].map((x) => x * 10 ** Math.floor(Math.log10(steps[0]))),
    ).toContain(steps[0]);
  });

  it("includes the clinical range when full=true", () => {
    const s = yScale([33, 47], {
      nTicks: 5,
      full: true,
      refMin: 117,
      refMax: 354,
    });
    expect(s.y0).toBeLessThanOrEqual(33);
    expect(s.y1).toBeGreaterThanOrEqual(354);
  });

  it("enforces a minimum span of 25% of the normal-range width", () => {
    // Kreatinin 0.85 → 0.88 on 0.67–1.17 (width 0.5): span >= 0.125
    const s = yScale([0.85, 0.88], { nTicks: 5, refMin: 0.67, refMax: 1.17 });
    expect(s.y1 - s.y0).toBeGreaterThanOrEqual(0.125);
  });

  it("keeps outliers out of the domain (clamped by the chart)", () => {
    const vals = [5, 6, 7, 6.5, 5.5, 7.2, 6.1, 5.9, 6.8, 7.1, 6.3, 60.59];
    const s = yScale(vals, { nTicks: 5, refMin: 4, refMax: 11 });
    expect(s.y1).toBeLessThan(60.59);
    expect(s.y1).toBeGreaterThanOrEqual(7.2);
  });

  it("never goes below zero for non-negative data", () => {
    expect(yScale([0.1, 0.2], { nTicks: 4 }).y0).toBeGreaterThanOrEqual(0);
    expect(yScale([0.01, 2], { nTicks: 4 }).y0).toBe(0);
  });

  it("handles a single value", () => {
    const s = yScale([5], { nTicks: 4 });
    expect(s.y0).toBeLessThan(5);
    expect(s.y1).toBeGreaterThan(5);
  });
});

describe("placeLabels (label thinning)", () => {
  const bounds = { x0: 0, x1: 600, y0: 0, y1: 200 };
  const mk = (n: number, spacing = 60) =>
    Array.from({ length: n }, (_, i) => ({
      x: 20 + i * spacing,
      y: 100 + (i % 2 ? 20 : -20),
      v: 10 + (i % 2 ? -1 : 1) + i * 0.01,
      txt: fmtV(10 + i),
      dl: i ? "↑1" : "",
    }));

  it("labels every point when ≤ 8 are visible and there is room", () => {
    expect(placeLabels(mk(8), bounds)).toHaveLength(8);
  });

  it("labels only first/last/min/max when more than 8 are visible", () => {
    const pts = mk(12, 45);
    const placed = placeLabels(pts, bounds).map((l) => l.i);
    expect(placed.length).toBeLessThanOrEqual(4);
    expect(placed).toContain(11);
    expect(placed).toContain(0);
  });

  it("drops labels that would collide instead of overlapping", () => {
    const crowded = Array.from({ length: 6 }, (_, i) => ({
      x: 100 + i * 3,
      y: 100,
      v: 10,
      txt: "123.45",
      dl: "↑1.23",
    }));
    const placed = placeLabels(crowded, bounds);
    expect(placed.length).toBeLessThan(6);
    for (let a = 0; a < placed.length; a++) {
      for (let b = a + 1; b < placed.length; b++) {
        const same = Math.abs(placed[a].y - placed[b].y) < 12;
        const overlapX = Math.abs(placed[a].x - placed[b].x) < 40;
        expect(same && overlapX).toBe(false);
      }
    }
  });

  it("never drops the last label: an edge-strip label above it pushes it aside", () => {
    // last point at the top-right with the "Normal aralık ↑" label right
    // above it and the previous day's dot right below it (synthetic layout):
    // neither "above" nor "below" is free
    const pts = [
      { x: 60, y: 150, v: 9.1, txt: "9.1", dl: "" },
      { x: 520, y: 60, v: 10.1, txt: "10.1", dl: "↑0.3" },
      { x: 556, y: 50, v: 9.9, txt: "9.9", dl: "↓0.2" },
      { x: 564, y: 30, v: 10.2, txt: "10.2", dl: "↑0.3" },
    ];
    const strip = { x0: 470, x1: 600, y0: 0, y1: 22 };
    const placed = placeLabels(pts, bounds, [strip]);
    const last = placed.find((l) => l.i === 3);
    expect(last).toBeDefined();
    // it found a free spot: not on top of the strip label
    const top = last!.y - 9.5; // label box top (12px high)
    expect(top).toBeGreaterThanOrEqual(strip.y1);
  });

  it("never drops the last label even when every spot is taken", () => {
    const pts = [
      { x: 100, y: 100, v: 1, txt: "1", dl: "" },
      { x: 300, y: 100, v: 2, txt: "2", dl: "↑1" },
    ];
    const wall = { x0: 0, x1: 600, y0: 0, y1: 200 };
    expect(placeLabels(pts, bounds, [wall]).map((l) => l.i)).toEqual([1]);
  });

  it("also labels the pinned point on a dense series", () => {
    const pts = mk(12, 45);
    expect(placeLabels(pts, bounds, [], 5).map((l) => l.i)).toContain(5);
    expect(placeLabels(pts, bounds).map((l) => l.i)).not.toContain(5);
  });

  it("labels exactly first/last/min/max on 12 well-spaced points", () => {
    const pts = Array.from({ length: 12 }, (_, i) => ({
      x: 20 + i * 50,
      y: 100,
      v: [5, 6, 7, 3, 6, 6, 9, 6, 6, 6, 6, 6.5][i],
      txt: "1",
      dl: "",
    }));
    pts.forEach((p) => (p.y = 150 - p.v * 10));
    expect(
      placeLabels(pts, bounds)
        .map((l) => l.i)
        .sort((a, b) => a - b),
    ).toEqual([0, 3, 6, 11]);
  });

  it("respects obstacles (e.g. the average pill)", () => {
    const pts = [
      { x: 100, y: 100, v: 1, txt: "1", dl: "" },
      { x: 400, y: 160, v: 2, txt: "2", dl: "↑1" },
    ];
    const block = [
      { x0: 0, x1: 300, y0: 70, y1: 95 },
      { x0: 0, x1: 300, y0: 105, y1: 130 },
      { x0: 0, x1: 300, y0: 94, y1: 106 },
    ];
    // the first point has no free spot and is dropped; the last one is free
    expect(placeLabels(pts, bounds, block).map((l) => l.i)).toEqual([1]);
  });
});

describe("time scale", () => {
  it("draws gaps to scale (26 Eki → 17 Kas is ≥ 15× the 17 → 18 Kas gap)", () => {
    const d = (m: number, day: number) => Date.UTC(2026, m, day);
    const dom: [number, number] = [d(9, 25), d(10, 21)];
    const x = (t: number) => timeToX(t, dom, 40, 600);
    const big = x(d(10, 17)) - x(d(9, 26));
    const small = x(d(10, 18)) - x(d(10, 17));
    expect(big / small).toBeGreaterThanOrEqual(15);
  });
});

describe("timeTicks", () => {
  it("uses days for short spans and months for long ones", () => {
    const t0 = Date.UTC(2026, 9, 26);
    expect(timeTicks(t0, t0 + 25 * DAY, 500)[0].unit).toBe("day");
    expect(timeTicks(t0, t0 + 400 * DAY, 500)[0].unit).toBe("month");
    expect(timeTicks(t0, t0 + 3650 * DAY, 300)[0].unit).toBe("year");
  });
});

describe("formatting", () => {
  it("formats deltas with arrows and . decimals", () => {
    expect(fmtDelta(0.1)).toBe("↑0.1");
    expect(fmtDelta(-5)).toBe("↓5");
    expect(fmtDelta(0)).toBe("±0");
    expect(fmtV(9.8)).toBe("9.8");
  });
});
