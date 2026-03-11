"use client";

import { Card, CardContent } from "@/components/ui/card";

interface ReportReviewLayoutProps {
  pdfUrl?: string | null;
  children: React.ReactNode;
}

/**
 * Shared layout for reviewing report metrics alongside the original PDF.
 * - If pdfUrl exists: full-bleed two-column layout (PDF left, content right)
 * - If no pdfUrl: renders children full-width (no wrapper)
 *
 * Consumers should remove their max-w constraint when pdfUrl is present
 * so this layout can use the full viewport width.
 */
export function ReportReviewLayout({
  pdfUrl,
  children,
}: ReportReviewLayoutProps) {
  if (!pdfUrl) {
    return <>{children}</>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
      <Card className="overflow-hidden lg:sticky lg:top-6 lg:self-start">
        <CardContent className="p-4">
          <iframe
            src={pdfUrl}
            className="w-full h-[calc(100vh-10rem)] min-h-[500px] rounded-lg border"
            title="Original PDF"
          />
        </CardContent>
      </Card>
      <div>{children}</div>
    </div>
  );
}
