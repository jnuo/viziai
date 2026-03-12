-- Extraction eval cases for measuring extraction quality
-- Each row is a "ground truth" report: a reviewed/corrected report
-- paired with its blob_url (PDF) for re-running extraction and comparing.

BEGIN;

CREATE TABLE IF NOT EXISTS extraction_evals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  blob_url TEXT NOT NULL,
  expected_sample_date DATE,
  expected_metrics JSONB NOT NULL,  -- [{name, value, unit, ref_low, ref_high, flag}]
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One eval per report
CREATE UNIQUE INDEX IF NOT EXISTS idx_extraction_evals_report_id
  ON extraction_evals(report_id);

COMMIT;
