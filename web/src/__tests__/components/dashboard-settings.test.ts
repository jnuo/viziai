import { loadView, saveView, DEFAULT_VIEW, store } from "@/components/dashboard/shared";

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
