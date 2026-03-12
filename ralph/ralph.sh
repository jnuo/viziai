#!/bin/bash
set -e

MAX_ITERATIONS=${1:-15}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG="$SCRIPT_DIR/ralph.log"

cd "$PROJECT_ROOT"

log() { echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG"; }

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "🚀 RALPH — $MAX_ITERATIONS iterations"
log "   Branch: $(git branch --show-current)"
log "   Last commit: $(git log --oneline -1)"

for i in $(seq 1 $MAX_ITERATIONS); do
  log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log "🔄 ITERATION $i/$MAX_ITERATIONS"

  START=$(date +%s)

  # This is the pattern that works — same as the original ralph.sh
  OUTPUT=$(cat "$SCRIPT_DIR/prompt.md" \
    | claude --dangerously-skip-permissions 2>&1 \
    | tee /dev/stderr) || true

  DURATION=$(( $(date +%s) - START ))
  log "⏱️  Done in $((DURATION/60))m $((DURATION%60))s"

  # Parse markers from output
  echo "$OUTPUT" | grep '\[RALPH:' | while IFS= read -r line; do
    marker=$(echo "$line" | grep -o '\[RALPH:[A-Z]*\].*')
    [ -n "$marker" ] && log "   $marker"
  done

  # Git state
  log "   Commit: $(git log --oneline -1)"

  # Stop conditions
  if echo "$OUTPUT" | grep -q "ALL_TASKS_COMPLETE"; then
    log "🎉 ALL TASKS COMPLETE"; exit 0
  fi
  if echo "$OUTPUT" | grep -q "BLOCKED:"; then
    log "🛑 BLOCKED"; exit 1
  fi
  if echo "$OUTPUT" | grep -q "ERROR:"; then
    log "💥 ERROR"; exit 1
  fi
  if ! echo "$OUTPUT" | grep -q '\[RALPH:DONE\]'; then
    log "⚠️  No DONE marker — may have failed"
  fi

  sleep 2
done

log "⏰ Max iterations reached"
exit 1
