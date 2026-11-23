/**
 * @jest-environment node
 *
 * PUT /api/metric-order writes per-profile Ana ekran state + order.
 * #158: a viewer must not be able to write it (was 200 before the fix).
 */
jest.mock("@/lib/db", () => ({ sql: jest.fn(async () => []) }));
jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn(async () => "user-1"),
  hasProfileAccess: jest.fn(async () => true),
  getProfileAccessLevel: jest.fn(async () => "viewer"),
}));

import { PUT } from "@/app/api/metric-order/route";
import { sql } from "@/lib/db";
import { getProfileAccessLevel, requireAuth } from "@/lib/auth";
import { parseNameList } from "@/lib/chart/name-list";

const sqlMock = sql as unknown as jest.Mock;
const levelMock = getProfileAccessLevel as jest.Mock;

function put(body: unknown) {
  return PUT(
    new Request("http://localhost/api/metric-order", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  sqlMock.mockClear();
  levelMock.mockReset();
  levelMock.mockResolvedValue("viewer");
});

it("rejects a viewer with 403 and writes nothing", async () => {
  const res = await put({ profileId: "p1", order: ["Hemoglobin", "Trombosit"] });
  expect(res.status).toBe(403);
  expect(sql).not.toHaveBeenCalled();
});

it("rejects a viewer writing Ana ekran with 403", async () => {
  const res = await put({ profileId: "p1", home: ["Hemoglobin"] });
  expect(res.status).toBe(403);
  expect(sql).not.toHaveBeenCalled();
});

it("rejects a user without access to the profile", async () => {
  levelMock.mockResolvedValue(null);
  const res = await put({ profileId: "p1", home: ["Hemoglobin"] });
  expect(res.status).toBe(403);
});

it("rejects unauthenticated requests", async () => {
  (requireAuth as jest.Mock).mockResolvedValueOnce(null);
  const res = await put({ profileId: "p1", home: [] });
  expect(res.status).toBe(401);
});

/** the name lookup knows every name it is asked about */
const knowsAll = () =>
  sqlMock.mockImplementationOnce(async (_s: unknown, ...params: unknown[]) =>
    (params[1] as string[]).map((name) => ({ name })),
  );

it.each(["owner", "editor"])("lets an %s write Ana ekran in ONE batched statement", async (lvl) => {
  levelMock.mockResolvedValue(lvl);
  knowsAll();
  const res = await put({ profileId: "p1", home: ["Trombosit", "Hemoglobin", "Trombosit"] });
  expect(res.status).toBe(200);
  expect(sqlMock).toHaveBeenCalledTimes(2); // name lookup + one write
  const [strings, ...params] = sqlMock.mock.calls[1];
  const text = (strings as string[]).join("?");
  expect(text).toMatch(/INSERT INTO metric_preferences/);
  expect(text).toMatch(/ON CONFLICT \(profile_id, name\) DO UPDATE/);
  expect(text).toMatch(/is_favorite = false/);
  // de-duplicated, order kept
  expect(params).toContainEqual(["Trombosit", "Hemoglobin"]);
});

it("upserts the legacy order in one statement (no silent drops)", async () => {
  levelMock.mockResolvedValue("editor");
  knowsAll();
  const res = await put({ profileId: "p1", order: ["A", "B", "C"] });
  expect(res.status).toBe(200);
  expect(sqlMock).toHaveBeenCalledTimes(2);
  expect((sqlMock.mock.calls[1][0] as string[]).join("?")).toMatch(/INSERT INTO metric_preferences[\s\S]*ON CONFLICT/);
});

it.each([
  [{ profileId: "p1" }],
  [{ profileId: "p1", home: "Hemoglobin" }],
  [{ profileId: "p1", home: [1, 2] }],
  [{ profileId: "p1", home: ["x".repeat(201)] }],
  [{ profileId: "p1", home: Array.from({ length: 501 }, (_, i) => `m${i}`) }],
  [{ home: ["Hemoglobin"] }],
])("rejects invalid input %j with 400", async (body) => {
  levelMock.mockResolvedValue("owner");
  const res = await put(body);
  expect(res.status).toBe(400);
  expect(sql).not.toHaveBeenCalled();
});

describe("PUT accepts only names the profile has", () => {
  beforeEach(() => {
    levelMock.mockResolvedValue("editor");
    sqlMock.mockReset();
  });

  it("rejects a made-up name with 400 and writes nothing", async () => {
    // the profile knows Hemoglobin only
    sqlMock.mockResolvedValueOnce([{ name: "Hemoglobin" }]);
    const res = await put({ profileId: "p1", home: ["Hemoglobin", "Made up"] });
    expect(res.status).toBe(400);
    expect(sqlMock).toHaveBeenCalledTimes(1); // the lookup, no write
  });

  it("rejects made-up names on the legacy order path too", async () => {
    sqlMock.mockResolvedValueOnce([]);
    const res = await put({ profileId: "p1", order: ["Made up"] });
    expect(res.status).toBe(400);
    expect(sqlMock).toHaveBeenCalledTimes(1);
  });

  it("accepts known names plus the Kilo / Tansiyon ids", async () => {
    sqlMock.mockResolvedValueOnce([{ name: "Hemoglobin" }]).mockResolvedValue([]);
    const res = await put({
      profileId: "p1",
      home: ["__tracking_weight", "Hemoglobin"],
    });
    expect(res.status).toBe(200);
    expect(sqlMock).toHaveBeenCalledTimes(2); // lookup + one batched write
  });
});

describe("parseNameList", () => {
  it("keeps stored names exactly (no trim), so the upsert hits the existing row", () => {
    expect(parseNameList(["Ferritin ", "Hemoglobin"])).toEqual(["Ferritin ", "Hemoglobin"]);
  });
  it("rejects blank names and de-duplicates", () => {
    expect(parseNameList(["  "])).toBeNull();
    expect(parseNameList(["A", "A"])).toEqual(["A"]);
  });
});

describe("PR #160 review: an empty Ana ekran must be an explicit clear", () => {
  beforeEach(() => {
    levelMock.mockResolvedValue("owner");
    sqlMock.mockReset();
    sqlMock.mockResolvedValue([]);
  });

  it("refuses home: [] without clear: true and writes nothing", async () => {
    const res = await put({ profileId: "p1", home: [] });
    expect(res.status).toBe(409);
    expect(sqlMock).not.toHaveBeenCalled();
  });

  it("clears it when the last item is removed explicitly (clear: true)", async () => {
    const res = await put({ profileId: "p1", home: [], clear: true });
    expect(res.status).toBe(200);
    expect(sqlMock).toHaveBeenCalledTimes(1); // one batched write, no lookup
    expect((sqlMock.mock.calls[0][0] as string[]).join("?")).toMatch(/is_favorite = false/);
  });
});
