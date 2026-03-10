import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth, isAdmin } from "@/lib/auth";
import { ShieldX } from "lucide-react";

function AccessDenied() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-md px-6">
        <ShieldX className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h1 className="text-2xl font-semibold tracking-tight">Access Denied</h1>
        <p className="text-muted-foreground mt-2">
          You don&apos;t have permission to access the admin area.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block text-sm text-primary hover:underline"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await requireAuth();
  if (!userId) redirect("/login");

  const admin = await isAdmin(userId);
  if (!admin) return <AccessDenied />;

  return <>{children}</>;
}
