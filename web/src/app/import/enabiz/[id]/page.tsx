"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Loader2,
  Check,
  X,
  AlertCircle,
  ChevronLeft,
  ArrowRight,
  Building2,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { cn } from "@/lib/utils";
import {
  CollisionBanner,
  type CollisionAction,
} from "@/components/collision-banner";
import {
  checkOutOfRange,
  type EditableMetric,
  type MetricField,
  type RenameInfo,
} from "@/lib/metrics";
import {
  MetricReviewCard,
  type MetricCardLabels,
} from "@/components/metric-review-card";
import { reportError } from "@/lib/error-reporting";
import { trackEvent } from "@/lib/analytics";

interface CollisionInfo {
  reportId: string;
  source: string;
  similarity: number;
  overlapping: number;
  existingCount: number;
  newCount: number;
  existingMetrics: Array<{ name: string; value: number }>;
}

interface PendingImportData {
  id: string;
  profileId: string;
  profileName: string;
  source: string;
  contentHash: string;
  sampleDate: string;
  hospitalName: string | null;
  metrics: Array<{
    name: string;
    value: number;
    unit?: string;
    ref_low?: number | null;
    ref_high?: number | null;
  }>;
  status: string;
  createdAt: string;
}

type PageState =
  | "loading"
  | "review"
  | "confirming"
  | "success"
  | "processed"
  | "error";

