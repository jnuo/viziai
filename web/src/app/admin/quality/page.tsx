"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  FileText,
  FlaskConical,
  X,
} from "lucide-react";

/* ---------- Types ---------- */

interface Stats {
  unreviewedCount: number;
  approvedCount: number;
  coveragePct: number;
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
  upload_date: string | null;
  user_email: string | null;
  mapped_count: number;
}

/* ---------- Stats skeleton ---------- */

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}

/* ---------- Component ---------- */

export default function AdminQualityPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [reviews, setReviews] = useState<ReviewReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Reports table state
  type SortDir = "asc" | "desc" | null;
  type PdfFilter = "all" | "with" | "without";
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [pdfFilter, setPdfFilter] = useState<PdfFilter>("all");

  const fetchData = useCallback(async () => {
    const [statsRes, reviewsRes] = await Promise.all([
      fetch("/api/admin/quality/stats"),
      fetch("/api/admin/quality/reviews"),
    ]);

    if (statsRes.ok) setStats(await statsRes.json());
    if (reviewsRes.ok) {
      const data = await reviewsRes.json();
      setReviews(data.items);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredReviews = useMemo(() => {
    let list = reviews;
    if (pdfFilter === "with") list = list.filter((r) => !!r.blob_url);
    if (pdfFilter === "without") list = list.filter((r) => !r.blob_url);
    if (sortDir) {
      list = [...list].sort((a, b) => {
        const da = a.upload_date ? new Date(a.upload_date).getTime() : 0;
        const db = b.upload_date ? new Date(b.upload_date).getTime() : 0;
        return sortDir === "asc" ? da - db : db - da;
      });
    }
    return list;
  }, [reviews, pdfFilter, sortDir]);

  function formatDate(iso: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }

  function cycleSortDir() {
    setSortDir((prev) => {
      if (prev === null) return "desc";
      if (prev === "desc") return "asc";
      return null;
    });
  }

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <h1 className="text-2xl font-semibold">Report Reviews</h1>
        <StatsSkeleton />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <h1 className="text-2xl font-semibold">Report Reviews</h1>

      {/* Stats cards */}
      {stats && (
        <section aria-label="Quality stats" className="grid grid-cols-3 gap-4">
          <Card className="py-4">
            <CardContent className="flex items-center gap-3">
              <div className="rounded-lg bg-status-warning/10 p-2">
                <FileText
                  className="size-5 text-status-warning"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Unreviewed</p>
                <p className="text-2xl font-bold tabular-nums">
                  {stats.unreviewedCount}
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
                <p className="text-xs text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold tabular-nums">
                  {stats.approvedCount}
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
                <p className="text-xs text-muted-foreground">Metric Coverage</p>
                <p className="text-2xl font-bold tabular-nums">
                  {stats.coveragePct}%
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Reports</CardTitle>
              <CardDescription>All reports, sorted by date</CardDescription>
            </div>
            <div className="flex items-center gap-1">
              {(["all", "with", "without"] as const).map((v) => (
                <Button
                  key={v}
                  size="sm"
                  variant={pdfFilter === v ? "default" : "ghost"}
                  className="text-xs h-7 px-2.5"
                  onClick={() => setPdfFilter(v)}
                >
                  {{ all: "All", with: "Has PDF", without: "No PDF" }[v]}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredReviews.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <FileText
                className="size-10 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="text-sm text-muted-foreground">
                {reviews.length === 0
                  ? "No reports yet."
                  : "No matching reports."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table
                className="w-full text-sm table-fixed"
                aria-label="Reports for review"
              >
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th scope="col" className="pb-3 font-medium w-[30%]">
                      Lab / File
                    </th>
                    <th scope="col" className="pb-3 font-medium w-[15%]">
                      Profile
                    </th>
                    <th scope="col" className="pb-3 font-medium w-[12%]">
                      <button
                        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                        onClick={cycleSortDir}
                      >
                        Uploaded
                        {sortDir === null && (
                          <ArrowUpDown className="size-3.5 opacity-40" />
                        )}
                        {sortDir === "asc" && <ArrowUp className="size-3.5" />}
                        {sortDir === "desc" && (
                          <ArrowDown className="size-3.5" />
                        )}
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="pb-3 font-medium text-center w-[6%]"
                    >
                      PDF
                    </th>
                    <th
                      scope="col"
                      className="pb-3 font-medium text-right w-[17%]"
                    >
                      Metrics
                    </th>
                    <th
                      scope="col"
                      className="pb-3 font-medium text-center w-[10%]"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="pb-3 font-medium text-right w-[10%]"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviews.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3">
                        <div
                          className="font-medium text-xs truncate"
                          title={r.file_name}
                        >
                          {r.file_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {r.sample_date || "—"}
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground text-xs">
                        <div className="truncate">{r.profile_name}</div>
                        {r.user_email && (
                          <div className="text-xs opacity-60 truncate">
                            {r.user_email}
                          </div>
                        )}
                      </td>
                      <td className="py-3 text-muted-foreground text-xs tabular-nums">
                        {formatDate(r.upload_date)}
                      </td>
                      <td className="py-3 text-center">
                        {r.blob_url ? (
                          <CheckCircle2
                            className="size-4 text-status-normal inline-block"
                            aria-label="Has PDF"
                          />
                        ) : (
                          <X
                            className="size-4 text-muted-foreground/40 inline-block"
                            aria-label="No PDF"
                          />
                        )}
                      </td>
                      <td className="py-3 text-right tabular-nums">
                        {r.metric_count}
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
                        <Link href={`/admin/reports/${r.id}/review`}>
                          <Button size="sm" variant="outline">
                            Review
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
