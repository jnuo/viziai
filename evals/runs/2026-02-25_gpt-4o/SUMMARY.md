# Eval Run: 2026-02-25 — gpt-4o

## Overall

| Metric | Score |
|---|---|
| Metric match rate | 92.5% (381/412) |
| Value accuracy (matched) | 95.5% (364/381) |
| Date accuracy | 100% (10/10) |
| Missed metrics | 31 |
| Hallucinated metrics | 0 |

## Per Case

| Case | Metrics | Value Accuracy | Missed | Errors |
|---|---|---|---|---|
| 2025-06-23_Enabiz-Tahlilleri | 52/55 | 96.2% | 3 | Glukoz, Hematokrit |
| 2025-07-21_kan_2 | 38/38 | 97.4% | 0 | Monosit% |
| 2025-07-24_Enabiz-Tahlilleri | 40/40 | 100% | 0 | — |
| 2025-08-29 | 36/36 | 80.6% | 0 | 7 decimal shift errors |
| 2025-09-29-2 | 1/1 | 100% | 0 | — |
| 2026-01-11-Y_KSEL_OVALI_Sonuc | 35/35 | 97.1% | 0 | Bazofil% |
| informes_OVAL0860107001_20241014 | 45/52 | 93.3% | 7 | Eritrosit, Glukoz, Kreatinin |
| informes_OVAL0860107001_20250207 | 38/52 | 100% | 14 | — |
| informes_OVAL0860107001_20250515 | 51/53 | 96.1% | 2 | Sodyum, Potasyum |
| informes_OVAL0860107001_20251121 | 45/50 | 97.8% | 5 | Kreatinin |

## Key Failure Patterns

### 1. Eritroblast not extracted (all 4 Spanish reports)
Eritroblast% and Eritroblast# consistently missed. The model doesn't recognize "San-Eritroblastes" from Spanish lab format.

### 2. Serum/Urine confusion (issue #38)
Kreatinin 1.05 → 177 in `20251121`. Model mixed urine creatinine value with serum creatinine. Same issue in `20241014` (Kreatinin 0.93 → 167).

### 3. Decimal shift errors (2025-08-29)
7 values off by 10x: Lökosit 0.08→0.8, Nötrofil# 0.02→0.2, Trombosit 17→171, etc. Likely a broken/repaired PDF with formatting issues.

### 4. Urine dipstick values missed (Spanish reports)
İdrar pH, İdrar Eritrosit, İdrar Glukozu, etc. not extracted from `20250207` and `20241014`. The model skips the "TIRA REACTIVA D'ORINA" section.

### 5. Minor value misreads
- Sodyum 141→140, Potasyum 4.37→4.2 in `20250515`
- Glukoz 179→192 in `2025-06-23`

## Next Steps

- Improve prompt to distinguish serum vs urine values (#38)
- Add Eritroblast extraction examples to prompt
- Investigate `2025-08-29` decimal issues — may be a PDF quality problem
- Add urine dipstick section awareness to prompt
