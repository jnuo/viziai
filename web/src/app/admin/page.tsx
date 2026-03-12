import Link from "next/link";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { FileSearch, Database } from "lucide-react";

export default function AdminPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <h1 className="text-2xl font-semibold">Admin</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/quality">
          <Card className="py-6 hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-2">
                <FileSearch className="size-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-base">Report Reviews</CardTitle>
                <CardDescription className="mt-1">
                  Review extraction quality and approve reports
                </CardDescription>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/metric-definitions">
          <Card className="py-6 hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-2">
                <Database className="size-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-base">Metric Definitions</CardTitle>
                <CardDescription className="mt-1">
                  Manage metrics, translations, aliases, and reference ranges
                </CardDescription>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </main>
  );
}
