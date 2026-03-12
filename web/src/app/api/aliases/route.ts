import { NextResponse } from "next/server";
import { getAliasMap } from "@/lib/metric-definitions";
import { reportError } from "@/lib/error-reporting";

export const dynamic = "force-dynamic";

export async function GET() {
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
