import {
  loadView,
  saveView,
  DEFAULT_VIEW,
  store,
  loadRangeChoice,
  saveRangeChoice,
} from "@/components/dashboard/shared";

describe("Görünüm settings persistence", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    window.localStorage.clear();
  });

  it("restores saved settings", () => {
    saveView({ full: true, pers: true, labels: false, cols: 2, size: "l" });
    expect(loadView()).toEqual({ full: true, pers: true, labels: false, cols: 2, size: "l" });
  });

  it("defaults: normal range off, personal range off, labels on", () => {
    expect(loadView()).toEqual(DEFAULT_VIEW);
    expect(DEFAULT_VIEW).toMatchObject({ full: false, pers: false, labels: true });
  });

  it("ignores invalid stored values", () => {
    window.localStorage.setItem(
      "viziai.dashboard.view",
      JSON.stringify({ cols: 7, size: "xl", labels: "yes" }),
    );
    expect(loadView()).toEqual(DEFAULT_VIEW);
  });

  it("falls back to defaults when localStorage throws", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    expect(() => saveView({ ...DEFAULT_VIEW, cols: 3 })).not.toThrow();
    expect(loadView()).toEqual(DEFAULT_VIEW);
    expect(store.get("anything", 42)).toBe(42);
  });
});

describe("date range persistence (per profile)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    window.localStorage.clear();
  });

  it("is automatic (null) until the user picks a range", () => {
    expect(loadRangeChoice("p1")).toBeNull();
  });

  it("keeps an explicit choice per profile", () => {
    saveRangeChoice("p1", { kind: "preset", preset: "6m" });
    saveRangeChoice("p2", { kind: "custom", from: 10, to: 20 });
    expect(loadRangeChoice("p1")).toEqual({ kind: "preset", preset: "6m" });
    expect(loadRangeChoice("p2")).toEqual({ kind: "custom", from: 10, to: 20 });
    expect(loadRangeChoice("p3")).toBeNull();
  });

  it("going back to automatic clears the choice", () => {
    saveRangeChoice("p1", { kind: "preset", preset: "1y" });
    saveRangeChoice("p1", null);
    expect(loadRangeChoice("p1")).toBeNull();
  });

  it("an invalid stored value means automatic", () => {
    window.localStorage.setItem("viziai.dashboard.range.p1", JSON.stringify("90"));
    expect(loadRangeChoice("p1")).toBeNull();
    window.localStorage.setItem("viziai.dashboard.range.p1", "{not json");
    expect(loadRangeChoice("p1")).toBeNull();
  });

  it("blocked storage: automatic, and saving does not throw", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    expect(() =>
      saveRangeChoice("p1", { kind: "preset", preset: "3m" }),
    ).not.toThrow();
    expect(loadRangeChoice("p1")).toBeNull();
  });
});
