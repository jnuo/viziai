import { NextResponse } from "next/server";
import { getAliasMap } from "@/lib/metric-definitions";
import { reportError } from "@/lib/error-reporting";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const aliasMap = await getAliasMap();
    // Keep backwards-compatible shape: { aliases: { "CRP": "CRP (C-Reaktif Protein)", ... } }
    const aliases: Record<string, string> = {};
    for (const [alias, info] of Object.entries(aliasMap)) {
      aliases[alias] = info.canonicalName;
    }
    return NextResponse.json({ aliases });
  } catch (error) {
    reportError(error, { op: "api.aliases.GET" });
    return NextResponse.json({ aliases: {} });
  }
}
