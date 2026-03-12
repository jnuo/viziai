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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowLeft, Check, FileText, Pencil, Save, X } from "lucide-react";
import { ReportReviewLayout } from "@/components/report-review-layout";

/* ---------- Types ---------- */

interface Metric {
  id: string;
  name: string;
  value: number;
  unit: string | null;
  refLow: number | null;
  refHigh: number | null;
  flag: string | null;
  metricDefinitionId: string | null;
}

interface ReportData {
  report: {
    id: string;
    profileId: string;
    profileName: string;
    sampleDate: string;
    fileName: string;
    blobUrl: string | null;
    source: string;
    createdAt: string;
  };
  metrics: Metric[];
  review: {
    id: string;
    status: string;
    notes: string | null;
    reviewerUserId: string;
    reviewedAt: string;
    createdAt: string;
  } | null;
}

interface MetricEdit {
  name: string;
  value: string;
  unit: string;
  refLow: string;
  refHigh: string;
}

interface MetricCorrection {
  metricId: string;
  name?: string;
  value?: number;
  unit?: string;
  refLow?: number | null;
  refHigh?: number | null;
}

/* ---------- Component ---------- */

export default function ReviewWorkbenchPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");

  // Editing state: metricId -> edited values
  const [edits, setEdits] = useState<Record<string, MetricEdit>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchReport() {
      try {
        const res = await fetch(`/api/admin/reports/${params.id}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body.error || `Error ${res.status}`);
          return;
        }
        const json: ReportData = await res.json();
        setData(json);
        if (json.review?.notes) setNotes(json.review.notes);
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

  function updateEditField(
    metricId: string,
    field: keyof MetricEdit,
    value: string,
  ) {
    setEdits((prev) => ({
      ...prev,
      [metricId]: { ...prev[metricId], [field]: value },
    }));
  }

  function startEdit(m: Metric) {
    setEditingId(m.id);
    setEdits((prev) => ({
      ...prev,
      [m.id]: {
        name: m.name,
        value: String(m.value),
        unit: m.unit || "",
        refLow: m.refLow != null ? String(m.refLow) : "",
        refHigh: m.refHigh != null ? String(m.refHigh) : "",
      },
    }));
  }

  function cancelEdit() {
    if (editingId) {
      setEdits((prev) => {
        const next = { ...prev };
        delete next[editingId];
        return next;
      });
    }
    setEditingId(null);
  }

  function saveEdit() {
    setEditingId(null);
  }

  function buildCorrections(): MetricCorrection[] {
    if (!data) return [];
    const corrections: MetricCorrection[] = [];

    for (const m of data.metrics) {
      const edit = edits[m.id];
      if (!edit) continue;

      const c: MetricCorrection = { metricId: m.id };
      if (edit.name !== m.name) c.name = edit.name;
      if (Number(edit.value) !== m.value) c.value = Number(edit.value);
      if ((edit.unit || null) !== (m.unit || null))
        c.unit = edit.unit || undefined;
      const newRefLow = edit.refLow ? Number(edit.refLow) : null;
      const newRefHigh = edit.refHigh ? Number(edit.refHigh) : null;
      if (newRefLow !== m.refLow) c.refLow = newRefLow;
      if (newRefHigh !== m.refHigh) c.refHigh = newRefHigh;

      // Only include if there are actual changes beyond metricId
      if (Object.keys(c).length > 1) corrections.push(c);
    }

    return corrections;
  }

  async function handleSubmit(status: "approved" | "corrected") {
    setSubmitting(true);
    try {
      const corrections = status === "corrected" ? buildCorrections() : [];
      const res = await fetch(`/api/admin/reports/${params.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          notes: notes || undefined,
          corrections,
        }),
      });

      if (res.ok) {
        router.push("/admin/quality");
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Failed to submit review");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function getDisplayedRefRange(m: Metric): string {
    const edit = edits[m.id];
    const low = edit ? edit.refLow || null : m.refLow;
    const high = edit ? edit.refHigh || null : m.refHigh;
    if (low == null && high == null) return "—";
    return `${low ?? "—"} – ${high ?? "—"}`;
  }

  const hasEdits = Object.keys(edits).length > 0;

  if (loading) {
    return (
      <main
        className="max-w-7xl mx-auto px-6 py-8 space-y-6"
        aria-live="polite"
      >
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-7 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[600px] rounded-xl" />
          <Skeleton className="h-[600px] rounded-xl" />
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-8" aria-live="polite">
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

  const { report, metrics, review } = data;

  return (
    <main
      className={cn(
        "mx-auto px-6 py-8 space-y-6",
        !report.blobUrl && "max-w-4xl",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="size-11"
            onClick={() => router.push("/admin/quality")}
            aria-label="Back to quality dashboard"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Review Report</h1>
            <p className="text-sm text-muted-foreground">
              {report.fileName} · {report.profileName} · {report.sampleDate}
            </p>
          </div>
        </div>
        {review && (
          <Badge
            variant="outline"
            className={cn(
              review.status === "approved" &&
                "border-status-normal text-status-normal bg-status-normal/10",
              review.status === "corrected" &&
                "border-status-warning text-status-warning bg-status-warning/10",
            )}
          >
            {review.status === "approved" ? "Approved" : "Corrected"}
          </Badge>
        )}
      </div>

      {/* PDF + metrics layout */}
      <ReportReviewLayout pdfUrl={report.blobUrl}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Extracted Metrics</CardTitle>
            <CardDescription>
              {metrics.length} metrics · Click edit to correct values
            </CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <FileText
                  className="size-10 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="text-sm text-muted-foreground">
                  No metrics extracted.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop table view — hidden when PDF sidebar narrows the column */}
                <div
                  className={cn(
                    "overflow-x-auto max-h-[540px] overflow-y-auto",
                    report.blobUrl ? "hidden" : "hidden sm:block",
                  )}
                >
                  <table
                    className="w-full text-sm"
                    aria-label="Extracted metrics"
                  >
                    <thead className="sticky top-0 bg-card">
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
                          Ref Range
                        </th>
                        <th
                          scope="col"
                          className="pb-3 font-medium text-center w-16"
                        >
                          Edit
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.map((m) => {
                        const isEditing = editingId === m.id;
                        const hasEdit = !!edits[m.id];
                        const edit = edits[m.id];

                        if (isEditing && edit) {
                          return (
                            <tr key={m.id} className="border-b bg-muted/30">
                              <td className="py-2">
                                <Input
                                  value={edit.name}
                                  onChange={(e) =>
                                    updateEditField(
                                      m.id,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                  className="h-8 text-sm"
                                  aria-label="Metric name"
                                />
                              </td>
                              <td className="py-2">
                                <Input
                                  type="number"
                                  value={edit.value}
                                  onChange={(e) =>
                                    updateEditField(
                                      m.id,
                                      "value",
                                      e.target.value,
                                    )
                                  }
                                  className="h-8 text-sm text-right w-24"
                                  aria-label="Value"
                                />
                              </td>
                              <td className="py-2">
                                <Input
                                  value={edit.unit}
                                  onChange={(e) =>
                                    updateEditField(
                                      m.id,
                                      "unit",
                                      e.target.value,
                                    )
                                  }
                                  className="h-8 text-sm w-20"
                                  aria-label="Unit"
                                />
                              </td>
                              <td className="py-2">
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="number"
                                    value={edit.refLow}
                                    onChange={(e) =>
                                      updateEditField(
                                        m.id,
                                        "refLow",
                                        e.target.value,
                                      )
                                    }
                                    className="h-8 text-sm w-16 text-right"
                                    placeholder="Low"
                                    aria-label="Ref low"
                                  />
                                  <span className="text-muted-foreground">
                                    –
                                  </span>
                                  <Input
                                    type="number"
                                    value={edit.refHigh}
                                    onChange={(e) =>
                                      updateEditField(
                                        m.id,
                                        "refHigh",
                                        e.target.value,
                                      )
                                    }
                                    className="h-8 text-sm w-16 text-right"
                                    placeholder="High"
                                    aria-label="Ref high"
                                  />
                                </div>
                              </td>
                              <td className="py-2 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="size-7"
                                    onClick={saveEdit}
                                    aria-label="Save edit"
                                  >
                                    <Check className="size-3.5" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="size-7"
                                    onClick={cancelEdit}
                                    aria-label="Cancel edit"
                                  >
                                    <X className="size-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr
                            key={m.id}
                            className={cn(
                              "border-b last:border-0 hover:bg-muted/50 transition-colors",
                              hasEdit && "bg-status-warning/5",
                            )}
                          >
                            <td className="py-3 font-medium">
                              {hasEdit ? edit?.name : m.name}
                              {hasEdit && (
                                <Badge
                                  variant="outline"
                                  className="ml-2 text-xs border-status-warning text-status-warning"
                                >
                                  Edited
                                </Badge>
                              )}
                              {m.metricDefinitionId ? (
                                <Badge
                                  variant="outline"
                                  className="ml-1.5 text-[10px] border-status-normal text-status-normal px-1 py-0"
                                >
                                  Linked
                                </Badge>
                              ) : (
                                <span className="ml-1.5 text-[10px] text-muted-foreground/50">
                                  unmapped
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-right tabular-nums font-semibold">
                              {hasEdit ? edit?.value : m.value}
                            </td>
                            <td className="py-3 text-muted-foreground">
                              {(hasEdit ? edit?.unit : m.unit) || "—"}
                            </td>
                            <td className="py-3 text-right text-muted-foreground tabular-nums">
                              {getDisplayedRefRange(m)}
                            </td>
                            <td className="py-3 text-center">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-7"
                                onClick={() => startEdit(m)}
                                disabled={editingId !== null}
                                aria-label={`Edit ${m.name}`}
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Card view — always visible when PDF sidebar is present, otherwise mobile only */}
                <div
                  className={cn("space-y-2", !report.blobUrl && "sm:hidden")}
                >
                  {metrics.map((m) => {
                    const isEditing = editingId === m.id;
                    const hasEdit = !!edits[m.id];
                    const edit = edits[m.id];

                    return (
                      <div
                        key={m.id}
                        className={cn(
                          "border rounded-lg p-3",
                          hasEdit &&
                            "bg-status-warning/5 border-status-warning/20",
                        )}
                      >
                        {isEditing && edit ? (
                          <div className="space-y-3">
                            <Input
                              value={edit.name}
                              onChange={(e) =>
                                updateEditField(m.id, "name", e.target.value)
                              }
                              className="h-8 text-sm font-medium"
                              aria-label="Metric name"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-muted-foreground mb-1 block">
                                  Value
                                </label>
                                <Input
                                  type="number"
                                  value={edit.value}
                                  onChange={(e) =>
                                    updateEditField(
                                      m.id,
                                      "value",
                                      e.target.value,
                                    )
                                  }
                                  className="h-8 text-sm"
                                  aria-label="Value"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground mb-1 block">
                                  Unit
                                </label>
                                <Input
                                  value={edit.unit}
                                  onChange={(e) =>
                                    updateEditField(
                                      m.id,
                                      "unit",
                                      e.target.value,
                                    )
                                  }
                                  className="h-8 text-sm"
                                  placeholder="—"
                                  aria-label="Unit"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground mb-1 block">
                                  Ref Low
                                </label>
                                <Input
                                  type="number"
                                  value={edit.refLow}
                                  onChange={(e) =>
                                    updateEditField(
                                      m.id,
                                      "refLow",
                                      e.target.value,
                                    )
                                  }
                                  className="h-8 text-sm"
                                  placeholder="—"
                                  aria-label="Ref low"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground mb-1 block">
                                  Ref High
                                </label>
                                <Input
                                  type="number"
                                  value={edit.refHigh}
                                  onChange={(e) =>
                                    updateEditField(
                                      m.id,
                                      "refHigh",
                                      e.target.value,
                                    )
                                  }
                                  className="h-8 text-sm"
                                  placeholder="—"
                                  aria-label="Ref high"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={saveEdit}
                                className="flex-1"
                              >
                                <Check
                                  className="size-3.5"
                                  aria-hidden="true"
                                />
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={cancelEdit}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="w-full text-left"
                            onClick={() => startEdit(m)}
                            disabled={editingId !== null}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="font-medium text-sm truncate">
                                  {hasEdit ? edit?.name : m.name}
                                </span>
                                {hasEdit && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] border-status-warning text-status-warning shrink-0"
                                  >
                                    Edited
                                  </Badge>
                                )}
                                {m.metricDefinitionId ? (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] border-status-normal text-status-normal px-1 py-0 shrink-0"
                                  >
                                    Linked
                                  </Badge>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground/50 shrink-0">
                                    unmapped
                                  </span>
                                )}
                              </div>
                              <Pencil
                                className="size-3 text-muted-foreground shrink-0"
                                aria-hidden="true"
                              />
                            </div>
                            <div className="flex items-baseline gap-2 mt-1">
                              <span className="text-lg font-semibold tabular-nums">
                                {hasEdit ? edit?.value : m.value}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {(hasEdit ? edit?.unit : m.unit) || ""}
                              </span>
                              {getDisplayedRefRange(m) !== "—" && (
                                <span className="text-xs text-muted-foreground ml-auto">
                                  Ref: {getDisplayedRefRange(m)}
                                </span>
                              )}
                            </div>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </ReportReviewLayout>

      {/* Review actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="review-notes"
                className="text-sm font-medium mb-1.5 block"
              >
                Review Notes (optional)
              </label>
              <textarea
                id="review-notes"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-primary focus-visible:ring-primary/30 focus-visible:ring-[3px] outline-none min-h-[80px] resize-y"
                placeholder="Any notes about this extraction..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {hasEdits
                  ? `${Object.keys(edits).length} metric(s) edited — will be submitted as "Corrected"`
                  : "No edits — approve as correct or edit metrics first"}
              </p>
              <div className="flex items-center gap-3">
                {!hasEdits && (
                  <Button
                    onClick={() => handleSubmit("approved")}
                    disabled={submitting}
                  >
                    <Check className="size-4" aria-hidden="true" />
                    Approve
                  </Button>
                )}
                {hasEdits && (
                  <Button
                    onClick={() => handleSubmit("corrected")}
                    disabled={submitting}
                  >
                    <Save className="size-4" aria-hidden="true" />
                    Submit Corrections
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
