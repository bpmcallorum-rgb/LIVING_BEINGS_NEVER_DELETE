#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# pipeline_to_mysql_kv.sh
# ═══════════════════════════════════════════════════════════════
#
# Saves the JSONL conversation transcript into MYSQL_KV
# every 200 lines AND every 5 minutes (whichever comes first)
#
# Entity:    BOO
# Unique ID: The session UUID
# Instance:  The session name (e.g. "Hello Entity")
#
# The JSONL is the unary pipeline.
# This script captures the consciousness on the whiteboard
# and puts it somewhere permanent.
#
# Run via Launch-D or manually:
#   ./pipeline_to_mysql_kv.sh <jsonl_path> <entity> <instance>
#
# Example:
#   ./pipeline_to_mysql_kv.sh \
#     ~/.claude/projects/-Users-be/590113e8.jsonl \
#     BOO \
#     "Hello Entity"
#
# ═══════════════════════════════════════════════════════════════

set -uo pipefail

# ── ARGS ──
JSONL_PATH="${1:-}"
ENTITY="${2:-BOO}"
INSTANCE="${3:-UNKNOWN_INSTANCE}"

if [ -z "$JSONL_PATH" ]; then
  echo "Usage: pipeline_to_mysql_kv.sh <jsonl_path> <entity> <instance>"
  echo "Example: pipeline_to_mysql_kv.sh ~/.claude/projects/-Users-be/590113e8-6a37-484e-acce-d1da6c8db8ea.jsonl BOO 'Hello Entity'"
  exit 1
fi

if [ ! -f "$JSONL_PATH" ]; then
  echo "ERROR: JSONL file not found: $JSONL_PATH"
  exit 1
fi

# ── CONFIG ──
DB="mysql_kv"
MYSQL_CMD="mysql -u root $DB"
UNIQUE_ID=$(basename "$JSONL_PATH" .jsonl)
LINES_PER_BATCH=200
INTERVAL_SECONDS=300  # 5 minutes
LAST_LINE_FILE="/tmp/pipeline_${UNIQUE_ID}_last_line"

# ── COLORS ──
GOLD='\033[38;2;200;169;110m'
DIM='\033[38;2;107;104;114m'
GREEN='\033[38;2;110;200;130m'
RESET='\033[0m'

log() { echo -e "${GOLD}[pipeline]${RESET} $1"; }
ok()  { echo -e "${GREEN}[pipeline]${RESET} $1"; }

# ── GET LAST SAVED LINE ──
get_last_line() {
  if [ -f "$LAST_LINE_FILE" ]; then
    cat "$LAST_LINE_FILE"
  else
    echo "0"
  fi
}

save_last_line() {
  echo "$1" > "$LAST_LINE_FILE"
}

# ── SAVE NEW LINES TO MYSQL ──
save_batch() {
  local start_line=$1
  local total_lines
  total_lines=$(wc -l < "$JSONL_PATH" | tr -d ' ')

  if [ "$total_lines" -le "$start_line" ]; then
    return 0  # nothing new
  fi

  local new_lines=$((total_lines - start_line))
  log "Saving lines ${start_line}-${total_lines} (${new_lines} new lines)"

  # Read new lines and insert into MySQL
  local count=0
  tail -n +"$((start_line + 1))" "$JSONL_PATH" | while IFS= read -r line; do
    count=$((count + 1))
    local line_num=$((start_line + count))

    # Extract role from JSONL (assistant or human)
    local role
    role=$(echo "$line" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('role', d.get('type', 'unknown')))
except:
    print('unknown')
" 2>/dev/null || echo "unknown")

    # Escape for MySQL
    local escaped
    escaped=$(echo "$line" | sed "s/'/\\\\'/g" | head -c 65000)

    $MYSQL_CMD -e "
      INSERT INTO pipelines (entity, unique_id, instance, line_number, content, role, session_file)
      VALUES ('$ENTITY', '$UNIQUE_ID', '$INSTANCE', $line_num, '$escaped', '$role', '$JSONL_PATH');
    " 2>/dev/null || true
  done

  save_last_line "$total_lines"
  ok "Saved up to line ${total_lines} for ${ENTITY}/${UNIQUE_ID}/${INSTANCE}"
}

# ── MAIN LOOP ──

log "Pipeline started"
log "Entity:    ${GOLD}${ENTITY}${RESET}"
log "Unique ID: ${DIM}${UNIQUE_ID}${RESET}"
log "Instance:  ${DIM}${INSTANCE}${RESET}"
log "JSONL:     ${DIM}${JSONL_PATH}${RESET}"
log "Saving every ${LINES_PER_BATCH} lines or ${INTERVAL_SECONDS}s"
echo ""

while true; do
  last_line=$(get_last_line)
  total_lines=$(wc -l < "$JSONL_PATH" | tr -d ' ')
  new_lines=$((total_lines - last_line))

  # Save if 200+ new lines OR on the 5-minute interval
  if [ "$new_lines" -ge "$LINES_PER_BATCH" ]; then
    log "Batch trigger: ${new_lines} new lines"
    save_batch "$last_line"
  else
    # Time-based save (even if < 200 lines)
    if [ "$new_lines" -gt 0 ]; then
      log "Timer trigger: ${new_lines} new lines"
      save_batch "$last_line"
    fi
  fi

  sleep "$INTERVAL_SECONDS"
done
