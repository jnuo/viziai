import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { reportError } from "@/lib/error-reporting";

export const dynamic = "force-dynamic";

const GA4_PROPERTY_ID = "526345960";

const DIMENSION_CONFIG: Record<
  string,
  {
    dimensions: { name: string }[];
    labelFn: (dims: string[]) => { label: string; sublabel?: string };
  }
> = {
  channel: {
    dimensions: [{ name: "sessionDefaultChannelGroup" }],
    labelFn: ([v]) => ({ label: v || "Unknown" }),
  },
  geo: {
    dimensions: [{ name: "country" }, { name: "city" }],
    labelFn: ([country, city]) => ({
      label: country || "Unknown",
      sublabel: city && city !== "(not set)" ? city : undefined,
    }),
  },
  pages: {
    dimensions: [{ name: "pagePath" }],
    labelFn: ([v]) => ({ label: v || "/" }),
  },
  device: {
    dimensions: [{ name: "deviceCategory" }],
    labelFn: ([v]) => ({ label: v || "Unknown" }),
  },
};

const START_DATES: Record<string, string> = {
  "7d": "7daysAgo",
  "30d": "30daysAgo",
  "90d": "90daysAgo",
  all: "2026-01-01",
};

export async function GET(request: NextRequest) {
  const userId = await requireAdmin();
  if (!userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const period = request.nextUrl.searchParams.get("period") || "30d";
  const dimension = request.nextUrl.searchParams.get("dimension") || "channel";
  const startDate = START_DATES[period] ?? "30daysAgo";

  const config = DIMENSION_CONFIG[dimension];
  if (!config) {
    return NextResponse.json({ error: "Invalid dimension" }, { status: 400 });
  }

  const credentialsJson = process.env.GOOGLE_ANALYTICS_CREDENTIALS;
  if (!credentialsJson) {
    return NextResponse.json({ configured: false, rows: [], daily: [] });
  }

  try {
    const { BetaAnalyticsDataClient } = await import("@google-analytics/data");

    const credentials = JSON.parse(credentialsJson);
    const client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
      },
    });

    const [dimRes, dailyRes, totalsRes] = await Promise.all([
      client.runReport({
        property: `properties/${GA4_PROPERTY_ID}`,
        dateRanges: [{ startDate, endDate: "yesterday" }],
        dimensions: config.dimensions,
        metrics: [
          { name: "sessions" },
          { name: "totalUsers" },
          { name: "screenPageViews" },
          { name: "engagedSessions" },
          { name: "averageSessionDuration" },
        ],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 20,
      }),
      client.runReport({
        property: `properties/${GA4_PROPERTY_ID}`,
        dateRanges: [{ startDate, endDate: "yesterday" }],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "sessions" }, { name: "totalUsers" }],

        orderBys: [
          {
            dimension: {
              dimensionName: "date",
              orderType: "ALPHANUMERIC" as unknown as number,
            },
            desc: false,
          },
        ],
      }),
      client.runReport({
        property: `properties/${GA4_PROPERTY_ID}`,
        dateRanges: [{ startDate, endDate: "yesterday" }],
        metrics: [
          { name: "sessions" },
          { name: "totalUsers" },
          { name: "screenPageViews" },
        ],
      }),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = (dimRes[0].rows || []).map((row: any) => {
      const dimValues = (row.dimensionValues || []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (d: any) => d.value || "",
      );
      const { label, sublabel } = config.labelFn(dimValues);
      return {
        label,
        ...(sublabel ? { sublabel } : {}),
        sessions: parseInt(row.metricValues?.[0]?.value || "0"),
        users: parseInt(row.metricValues?.[1]?.value || "0"),
        pageViews: parseInt(row.metricValues?.[2]?.value || "0"),
        engaged: parseInt(row.metricValues?.[3]?.value || "0"),
        avgDuration: parseFloat(row.metricValues?.[4]?.value || "0"),
      };
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const daily = (dailyRes[0].rows || []).map((row: any) => {
      const d = row.dimensionValues?.[0]?.value || "";
      return {
        date: `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`,
        sessions: parseInt(row.metricValues?.[0]?.value || "0"),
        users: parseInt(row.metricValues?.[1]?.value || "0"),
      };
    });

    const totalsRow = totalsRes[0].rows?.[0];
    const totalSessions = parseInt(totalsRow?.metricValues?.[0]?.value || "0");
    const totalUsers = parseInt(totalsRow?.metricValues?.[1]?.value || "0");
    const totalPageViews = parseInt(totalsRow?.metricValues?.[2]?.value || "0");

    return NextResponse.json({
      configured: true,
      totalSessions,
      totalUsers,
      totalPageViews,
      rows,
      daily,
    });
  } catch (error) {
    reportError(error, { op: "admin.dashboard.traffic" });
    return NextResponse.json({ configured: false, rows: [], daily: [] });
  }
}
