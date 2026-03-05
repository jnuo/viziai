import { computeReportSimilarity } from "@/lib/report-similarity";

describe("computeReportSimilarity", () => {
  test("exact match — same names and values", () => {
    const existing = [
      { name: "Hemoglobin", value: 14.5 },
      { name: "WBC", value: 7200 },
    ];
    const result = computeReportSimilarity(existing, existing);
    expect(result.similarity).toBe(1);
    expect(result.overlapping).toBe(2);
  });

  test("both empty — returns similarity 1", () => {
    const result = computeReportSimilarity([], []);
    expect(result.similarity).toBe(1);
    expect(result.overlapping).toBe(0);
  });

  test("no overlap — completely different metric names", () => {
    const existing = [{ name: "Hemoglobin", value: 14.5 }];
    const incoming = [{ name: "Glucose", value: 95 }];
    const result = computeReportSimilarity(existing, incoming);
    expect(result.similarity).toBe(0);
    expect(result.overlapping).toBe(0);
  });

  test("partial overlap — 2 of 3 match", () => {
    const existing = [
      { name: "Hemoglobin", value: 14.5 },
      { name: "WBC", value: 7200 },
      { name: "Platelet", value: 250000 },
    ];
    const incoming = [
      { name: "Hemoglobin", value: 14.5 },
      { name: "WBC", value: 7200 },
      { name: "Glucose", value: 95 },
    ];
    const result = computeReportSimilarity(existing, incoming);
    expect(result.similarity).toBeCloseTo(2 / 3);
    expect(result.overlapping).toBe(2);
  });

  test("case-insensitive name matching", () => {
    const existing = [{ name: "POTASYUM", value: 4.5 }];
    const incoming = [{ name: "Potasyum", value: 4.5 }];
    const result = computeReportSimilarity(existing, incoming);
    expect(result.similarity).toBe(1);
    expect(result.overlapping).toBe(1);
  });

  test("value within 5% tolerance counts as match", () => {
    const existing = [{ name: "Hemoglobin", value: 14.5 }];
    // 14.5 * 1.049 = 15.21 — within 5%
    const incoming = [{ name: "Hemoglobin", value: 15.2 }];
    const result = computeReportSimilarity(existing, incoming);
    expect(result.overlapping).toBe(1);
  });

  test("value outside 5% tolerance does NOT match", () => {
    const existing = [{ name: "Hemoglobin", value: 14.5 }];
    // 14.5 * 1.06 = 15.37 — outside 5%
    const incoming = [{ name: "Hemoglobin", value: 15.4 }];
    const result = computeReportSimilarity(existing, incoming);
    expect(result.overlapping).toBe(0);
  });

  test("custom tolerance overrides default 5%", () => {
    const existing = [{ name: "WBC", value: 7200 }];
    const incoming = [{ name: "WBC", value: 8000 }]; // ~11% difference
    // Default 5% tolerance: no match
    expect(computeReportSimilarity(existing, incoming).overlapping).toBe(0);
    // 15% tolerance: match
    expect(computeReportSimilarity(existing, incoming, 0.15).overlapping).toBe(
      1,
    );
  });

  test("one-sided — existing has metrics, new is empty", () => {
    const existing = [
      { name: "Hemoglobin", value: 14.5 },
      { name: "WBC", value: 7200 },
    ];
    const result = computeReportSimilarity(existing, []);
    expect(result.similarity).toBe(0);
    expect(result.existingCount).toBe(2);
    expect(result.newCount).toBe(0);
  });

  test("one-sided — existing is empty, new has metrics", () => {
    const incoming = [{ name: "Hemoglobin", value: 14.5 }];
    const result = computeReportSimilarity([], incoming);
    expect(result.similarity).toBe(0);
    expect(result.existingCount).toBe(0);
    expect(result.newCount).toBe(1);
  });

  test("denominator is max(existingCount, newCount)", () => {
    // 2 existing, 5 new, 2 overlap → 2/5 = 0.4
    const existing = [
      { name: "A", value: 1 },
      { name: "B", value: 2 },
    ];
    const incoming = [
      { name: "A", value: 1 },
      { name: "B", value: 2 },
      { name: "C", value: 3 },
      { name: "D", value: 4 },
      { name: "E", value: 5 },
    ];
    const result = computeReportSimilarity(existing, incoming);
    expect(result.similarity).toBeCloseTo(0.4);
    expect(result.overlapping).toBe(2);
  });

  test("zero values are handled correctly", () => {
    const existing = [{ name: "Metric", value: 0 }];
    const incoming = [{ name: "Metric", value: 0 }];
    const result = computeReportSimilarity(existing, incoming);
    expect(result.overlapping).toBe(1);
    expect(result.similarity).toBe(1);
  });
});
