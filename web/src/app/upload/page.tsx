"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  Loader2,
  Check,
  X,
  AlertCircle,
  ChevronLeft,
  ArrowRight,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { ExtractionLoading } from "@/components/extraction-loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Header } from "@/components/header";
import { cn } from "@/lib/utils";
import { formatDateTimeTR } from "@/lib/date";
import { reportError } from "@/lib/error-reporting";
import { trackEvent } from "@/lib/analytics";
import { FREE_REPORT_CAP } from "@/lib/constants";
import {
  checkOutOfRange,
  type ExtractedMetric,
  type EditableMetric,
  type MetricField,
  type RenameInfo,
} from "@/lib/metrics";
import {
  MetricReviewCard,
  type MetricCardLabels,
} from "@/components/metric-review-card";

interface Profile {
  id: string;
  display_name: string;
  report_count?: number;
}

interface ExtractedData {
  sample_date: string | null;
  metrics: ExtractedMetric[];
}

type UploadStatus =
  | "idle"
  | "uploading"
  | "extracting"
  | "review"
  | "confirming"
  | "success"
  | "error";

function UploadPageContent(): React.ReactElement {
  const t = useTranslations("pages.upload");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(
    null,
  );
  const [editedMetrics, setEditedMetrics] = useState<EditableMetric[]>([]);
  const [sampleDate, setSampleDate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [uploadCreatedAt, setUploadCreatedAt] = useState<string | null>(null);
  const [appliedRenames, setAppliedRenames] = useState<
    Record<string, RenameInfo>
  >({});
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollStartTimeRef = useRef<number | null>(null);
  const POLL_TIMEOUT_MS = 300000; // 5 minutes max polling

  function stopPolling(): void {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    pollStartTimeRef.current = null;
  }

  useEffect(() => {
    async function checkPendingUploads() {
      try {
        const urlUploadId = searchParams.get("uploadId");
        const response = await fetch("/api/upload");
        if (!response.ok) return;

        const data = await response.json();
        const uploads = data.uploads || [];

        const pendingUpload = urlUploadId
          ? uploads.find((u: { id: string }) => u.id === urlUploadId)
          : uploads[0];

        if (pendingUpload) {
          setUploadId(pendingUpload.id);
          setFileName(pendingUpload.file_name);
          setSelectedProfileId(pendingUpload.profile_id);
          setUploadCreatedAt(pendingUpload.created_at);

          if (pendingUpload.status === "extracting") {
            setStatus("extracting");
            startPolling(pendingUpload.id);
          } else if (pendingUpload.status === "review") {
            await loadExtractedData(pendingUpload.id);
          } else if (pendingUpload.status === "pending") {
            setStatus("extracting");
            startExtraction(pendingUpload.id);
          }
        }
      } catch (error) {
        reportError(error, { op: "upload.checkPending" });
      }
    }

    checkPendingUploads();

    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- startPolling/startExtraction/loadExtractedData use refs and are stable
  }, [searchParams]);

  function startPolling(id: string): void {
    stopPolling();
    pollStartTimeRef.current = Date.now();

    pollIntervalRef.current = setInterval(async () => {
      try {
        if (
          pollStartTimeRef.current &&
          Date.now() - pollStartTimeRef.current > POLL_TIMEOUT_MS
        ) {
          stopPolling();
          setError(t("timeout"));
          setStatus("error");
          return;
        }

        const response = await fetch("/api/upload");
        if (!response.ok) return;

        const data = await response.json();
        const upload = data.uploads?.find((u: { id: string }) => u.id === id);

        if (!upload) {
          stopPolling();
          setStatus("idle");
          return;
        }

        if (upload.status === "review") {
          stopPolling();
          await loadExtractedData(id);
        } else if (
          upload.status === "error" ||
          (upload.status === "pending" && upload.error_message)
        ) {
          stopPolling();
          setError(upload.error_message || t("extractionFailed"));
          setStatus("error");
        }
      } catch (err) {
        reportError(err, { op: "upload.polling" });
      }
    }, 2000);
  }

  async function applyAliases(
    metrics: ExtractedMetric[],
  ): Promise<{ metrics: ExtractedMetric[]; renames: typeof appliedRenames }> {
    try {
      const response = await fetch("/api/aliases");
      if (!response.ok) return { metrics, renames: {} };
      const data = await response.json();
      const aliases: Record<string, string> = data.aliases || {};

      const renames: typeof appliedRenames = {};
      const updated = metrics.map((m) => {
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

      return { metrics: updated, renames };
    } catch (error) {
      reportError(error, { op: "upload.applyAliases" });
      return { metrics, renames: {} };
    }
  }

  async function loadExtractedData(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/upload/${id}`);
      if (!response.ok) throw new Error("Failed to load upload data");

      const data = await response.json();
      const upload = data.upload;

      if (upload?.extracted_data) {
        const extracted = upload.extracted_data;
        setExtractedData(extracted);
        setSampleDate(extracted.sample_date || upload.sample_date || "");

        const { metrics, renames } = await applyAliases(
          extracted.metrics || [],
        );
        const ts = Date.now();
        setEditedMetrics(
          metrics.map((m, i) => ({ ...m, _key: `metric-${i}-${ts}` })),
        );
        setAppliedRenames(renames);
        setStatus("review");
      }
    } catch (err) {
      reportError(err, { op: "upload.loadExtractedData", uploadId: id });
      setError(t("dataLoadFailed"));
      setStatus("error");
    }
  }

  async function startExtraction(id: string): Promise<void> {
    try {
      setStatus("extracting");
      const response = await fetch(`/api/upload/${id}/extract`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Extraction failed");
      }

      startPolling(id);
    } catch (err) {
      reportError(err, { op: "upload.startExtraction", uploadId: id });
      setError(t("extractionFailed"));
      setStatus("error");
    }
  }

  useEffect(() => {
    async function fetchProfiles() {
      try {
        const response = await fetch("/api/profiles");
        if (response.ok) {
          const data = await response.json();
          const fetchedProfiles = data.profiles || [];
          setProfiles(fetchedProfiles);

          const cookies = document.cookie.split(";");
          const activeProfileCookie = cookies.find((c) =>
            c.trim().startsWith("viziai_active_profile="),
          );
          const cookieProfileId = activeProfileCookie?.split("=")[1]?.trim();

          if (
            cookieProfileId &&
            fetchedProfiles.some((p: Profile) => p.id === cookieProfileId)
          ) {
            setSelectedProfileId(cookieProfileId);
          } else if (fetchedProfiles.length > 0) {
            setSelectedProfileId(fetchedProfiles[0].id);
          }
        }
      } catch (error) {
        reportError(error, { op: "upload.fetchProfiles" });
      }
    }

    fetchProfiles();
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (!selectedProfileId) {
        setError(t("selectProfile"));
        return;
      }

      if (file.type !== "application/pdf") {
        setError(t("onlyPdf"));
        return;
      }

      setError(null);
      setFileName(file.name);
      setStatus("uploading");

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("profileId", selectedProfileId);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          if (uploadResponse.status === 409) {
            setError(
              t("alreadyUploaded", {
                date: uploadData.existingSampleDate || "?",
              }),
            );
          } else if (uploadResponse.status === 403 && uploadData.reportCap) {
            setError(t("reportCapDescription", { max: uploadData.reportCap }));
          } else {
            setError(uploadData.message || t("uploadFailed"));
          }
          setStatus("error");
          return;
        }

        setUploadId(uploadData.uploadId);
        setUploadCreatedAt(new Date().toISOString());
        setStatus("extracting");
        trackEvent({ action: "upload_started", category: "engagement" });

        const extractResponse = await fetch(
          `/api/upload/${uploadData.uploadId}/extract`,
          {
            method: "POST",
          },
        );

        const extractData = await extractResponse.json();

        if (!extractResponse.ok) {
          setError(extractData.message || t("extractionFailed"));
          setStatus("error");
          return;
        }

        startPolling(uploadData.uploadId);
      } catch (err) {
        reportError(err, { op: "upload.onDrop" });
        setError(tc("errorRetry"));
        setStatus("error");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- startPolling uses refs and is stable
    [selectedProfileId, t, tc],
  );

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);
  const isAtCap =
    selectedProfile?.report_count !== undefined &&
    selectedProfile.report_count >= FREE_REPORT_CAP;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: isAtCap || (status !== "idle" && status !== "error"),
  });

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

  async function handleConfirm(): Promise<void> {
    if (!uploadId || !sampleDate || editedMetrics.length === 0) return;

    setStatus("confirming");
    setError(null);

    try {
      const response = await fetch(`/api/upload/${uploadId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sampleDate,
          metrics: editedMetrics,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || t("confirmFailed"));
        setStatus("review");
        return;
      }

      setStatus("success");
    } catch (err) {
      reportError(err, { op: "upload.confirm", uploadId });
      setError(tc("errorRetry"));
      setStatus("review");
    }
  }

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

  const renameInfoMap = useMemo(() => {
    const map = new Map<string, RenameInfo>();
    for (const entry of Object.values(appliedRenames)) {
      const key = entry.applied ? entry.canonical : entry.original;
      map.set(key, entry);
    }
    return map;
  }, [appliedRenames]);

  async function handleCancel(): Promise<void> {
    stopPolling();

    if (uploadId) {
      try {
        await fetch(`/api/upload/${uploadId}`, { method: "DELETE" });
      } catch (err) {
        reportError(err, { op: "upload.cancel", uploadId });
      }
    }

    setStatus("idle");
    setUploadId(null);
    setFileName("");
    setUploadCreatedAt(null);
    setExtractedData(null);
    setEditedMetrics([]);
    setAppliedRenames({});
    setSampleDate("");
    setError(null);
  }

  function handleGoToDashboard(): void {
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
      yesDelete: tc("yesDelete"),
      cancel: tc("cancel"),
    }),
    [t, tc],
  );

  return (
    <div className="min-h-screen bg-background">
      <Header
        profileName={selectedProfile?.display_name}
        currentProfileId={selectedProfileId || undefined}
      />

      <main className="container max-w-3xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            {tc("back")}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {status === "review" || status === "confirming"
                ? t("reviewTitle")
                : t("title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Selection */}
            {status === "idle" && (
              <div className="space-y-2">
                <Label htmlFor="profile">{tc("profile")}</Label>
                <Select
                  value={selectedProfileId}
                  onValueChange={setSelectedProfileId}
                >
                  <SelectTrigger id="profile">
                    <SelectValue placeholder={tc("selectProfile")} />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Report Cap Warning */}
            {status === "idle" && isAtCap && (
              <div className="flex items-start gap-2 p-3 bg-status-warning/10 text-status-warning rounded-lg">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">
                  {t("reportCapDescription", { max: FREE_REPORT_CAP })}
                </p>
              </div>
            )}

            {/* Drop Zone */}
            {(status === "idle" || status === "error") && (
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50",
                  !selectedProfileId && "opacity-50 cursor-not-allowed",
                )}
              >
                <input {...getInputProps()} aria-label={t("selectPdf")} />
                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                {isDragActive ? (
                  <p className="text-lg font-medium">{t("dropHere")}</p>
                ) : (
                  <>
                    <p className="text-lg font-medium">{t("dragOrClick")}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("onlyPdf")}
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Uploading State */}
            {status === "uploading" && (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium">{t("uploading")}</p>
                <p className="text-sm text-muted-foreground">{fileName}</p>
              </div>
            )}

            {/* Extracting State */}
            {status === "extracting" && (
              <ExtractionLoading
                fileName={fileName || undefined}
                uploadTime={formatDateTimeTR(uploadCreatedAt, locale)}
                onCancel={handleCancel}
              />
            )}

            {/* Review State */}
            {status === "review" && extractedData && (
              <div className="space-y-6">
                <div className="flex items-start gap-2 text-status-normal">
                  <FileText className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{fileName}</p>
                    {uploadCreatedAt && (
                      <p className="text-muted-foreground text-xs mt-0.5">
                        {formatDateTimeTR(uploadCreatedAt, locale)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Sample Date */}
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
                  <Label>{t("metrics", { count: editedMetrics.length })}</Label>

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
                                      onClick={() => handleRemoveMetric(index)}
                                      aria-label={t("deleteMetric")}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </td>
                                </tr>
                                {renameInfo && (
                                  <tr>
                                    <td colSpan={6} className="px-2 pb-2 pt-0">
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
                        onMetricChange={handleMetricChange}
                        onRemove={handleRemoveMetric}
                        onAliasToggle={handleAliasToggle}
                      />
                    ))}
                  </div>
                </div>

                {/* Mobile: sticky actions */}
                <div className="md:hidden sticky bottom-0 bg-background border-t p-3 pb-safe">
                  <div className="flex flex-col-reverse gap-2">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="w-full"
                    >
                      {tc("cancel")}
                    </Button>
                    <Button
                      onClick={handleConfirm}
                      disabled={!sampleDate || editedMetrics.length === 0}
                      className="w-full"
                    >
                      {t("confirmSave")}
                    </Button>
                  </div>
                </div>

                {/* Desktop: inline actions */}
                <div className="hidden md:flex gap-3 justify-end">
                  <Button variant="outline" onClick={handleCancel}>
                    {tc("cancel")}
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={!sampleDate || editedMetrics.length === 0}
                  >
                    {t("confirmSave")}
                  </Button>
                </div>
              </div>
            )}

            {/* Confirming State */}
            {status === "confirming" && (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium">{t("saving")}</p>
              </div>
            )}

            {/* Success State */}
            {status === "success" && (
              <div className="flex flex-col items-center py-8">
                <div className="h-16 w-16 rounded-full bg-status-normal/10 flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-status-normal" />
                </div>
                <p className="text-lg font-medium">{t("savedSuccessfully")}</p>
                <p className="text-sm text-muted-foreground mb-6">
                  {t("resultsAdded")}
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleCancel}>
                    {t("uploadAnother")}
                  </Button>
                  <Button onClick={handleGoToDashboard}>
                    {t("goToDashboard")}
                  </Button>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="space-y-4">
                <div className="flex items-start gap-2 p-3 bg-status-critical/10 text-status-critical rounded-lg">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm">{error}</p>
                    {fileName && uploadCreatedAt && (
                      <p className="text-xs mt-1 opacity-70">
                        {fileName} - {formatDateTimeTR(uploadCreatedAt, locale)}
                      </p>
                    )}
                  </div>
                </div>
                {uploadId && (
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    {t("uploadNewFile")}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function UploadPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <UploadPageContent />
    </Suspense>
  );
}
