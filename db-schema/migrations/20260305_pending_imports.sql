-- Pending imports from e-Nabiz extension.
-- Stores scraped data temporarily until the user reviews and confirms in the web app.

CREATE TABLE pending_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'enabiz',
  content_hash TEXT NOT NULL,
  sample_date DATE NOT NULL,
  hospital_name TEXT,
  metrics JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'skipped')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '15 minutes'
);

CREATE INDEX idx_pending_imports_profile ON pending_imports(profile_id);
CREATE INDEX idx_pending_imports_status ON pending_imports(status) WHERE status = 'pending';
