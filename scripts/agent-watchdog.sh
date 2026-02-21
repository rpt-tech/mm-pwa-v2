#!/usr/bin/env bash
# scripts/agent-watchdog.sh
#
# Self-healing wrapper for Claude Code autonomous agent.
# Restarts on API errors (502/503/timeout) within ~45 seconds.
#
# Usage (inside tmux):
#   tmux new-session -d -s agent 'bash /mnt/d/mm-new-pwa/scripts/agent-watchdog.sh'
#
# Or directly:
#   bash scripts/agent-watchdog.sh

WORKDIR="/mnt/d/mm-new-pwa"
LOG="$WORKDIR/LIVE_LOG.md"
RESTART_DELAY=45   # seconds before restart (API rate-limit recovery)
MAX_RESTARTS=200   # ~200 × 45s ≈ 2.5h total downtime tolerance

# Prevent 32k output token limit errors in Claude Code
export CLAUDE_CODE_MAX_OUTPUT_TOKENS=65536

count=0

log() {
  local msg="[$(date +%H:%M)] Watchdog: $*"
  echo "$msg"
  echo "$msg" >> "$LOG"
}

cd "$WORKDIR" || exit 1

log "Started — max_restarts=$MAX_RESTARTS restart_delay=${RESTART_DELAY}s"
log "Session resume: reading PROGRESS.md + LIVE_LOG.md + STEERING.md"

while [ "$count" -lt "$MAX_RESTARTS" ]; do
  log "Launching agent (run $((count + 1))/$MAX_RESTARTS)"

  # Run claude — blocks until it exits
  claude --dangerously-skip-permissions
  EXIT_CODE=$?

  count=$((count + 1))

  if [ "$EXIT_CODE" -eq 0 ]; then
    log "Agent completed normally after $count run(s) — watchdog exiting"
    exit 0
  fi

  log "Agent exited (code=$EXIT_CODE) — restart in ${RESTART_DELAY}s [restart $count/$MAX_RESTARTS]"
  sleep "$RESTART_DELAY"
done

log "ERROR: max restarts ($MAX_RESTARTS) reached — manual intervention required"
exit 1
