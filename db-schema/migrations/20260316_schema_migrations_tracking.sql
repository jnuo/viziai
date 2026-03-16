-- Migration tracking table
-- Records which SQL files have been applied to this database.
-- Used by the automated migration runner to skip already-applied files.

CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL UNIQUE,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
