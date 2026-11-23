import {
  AUTO_MIN_DATES,
  autoPreset,
  localDateToUtc,
  normalizeCustom,
  parseRangeChoice,
  presetStart,
  rangeAnchor,
  rangeBounds,
  utcToLocalDate,
} from "@/lib/chart/range";
import { DAY, toMs } from "@/lib/chart/model";

/** n draw dates, every `gap` days, the last one on `last` */
function draws(last: string, n: number, gap: number): number[] {
  const end = toMs(last);
  return Array.from({ length: n }, (_, i) => end - (n - 1 - i) * gap * DAY);
}

describe("presetStart (anchored to the latest draw)", () => {
  const anchor = toMs("2026-05-31");
  it("2 hafta is 14 days back", () => {
    expect(presetStart("2w", anchor)).toBe(toMs("2026-05-17"));
  });
  it("months are calendar months, clamped to the month's last day", () => {
    expect(presetStart("1m", toMs("2026-03-31"))).toBe(toMs("2026-02-28"));
    expect(presetStart("1m", anchor)).toBe(toMs("2026-04-30"));
    expect(presetStart("3m", anchor)).toBe(toMs("2026-02-28"));
    expect(presetStart("6m", anchor)).toBe(toMs("2025-11-30"));
    expect(presetStart("1y", anchor)).toBe(toMs("2025-05-31"));
  });
  it("Tümü has no lower bound", () => {
    expect(presetStart("all", anchor)).toBe(-Infinity);
  });
});

describe("autoPreset: smallest preset with >= 8 draw dates, never below 1 ay", () => {
  it("uses 8 as the threshold", () => {
    expect(AUTO_MIN_DATES).toBe(8);
  });

  it("dense recent data -> 1 ay", () => {
    // 80 draws, every 3 days: 11 of them fall in the last month
    expect(autoPreset(draws("2026-11-20", 80, 3), toMs("2026-11-20"))).toBe(
      "1m",
    );
  });

  it("never picks 2 hafta, even when 2 weeks hold 8+ dates", () => {
    expect(autoPreset(draws("2026-11-20", 40, 1), toMs("2026-11-20"))).toBe(
      "1m",
    );
  });

  it("weekly draws -> 3 ay", () => {
    // 4-5 dates in a month, ~13 in three months
    expect(autoPreset(draws("2026-11-20", 30, 7), toMs("2026-11-20"))).toBe(
      "3m",
    );
  });

  it("every 3 weeks -> 6 ay", () => {
    expect(autoPreset(draws("2026-11-20", 20, 21), toMs("2026-11-20"))).toBe(
      "6m",
    );
  });

  it("monthly -> 1 yıl", () => {
    expect(autoPreset(draws("2026-11-20", 15, 30), toMs("2026-11-20"))).toBe(
      "1y",
    );
  });

  it("very sparse (no preset reaches 8) -> Tümü", () => {
    expect(autoPreset(draws("2026-11-20", 6, 30), toMs("2026-11-20"))).toBe(
      "all",
    );
    expect(autoPreset([], toMs("2026-11-20"))).toBe("all");
  });

  it("counts distinct dates, not values", () => {
    const d = draws("2026-11-20", 7, 2);
    // the same 7 dates, measured by 10 metrics: still 7 < 8
    const many = Array.from({ length: 10 }, () => d).flat();
    expect(autoPreset(many, toMs("2026-11-20"))).toBe("all");
    expect(autoPreset([...many, toMs("2026-11-01")], toMs("2026-11-20"))).toBe(
      "1m",
    );
  });

  it("anchors to the latest draw, not today: an old profile still gets 1 ay", () => {
    // last draw three months before "today"; 10 draws in its final month
    const ts = draws("2026-08-20", 10, 3);
    expect(autoPreset(ts, toMs("2026-08-20"))).toBe("1m");
    const [lo] = rangeBounds(
      { kind: "preset", preset: "1m" },
      toMs("2026-08-20"),
    );
    expect(ts.filter((t) => t >= lo)).toHaveLength(10);
  });
});

