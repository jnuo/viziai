import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getAliasMap } from "@/lib/metric-definitions";
import { reportError } from "@/lib/error-reporting";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await requireAuth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const aliasMap = await getAliasMap();
    const aliases = Object.fromEntries(
      Object.entries(aliasMap).map(([alias, info]) => [
        alias,
        info.canonicalName,
      ]),
    );
    return NextResponse.json({ aliases });
  } catch (error) {
    reportError(error, { op: "api.aliases.GET" });
    return NextResponse.json({ aliases: {} });
  }
}
