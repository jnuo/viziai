"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Upload, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SAMPLE_DATA = [
  { date: "Jan", value: 4.2 },
  { date: "Feb", value: 4.5 },
  { date: "Mar", value: 4.1 },
  { date: "Apr", value: 4.8 },
  { date: "May", value: 4.3 },
  { date: "Jun", value: 4.6 },
];

interface GhostedChartProps {
  className?: string;
}

export function GhostedChart({
  className,
}: GhostedChartProps): React.ReactElement {
  const router = useRouter();
  const t = useTranslations("components.ghostedChart");

  return (
    <Card className={cn("rounded-xl relative overflow-hidden", className)}>
      <CardContent className="p-4">
        {/* Blurred chart layer */}
        <div
          className="blur-[6px] opacity-40 pointer-events-none select-none"
          aria-hidden="true"
        >
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SAMPLE_DATA}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="opacity-30"
                />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-primary, #0d9488)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CTA overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/60 backdrop-blur-[1px]">
          <TrendingUp className="h-8 w-8 text-primary" />
          <p className="text-sm text-muted-foreground text-center max-w-[240px]">
            {t("needMoreData")}
          </p>
          <Button
            onClick={() => router.push("/upload")}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {t("uploadAnother")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
