"use client";

import React from "react";
import { X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { checkOutOfRange } from "@/lib/metrics";

interface RenameInfo {
  original: string;
  canonical: string;
  applied: boolean;
}

interface MetricReviewCardProps {
  metric: {
    name: string;
    value: number;
    unit?: string;
    ref_low?: number | null;
    ref_high?: number | null;
  };
  index: number;
  renameInfo: RenameInfo | null;
  onMetricChange: (
    index: number,
    field: string,
    value: string | number | null,
  ) => void;
  onRemove: (index: number) => void;
  onAliasToggle: (
    index: number,
    checked: boolean,
    info: { original: string; canonical: string },
  ) => void;
}

export const MetricReviewCard = React.memo(function MetricReviewCard({
  metric,
  index,
  renameInfo,
  onMetricChange,
  onRemove,
  onAliasToggle,
}: MetricReviewCardProps) {
  const isOutOfRange = checkOutOfRange(
    metric.value,
    metric.ref_low ?? null,
    metric.ref_high ?? null,
  );

  return (
    <div
      role="group"
      aria-labelledby={`metric-label-${index}`}
      className={cn(
        "border rounded-lg p-3",
        isOutOfRange && "bg-status-critical/10 border-status-critical/20",
      )}
    >
      <div className="space-y-3">
        {/* Metric name + delete */}
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <label
              id={`metric-label-${index}`}
              htmlFor={`metric-name-${index}`}
              className="text-xs text-muted-foreground mb-1 block"
            >
              Metrik adi
            </label>
            <Input
              id={`metric-name-${index}`}
              value={metric.name ?? ""}
              onChange={(e) => onMetricChange(index, "name", e.target.value)}
              className="h-10 text-sm"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 mt-5"
            onClick={() => onRemove(index)}
            aria-label={`${metric.name || "Metrik"} sil`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Alias suggestion */}
        {renameInfo && (
          <div className="flex items-center gap-2 text-xs bg-muted/50 rounded-md px-2 py-1.5">
            <span className="text-muted-foreground flex-1">
              <span className="font-medium line-through">
                {renameInfo.original}
              </span>
              <ArrowRight className="inline h-3 w-3 mx-1" />
              <span className="font-medium text-primary">
                {renameInfo.canonical}
              </span>
              <span className="ml-1">
                {renameInfo.applied ? "olarak eklenecek" : "olarak kalacak"}
              </span>
            </span>
            <Switch
              checked={renameInfo.applied}
              onCheckedChange={(checked) =>
                onAliasToggle(index, checked, renameInfo)
              }
              aria-label={`${renameInfo.original} → ${renameInfo.canonical}`}
            />
          </div>
        )}

        {/* Value + Unit */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label
              htmlFor={`metric-value-${index}`}
              className="text-xs text-muted-foreground mb-1 block"
            >
              Deger
            </label>
            <Input
              id={`metric-value-${index}`}
              type="text"
              inputMode="decimal"
              value={metric.value ?? ""}
              onChange={(e) => {
                const normalized = e.target.value.replace(",", ".");
                onMetricChange(
                  index,
                  "value",
                  normalized ? parseFloat(normalized) || 0 : 0,
                );
              }}
              className={cn(
                "h-10 text-sm",
                isOutOfRange && "text-status-critical font-medium",
              )}
            />
          </div>
          <div>
            <label
              htmlFor={`metric-unit-${index}`}
              className="text-xs text-muted-foreground mb-1 block"
            >
              Birim
            </label>
            <Input
              id={`metric-unit-${index}`}
              value={metric.unit ?? ""}
              onChange={(e) => onMetricChange(index, "unit", e.target.value)}
              className="h-10 text-sm"
            />
          </div>
        </div>

        {/* Ref Min + Ref Max */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label
              htmlFor={`metric-refmin-${index}`}
              className="text-xs text-muted-foreground mb-1 block"
            >
              Ref Min
            </label>
            <Input
              id={`metric-refmin-${index}`}
              type="text"
              inputMode="decimal"
              value={metric.ref_low ?? ""}
              onChange={(e) => {
                const normalized = e.target.value.replace(",", ".");
                onMetricChange(
                  index,
                  "ref_low",
                  normalized ? parseFloat(normalized) : null,
                );
              }}
              className="h-10 text-sm"
              placeholder="-"
            />
          </div>
          <div>
            <label
              htmlFor={`metric-refmax-${index}`}
              className="text-xs text-muted-foreground mb-1 block"
            >
              Ref Max
            </label>
            <Input
              id={`metric-refmax-${index}`}
              type="text"
              inputMode="decimal"
              value={metric.ref_high ?? ""}
              onChange={(e) => {
                const normalized = e.target.value.replace(",", ".");
                onMetricChange(
                  index,
                  "ref_high",
                  normalized ? parseFloat(normalized) : null,
                );
              }}
              className="h-10 text-sm"
              placeholder="-"
            />
          </div>
        </div>
      </div>
    </div>
  );
});
