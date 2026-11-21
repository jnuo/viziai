import {
  buildMetrics,
  pickDefaultHome,
  orderCharts,
  moveItem,
  searchMetrics,
  sorter,
  fold,
  personalBand,
  prettifyName,
  normalizeCategory,
  statusOf,
  changeBetween,
  cleanUnit,
  unitKey,
  mergeVariants,
  toMs,
  DAY,
  type RawMetric,
  type RawValue,
} from "@/lib/chart/model";

const D1 = "2026-10-01";
const D2 = "2026-11-20";

function metric(
  id: string,
  ref_min: number | null,
  ref_max: number | null,
  values: [string, number][],
  extra: Partial<RawMetric> = {},
): { m: RawMetric; v: RawValue[] } {
  return {
    m: { id, name: id, unit: "u", ref_min, ref_max, ...extra },
    v: values.map(([date, value]) => ({
      metric_id: id,
      date,
      value,
      ref_low: ref_min,
      ref_high: ref_max,
      unit: "u",
    })),
  };
}

function build(list: ReturnType<typeof metric>[]) {
  return buildMetrics(
    list.map((x) => x.m),
    list.flatMap((x) => x.v),
  );
}

describe("empty-state ranking (pickDefaultHome)", () => {
  const set = [
    // big move relative to range width (|Δ| 7 of width 5)
    metric("CRP", 0, 5, [
      [D1, 45.6],
      [D2, 38.6],
    ]),
    // tiny value change: 0.1 -> 0.2 on a 0.1–0.9 range (share 0.125) -> excluded
    metric("BAS%", 0.1, 0.9, [
      [D1, 0.1],
      [D2, 0.2],
    ]),
    // no reference range -> excluded even with a big change
    metric("Mystery", null, null, [
      [D1, 1],
      [D2, 100],
    ]),
    // moderate move, stays in range (share 0.42)
    metric("Lökosit", 4.22, 11.58, [
      [D1, 4.31],
      [D2, 7.41],
    ]),
    // small move but crosses out of range (share 0.095) -> qualifies, ranked first
    metric("Hemoglobin", 10.2, 16.5, [
      [D1, 10.3],
      [D2, 9.7],
    ]),
    // big move but not in the latest report -> excluded
    metric("Old", 0, 10, [
      [D1, 1],
      ["2026-10-05", 9],
    ]),
    // first measurement only -> excluded
    metric("New", 0, 10, [[D2, 5]]),
  ];
  const ms = build(set);

  it("puts range crossings first, then ranks by |Δ| / range width", () => {
    expect(pickDefaultHome(ms)).toEqual(["Hemoglobin", "CRP", "Lökosit"]);
  });

  it("ignores tiny changes and metrics without a range", () => {
    const ids = pickDefaultHome(ms);
    expect(ids).not.toContain("BAS%");
    expect(ids).not.toContain("Mystery");
    expect(ids).not.toContain("Old");
  });

  it("ranks a small move on a narrow range above a bigger raw move on a wide one", () => {
    const ms2 = build([
      metric("Wide", 117, 354, [[D1, 150], [D2, 210]]), // Δ60, 0.25 of width
      metric("Narrow", 70, 100, [[D1, 80], [D2, 95]]), // Δ15, 0.5 of width
    ]);
    expect(pickDefaultHome(ms2)).toEqual(["Narrow", "Wide"]);
  });

  it("caps at n", () => {
    expect(pickDefaultHome(ms, 1)).toEqual(["Hemoglobin"]);
  });

  it("falls back to out-of-range latest values when nothing changed enough", () => {
    const quiet = build([
      metric("A", 0, 10, [
        [D1, 5],
        [D2, 5.1],
      ]),
      metric("B", 0, 10, [
        [D1, 12],
        [D2, 12.1],
      ]),
    ]);
    expect(pickDefaultHome(quiet)).toEqual(["B"]);
  });
});