export default function EnabizImportPage(): React.ReactElement {
  const t = useTranslations("pages.enabizImport");
  const tc = useTranslations("common");
  const router = useRouter();
  const params = useParams();
  const importId = params.id as string;

  const [state, setState] = useState<PageState>("loading");
  const [importData, setImportData] = useState<PendingImportData | null>(null);
  const [collision, setCollision] = useState<CollisionInfo | null>(null);
  const [collisionAction, setCollisionAction] =
    useState<CollisionAction | null>(null);
  const [editedMetrics, setEditedMetrics] = useState<EditableMetric[]>([]);
  const [sampleDate, setSampleDate] = useState("");
  const [appliedRenames, setAppliedRenames] = useState<
    Record<string, RenameInfo>
  >({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadImport() {
      try {
        const response = await fetch(`/api/import/enabiz/pending/${importId}`);
        if (!response.ok) {
          if (response.status === 401) {
            router.push(`/login?redirect=/import/enabiz/${importId}`);
            return;
          }
          throw new Error("Failed to load import");
        }

        const data = await response.json();

        if (data.processed) {
          setState("processed");
          return;
        }

        const imp = data.import as PendingImportData;
        setImportData(imp);
        setSampleDate(imp.sampleDate);

        if (data.collision) {
          // Auto-skip if values are exactly identical
          const col = data.collision as CollisionInfo;
          const existingMap = new Map(
            (col.existingMetrics || []).map(
              (m: { name: string; value: number }) => [
                m.name.toLowerCase(),
                m.value,
              ],
            ),
          );
          const allExact =
            imp.metrics.every((m) => {
              const existing = existingMap.get(m.name.toLowerCase());
              return existing !== undefined && existing === m.value;
            }) && imp.metrics.length === (col.existingMetrics || []).length;

          if (allExact) {
            // Exact duplicate — auto-skip without showing review
            try {
              await fetch(`/api/import/enabiz/pending/${importId}/confirm`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  sampleDate: imp.sampleDate,
                  metrics: [],
                  collisionAction: "skip",
                }),
              });
            } catch {
              // Best effort
            }
            setState("processed");
            return;
          }

          setCollision(col);
        }

        // Apply aliases
        const aliases: Record<string, string> = data.aliases || {};
        const renames: Record<string, RenameInfo> = {};
        const metricsWithAliases = imp.metrics.map((m) => {
          for (const [alias, canonical] of Object.entries(aliases)) {
            if (m.name.toLowerCase() === alias.toLowerCase()) {
              renames[m.name.toLowerCase()] = {
                original: m.name,
                canonical,
                applied: true,
              };
              return { ...m, name: canonical };
            }
          }
          return m;
        });

        const ts = Date.now();
        setEditedMetrics(
          metricsWithAliases.map((m, i) => ({
            ...m,
            _key: `metric-${i}-${ts}`,
          })),
        );
        setAppliedRenames(renames);
        setState("review");
      } catch (err) {
        reportError(err, { op: "enabizImport.load", importId });
        setError(t("loadFailed"));
        setState("error");
      }
    }

    loadImport();
  }, [importId, router, t]);

  const handleMetricChange = useCallback(
    (index: number, field: MetricField, value: string | number | null) => {
      setEditedMetrics((prev) =>
        prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
      );
    },
    [],
  );

  const handleRemoveMetric = useCallback((index: number) => {
    setEditedMetrics((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAliasToggle = useCallback(
    (index: number, checked: boolean, info: RenameInfo) => {
      const newName = checked ? info.canonical : info.original;
      setEditedMetrics((prev) =>
        prev.map((m, i) => (i === index ? { ...m, name: newName } : m)),
      );
      setAppliedRenames((prev) => ({
        ...prev,
        [info.original.toLowerCase()]: {
          ...prev[info.original.toLowerCase()],
          applied: checked,
        },
      }));
    },
    [],
  );

  const handleConversionToggle = useCallback(() => {
    // No-op: e-Nabız imports use canonical Turkish units, no conversions needed
  }, []);

  const renameInfoMap = useMemo(() => {
    const map = new Map<string, RenameInfo>();
    for (const entry of Object.values(appliedRenames)) {
      const key = entry.applied ? entry.canonical : entry.original;
      map.set(key, entry);
    }
    return map;
  }, [appliedRenames]);

  const canConfirm =
    !!sampleDate &&
    editedMetrics.length > 0 &&
    (!collision || !!collisionAction);

  async function handleConfirm(): Promise<void> {
    if (!canConfirm) return;

    setState("confirming");
    setError(null);

    try {
      const response = await fetch(
        `/api/import/enabiz/pending/${importId}/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sampleDate,
            metrics: editedMetrics,
            collisionAction: collision ? collisionAction : undefined,
            collisionReportId: collision?.reportId,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || t("confirmFailed"));
        setState("review");
        return;
      }

      trackEvent({ action: "enabiz_import_confirmed", category: "engagement" });
      setState("success");

      // Redirect to dashboard after short delay
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err) {
      reportError(err, { op: "enabizImport.confirm", importId });
      setError(tc("errorRetry"));
      setState("review");
    }
  }

  async function handleSkip(): Promise<void> {
    try {
      await fetch(`/api/import/enabiz/pending/${importId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sampleDate: sampleDate || importData?.sampleDate,
          metrics: [],
          collisionAction: "skip",
        }),
      });
    } catch {
      // Best effort
    }
    router.push("/dashboard");
  }

  const cardLabels = useMemo<MetricCardLabels>(
    () => ({
      metricName: t("metricName"),
      value: t("value"),
      unit: t("unit"),
      refMin: t("refMin"),
      refMax: t("refMax"),
      refPrefix: t("refPrefix"),
      deleteMetric: t("deleteMetric"),
      willBeAddedAs: t("willBeAddedAs"),
      willStayAs: t("willStayAs"),
      willConvertTo: t("willConvertTo"),
      willKeepOriginal: t("willKeepOriginal"),
      yesDelete: tc("yesDelete"),
      cancel: tc("cancel"),
    }),
    [t, tc],
  );

  const collisionLabels = useMemo(() => {
    const isHighSimilarity = collision ? collision.similarity > 0.8 : false;
    return {
      title: t("collision.title"),
      skip: t("collision.skip"),
      skipDescription: t("collision.skipDescription"),
      overwrite: t("collision.overwrite"),
      overwriteDescription: t("collision.overwriteDescription"),
      createSeparate: t("collision.createSeparate"),
      createSeparateDescription: t("collision.createSeparateDescription"),
      selectAction: t("collision.selectAction"),
      recommendation: isHighSimilarity
        ? t("collision.recommendSkip")
        : t("collision.recommendSeparate"),
      existing: t("collision.existing"),
      new: t("collision.new"),
      metric: t("metric"),
    };
  }, [t, collision]);

  // Loading state
  if (state === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Already processed — redirect
  if (state === "processed") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-3xl mx-auto p-4">
          <Card>
            <CardContent className="flex flex-col items-center py-8">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">{t("alreadyProcessed")}</p>
              <p className="text-sm text-muted-foreground mb-4">
                {t("alreadyProcessedDescription")}
              </p>
              <Button onClick={() => router.push("/dashboard")}>
                {t("goToDashboard")}
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        profileName={importData?.profileName}
        currentProfileId={importData?.profileId}
      />

      <main className="container max-w-3xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {tc("back")}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("reviewTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Source info */}
            {importData && (
              <div className="flex items-start gap-3">
                <Badge
                  variant="outline"
                  className="text-primary border-primary/30 shrink-0"
                >
                  e-Nabız
                </Badge>
                {importData.hospitalName && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    {importData.hospitalName}
                  </div>
                )}
              </div>
            )}

            {/* Profile indicator */}
            {importData && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-primary/5 border border-primary/20">
                <User className="h-4 w-4 text-primary shrink-0" />
                <p className="text-sm">
                  {t("importingToProfile", {
                    profileName: importData.profileName,
                  })}
                </p>
              </div>
            )}

            {/* Collision banner */}
            {collision && state === "review" && (
              <CollisionBanner
                collision={collision}
                sampleDate={sampleDate}
                newMetrics={editedMetrics
                  .filter((m) => m.value !== null)
                  .map((m) => ({
                    name: m.name,
                    value: m.value as number,
                  }))}
                selectedAction={collisionAction}
                onActionChange={setCollisionAction}
                labels={collisionLabels}
              />
            )}

            {/* Review state */}
            {(state === "review" || state === "confirming") && (
              <div className="space-y-6">
                {/* Sample Date + Metrics — hide when skip selected */}
                {collisionAction !== "skip" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="sampleDate">{t("testDate")}</Label>
                      <Input
                        id="sampleDate"
                        type="date"
                        value={sampleDate}
                        onChange={(e) => setSampleDate(e.target.value)}
                        className="max-w-xs"
                      />
                    </div>

                    {/* Metrics */}
                    <div className="space-y-2">
                      <Label>
                        {t("metrics", { count: editedMetrics.length })}
                      </Label>

                      {/* Desktop table view */}
                      <div className="hidden md:block border rounded-lg overflow-hidden">
                        <div className="max-h-96 overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-muted sticky top-0">
                              <tr>
                                <th className="text-left p-2 font-medium">
                                  {t("metric")}
                                </th>
                                <th className="text-right p-2 font-medium">
                                  {t("value")}
                                </th>
                                <th className="text-right p-2 font-medium">
                                  {t("unit")}
                                </th>
                                <th className="text-right p-2 font-medium">
                                  {t("refMin")}
                                </th>
                                <th className="text-right p-2 font-medium">
                                  {t("refMax")}
                                </th>
                                <th className="w-10"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {editedMetrics.map((metric, index) => {
                                const isOutOfRange = checkOutOfRange(
                                  metric.value,
                                  metric.ref_low ?? null,
                                  metric.ref_high ?? null,
                                );
                                const renameInfo =
                                  renameInfoMap.get(metric.name) ?? null;
                                return (
                                  <React.Fragment key={metric._key}>
                                    <tr
                                      className={cn(
                                        "border-t",
                                        isOutOfRange && "bg-status-critical/10",
                                      )}
                                    >
                                      <td className="p-2">
                                        <Input
                                          value={metric.name ?? ""}
                                          onChange={(e) =>
                                            handleMetricChange(
                                              index,
                                              "name",
                                              e.target.value,
                                            )
                                          }
                                          className="h-8 text-sm"
                                          aria-label={t("metricName")}
                                        />
                                      </td>
                                      <td className="p-2">
                                        <Input
                                          type="number"
                                          value={metric.value ?? ""}
                                          onChange={(e) =>
                                            handleMetricChange(
                                              index,
                                              "value",
                                              e.target.value
                                                ? parseFloat(e.target.value)
                                                : null,
                                            )
                                          }
                                          className={cn(
                                            "h-8 text-sm text-right w-24",
                                            isOutOfRange &&
                                              "text-status-critical font-medium",
                                          )}
                                          aria-label={t("value")}
                                        />
                                      </td>
                                      <td className="p-2">
                                        <Input
                                          value={metric.unit ?? ""}
                                          onChange={(e) =>
                                            handleMetricChange(
                                              index,
                                              "unit",
                                              e.target.value,
                                            )
                                          }
                                          className="h-8 text-sm text-right w-20"
                                          aria-label={t("unit")}
                                        />
                                      </td>
                                      <td className="p-2">
                                        <Input
                                          type="number"
                                          value={metric.ref_low ?? ""}
                                          onChange={(e) =>
                                            handleMetricChange(
                                              index,
                                              "ref_low",
                                              e.target.value
                                                ? parseFloat(e.target.value)
                                                : null,
                                            )
                                          }
                                          className="h-8 text-sm text-right w-20"
                                          placeholder="-"
                                          aria-label={t("refMinAria")}
                                        />
                                      </td>
                                      <td className="p-2">
                                        <Input
                                          type="number"
                                          value={metric.ref_high ?? ""}
                                          onChange={(e) =>
                                            handleMetricChange(
                                              index,
                                              "ref_high",
                                              e.target.value
                                                ? parseFloat(e.target.value)
                                                : null,
                                            )
                                          }
                                          className="h-8 text-sm text-right w-20"
                                          placeholder="-"
                                          aria-label={t("refMaxAria")}
                                        />
                                      </td>
                                      <td className="p-2">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() =>
                                            handleRemoveMetric(index)
                                          }
                                          aria-label={t("deleteMetric")}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </td>
                                    </tr>
                                    {renameInfo && (
                                      <tr>
                                        <td
                                          colSpan={6}
                                          className="px-2 pb-2 pt-0"
                                        >
                                          <div className="flex items-center gap-2.5 text-xs">
                                            <span className="text-muted-foreground shrink-0">
                                              <span className="font-medium line-through">
                                                {renameInfo.original}
                                              </span>
                                              <ArrowRight className="inline h-3 w-3 mx-1" />
                                              <span className="font-medium text-primary">
                                                {renameInfo.canonical}
                                              </span>
                                            </span>
                                            <Switch
                                              checked={renameInfo.applied}
                                              onCheckedChange={(checked) =>
                                                handleAliasToggle(
                                                  index,
                                                  checked,
                                                  renameInfo,
                                                )
                                              }
                                              aria-label={`${renameInfo.original} → ${renameInfo.canonical}`}
                                            />
                                            <span className="text-muted-foreground/70">
                                              {renameInfo.applied ? (
                                                <>
                                                  <span className="font-medium text-primary">
                                                    {renameInfo.canonical}
                                                  </span>{" "}
                                                  {t("willBeAddedAs")}
                                                </>
                                              ) : (
                                                <>
                                                  <span className="font-medium">
                                                    {renameInfo.original}
                                                  </span>{" "}
                                                  {t("willStayAs")}
                                                </>
                                              )}
                                            </span>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Mobile card view */}
                      <div className="md:hidden space-y-2 pb-20">
                        {editedMetrics.map((metric, index) => (
                          <MetricReviewCard
                            key={metric._key}
                            metric={metric}
                            index={index}
                            labels={cardLabels}
                            renameInfo={renameInfoMap.get(metric.name) ?? null}
                            conversionInfo={null}
                            onMetricChange={handleMetricChange}
                            onRemove={handleRemoveMetric}
                            onAliasToggle={handleAliasToggle}
                            onConversionToggle={handleConversionToggle}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Mobile: sticky actions */}
                <div className="md:hidden sticky bottom-0 bg-background border-t p-3 pb-safe">
                  <div className="flex flex-col-reverse gap-2">
                    <Button
                      variant="outline"
                      onClick={handleSkip}
                      className="w-full"
                    >
                      {t("skipImport")}
                    </Button>
                    <Button
                      onClick={handleConfirm}
                      disabled={!canConfirm || state === "confirming"}
                      className="w-full"
                    >
                      {state === "confirming" ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {t("confirmSave")}
                    </Button>
                  </div>
                </div>

                {/* Desktop: inline actions */}
                <div className="hidden md:flex gap-3 justify-end">
                  <Button variant="outline" onClick={handleSkip}>
                    {t("skipImport")}
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={!canConfirm || state === "confirming"}
                  >
                    {state === "confirming" && (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    )}
                    {t("confirmSave")}
                  </Button>
                </div>
              </div>
            )}

            {/* Success State */}
            {state === "success" && (
              <div className="flex flex-col items-center py-8">
                <div className="h-16 w-16 rounded-full bg-status-normal/10 flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-status-normal" />
                </div>
                <p className="text-lg font-medium">{t("savedSuccessfully")}</p>
                <p className="text-sm text-muted-foreground mb-6">
                  {t("resultsAdded")}
                </p>
                <Button onClick={() => router.push("/dashboard")}>
                  {t("goToDashboard")}
                </Button>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-status-critical/10 text-status-critical rounded-lg">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
