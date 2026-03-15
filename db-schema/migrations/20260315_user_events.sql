-- User behavioral events for activation cohort tracking
CREATE TABLE user_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  metric_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_events_user_event ON user_events(user_id, event);
CREATE INDEX idx_user_events_created_at ON user_events(created_at);