describe("series model", () => {
  it("keeps one value per date, the later upload wins", () => {
    const [m] = buildMetrics(
      [{ id: "X", name: "X", unit: "u", ref_min: 0, ref_max: 10 }],
      [
        { metric_id: "X", date: D2, value: 1 },
        { metric_id: "X", date: D2, value: 2 },
      ],
    );
    expect(m.pts).toHaveLength(1);
    expect(m.pts[0].v).toBe(2);
  });

  it("does not compute a change across a unit switch", () => {
    const a = { t: 1, v: 1, refMin: null, refMax: null, unit: "mg/dL" };
    const b = { t: 2, v: 10, refMin: null, refMax: null, unit: "mg/L" };
    expect(changeBetween(a, b)).toBeNull();
    expect(changeBetween(a, { ...b, unit: "mg/dL" })).toBe(9);
  });

  it("treats metrics without a range as neutral, never in range", () => {
    expect(statusOf(5, null, null)).toBe("none");
    expect(statusOf(5, 1, null)).toBe("ok");
    expect(statusOf(0.5, 1, null)).toBe("low");
  });

  it("personal band needs 5 values in the last 90 days", () => {
    const today = toMs(D2);
    const pts = [1, 2, 3, 4].map((v, i) => ({ t: today - i * DAY, v }));
    expect(personalBand(pts, today)).toBeNull();
    const five = [...pts, { t: today - 10 * DAY, v: 5 }];
    expect(personalBand(five, today)).toEqual([1.4, 4.6]);
    const old = five.map((p) => ({ ...p, t: p.t - 200 * DAY }));
    expect(personalBand(old, today)).toBeNull();
  });
});

describe("chart order follows Ana ekran", () => {
  it("orders opened charts by home order, others after in opening order", () => {
    const home = ["A", "B", "C"];
    expect(orderCharts(["X", "C", "A", "Y"], home)).toEqual([
      "A",
      "C",
      "X",
      "Y",
    ]);
  });

  it("re-orders live when home is reordered", () => {
    const selected = ["A", "B", "Z"];
    const home = ["A", "B", "C"];
    const moved = moveItem(home, 1, 0); // drag B before A
    expect(moved).toEqual(["B", "A", "C"]);
    expect(orderCharts(selected, moved)).toEqual(["B", "A", "Z"]);
  });

  it("moveItem ignores out-of-range moves", () => {
    expect(moveItem(["A"], 0, 1)).toEqual(["A"]);
  });
});

describe("search", () => {
  const ms = build([
    metric("Hemoglobin", 10, 16, [[D2, 9]]),
    metric("Trombosit", 150, 400, [[D2, 47]]),
    metric("İnsülin", 2, 25, [[D2, 8]]),
    metric("Lökosit", 4, 11, [[D2, 7]]),
    metric("Kreatinin", 0.6, 1.2, [[D2, 0.9]], { aliases: ["Creatinine"] }),
    metric("C REAKTİF PROTEİN (CRP)", 0, 5, [[D2, 38]]),
  ]);
  const ids = (q: string) => searchMetrics(ms, q)?.list.map((m) => m.id);

  it("folds Turkish characters and dotted/dotless i", () => {
    expect(fold("İnsülin")).toBe("insulin");
    expect(fold("INSÜLIN")).toBe("insulin");
    expect(fold("ıŞĞÇÖ")).toBe("isgco");
    expect(ids("insulin")).toEqual(["İnsülin"]);
    expect(ids("İNSÜLİN")).toEqual(["İnsülin"]);
    expect(ids("lokosit")).toEqual(["Lökosit"]);
    expect(ids("LÖKOSİT")).toEqual(["Lökosit"]);
  });

  it("matches abbreviations through the alias table", () => {
    expect(ids("hb")?.[0]).toBe("Hemoglobin");
    expect(ids("PLT")?.[0]).toBe("Trombosit");
    expect(ids("wbc")?.[0]).toBe("Lökosit");
    expect(ids("crp")?.[0]).toBe("C REAKTİF PROTEİN (CRP)");
    expect(searchMetrics(ms, "Hb")?.alias).toBe("Hemoglobin");
  });

  it("matches translations / DB aliases", () => {
    expect(ids("creatin")).toEqual(["Kreatinin"]);
  });

  it("returns null for an empty query", () => {
    expect(searchMetrics(ms, "   ")).toBeNull();
  });
});

