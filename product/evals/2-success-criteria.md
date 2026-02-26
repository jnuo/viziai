# Step 2: Success Criteria

## Top User Scenarios

1. Standard Turkish lab PDF (single page, ~30-40 metrics)
2. Multi-page Turkish lab PDF
3. Spanish lab PDF (metric names need Turkish translation)
4. English lab PDF (metric names need Turkish translation)
5. PDF with decimal comma formatting (1,77 → 1.77)
6. PDF with unusual metric name variants
7. Low-quality scan or photo of printed results
8. PDF with partial reference ranges (some missing)
9. PDF with multiple test sections (blood, urine, hormone panels)
10. PDF from an unknown lab format (global launch scenario)
11. Non-lab PDF (bank statement, invoice) — should reject gracefully
12. Corrupted or empty PDF

## What Does Perfect Look Like?

- Every metric extracted with correct name, value, unit, ref range
- No hallucinated metrics (not in PDF)
- No missed metrics (in PDF but skipped)
- Correct decimal parsing (1,77 → 1.77, NOT 177.0)
- Sample date correctly identified in ISO format
- Metric names translated to Turkish medical terminology

## Known Failure Modes

| Failure               | Severity     | Example                                            |
| --------------------- | ------------ | -------------------------------------------------- |
| Decimal parsing error | **Critical** | Kreatinin 1.77 → 177.0                             |
| Metric name mismatch  | High         | Name doesn't match alias table → creates duplicate |
| Missed metric         | Medium       | Metric in PDF but not extracted                    |
| Wrong reference range | Medium       | Swapped ref_low/ref_high                           |
| Hallucinated metric   | Medium       | Metric not in PDF appears in output                |
| Wrong sample date     | Low          | Picks wrong date from multi-date PDF               |
| No input validation   | High         | Non-lab PDF accepted, garbage extracted            |
| No file type check    | Medium       | No server-side PDF validation before processing    |

## Failure Criticality

**Health data = critical.** Wrong values mislead users about health trends. The decimal bug (1.77 → 177.0) is the worst case — a 100x error that looks alarming.

## Current Accuracy (Estimated)

~97% per value (1-2 wrong out of 30-40 per PDF). Not measured systematically — this is the point of building evals.

## Review Step as Safety Net

Users see extracted values on a temp screen before saving. Current UX doesn't highlight suspicious values.

**Product improvement idea:** Flag values that are way outside reference range or way outside user's historical values. Warn users explicitly that AI extracted these and they should verify flagged items before confirming.

## Test Data Challenge

- **Now:** Only family PDFs (Turkish labs, ~same format)
- **Global launch:** Need diverse lab formats. Possible sources: Kaggle datasets, synthetic PDFs, community-contributed samples
- This is a Step 3 problem — building the test dataset
