"use client";

import { Button } from "@/components/ui/button";

export type Period = "7d" | "30d" | "90d" | "all";

const PERIODS: { value: Period; label: string }[] = [
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
  { value: "all", label: "All" },
];

interface PeriodSelectorProps {
  value: Period;
  onChange: (period: Period) => void;
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex items-center gap-1">
      {PERIODS.map((p) => (
        <Button
          key={p.value}
          size="sm"
          variant={value === p.value ? "default" : "ghost"}
          className="text-xs h-7 px-2.5"
          onClick={() => onChange(p.value)}
        >
          {p.label}
        </Button>
      ))}
    </div>
  );
}