describe("rangeAnchor", () => {
  const today = toMs("2026-11-23");
  it("is the latest lab draw, not today", () => {
    expect(
      rangeAnchor([toMs("2026-08-01"), toMs("2026-08-20")], [], today),
    ).toBe(toMs("2026-08-20"));
  });
  it("ignores later tracking readings when there are lab draws", () => {
    expect(
      rangeAnchor([toMs("2026-08-20")], [toMs("2026-11-01")], today),
    ).toBe(toMs("2026-08-20"));
  });
  it("falls back to tracking, then to today", () => {
    expect(rangeAnchor([], [toMs("2026-10-01")], today)).toBe(toMs("2026-10-01"));
    expect(rangeAnchor([], [], today)).toBe(today);
  });
});

describe("rangeBounds", () => {
  const anchor = toMs("2026-05-31");
  it("presets: [start, open end]", () => {
    expect(rangeBounds({ kind: "preset", preset: "3m" }, anchor)).toEqual([
      toMs("2026-02-28"),
      Infinity,
    ]);
    expect(rangeBounds({ kind: "preset", preset: "all" }, anchor)).toEqual([
      -Infinity,
      Infinity,
    ]);
  });
  it("custom: inclusive [from, to]", () => {
    const from = toMs("2026-03-01");
    const to = toMs("2026-04-01");
    expect(rangeBounds({ kind: "custom", from, to }, anchor)).toEqual([
      from,
      to,
    ]);
  });
});

describe("normalizeCustom: validation and clamping to the data span", () => {
  const span: [number, number] = [toMs("2026-01-05"), toMs("2026-04-20")];
  it("keeps a valid range inside the span", () => {
    expect(
      normalizeCustom(toMs("2026-02-01"), toMs("2026-03-01"), span),
    ).toEqual({
      kind: "custom",
      from: toMs("2026-02-01"),
      to: toMs("2026-03-01"),
    });
  });
  it("a single day is valid", () => {
    const d = toMs("2026-02-02");
    expect(normalizeCustom(d, d, span)).toEqual({
      kind: "custom",
      from: d,
      to: d,
    });
  });
  it("rejects start after end", () => {
    expect(
      normalizeCustom(toMs("2026-03-01"), toMs("2026-02-01"), span),
    ).toBeNull();
  });
  it("rejects missing or non-finite bounds", () => {
    expect(normalizeCustom(undefined, toMs("2026-02-01"), span)).toBeNull();
    expect(normalizeCustom(NaN, toMs("2026-02-01"), span)).toBeNull();
  });
  it("clamps to the data span", () => {
    expect(
      normalizeCustom(toMs("2025-06-01"), toMs("2026-12-31"), span),
    ).toEqual({
      kind: "custom",
      from: span[0],
      to: span[1],
    });
  });
  it("rejects a range entirely outside the data", () => {
    expect(
      normalizeCustom(toMs("2026-06-01"), toMs("2026-07-01"), span),
    ).toBeNull();
  });
  it("without a data span only checks the order", () => {
    expect(
      normalizeCustom(toMs("2026-06-01"), toMs("2026-07-01"), null),
    ).toEqual({
      kind: "custom",
      from: toMs("2026-06-01"),
      to: toMs("2026-07-01"),
    });
  });
});

describe("parseRangeChoice (stored values)", () => {
  it("accepts presets and valid custom ranges", () => {
    expect(parseRangeChoice({ kind: "preset", preset: "6m" })).toEqual({
      kind: "preset",
      preset: "6m",
    });
    expect(parseRangeChoice({ kind: "custom", from: 1, to: 2 })).toEqual({
      kind: "custom",
      from: 1,
      to: 2,
    });
  });
  it("anything else means automatic (null)", () => {
    for (const v of [
      null,
      "30",
      { kind: "preset", preset: "90" },
      { kind: "custom", from: 5, to: 2 },
      { kind: "custom", from: "a", to: 2 },
    ]) {
      expect(parseRangeChoice(v)).toBeNull();
    }
  });
});

describe("calendar day <-> UTC midnight", () => {
  it("round-trips without a timezone shift", () => {
    const t = toMs("2026-03-23");
    const d = utcToLocalDate(t);
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 2, 23]);
    expect(localDateToUtc(d)).toBe(t);
  });
});
