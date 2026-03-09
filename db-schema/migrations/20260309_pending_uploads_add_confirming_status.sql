-- Add 'confirming' to pending_uploads status CHECK constraint.
-- The confirm endpoint uses 'confirming' as an intermediate status to prevent
-- duplicate confirmations, but it was never added to the allowed values.

ALTER TABLE pending_uploads
  DROP CONSTRAINT pending_uploads_status_check;

ALTER TABLE pending_uploads
  ADD CONSTRAINT pending_uploads_status_check
  CHECK (status IN ('pending', 'extracting', 'review', 'confirming', 'confirmed', 'rejected'));
