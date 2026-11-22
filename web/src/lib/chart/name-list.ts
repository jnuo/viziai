const MAX_NAMES = 500;
const MAX_NAME_LENGTH = 200;

/**
 * Validates a list of metric names: strings, sane length, de-duplicated
 * (first occurrence wins). Returns null when invalid.
 */
export function parseNameList(input: unknown): string[] | null {
  if (!Array.isArray(input) || input.length > MAX_NAMES) return null;
  const seen = new Set<string>();
  const out: string[] = [];
  for (const n of input) {
    if (typeof n !== "string") return null;
    // not trimmed: names are matched exactly against stored rows, and a
    // stored name may carry stray spaces from extraction
    const name = n;
    if (!name.trim() || name.length > MAX_NAME_LENGTH) return null;
    if (seen.has(name)) continue;
    seen.add(name);
    out.push(name);
  }
  return out;
}
