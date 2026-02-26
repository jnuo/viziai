# Step 3: Test Dataset

## Sources

| Source                 | What                                                                    | Status                      |
| ---------------------- | ----------------------------------------------------------------------- | --------------------------- |
| **Family PDFs**        | Turkish lab PDFs from dad's tests. Known format, ~30-40 metrics each    | Have these                  |
| **Own PDFs**           | Spanish lab PDFs from Barcelona                                         | Have these                  |
| **Kaggle / open data** | Public lab result datasets or PDFs                                      | Researched — see below      |
| **Synthetic PDFs**     | Generate fake lab PDFs in different formats/languages with known values | SimLab found — see below    |
| **Community**          | Real PDFs from beta users (anonymized)                                  | Future — needs consent flow |

## What We Need Per Test Case

| Field             | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `input`           | The PDF file                                         |
| `expected_output` | Manually verified JSON with correct values           |
| `metadata`        | Language, lab name, page count, known tricky metrics |

## Priority Test Cases to Build

### Tier 1 — Build now (from existing PDFs)

10 PDFs extracted with GPT-4o, draft `expected.json` generated. Manual verification in progress:

- [x] `2025-06-23_Enabiz-Tahlilleri` — 52 metrics, 2 pages
- [x] `2025-07-21_kan_2` — 38 metrics, 1 page (broken PDF, repaired)
- [x] `2025-07-24_Enabiz-Tahlilleri` — 40 metrics, 2 pages
- [ ] `2025-08-29` — 36 metrics, 1 page (broken PDF, repaired)
- [ ] `2025-09-29-2` — 1 metric, 1 page (likely too corrupted — skip?)
- [ ] `2026-01-11-Y_KSEL_OVALI_Sonuc` — 35 metrics, 1 page
- [ ] `informes_OVAL0860107001_20241014` — 45 metrics, 4 pages (Spanish)
- [ ] `informes_OVAL0860107001_20250207` — 38 metrics, 5 pages (Spanish)
- [ ] `informes_OVAL0860107001_20250515` — 51 metrics, 5 pages (Spanish)
- [ ] `informes_OVAL0860107001_20251121` — 45 metrics, 3 pages (Spanish)

### Tier 2 — Build next

- [ ] PDF with non-standard metric names (test alias mapping)
- [ ] Multi-page PDF
- [ ] Non-lab PDF (bank statement) — should return error/empty

### Tier 3 — Before global launch

- [ ] English lab PDFs
- [ ] German lab PDFs
- [ ] PDFs from 5+ different lab formats
- [ ] Synthetic edge cases (missing ref ranges, unusual units, handwritten annotations)

## External Resources (Researched Feb 25)

### Synthetic PDF Generation

- **SimLab** (https://github.com/resusio/simlab) — MIT license. Generates realistic lab reports with programmatic values. Produces printable/PDF lab reports. Values are known → perfect ground truth. Best option for scalable synthetic test cases.
- **ReportLab json2pdf** (https://docs.reportlab.com/json2pdf/) — Define PDF templates, feed JSON data. Could combine with Kaggle structured data to create varied lab formats.

### Medical PDF Benchmarks

- **courtotlab/PDF_benchmarking** (https://github.com/courtotlab/PDF_benchmarking) — 1,000 mock medical PDFs with structured ground truth. Benchmarks LLM-based extraction. GPT-4.1-mini got F1=55.6. Paper: https://www.medrxiv.org/content/10.64898/2026.01.19.26344287v1
- **ExtractBench** (https://arxiv.org/abs/2602.12247) — 35 PDFs with JSON schemas + gold labels, 12,867 fields. Schema-driven eval methodology worth adopting.

### Structured Lab Data (No PDFs — Feed Into PDF Generator)

- **Kaggle: Lab Test Results Anonymized** (https://www.kaggle.com/datasets/pinuto/laboratory-test-results-anonymized-dataset) — structured lab values, use as ground truth seeds for synthetic PDFs
- **AI-READI Clinical Lab Tests** (https://docs.aireadi.org/docs/1/dataset/clinical-data/clinical-lab-tests/) — CSV/OMOP format, includes test names, units, ref ranges
- **LabQAR** (https://pmc.ncbi.nlm.nih.gov/articles/PMC12155050/) — 550 lab test reference ranges, 363 unique tests. Useful for realistic value generation.

### General Document Extraction Benchmarks (Methodology)

- **OmniDocBench** (https://github.com/opendatalab/OmniDocBench) — 9 doc types, detailed annotations
- **TWIX** (https://github.com/ucbepic/TWIX) — templatized document extraction, lab reports are templatized

## Open Questions

- Where to store test PDFs? Repo (git LFS)? Separate bucket?
- How to handle PII in real PDFs? Anonymize or use synthetic only?
- Target: 10-50 test cases with ground truth before meaningful eval results
