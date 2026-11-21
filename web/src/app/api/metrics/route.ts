import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth, hasProfileAccess } from "@/lib/auth";
import { reportError } from "@/lib/error-reporting";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Metric = {
  id: string;
  name: string;
  unit: string;
  ref_min: number | null;
  ref_max: number | null;
  /** metric_definitions.category (raw; normalised client-side), null if unknown */
  category: string | null;
  /** Other names for the same test (translations in every locale + alias table), for search */
  aliases: string[];
  /** metric_definitions.id when the name is mapped to a known test */
  metric_definition_id: string | null;
};

type MetricValue = {
  metric_id: string;
  date: string; // ISO yyyy-mm-dd
  value: number;
  /** This result's own reference range and unit (labs differ between reports) */
  ref_low: number | null;
  ref_high: number | null;
  unit: string | null;
};

type MetricsPayload = {
  metrics: Metric[];
  values: MetricValue[];
  reportCount: number;
};

type MetricMeta = {
  category: string | null;
  aliases: string[];
  definitionId: string | null;
};

/**
 * Category + search aliases per metric name. The definition comes from the
 * metric row (metric_definition_id) or, when that is missing, from the global
 * alias table (alias or canonical name, case-insensitive). Read-only, global
 * tables, so no profile scoping is needed here.
 */
async function resolveMetricMeta(
  rows: Record<string, unknown>[],
): Promise<Map<string, MetricMeta>> {
  const defByName = new Map<string, string>();
  for (const r of rows) {
    const name = r.name as string;
    if (r.definition_id && !defByName.has(name)) {
      defByName.set(name, r.definition_id as string);
    }
  }
  const names = [...new Set(rows.map((r) => r.name as string))];
  const missing = names.filter((n) => !defByName.has(n));
  if (missing.length > 0) {
    const lowered = missing.map((n) => n.toLocaleLowerCase("tr"));
    const viaAlias = await sql`
      SELECT LOWER(alias) AS alias, LOWER(canonical_name) AS canonical,
             metric_definition_id::TEXT AS definition_id
      FROM metric_aliases
      WHERE metric_definition_id IS NOT NULL
        AND (LOWER(alias) = ANY(${lowered})
             OR LOWER(canonical_name) = ANY(${lowered}))
    `;
    const byLower = new Map<string, string>();
    for (const a of viaAlias || []) {
      if (!byLower.has(a.alias)) byLower.set(a.alias, a.definition_id);
      if (!byLower.has(a.canonical)) byLower.set(a.canonical, a.definition_id);
    }
    for (const n of missing) {
      const def = byLower.get(n.toLocaleLowerCase("tr"));
      if (def) defByName.set(n, def);
    }
  }

  const defIds = [...new Set(defByName.values())];
  const catByDef = new Map<string, string | null>();
  const namesByDef = new Map<string, Set<string>>();
  if (defIds.length > 0) {
    const [defs, translations, aliases] = await Promise.all([
      sql`SELECT id::TEXT AS id, category FROM metric_definitions
          WHERE id::TEXT = ANY(${defIds})`,
      sql`SELECT metric_definition_id::TEXT AS id, display_name
          FROM metric_translations WHERE metric_definition_id::TEXT = ANY(${defIds})`,
      sql`SELECT metric_definition_id::TEXT AS id, alias FROM metric_aliases
          WHERE metric_definition_id::TEXT = ANY(${defIds})`,
    ]);
    for (const d of defs || []) catByDef.set(d.id, d.category ?? null);
    const add = (id: string, n: string) => {
      if (!namesByDef.has(id)) namesByDef.set(id, new Set());
      namesByDef.get(id)!.add(n);
    };
    for (const t of translations || []) add(t.id, t.display_name);
    for (const a of aliases || []) add(a.id, a.alias);
  }

  const out = new Map<string, MetricMeta>();
  for (const n of names) {
    const def = defByName.get(n);
    out.set(n, {
      definitionId: def ?? null,
      category: def ? (catByDef.get(def) ?? null) : null,
      aliases: def
        ? [...(namesByDef.get(def) ?? [])].filter((a) => a !== n).slice(0, 20)
        : [],
    });
  }
  return out;
}

