"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2, Circle, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OnboardingChecklistProps {
  reportCount: number;
  hasWeight: boolean;
  hasBloodPressure: boolean;
}

export function OnboardingChecklist({
  reportCount,
  hasWeight,
  hasBloodPressure,
}: OnboardingChecklistProps): React.ReactElement {
  const router = useRouter();
  const t = useTranslations("components.onboardingChecklist");

  const progressPercent = Math.min((reportCount / 3) * 100, 100);

  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          {t("title")}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {t("subtitle")}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Report upload progress */}
        <div className="flex items-start gap-3">
          {reportCount >= 3 ? (
            <CheckCircle2 className="h-5 w-5 text-status-normal flex-shrink-0 mt-0.5" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">
              {t("uploadReports", { count: reportCount })}
            </div>
            <div className="mt-1.5 h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Weight tracking */}
        <div className="flex items-center gap-3">
          {hasWeight ? (
            <CheckCircle2 className="h-5 w-5 text-status-normal flex-shrink-0" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          )}
          <span
            className={cn(
              "text-sm",
              hasWeight && "text-muted-foreground line-through",
            )}
          >
            {t("logWeight")}
          </span>
        </div>

        {/* Blood pressure tracking */}
        <div className="flex items-center gap-3">
          {hasBloodPressure ? (
            <CheckCircle2 className="h-5 w-5 text-status-normal flex-shrink-0" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          )}
          <span
            className={cn(
              "text-sm",
              hasBloodPressure && "text-muted-foreground line-through",
            )}
          >
            {t("logBloodPressure")}
          </span>
        </div>

        {/* Upload CTA */}
        {reportCount < 3 && (
          <Button
            onClick={() => router.push("/upload")}
            className="w-full gap-2 mt-1"
          >
            <Upload className="h-4 w-4" />
            {t("uploadNext")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
