/**
 * AI-assisted alias suggester for unmapped metric names.
 *
 * Given a foreign/unknown metric name, uses OpenAI to suggest the most likely
 * Turkish canonical metric name from the CANONICAL_METRICS list.
 */

import { CANONICAL_METRIC_NAMES } from "@/lib/canonical-metrics";
import { reportError } from "@/lib/error-reporting";

export interface AliasSuggestion {
  suggestedName: string;
  confidence: "high" | "medium" | "low";
}

const CANONICAL_LIST = Array.from(CANONICAL_METRIC_NAMES).join(", ");

/**
 * Suggest the canonical Turkish metric name for an unknown/foreign metric name.
 * Returns null if no good match is found or on API error.
 */
export async function suggestCanonicalName(
  metricName: string,
  unit?: string | null,
  refRange?: { low?: number | null; high?: number | null } | null,
): Promise<AliasSuggestion | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const context = [
    `Metric name: "${metricName}"`,
    unit ? `Unit: ${unit}` : null,
    refRange?.low != null || refRange?.high != null
      ? `Reference range: ${refRange?.low ?? "?"} - ${refRange?.high ?? "?"}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = `You are a clinical laboratory expert. Given a blood test metric name (possibly in a foreign language like Spanish, German, French, Dutch, or English), suggest the matching Turkish canonical metric name from this list:

${CANONICAL_LIST}

${context}

Respond with ONLY a JSON object: {"suggestedName": "exact name from list", "confidence": "high"|"medium"|"low"}
- "high": obvious direct translation (e.g., "Glucose" → "Glukoz")
- "medium": likely match based on unit and context
- "low": uncertain match
- If no reasonable match exists, respond: {"suggestedName": null, "confidence": "low"}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0,
        max_tokens: 100,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return null;

    const parsed = JSON.parse(content);
    if (
      !parsed.suggestedName ||
      !CANONICAL_METRIC_NAMES.has(parsed.suggestedName)
    ) {
      return null;
    }

    return {
      suggestedName: parsed.suggestedName,
      confidence:
        parsed.confidence === "high" || parsed.confidence === "medium"
          ? parsed.confidence
          : "low",
    };
  } catch (error) {
    reportError(error, {
      op: "aliasSuggester.suggestCanonicalName",
      metricName,
    });
    return null;
  }
}