export async function GET(request: Request) {
  try {
    const userId = await requireAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json(
        { error: "profileId is required" },
        { status: 400 },
      );
    }

    const hasAccess = await hasProfileAccess(userId, profileId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get all reports for this profile
    // Cast sample_date to TEXT to avoid timezone conversion issues with JS Date
    const reports = await sql`
      SELECT id, sample_date::TEXT as sample_date
      FROM reports
      WHERE profile_id = ${profileId}
      ORDER BY sample_date ASC, created_at ASC
    `;

    if (!reports || reports.length === 0) {
      return NextResponse.json({ metrics: [], values: [], reportCount: 0 });
    }

    const reportIds = reports.map((r) => r.id);

    const metricPrefs = await sql`
      SELECT name, display_order
      FROM metric_preferences
      WHERE profile_id = ${profileId}
      ORDER BY display_order ASC, name ASC
    `;

    const displayOrderMap = new Map<string, number>();
    for (const pref of metricPrefs || []) {
      displayOrderMap.set(pref.name, pref.display_order);
    }

    const reportDateMap = new Map<string, string>();
    for (const report of reports) {
      reportDateMap.set(report.id, report.sample_date);
    }

    const metricsData = await sql`
      SELECT m.report_id, m.name, m.value, m.unit, m.ref_low, m.ref_high,
             m.metric_definition_id::TEXT AS definition_id
      FROM metrics m
      WHERE m.report_id = ANY(${reportIds})
    `;

    const metaMap = await resolveMetricMeta(metricsData || []);

    // Build latest ref ranges per metric name.
    // Sort by report date ascending so that overwriting gives us the most recent ref.
    const metricsByDateAsc = [...(metricsData || [])].sort((a, b) => {
      const dateA = reportDateMap.get(a.report_id) || "";
      const dateB = reportDateMap.get(b.report_id) || "";
      return dateA.localeCompare(dateB);
    });

    const latestRefsMap = new Map<
      string,
      { unit: string; ref_low: number | null; ref_high: number | null }
    >();
    for (const m of metricsByDateAsc) {
      if (m.ref_low != null || m.ref_high != null) {
        latestRefsMap.set(m.name, {
          unit: m.unit || "",
          ref_low: m.ref_low,
          ref_high: m.ref_high,
        });
      }
    }

    const metricsMap = new Map<
      string,
      {
        unit: string;
        ref_min: number | null;
        ref_max: number | null;
        display_order: number;
      }
    >();
    const values: MetricValue[] = [];
    const uploadIndex = new Map<string, number>(
      reports.map((r, i) => [r.id as string, i]),
    );
    const valueUpload = new Map<MetricValue, number>();

    for (const m of metricsData || []) {
      const date = reportDateMap.get(m.report_id);
      if (!date) continue;

      values.push({
        metric_id: m.name,
        date,
        value: Number(m.value),
        ref_low: m.ref_low != null ? Number(m.ref_low) : null,
        ref_high: m.ref_high != null ? Number(m.ref_high) : null,
        unit: m.unit || null,
      });
      valueUpload.set(values[values.length - 1], uploadIndex.get(m.report_id) ?? 0);

      if (!metricsMap.has(m.name)) {
        const latestRef = latestRefsMap.get(m.name);
        metricsMap.set(m.name, {
          unit: latestRef?.unit || m.unit || "",
          ref_min: latestRef?.ref_low ?? null,
          ref_max: latestRef?.ref_high ?? null,
          display_order: displayOrderMap.get(m.name) ?? 99999,
        });
      }
    }

    // Date ascending; within a date, upload order (reports.created_at), so a
    // client that keeps the last value per date gets the latest upload.
    values.sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        (valueUpload.get(a) ?? 0) - (valueUpload.get(b) ?? 0),
    );

    const metrics: Metric[] = Array.from(metricsMap.entries())
      .sort((a, b) => a[1].display_order - b[1].display_order)
      .map(([name, ref]) => ({
        id: name,
        name,
        unit: ref.unit,
        ref_min: ref.ref_min != null ? Number(ref.ref_min) : null,
        ref_max: ref.ref_max != null ? Number(ref.ref_max) : null,
        category: metaMap.get(name)?.category ?? null,
        aliases: metaMap.get(name)?.aliases ?? [],
        metric_definition_id: metaMap.get(name)?.definitionId ?? null,
      }));

    const payload: MetricsPayload = { metrics, values, reportCount: reports.length };
    return NextResponse.json(payload);
  } catch (error) {
    reportError(error, { op: "api.metrics.GET" });
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 },
    );
  }
}
