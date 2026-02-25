# Step 3: Test Dataset

## Sources

| Source                 | What                                                                    | Status                      |
| ---------------------- | ----------------------------------------------------------------------- | --------------------------- |
| **Family PDFs**        | Turkish lab PDFs from dad's tests. Known format, ~30-40 metrics each    | Have these                  |
| **Own PDFs**           | Spanish lab PDFs from Barcelona                                         | Have these                  |
| **Kaggle / open data** | Public lab result datasets or PDFs                                      | Not explored yet            |
| **Synthetic PDFs**     | Generate fake lab PDFs in different formats/languages with known values | Not started                 |
| **Community**          | Real PDFs from beta users (anonymized)                                  | Future — needs consent flow |

## What We Need Per Test Case

| Field             | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `input`           | The PDF file                                         |
| `expected_output` | Manually verified JSON with correct values           |
| `metadata`        | Language, lab name, page count, known tricky metrics |

## Priority Test Cases to Build

### Tier 1 — Build now (from existing PDFs)

- [ ] 3-5 Turkish lab PDFs with manually verified ground truth
- [ ] 1-2 Spanish lab PDFs with ground truth
- [ ] Include the Kreatinin 1.77 case (decimal bug)

### Tier 2 — Build next

- [ ] PDF with non-standard metric names (test alias mapping)
- [ ] Multi-page PDF
- [ ] Non-lab PDF (bank statement) — should return error/empty

### Tier 3 — Before global launch

- [ ] English lab PDFs
- [ ] German lab PDFs
- [ ] PDFs from 5+ different lab formats
- [ ] Synthetic edge cases (missing ref ranges, unusual units, handwritten annotations)

## Open Questions

- Where to store test PDFs? Repo (git LFS)? Separate bucket?
- How to handle PII in real PDFs? Anonymize or use synthetic only?
- Target: 10-50 test cases with ground truth before meaningful eval results
