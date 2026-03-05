"use client";

import { AlertTriangle, ArrowRight, Lightbulb } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type CollisionAction = "overwrite" | "skip" | "create_separate";

interface MetricComparison {
  name: string;
  existingValue: number | null;
  newValue: number | null;
  match: "same" | "different" | "new" | "missing";
}

interface CollisionInfo {
  reportId: string;
  source: string;
  similarity: number;
  overlapping: number;
  existingCount: number;
  newCount: number;
  existingMetrics: Array<{ name: string; value: number }>;
}

interface CollisionBannerProps {
  collision: CollisionInfo;
  sampleDate: string;
  newMetrics: Array<{ name: string; value: number }>;
  selectedAction: CollisionAction | null;
  onActionChange: (action: CollisionAction) => void;
  labels: {
    title: string;
    skip: string;
    skipDescription: string;
    overwrite: string;
    overwriteDescription: string;
    createSeparate: string;
    createSeparateDescription: string;
    selectAction: string;
    recommendation: string;
    existing: string;
    new: string;
    metric: string;
  };
}

function buildComparison(
  existingMetrics: Array<{ name: string; value: number }>,
  newMetrics: Array<{ name: string; value: number }>,
  tolerance = 0.05,
): MetricComparison[] {
  const existingMap = new Map<string, number>();
  for (const m of existingMetrics) {
    existingMap.set(m.name.toLowerCase(), m.value);
  }

  const result: MetricComparison[] = [];
  const seen = new Set<string>();

  for (const m of newMetrics) {
    const key = m.name.toLowerCase();
    seen.add(key);
    const existingValue = existingMap.get(key);

    if (existingValue === undefined) {
      result.push({
        name: m.name,
        existingValue: null,
        newValue: m.value,
        match: "new",
      });
    } else {
      const maxAbs = Math.max(Math.abs(existingValue), Math.abs(m.value), 1);
      const diff = Math.abs(existingValue - m.value) / maxAbs;
      result.push({
        name: m.name,
        existingValue,
        newValue: m.value,
        match: diff <= tolerance ? "same" : "different",
      });
    }
  }

  // Metrics in existing but not in new
  for (const m of existingMetrics) {
    if (!seen.has(m.name.toLowerCase())) {
      result.push({
        name: m.name,
        existingValue: m.value,
        newValue: null,
        match: "missing",
      });
    }
  }

  return result;
}

function getRecommendation(similarity: number): {
  action: CollisionAction;
  key: "skip" | "createSeparate";
} {
  if (similarity > 0.8) return { action: "skip", key: "skip" };
  return { action: "create_separate", key: "createSeparate" };
}

export function CollisionBanner({
  collision,
  sampleDate,
  newMetrics,
  selectedAction,
  onActionChange,
  labels,
}: CollisionBannerProps) {
  const isHighSimilarity = collision.similarity > 0.8;
  const formattedDate = sampleDate
    ? new Date(sampleDate + "T00:00:00").toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";
  const comparison = buildComparison(
    collision.existingMetrics || [],
    newMetrics,
  );
  const rec = getRecommendation(collision.similarity);

  const options: {
    value: CollisionAction;
    label: string;
    description: string;
    recommended: boolean;
  }[] = [
    {
      value: "skip",
      label: labels.skip,
      description: labels.skipDescription,
      recommended: rec.action === "skip",
    },
    {
      value: "overwrite",
      label: labels.overwrite,
      description: labels.overwriteDescription,
      recommended: false,
    },
    {
      value: "create_separate",
      label: labels.createSeparate,
      description: labels.createSeparateDescription,
      recommended: rec.action === "create_separate",
    },
  ];

  return (
    <div className="rounded-lg border border-status-warning/30 bg-status-warning/5 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-status-warning shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-sm">{labels.title}</p>
          {formattedDate && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {formattedDate}
            </p>
          )}
        </div>
      </div>

      {/* Comparison table */}
      {comparison.length > 0 && (
        <div className="ml-8 rounded-md border overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-2 font-medium">{labels.metric}</th>
                <th className="text-right p-2 font-medium">
                  {labels.existing}
                </th>
                <th className="text-center p-2 w-8"></th>
                <th className="text-right p-2 font-medium">{labels.new}</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.name} className="border-t border-border/50">
                  <td className="p-2 font-medium">{row.name}</td>
                  <td
                    className={cn(
                      "p-2 text-right tabular-nums",
                      row.match === "new" && "text-muted-foreground/40",
                    )}
                  >
                    {row.existingValue !== null ? row.existingValue : "—"}
                  </td>
                  <td className="p-2 text-center">
                    {row.match === "different" && (
                      <ArrowRight className="h-3 w-3 text-status-warning inline" />
                    )}
                    {row.match === "new" && (
                      <span className="text-primary text-[10px] font-bold">
                        +
                      </span>
                    )}
                    {row.match === "missing" && (
                      <span className="text-muted-foreground/40 text-[10px]">
                        −
                      </span>
                    )}
                  </td>
                  <td
                    className={cn(
                      "p-2 text-right tabular-nums",
                      row.match === "different" && "font-medium text-primary",
                      row.match === "new" && "font-medium text-primary",
                      row.match === "missing" && "text-muted-foreground/40",
                    )}
                  >
                    {row.newValue !== null ? row.newValue : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recommendation */}
      <div className="ml-8 flex items-start gap-2 rounded-md bg-primary/5 border border-primary/10 p-2.5">
        <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">{labels.recommendation}</p>
      </div>

      {/* Action options */}
      <div className="ml-8 space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">
          {labels.selectAction}
        </Label>
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex items-start gap-3 rounded-md border p-3 cursor-pointer transition-colors",
              selectedAction === option.value
                ? "border-primary bg-primary/5"
                : option.recommended
                  ? "border-primary/30 bg-primary/[0.02]"
                  : "border-border hover:border-primary/30",
            )}
          >
            <input
              type="radio"
              name="collisionAction"
              value={option.value}
              checked={selectedAction === option.value}
              onChange={() => onActionChange(option.value)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{option.label}</p>
                {option.recommended && (
                  <span className="text-[10px] font-medium text-primary bg-primary/10 rounded px-1.5 py-0.5">
                    ✓
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {option.description}
              </p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