describe("sorting", () => {
  const ms = build([
    metric("InRange", 0, 10, [
      [D1, 5],
      [D2, 6],
    ]),
    metric("NoRange", null, null, [
      [D1, 5],
      [D2, 6],
    ]),
    metric("Out", 0, 10, [
      [D1, 5],
      [D2, 12],
    ]),
  ]);
  it("'out' puts out-of-range first and metrics without a range last", () => {
    expect([...ms].sort(sorter("out")).map((m) => m.id)).toEqual([
      "Out",
      "InRange",
      "NoRange",
    ]);
  });
  it("'own' follows the Ana ekran order", () => {
    expect(
      [...ms].sort(sorter("own", ["NoRange", "Out"])).map((m) => m.id),
    ).toEqual(["NoRange", "Out", "InRange"]);
  });
});

describe("names and categories", () => {
  it("title-cases shouting lab names and keeps abbreviations", () => {
    expect(prettifyName("C REAKTİF PROTEİN (CRP)")).toBe(
      "C Reaktif Protein (CRP)",
    );
    expect(prettifyName("POTASYUM (SERUM/PLAZMA)")).toBe("Potasyum");
    expect(prettifyName("Hemoglobin")).toBe("Hemoglobin");
  });

  it("maps legacy categories, infers missing ones, splits out kidney tests", () => {
    expect(normalizeCategory("CBC", "Hemoglobin")).toBe("hemogram");
    expect(normalizeCategory("biyokimya", "Kreatinin")).toBe("bobrek");
    expect(normalizeCategory(null, "Troponin I")).toBe("kardiyak");
    expect(normalizeCategory(null, "Bilinmeyen test")).toBe("diger");
  });
});

describe("units", () => {
  it("treats lab flags and dashes as no unit", () => {
    expect(cleanUnit("-")).toBe("");
    expect(cleanUnit("H")).toBe("");
    expect(cleanUnit(" N ")).toBe("");
    expect(cleanUnit("N.%")).toBe("%");
    expect(cleanUnit("mg/dL")).toBe("mg/dL");
    expect(cleanUnit("L/L")).toBe("L/L");
  });

  it("normalises spellings of the same unit", () => {
    expect(unitKey("x10^3/uL")).toBe(unitKey("10³/μL"));
    expect(unitKey("10^3/µL")).toBe(unitKey("10^3/uL"));
    expect(unitKey("mg/dL")).not.toBe(unitKey("mg/L"));
  });

  it("does not report a change for a flag-only 'unit'", () => {
    const a = { t: 1, v: 1, refMin: null, refMax: null, unit: cleanUnit("fL") };
    const b = { t: 2, v: 2, refMin: null, refMax: null, unit: cleanUnit("H") };
    expect(changeBetween(a, b)).toBe(1);
  });
});

describe("mergeVariants", () => {
  const v = (id: string, date: string, value: number): RawValue => ({ metric_id: id, date, value });

  it("merges Turkish-case spellings and the same definition with the same unit", () => {
    const { metrics, values } = mergeVariants(
      [
        { id: "MON%", name: "MON%", unit: "%", ref_min: 2, ref_max: 12, metric_definition_id: "d1" },
        { id: "Monosit%", name: "Monosit%", unit: "%", ref_min: 2, ref_max: 12, metric_definition_id: "d1" },
        { id: "POTASYUM", name: "POTASYUM", unit: "mmol/L", ref_min: 3.5, ref_max: 5.1 },
        { id: "Potasyum", name: "Potasyum", unit: "mmol/L", ref_min: 3.5, ref_max: 5.1 },
      ],
      [v("Monosit%", D1, 5), v("POTASYUM", D2, 4)],
    );
    expect(metrics.map((m) => m.id)).toEqual(["MON%", "POTASYUM"]);
    expect(metrics[0].name).toBe("Monosit%");
    expect(metrics[0].aliases).toContain("MON%");
    expect(values.map((x) => x.metric_id)).toEqual(["MON%", "POTASYUM"]);
  });

  it("keeps the same definition apart when the unit differs", () => {
    const { metrics } = mergeVariants(
      [
        { id: "BUN", name: "BUN", unit: "mg/dL", ref_min: 6, ref_max: 20, metric_definition_id: "d2" },
        { id: "Üre", name: "Üre", unit: "mmol/L", ref_min: 2, ref_max: 7, metric_definition_id: "d2" },
      ],
      [],
    );
    expect(metrics).toHaveLength(2);
  });
});
