"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/admin/stat-card";
import {
  PeriodSelector,
  type Period,
} from "@/components/admin/period-selector";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Overview {
  totalUsers: number;
  newUsersInPeriod: number;
  totalReports: number;
  reportsInPeriod: number;
  totalProfiles: number;
  activatedUsers: number;
  activeUsersInPeriod: number;
  inviteClaimRate: number;
}

interface Activation {
  funnel: { signed_up: number; uploaded: number; confirmed: number };
  signupsByDay: { day: string; count: number }[];
  journeys: {
    id: string;
    email: string;
    name: string | null;
    signed_up_at: string;
    first_upload_at: string | null;
    first_confirmed_at: string | null;
    confirmed_uploads: number;
    hours_to_upload: number | null;
  }[];
  avgHoursToUpload: number | null;
}

interface FeatureRow {
  feature: string;
  users: number;
  pct: number;
  actions: number;
  label: string;
}

interface Adoption {
  totalUsers: number;
  features: FeatureRow[];
}

interface TrafficRow {
  label: string;
  sublabel?: string;
  sessions: number;
  users: number;
  pageViews: number;
  engaged: number;
  avgDuration: number;
}

interface Traffic {
  configured: boolean;
  totalSessions?: number;
  totalUsers?: number;
  totalPageViews?: number;
  rows?: TrafficRow[];
  daily?: { date: string; sessions: number; users: number }[];
}

interface Retention {
  totalUploaders: number;
  multiUploaders: number;
  returningAfter7d: number;
  active7d: number;
  active30d: number;
  uploadsByWeek: { week: string; uploads: number; unique_users: number }[];
}

type TrafficDimension = "channel" | "geo" | "pages" | "device";

const TRAFFIC_TABS: {
  key: TrafficDimension;
  label: string;
  columnHeader: string;
}[] = [
  { key: "channel", label: "Channel", columnHeader: "Channel" },
  { key: "geo", label: "Country / City", columnHeader: "Location" },
  { key: "pages", label: "Top Pages", columnHeader: "Page" },
  { key: "device", label: "Device", columnHeader: "Device" },
];

const TEAL = "#0D9488";
const CORAL = "#F97066";

function formatShortDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function formatRelative(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function pct(n: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((n / total) * 100)}%`;
}

function fmtDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  return `${Math.round(seconds / 60)}m`;
}

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [activation, setActivation] = useState<Activation | null>(null);
  const [adoption, setAdoption] = useState<Adoption | null>(null);
  const [retention, setRetention] = useState<Retention | null>(null);

  const [trafficDim, setTrafficDim] = useState<TrafficDimension>("channel");
  const [trafficLoading, setTrafficLoading] = useState(false);
  const [traffic, setTraffic] = useState<Traffic | null>(null);
  const trafficCache = useRef<Record<string, Traffic>>({});

  const fetchTraffic = useCallback(async (p: Period, dim: TrafficDimension) => {
    const cacheKey = `${p}:${dim}`;
    if (trafficCache.current[cacheKey]) {
      setTraffic(trafficCache.current[cacheKey]);
      return;
    }
    setTrafficLoading(true);
    const res = await fetch(
      `/api/admin/dashboard/traffic?period=${p}&dimension=${dim}`,
    );
    if (res.ok) {
      const data = await res.json();
      trafficCache.current[cacheKey] = data;
      setTraffic(data);
    }
    setTrafficLoading(false);
  }, []);

  const fetchData = useCallback(
    async (p: Period) => {
      setLoading(true);
      trafficCache.current = {};
      const qs = `?period=${p}`;
      const [ovRes, actRes, adpRes, retRes] = await Promise.all([
        fetch(`/api/admin/dashboard/overview${qs}`),
        fetch(`/api/admin/dashboard/activation${qs}`),
        fetch(`/api/admin/dashboard/adoption`),
        fetch(`/api/admin/dashboard/retention`),
      ]);

      if (ovRes.ok) setOverview(await ovRes.json());
      if (actRes.ok) setActivation(await actRes.json());
      if (adpRes.ok) setAdoption(await adpRes.json());
      if (retRes.ok) setRetention(await retRes.json());
      setLoading(false);
      await fetchTraffic(p, trafficDim);
    },
    [fetchTraffic, trafficDim],
  );

  useEffect(() => {
    fetchData(period);
  }, [period, fetchData]);

  useEffect(() => {
    if (!loading) {
      fetchTraffic(period, trafficDim);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trafficDim]);

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Analytics Dashboard</h1>
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </main>
    );
  }

  const activeTab = TRAFFIC_TABS.find((t) => t.key === trafficDim)!;

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Analytics Dashboard</h1>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {traffic && traffic.configured && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Traffic
              <span className="text-sm font-normal text-muted-foreground ml-2">
                {traffic.totalSessions} sessions · {traffic.totalUsers} visitors
                · {traffic.totalPageViews} pageviews
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-1 border-b">
              {TRAFFIC_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setTrafficDim(tab.key)}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors relative ${
                    trafficDim === tab.key
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  {trafficDim === tab.key && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
              ))}
            </div>

            {trafficLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 rounded" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table
                  className="w-full text-sm"
                  aria-label={`Traffic by ${activeTab.label}`}
                >
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th scope="col" className="pb-2 font-medium">
                        {activeTab.columnHeader}
                      </th>
                      <th scope="col" className="pb-2 font-medium text-right">
                        Sessions
                      </th>
                      <th scope="col" className="pb-2 font-medium text-right">
                        Users
                      </th>
                      <th scope="col" className="pb-2 font-medium text-right">
                        Pages
                      </th>
                      <th scope="col" className="pb-2 font-medium text-right">
                        Engaged
                      </th>
                      <th scope="col" className="pb-2 font-medium text-right">
                        Avg Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(traffic.rows || []).map((row, i) => (
                      <tr
                        key={`${row.label}-${i}`}
                        className="border-b last:border-0"
                      >
                        <td className="py-2">
                          <span className="font-medium">{row.label}</span>
                          {row.sublabel && (
                            <span className="text-muted-foreground ml-1.5">
                              {row.sublabel}
                            </span>
                          )}
                        </td>
                        <td className="py-2 text-right tabular-nums">
                          {row.sessions}
                        </td>
                        <td className="py-2 text-right tabular-nums">
                          {row.users}
                        </td>
                        <td className="py-2 text-right tabular-nums">
                          {row.pageViews}
                        </td>
                        <td className="py-2 text-right tabular-nums">
                          {row.engaged}
                        </td>
                        <td className="py-2 text-right tabular-nums">
                          {fmtDuration(row.avgDuration)}
                        </td>
                      </tr>
                    ))}
                    {(traffic.rows || []).length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-4 text-center text-muted-foreground"
                        >
                          No data for this period
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {traffic && !traffic.configured && (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground text-center">
              Set{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                GOOGLE_ANALYTICS_CREDENTIALS
              </code>{" "}
              env var to see GA4 traffic data.
            </p>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      {overview && (
        <section
          aria-label="Key metrics"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <StatCard label="Total Users" value={overview.totalUsers} />
          <StatCard
            label="Signed Up"
            value={overview.newUsersInPeriod}
            subtitle={`in ${period}`}
          />
          <StatCard
            label={`Any Action (${period})`}
            value={overview.activeUsersInPeriod}
            subtitle={pct(
              overview.activeUsersInPeriod,
              overview.newUsersInPeriod,
            )}
          />
          <StatCard
            label="Report Upload"
            value={overview.activatedUsers}
            subtitle={pct(overview.activatedUsers, overview.newUsersInPeriod)}
          />
        </section>
      )}

      {/* Feature Usage — unified table */}
      {adoption && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Feature Usage
              <span className="text-sm font-normal text-muted-foreground ml-2">
                out of {adoption.totalUsers} users
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Feature usage">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th scope="col" className="pb-2 font-medium">
                      Feature
                    </th>
                    <th scope="col" className="pb-2 font-medium text-right">
                      Users
                    </th>
                    <th scope="col" className="pb-2 font-medium text-right">
                      % of Total
                    </th>
                    <th scope="col" className="pb-2 font-medium text-right">
                      Total Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {adoption.features.map((f) => (
                    <tr key={f.feature} className="border-b last:border-0">
                      <td className="py-2 font-medium">{f.feature}</td>
                      <td className="py-2 text-right tabular-nums">
                        {f.users}
                      </td>
                      <td className="py-2 text-right tabular-nums">{f.pct}%</td>
                      <td className="py-2 text-right tabular-nums">
                        {f.actions} {f.label}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      {activation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Users">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th scope="col" className="pb-2 font-medium">
                      User
                    </th>
                    <th scope="col" className="pb-2 font-medium">
                      Signed Up
                    </th>
                    <th scope="col" className="pb-2 font-medium">
                      1st Upload
                    </th>
                    <th scope="col" className="pb-2 font-medium text-right">
                      Uploads
                    </th>
                    <th scope="col" className="pb-2 font-medium text-right">
                      Time to Upload
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activation.journeys.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-2.5">
                        <div className="font-medium text-xs">
                          {u.name || u.email.split("@")[0]}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {u.email}
                        </div>
                      </td>
                      <td className="py-2.5 text-xs text-muted-foreground tabular-nums">
                        {formatRelative(u.signed_up_at)}
                      </td>
                      <td className="py-2.5 text-xs tabular-nums">
                        {u.first_upload_at ? (
                          <span className="text-status-normal">
                            {formatRelative(u.first_upload_at)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40">--</span>
                        )}
                      </td>
                      <td className="py-2.5 text-right text-xs tabular-nums">
                        {u.confirmed_uploads || (
                          <span className="text-muted-foreground/40">0</span>
                        )}
                      </td>
                      <td className="py-2.5 text-right text-xs tabular-nums">
                        {u.hours_to_upload !== null ? (
                          <span
                            className={
                              u.hours_to_upload < 24
                                ? "text-status-normal"
                                : "text-status-warning"
                            }
                          >
                            {u.hours_to_upload < 24
                              ? `${Math.round(u.hours_to_upload * 10) / 10}h`
                              : `${Math.round(u.hours_to_upload / 24)}d`}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40">--</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Retention */}
      {retention && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold tabular-nums">
                  {retention.active7d}
                </p>
                <p className="text-xs text-muted-foreground">Active 7d</p>
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">
                  {retention.active30d}
                </p>
                <p className="text-xs text-muted-foreground">Active 30d</p>
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">
                  {retention.multiUploaders}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{retention.totalUploaders}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">Multi-uploaders</p>
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">
                  {retention.returningAfter7d}
                </p>
                <p className="text-xs text-muted-foreground">Returned 7d+</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {traffic?.configured && traffic.daily && traffic.daily.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sessions Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={traffic.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatShortDate}
                    fontSize={12}
                  />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip
                    labelFormatter={(v) => formatShortDate(v as string)}
                  />
                  <Line
                    type="monotone"
                    dataKey="sessions"
                    stroke={TEAL}
                    strokeWidth={2}
                    dot={{ fill: TEAL, r: 3 }}
                    name="Sessions"
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke={CORAL}
                    strokeWidth={2}
                    dot={{ fill: CORAL, r: 3 }}
                    name="Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {!traffic?.configured &&
        activation &&
        activation.signupsByDay.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Signups Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activation.signupsByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="day"
                      tickFormatter={formatShortDate}
                      fontSize={12}
                    />
                    <YAxis allowDecimals={false} fontSize={12} />
                    <Tooltip
                      labelFormatter={(v) => formatShortDate(v as string)}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke={TEAL}
                      strokeWidth={2}
                      dot={{ fill: TEAL, r: 3 }}
                      name="Signups"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
    </main>
  );
}
