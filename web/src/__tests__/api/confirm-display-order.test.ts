/**
 * @jest-environment node
 *
 * PR #160 review: upload confirm and e-Nabız confirm insert NEW metrics at
 * the end of the profile's order (max(display_order) + 1, + 2, …) in one
 * statement, instead of the column default 0, which put every new metric
 * ahead of the Ana ekran's first item. Existing rows keep their order.
 */
jest.mock("@/lib/db", () => ({ sql: jest.fn() }));
jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn(async () => "user-1"),
  getProfileAccessLevel: jest.fn(async () => "owner"),
}));
jest.mock("@/lib/error-reporting", () => ({ reportError: jest.fn() }));
jest.mock("@/lib/metric-definitions", () => ({
  processMetricsBatch: jest.fn(
    async (raw: { value: number; unit?: string }[]) =>
      raw.map((m) => ({
        value: m.value,
        unit: m.unit ?? null,
        refLow: null,
        refHigh: null,
        flag: null,
        definitionId: null,
        resolved: false,
      })),
  ),
  trackUnmappedMetrics: jest.fn(),
}));

import { sql } from "@/lib/db";
import { POST as confirmUpload } from "@/app/api/upload/[id]/confirm/route";
import { POST as confirmEnabiz } from "@/app/api/import/enabiz/pending/[id]/confirm/route";

const sqlMock = sql as unknown as jest.Mock;

/** answer each statement by what it does */
function routeSql() {
  sqlMock.mockReset();
  sqlMock.mockImplementation(async (strings: TemplateStringsArray) => {
    const text = strings.join("?");
    if (/UPDATE pending_uploads[\s\S]*RETURNING/.test(text))
      return [
        {
          id: "u1",
          profile_id: "p1",
          file_name: "f.pdf",
          content_hash: null,
          file_url: null,
        },
      ];
    if (/FROM pending_imports/.test(text))
      return [
        {
          id: "i1",
          profile_id: "p1",
          status: "pending",
          expires_at: new Date(Date.now() + 3_600_000).toISOString(),
          hospital_name: "Synthetic Lab",
          content_hash: "synthetic-hash",
        },
      ];
    if (/INSERT INTO reports/.test(text)) return [{ id: "r1" }];
    if (/INSERT INTO metrics/.test(text)) return [{ is_insert: true }];
    return [];
  });
}

const BODY = {
  sampleDate: "2026-04-20",
  metrics: [
    { name: "Synthetic A", value: 1, unit: "mg/dL" },
    { name: "Synthetic B", value: 2, unit: "mg/dL" },
  ],
};

function prefStatement() {
  const call = sqlMock.mock.calls.find((c) =>
    (c[0] as string[]).join("?").includes("INSERT INTO metric_preferences"),
  );
  expect(call).toBeDefined();
  return { text: (call![0] as string[]).join("?"), params: call!.slice(1) };
}

function expectAppended() {
  const { text, params } = prefStatement();
  // one statement: new names go after the profile's current maximum, in order
  expect(text).toMatch(/display_order/);
  expect(text).toMatch(/COALESCE\(\s*MAX\(display_order\)/i);
  expect(text).toMatch(/WITH ORDINALITY/i);
  expect(text).toMatch(/ON CONFLICT \(profile_id, name\) DO NOTHING/);
  expect(params).toContain("p1");
  expect(params).toContainEqual(["Synthetic A", "Synthetic B"]);
  expect(
    sqlMock.mock.calls.filter((c) =>
      (c[0] as string[]).join("?").includes("metric_preferences"),
    ),
  ).toHaveLength(1);
}

beforeEach(routeSql);

it("upload confirm appends new metrics after the current max display_order", async () => {
  const res = await confirmUpload(
    new Request("http://localhost/api/upload/u1/confirm", {
      method: "POST",
      body: JSON.stringify(BODY),
    }),
    { params: Promise.resolve({ id: "u1" }) },
  );
  expect(res.status).toBe(200);
  expectAppended();
});

it("e-Nabız confirm appends new metrics after the current max display_order", async () => {
  const res = await confirmEnabiz(
    new Request("http://localhost/api/import/enabiz/pending/i1/confirm", {
      method: "POST",
      body: JSON.stringify(BODY),
    }),
    { params: Promise.resolve({ id: "i1" }) },
  );
  expect(res.status).toBe(200);
  expectAppended();
});
