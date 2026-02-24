"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FileText, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  profileName?: string;
}

/**
 * Empty state component for dashboard when no reports exist
 */
export function EmptyState({
  profileName,
}: EmptyStateProps): React.ReactElement {
  const router = useRouter();
  const t = useTranslations("components.emptyState");

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto">
        {/* Animated icon cluster */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
            <FileText className="w-10 h-10 text-primary" />
          </div>
          {/* Floating sparkle */}
          <div className="absolute -top-2 -right-2 animate-bounce motion-reduce:animate-none">
            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-secondary" />
            </div>
          </div>
        </div>

        {/* Text content */}
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          {t("noReports")}
        </h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          {profileName ? (
            <>
              <span className="font-medium text-foreground">{profileName}</span>{" "}
              {t("startByUploadingFor")}
            </>
          ) : (
            t("startByUploading")
          )}{" "}
          {t("aiExtracts")}
        </p>

        {/* Upload button */}
        <Button
          size="lg"
          onClick={() => router.push("/upload")}
          className="gap-2"
        >
          <Upload className="w-5 h-5" />
          {t("uploadFirst")}
        </Button>
      </div>
    </div>
  );
}
