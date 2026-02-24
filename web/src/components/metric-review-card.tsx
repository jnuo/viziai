"use client";

import React, { useState } from "react";
import { ArrowRight, ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  checkOutOfRange,
  type ExtractedMetric,
  type MetricField,
  type RenameInfo,
} from "@/lib/metrics";

export interface MetricCardLabels {
  metricName: string;
  value: string;
  unit: string;
  refMin: string;
  refMax: string;
  refPrefix: string;
  deleteMetric: string;
  willBeAddedAs: string;
  willStayAs: string;
  yesDelete: string;
  cancel: string;
}

interface MetricReviewCardProps {
  metric: ExtractedMetric;
  index: number;
  labels: MetricCardLabels;
  renameInfo: RenameInfo | null;
  onMetricChange: (
    index: number,
    field: MetricField,
    value: string | number | null,
  ) => void;
  onRemove: (index: number) => void;
  onAliasToggle: (index: number, checked: boolean, info: RenameInfo) => void;
}

function formatRefRange(
  low: number | null | undefined,
  high: number | null | undefined,
): string | null {
  const hasLow = low != null && !isNaN(Number(low));
  const hasHigh = high != null && !isNaN(Number(high));
  if (hasLow && hasHigh) return `${low}\u2013${high}`;
  if (hasLow) return `\u2265${low}`;
  if (hasHigh) return `\u2264${high}`;
  return null;
}

export const MetricReviewCard = React.memo(function MetricReviewCard({
  metric,
  index,
  labels,
  renameInfo,
  onMetricChange,
  onRemove,
  onAliasToggle,
}: MetricReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isOutOfRange = checkOutOfRange(
    metric.value,
    metric.ref_low ?? null,
    metric.ref_high ?? null,
  );

  const refRange = formatRefRange(metric.ref_low, metric.ref_high);
  const expandedId = `metric-edit-${index}`;

  return (
    <div
      className={cn(
        "border rounded-lg overflow-hidden",
        isOutOfRange && "bg-status-critical/10 border-status-critical/20",
      )}
    >
      {/* Summary row — tap to expand/collapse */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-3 flex items-center gap-3 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset rounded-lg"
        aria-expanded={expanded}
        aria-controls={expandedId}
      >
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{metric.name}</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span
              className={cn(
                "text-sm font-medium tabular-nums",
                isOutOfRange && "text-status-critical",
              )}
            >
              {metric.value}
            </span>
            {metric.unit && (
              <span className="text-xs text-muted-foreground">
                {metric.unit}
              </span>
            )}
            {refRange && (
              <>
                <span className="text-muted-foreground/30 mx-0.5">
                  &middot;
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {labels.refPrefix} {refRange}
                </span>
              </>
            )}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground/40 shrink-0 motion-safe:transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>

      {/* Alias suggestion — always visible when present (outside button, so switch works) */}
      {renameInfo && (
        <div className={cn("px-3 pb-3", expanded && "pb-0")}>
          <div className="flex items-center gap-2 text-xs bg-muted/50 rounded-md px-2.5 py-2">
            <span className="text-muted-foreground flex-1 min-w-0">
              <span className="font-medium line-through">
                {renameInfo.original}
              </span>
              <ArrowRight className="inline h-3 w-3 mx-1" />
              <span className="font-medium text-primary">
                {renameInfo.canonical}
              </span>
              <span className="ml-1">
                {renameInfo.applied ? labels.willBeAddedAs : labels.willStayAs}
              </span>
            </span>
            <Switch
              checked={renameInfo.applied}
              onCheckedChange={(checked) =>
                onAliasToggle(index, checked, renameInfo)
              }
              aria-label={`${renameInfo.original} \u2192 ${renameInfo.canonical}`}
            />
          </div>
        </div>
      )}

      {/* Expanded edit form */}
      {expanded && (
        <div
          id={expandedId}
          className="px-3 pb-3 pt-3 space-y-3 border-t border-border/50"
        >
          {/* Metric name */}
          <div>
            <label
              htmlFor={`metric-name-${index}`}
              className="text-xs text-muted-foreground mb-1 block"
            >
              {labels.metricName}
            </label>
            <Input
              id={`metric-name-${index}`}
              name={`metric-name-${index}`}
              autoComplete="off"
              value={metric.name ?? ""}
              onChange={(e) => onMetricChange(index, "name", e.target.value)}
              className="h-10 text-sm"
            />
          </div>

          {/* Value + Unit */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label
                htmlFor={`metric-value-${index}`}
                className="text-xs text-muted-foreground mb-1 block"
              >
                {labels.value}
              </label>
              <Input
                id={`metric-value-${index}`}
                name={`metric-value-${index}`}
                autoComplete="off"
                type="text"
                inputMode="decimal"
                value={metric.value ?? ""}
                onChange={(e) => {
                  const normalized = e.target.value.replace(",", ".");
                  onMetricChange(
                    index,
                    "value",
                    normalized ? parseFloat(normalized) : null,
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
                {labels.unit}
              </label>
              <Input
                id={`metric-unit-${index}`}
                name={`metric-unit-${index}`}
                autoComplete="off"
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
                {labels.refMin}
              </label>
              <Input
                id={`metric-refmin-${index}`}
                name={`metric-refmin-${index}`}
                autoComplete="off"
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
                {labels.refMax}
              </label>
              <Input
                id={`metric-refmax-${index}`}
                name={`metric-refmax-${index}`}
                autoComplete="off"
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

          {/* Delete — confirm flow with proper full-width buttons */}
          {confirmingDelete ? (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => onRemove(index)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                {labels.yesDelete}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setConfirmingDelete(false)}
              >
                {labels.cancel}
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive w-full"
              onClick={() => setConfirmingDelete(true)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              {labels.deleteMetric}
            </Button>
          )}
        </div>
      )}
    </div>
  );
});
