"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { cn, friendlyMetricName } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { formatRefRange } from "@/lib/metrics";
import { ArrowLeft, FileText, Calendar, FlaskConical } from "lucide-react";
import { ReportReviewLayout } from "@/components/report-review-layout";

interface ReportMetric {
  id: string;
  name: string;
  value: number;
  unit: string | null;
  refLow: number | null;
  refHigh: number | null;
  flag: string | null;
}

interface ReportData {
  report: {
    id: string;
    profileId: string;
    sampleDate: string;
    fileName: string;
    blobUrl: string | null;
    source: string;
    createdAt: string;
  };
  metrics: ReportMetric[];
}

const FLAG_STYLES: Record<
  string,
  { label: string; color: string; badge: string }
> = {
  H: {
    label: "High",
    color: "text-status-critical",
    badge: "border-status-critical text-status-critical bg-status-critical/10",
  },
  L: {
    label: "Low",
    color: "text-status-warning",
    badge: "border-status-warning text-status-warning bg-status-warning/10",
  },
  N: {
    label: "Normal",
    color: "text-status-normal",
    badge: "border-status-normal text-status-normal bg-status-normal/10",
  },
};

function ReportDetailSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading report">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-7 w-48" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchReport() {
      try {
        const res = await fetch(`/api/reports/${params.id}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body.error || `Error ${res.status}`);
          return;
        }
        const json = await res.json();
        setData(json);
        trackEvent({ action: "report_viewed", category: "engagement" });
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError("Failed to load report");
      } finally {
        setLoading(false);
      }
    }
    fetchReport();

    return () => controller.abort();
  }, [params.id]);

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8" aria-live="polite">
        <ReportDetailSkeleton />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8" aria-live="polite">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <FileText
              className="size-12 text-muted-foreground"
              aria-hidden="true"
            />
            <p
              className="text-lg font-medium text-muted-foreground"
              role="alert"
            >
              {error || "Report not found"}
            </p>
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              Go back
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const { report, metrics } = data;
  const normalCount = metrics.filter((m) => m.flag === "N").length;
  const outOfRangeCount = metrics.filter(
    (m) => m.flag === "H" || m.flag === "L",
  ).length;

  return (
    <main
      className={cn(
        "mx-auto px-4 py-8 space-y-6",
        report.blobUrl ? "px-6" : "max-w-4xl",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="size-11"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Report Details</h1>
          <p className="text-sm text-muted-foreground">{report.fileName}</p>
        </div>
      </div>

      {/* Summary cards */}
      <section
        aria-label="Report summary"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <Card className="py-4">
          <CardContent className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Calendar className="size-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sample Date</p>
              <p className="font-semibold">{report.sampleDate}</p>
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
              <p className="text-xs text-muted-foreground">Metrics</p>
              <p className="font-semibold">
                {metrics.length} total
                {outOfRangeCount > 0 && (
                  <span className="text-status-critical ml-1 text-sm font-normal">
                    ({outOfRangeCount} out of range)
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* PDF + Metrics layout */}
      <ReportReviewLayout pdfUrl={report.blobUrl}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Extracted Metrics</CardTitle>
            <CardDescription>
              {normalCount} normal, {outOfRangeCount} out of range
            </CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <FlaskConical
                  className="size-10 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="text-sm text-muted-foreground">
                  No metrics found in this report.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop table — hidden when PDF sidebar narrows the column */}
                <div
                  className={cn(
                    "overflow-x-auto",
                    report.blobUrl ? "hidden" : "hidden sm:block",
                  )}
                >
                  <table className="w-full text-sm" aria-label="Report metrics">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th scope="col" className="pb-3 font-medium">
                          Metric
                        </th>
                        <th scope="col" className="pb-3 font-medium text-right">
                          Value
                        </th>
                        <th scope="col" className="pb-3 font-medium">
                          Unit
                        </th>
                        <th scope="col" className="pb-3 font-medium text-right">
                          Ref. Range
                        </th>
                        <th
                          scope="col"
                          className="pb-3 font-medium text-center"
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.map((m) => (
                        <tr
                          key={m.id}
                          className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                        >
                          <td className="py-3 font-medium">
                            {friendlyMetricName(m.name)}
                          </td>
                          <td
                            className={cn(
                              "py-3 text-right tabular-nums font-semibold",
                              FLAG_STYLES[m.flag ?? ""]?.color ??
                                "text-muted-foreground",
                            )}
                          >
                            {m.value}
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {m.unit || "—"}
                          </td>
                          <td className="py-3 text-right text-muted-foreground tabular-nums">
                            {formatRefRange(m.refLow, m.refHigh)}
                          </td>
                          <td className="py-3 text-center">
                            {m.flag ? (
                              <Badge
                                variant="outline"
                                className={FLAG_STYLES[m.flag]?.badge}
                              >
                                {FLAG_STYLES[m.flag]?.label}
                              </Badge>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Card view — always visible when PDF sidebar is present, otherwise mobile only */}
                <ul
                  className={cn("space-y-3", !report.blobUrl && "sm:hidden")}
                  aria-label="Report metrics"
                >
                  {metrics.map((m) => (
                    <li
                      key={m.id}
                      className={cn(
                        "rounded-lg border p-3 space-y-1",
                        m.flag === "H" && "border-l-4 border-l-status-critical",
                        m.flag === "L" && "border-l-4 border-l-status-warning",
                        m.flag === "N" && "border-l-4 border-l-status-normal",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {friendlyMetricName(m.name)}
                        </span>
                        {m.flag && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              FLAG_STYLES[m.flag]?.badge,
                            )}
                          >
                            {FLAG_STYLES[m.flag]?.label}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span
                          className={cn(
                            "text-lg font-semibold tabular-nums",
                            m.flag && FLAG_STYLES[m.flag]
                              ? FLAG_STYLES[m.flag].color
                              : "text-muted-foreground",
                          )}
                        >
                          {m.value}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {m.unit || ""}
                        </span>
                      </div>
                      {(m.refLow != null || m.refHigh != null) && (
                        <p className="text-xs text-muted-foreground">
                          Ref: {formatRefRange(m.refLow, m.refHigh)}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>
      </ReportReviewLayout>
    </main>
  );
}
