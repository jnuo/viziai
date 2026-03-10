"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  FlaskConical,
  ExternalLink,
  Sparkles,
} from "lucide-react";

/* ---------- Types ---------- */

interface Stats {
  unmappedCount: number;
  pendingReviewCount: number;
  totalReports: number;
  recentReports: number;
}

interface UnmappedMetric {
  id: string;
  metric_name: string;
  unit: string | null;
  ref_low: number | null;
  ref_high: number | null;
  status: string;
  suggested_canonical: string | null;
  created_at: string;
  sample_date: string | null;
  lab_name: string;
  profile_name: string;
}

interface ReviewReport {
  id: string;
  sample_date: string | null;
  file_name: string;
  blob_url: string | null;
  created_at: string;
  profile_name: string;
  review_status: string | null;
  reviewed_at: string | null;
  metric_count: number;
  unmapped_count: number;
}

/* ---------- Stats skeleton ---------- */

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}

/* ---------- Component ---------- */

export default function AdminQualityPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [unmapped, setUnmapped] = useState<UnmappedMetric[]>([]);
  const [reviews, setReviews] = useState<ReviewReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Map dialog state
  const [mapTarget, setMapTarget] = useState<UnmappedMetric | null>(null);
  const [mapName, setMapName] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const [statsRes, unmappedRes, reviewsRes] = await Promise.all([
      fetch("/api/admin/quality/stats"),
      fetch("/api/admin/quality/unmapped?limit=20"),
      fetch("/api/admin/quality/reviews?limit=20"),
    ]);

    if (statsRes.ok) setStats(await statsRes.json());
    if (unmappedRes.ok) {
      const data = await unmappedRes.json();
      setUnmapped(data.items);
    }
    if (reviewsRes.ok) {
      const data = await reviewsRes.json();
      setReviews(data.items);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleAction(
    id: string,
    action: "map" | "accept",
    canonicalName?: string,
  ) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/quality/unmapped/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          action === "map" ? { action, canonicalName } : { action },
        ),
      });
      if (res.ok) {
        setUnmapped((prev) => prev.filter((m) => m.id !== id));
        setMapTarget(null);
        setMapName("");
        // Refresh stats
        const statsRes = await fetch("/api/admin/quality/stats");
        if (statsRes.ok) setStats(await statsRes.json());
      }
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <h1 className="text-2xl font-semibold">Extraction Quality</h1>
        <StatsSkeleton />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <h1 className="text-2xl font-semibold">Extraction Quality</h1>

      {/* Stats cards */}
      {stats && (
        <section
          aria-label="Quality stats"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card className="py-4">
            <CardContent className="flex items-center gap-3">
              <div className="rounded-lg bg-status-critical/10 p-2">
                <AlertTriangle
                  className="size-5 text-status-critical"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Unmapped</p>
                <p className="text-2xl font-bold tabular-nums">
                  {stats.unmappedCount}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardContent className="flex items-center gap-3">
              <div className="rounded-lg bg-status-warning/10 p-2">
                <FileText
                  className="size-5 text-status-warning"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold tabular-nums">
                  {stats.pendingReviewCount}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardContent className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <FlaskConical
                  className="size-5 text-primary"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold tabular-nums">
                  {stats.totalReports}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardContent className="flex items-center gap-3">
              <div className="rounded-lg bg-status-normal/10 p-2">
                <CheckCircle2
                  className="size-5 text-status-normal"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold tabular-nums">
                  {stats.recentReports}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Unmapped metrics table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Unmapped Metrics</CardTitle>
          <CardDescription>
            Metric names not matching any alias or canonical name
          </CardDescription>
        </CardHeader>
        <CardContent>
          {unmapped.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <CheckCircle2
                className="size-10 text-status-normal"
                aria-hidden="true"
              />
              <p className="text-sm text-muted-foreground">
                No unmapped metrics. All clear!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Unmapped metrics">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th scope="col" className="pb-3 font-medium">
                      Metric Name
                    </th>
                    <th scope="col" className="pb-3 font-medium">
                      Unit
                    </th>
                    <th scope="col" className="pb-3 font-medium">
                      Suggested
                    </th>
                    <th scope="col" className="pb-3 font-medium">
                      Lab / Date
                    </th>
                    <th scope="col" className="pb-3 font-medium">
                      Profile
                    </th>
                    <th scope="col" className="pb-3 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {unmapped.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 font-medium">{m.metric_name}</td>
                      <td className="py-3 text-muted-foreground">
                        {m.unit || "—"}
                      </td>
                      <td className="py-3">
                        {m.suggested_canonical ? (
                          <Badge variant="outline" className="text-xs">
                            <Sparkles
                              className="size-3 mr-1"
                              aria-hidden="true"
                            />
                            {m.suggested_canonical}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 text-muted-foreground text-xs">
                        <div>{m.lab_name}</div>
                        <div>{m.sample_date || "—"}</div>
                      </td>
                      <td className="py-3 text-muted-foreground text-xs">
                        {m.profile_name}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actionLoading === m.id}
                            onClick={() => {
                              setMapTarget(m);
                              setMapName(m.suggested_canonical || "");
                            }}
                          >
                            Map to…
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={actionLoading === m.id}
                            onClick={() => handleAction(m.id, "accept")}
                          >
                            Accept
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reports needing review */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Reports</CardTitle>
          <CardDescription>Unreviewed reports shown first</CardDescription>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <FileText
                className="size-10 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="text-sm text-muted-foreground">No reports yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Reports for review">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th scope="col" className="pb-3 font-medium">
                      Lab / File
                    </th>
                    <th scope="col" className="pb-3 font-medium">
                      Profile
                    </th>
                    <th scope="col" className="pb-3 font-medium text-right">
                      Metrics
                    </th>
                    <th scope="col" className="pb-3 font-medium text-center">
                      Status
                    </th>
                    <th scope="col" className="pb-3 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3">
                        <div className="font-medium text-xs">{r.file_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.sample_date || "—"} ·{" "}
                          {new Date(r.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground text-xs">
                        {r.profile_name}
                      </td>
                      <td className="py-3 text-right tabular-nums">
                        {r.metric_count}
                        {r.unmapped_count > 0 && (
                          <span className="text-status-critical ml-1 text-xs">
                            ({r.unmapped_count} unmapped)
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        {r.review_status === "approved" && (
                          <Badge
                            variant="outline"
                            className="border-status-normal text-status-normal bg-status-normal/10"
                          >
                            Approved
                          </Badge>
                        )}
                        {r.review_status === "corrected" && (
                          <Badge
                            variant="outline"
                            className="border-status-warning text-status-warning bg-status-warning/10"
                          >
                            Corrected
                          </Badge>
                        )}
                        {!r.review_status && (
                          <Badge
                            variant="outline"
                            className="text-muted-foreground"
                          >
                            Unreviewed
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/reports/${r.id}/review`}>
                            <Button size="sm" variant="outline">
                              Review
                            </Button>
                          </Link>
                          {r.blob_url && (
                            <Link
                              href={r.blob_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button size="sm" variant="ghost">
                                <ExternalLink
                                  className="size-3"
                                  aria-hidden="true"
                                />
                                <span className="sr-only">
                                  View PDF (opens in new tab)
                                </span>
                              </Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map dialog */}
      <Dialog
        open={!!mapTarget}
        onOpenChange={(open) => !open && setMapTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Map Metric</DialogTitle>
            <DialogDescription>
              Map &ldquo;{mapTarget?.metric_name}&rdquo; to a canonical metric
              name. This creates a global alias.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="text-sm font-medium" htmlFor="canonical-name">
              Canonical name
            </label>
            <Input
              id="canonical-name"
              placeholder="e.g. Hemoglobin"
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
            />
            {mapTarget?.suggested_canonical &&
              mapName !== mapTarget.suggested_canonical && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => setMapName(mapTarget.suggested_canonical!)}
                >
                  <Sparkles className="size-3 mr-1" aria-hidden="true" />
                  Use AI suggestion: {mapTarget.suggested_canonical}
                </Button>
              )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMapTarget(null)}>
              Cancel
            </Button>
            <Button
              disabled={!mapName.trim() || actionLoading === mapTarget?.id}
              onClick={() =>
                mapTarget && handleAction(mapTarget.id, "map", mapName.trim())
              }
            >
              Create Alias
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
