-- Extraction Quality System Tables
-- Migration: extraction_quality_tables
--
-- Changes:
-- 1. Add is_admin column to users table (for admin auth gating)
-- 2. Add blob_url column to reports table (preserve PDFs for re-extraction)
-- 3. Create unmapped_metrics table (track unknown metric names from extractions)
-- 4. Create extraction_reviews table (admin review decisions on reports)

BEGIN;

-- ============================================================================
-- USERS TABLE: Add admin flag
-- ============================================================================
ALTER TABLE users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- ============================================================================
-- REPORTS TABLE: Add blob_url for PDF preservation
-- ============================================================================
ALTER TABLE reports ADD COLUMN blob_url TEXT;

-- ============================================================================
-- UNMAPPED_METRICS TABLE
-- Tracks metric names from uploads that don't match any alias or canonical name.
-- Status workflow: pending → mapped (alias created) or accepted (genuinely new)
-- ============================================================================
CREATE TABLE unmapped_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    unit TEXT,
    ref_low NUMERIC,
    ref_high NUMERIC,
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    upload_id UUID REFERENCES pending_uploads(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'mapped', 'accepted')),
    suggested_canonical TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Prevent duplicates from QStash retries
    UNIQUE(report_id, metric_name)
);

-- Indexes for admin dashboard queries
CREATE INDEX idx_unmapped_metrics_status ON unmapped_metrics(status);
CREATE INDEX idx_unmapped_metrics_report ON unmapped_metrics(report_id);
CREATE INDEX idx_unmapped_metrics_profile ON unmapped_metrics(profile_id);

-- ============================================================================
-- EXTRACTION_REVIEWS TABLE
-- Admin review decisions on report extractions
-- Status workflow: pending → approved (correct) or corrected (edits applied)
-- ============================================================================
CREATE TABLE extraction_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    reviewer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'corrected')),
    notes TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One review per report (re-extraction creates a new report)
    UNIQUE(report_id)
);

-- Indexes for admin dashboard queries
CREATE INDEX idx_extraction_reviews_report ON extraction_reviews(report_id);
CREATE INDEX idx_extraction_reviews_status ON extraction_reviews(status);

COMMIT;
