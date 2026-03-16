#!/bin/bash
set -e

# run-migrations.sh — Apply pending SQL migrations to a Neon database.
#
# Usage:
#   ./scripts/run-migrations.sh <database_url>
#   NEON_DATABASE_URL=... ./scripts/run-migrations.sh
#
# Scans db-schema/migrations/ and db-schema/data/ for SQL files,
# skips any already recorded in schema_migrations, and applies the rest
# in filename order (alphabetical = chronological with YYYYMMDD prefix).

PSQL="/opt/homebrew/opt/libpq/bin/psql"
DB_URL="${1:-$NEON_DATABASE_URL}"

if [ -z "$DB_URL" ]; then
  echo "ERROR: No database URL provided."
  echo "Usage: $0 <database_url>"
  echo "   or: NEON_DATABASE_URL=... $0"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Ensure schema_migrations table exists (idempotent)
$PSQL "$DB_URL" -q -c "
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL UNIQUE,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
"

# Collect all SQL files from migrations/ and data/ subdirectories
# Sort by full relative path (ensures migrations/ runs before data/)
SQL_FILES=()
for dir in "$PROJECT_ROOT/db-schema/migrations" "$PROJECT_ROOT/db-schema/data"; do
  if [ -d "$dir" ]; then
    while IFS= read -r -d '' file; do
      SQL_FILES+=("$file")
    done < <(find "$dir" -name "*.sql" -print0 | sort -z)
  fi
done

if [ ${#SQL_FILES[@]} -eq 0 ]; then
  echo "No SQL files found."
  exit 0
fi

# Get already-applied migrations
APPLIED=$($PSQL "$DB_URL" -t -A -c "SELECT filename FROM schema_migrations ORDER BY filename;")

PENDING=0
APPLIED_COUNT=0
FAILED=0

for file in "${SQL_FILES[@]}"; do
  # Use relative path from project root as the migration key
  relative="${file#$PROJECT_ROOT/}"

  # Skip if already applied
  if echo "$APPLIED" | grep -qxF "$relative"; then
    continue
  fi

  # Skip .gitkeep and non-SQL files
  if [[ "$relative" == *.gitkeep ]]; then
    continue
  fi

  PENDING=$((PENDING + 1))
  echo "→ Applying: $relative"

  if $PSQL "$DB_URL" -q -f "$file" 2>&1; then
    # Record as applied
    $PSQL "$DB_URL" -q -c "INSERT INTO schema_migrations (filename) VALUES ('$relative') ON CONFLICT (filename) DO NOTHING;"
    APPLIED_COUNT=$((APPLIED_COUNT + 1))
    echo "  ✓ Done"
  else
    FAILED=$((FAILED + 1))
    echo "  ✗ FAILED"
    echo "ERROR: Migration failed at $relative. Stopping."
    exit 1
  fi
done

if [ $PENDING -eq 0 ]; then
  echo "✓ All migrations already applied. Nothing to do."
else
  echo ""
  echo "✓ Applied $APPLIED_COUNT migration(s). $FAILED failed."
fi
