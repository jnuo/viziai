# Step 1: Product Definition

## AI Feature: PDF Lab Test Extraction

| Aspect              | Detail                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------ |
| **Model**           | `gpt-4o` (OpenAI Vision)                                                                   |
| **Input**           | Blood test PDF → converted to base64 PNG images (one per page, 2.5x scale, via mupdf)      |
| **Output**          | JSON: `{ sample_date, tests: { name: { value, unit, flag, ref_low, ref_high } } }`         |
| **Orchestration**   | Single API call per page. QStash async queue in prod, direct call in dev. 5min timeout.    |
| **Tools**           | None — single LLM call, no tool use                                                        |
| **Context**         | Only the PDF image(s) — no user history, no RAG                                            |
| **Post-processing** | Multi-page results merged. Tests converted to flat metrics array. Stored in Neon Postgres. |

## Prompt Summary

- Written in Turkish
- Extracts ALL current "Sonuç" (result) values
- Ignores old results in parentheses
- Normalizes decimals (comma → dot)
- Captures H/L/N flags
- Separates % and # variants (e.g., Nötrofil% / Nötrofil#)
- Extracts sample date in ISO format
- Extracts reference ranges (ref_low, ref_high) when available
- **Translates metric names to Turkish** regardless of source language (Spanish, English, German, etc.)

## Key Files

- `web/src/app/api/upload/[id]/extract/route.ts` — Queue trigger
- `web/src/app/api/upload/[id]/extract/worker/route.ts` — Extraction logic + prompt
