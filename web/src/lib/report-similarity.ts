export interface SimilarityResult {
  similarity: number;
  overlapping: number;
  existingCount: number;
  newCount: number;
}

/**
 * Compare two sets of metrics by name (case-insensitive) and value proximity.
 * Score = matchingValues / max(existingCount, newCount).
 */
export function computeReportSimilarity(
  existingMetrics: { name: string; value: number }[],
  newMetrics: { name: string; value: number }[],
  tolerance = 0.05,
): SimilarityResult {
  if (existingMetrics.length === 0 && newMetrics.length === 0) {
    return { similarity: 1, overlapping: 0, existingCount: 0, newCount: 0 };
  }

  const existingMap = new Map<string, number>();
  for (const m of existingMetrics) {
    existingMap.set(m.name.toLowerCase(), m.value);
  }

  let overlapping = 0;
  for (const m of newMetrics) {
    const existingValue = existingMap.get(m.name.toLowerCase());
    if (existingValue === undefined) continue;

    // Check value proximity within tolerance
    const maxAbs = Math.max(Math.abs(existingValue), Math.abs(m.value), 1);
    const diff = Math.abs(existingValue - m.value) / maxAbs;
    if (diff <= tolerance) {
      overlapping++;
    }
  }

  const denominator = Math.max(existingMetrics.length, newMetrics.length);
  const similarity = denominator > 0 ? overlapping / denominator : 0;

  return {
    similarity,
    overlapping,
    existingCount: existingMetrics.length,
    newCount: newMetrics.length,
  };
}
