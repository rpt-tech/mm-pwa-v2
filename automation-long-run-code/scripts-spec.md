# AEGIS v5.3 — Scripts Specification
# Agent đọc file này khi tạo scripts ở Phase 0 Bootstrap.
# KHÔNG CẦN đọc mỗi session — chỉ đọc 1 lần khi bootstrap.

---

## scripts/init.sh

Idempotent bootstrap script. PHẢI safe khi chạy lại.

**Greenfield mode:**
```bash
# Mỗi step phải safe khi chạy lại
[ -d node_modules ] || npm install
[ -f .env ] || cp .env.example .env
git rev-parse --git-dir >/dev/null 2>&1 || git init
```

**Existing mode** — validate thay vì overwrite:
```bash
#!/usr/bin/env bash
set -e

# 1. Install deps nếu chưa có
[ -d node_modules ] || npm install

# 2. .env: KHÔNG overwrite nếu đã tồn tại — chỉ validate keys còn thiếu
if [ -f .env ]; then
  echo "[init] .env exists — validating required keys..."
  MISSING_KEYS=""
  if [ -f .env.example ]; then
    while IFS= read -r line; do
      key=$(echo "$line" | grep -oP '^[A-Z_]+(?==)' || true)
      [ -z "$key" ] && continue
      if ! grep -q "^${key}=.\+" .env 2>/dev/null; then
        MISSING_KEYS="$MISSING_KEYS $key"
      fi
    done < .env.example
  fi
  if [ -n "$MISSING_KEYS" ]; then
    echo "[init] WARNING: Missing .env keys:$MISSING_KEYS"
    echo "[init] Add these to .env or NEEDS.md"
  else
    echo "[init] .env OK — all required keys present"
  fi
else
  [ -f .env.example ] && cp .env.example .env || touch .env
  echo "[init] Created .env from template"
fi

# 3. Git init nếu chưa có
git rev-parse --git-dir >/dev/null 2>&1 || git init
```

---

## scripts/memory-index.sh

Build semantic memory index từ src/. Chạy async sau mỗi feature pass.

```bash
#!/usr/bin/env bash
# Build memory index — chạy async sau mỗi feature pass
# Output: .memory/index.json (file paths + exports + descriptions)
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
MDIR="$ROOT/.memory"
mkdir -p "$MDIR"

INDEX="[]"
while IFS= read -r file; do
  rel="${file#$ROOT/}"
  # Extract exported symbols (TS/JS/Python)
  exports=$(grep -oP \
    '(?<=export\s)(default\s+)?(function|class|const|async function)\s+\K\w+|(?<=^def |^class )\w+' \
    "$file" 2>/dev/null | head -8 | paste -sd ',' -)
  # First meaningful comment or JSDoc
  desc=$(grep -m1 -oP '(?<=//\s{0,2}|/\*\*?\s{0,2}|\#\s{0,2})\K[A-Z].{15,100}' \
    "$file" 2>/dev/null | head -1 || echo "")
  size=$(wc -l < "$file" 2>/dev/null || echo 0)
  entry=$(jq -n \
    --arg f "$rel" --arg e "$exports" --arg d "$desc" --argjson s "$size" \
    '{file:$f,exports:$e,description:$d,lines:$s}')
  INDEX=$(printf '%s' "$INDEX" | jq ". + [$entry]")
done < <(find "$ROOT/src" "$ROOT/app" "$ROOT/lib" "$ROOT/pages" "$ROOT/api" \
  -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \
            -o -name "*.py" -o -name "*.go" -o -name "*.rs" \) \
  2>/dev/null | grep -v node_modules | grep -v __pycache__ | head -300)

printf '%s' "$INDEX" | jq '.' > "$MDIR/index.json"
COUNT=$(printf '%s' "$INDEX" | jq 'length')
echo "[memory] Indexed $COUNT files → .memory/index.json"
```

---

## scripts/memory-search.sh

Query memory index trước khi implement feature.

```bash
#!/usr/bin/env bash
# Usage: bash scripts/memory-search.sh "auth user login"
# Returns: top matching files với exports + descriptions
QUERY="${*:-}"
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
INDEX="$ROOT/.memory/index.json"

[ -f "$INDEX" ] || { echo "No index. Run: bash scripts/memory-index.sh"; exit 1; }
[ -z "$QUERY" ] && { echo "Usage: $0 'query terms'"; exit 1; }

# Split query into terms, search across file/exports/description
TERMS=$(echo "$QUERY" | tr ' ' '\n' | jq -R . | jq -s .)
jq --argjson terms "$TERMS" '
  [.[] | . as $item |
    ($terms | map(
      . as $t |
      (($item.file // "") | ascii_downcase | contains($t | ascii_downcase)) or
      (($item.exports // "") | ascii_downcase | contains($t | ascii_downcase)) or
      (($item.description // "") | ascii_downcase | contains($t | ascii_downcase))
    ) | map(if . then 1 else 0 end) | add) as $score |
    select($score > 0) |
    {score: $score, file: $item.file, exports: $item.exports, description: $item.description}
  ] | sort_by(-.score) | .[:8]
' "$INDEX"
```

---

## scripts/resilient-watchdog.sh

Main watchdog v5.3. Kill + fresh restart, NEVER --continue.
Xem "Session Recovery Protocol" trong AEGIS.md cho error classification table.

### Platform detection + process kill

```bash
detect_platform() {
  if grep -qi microsoft /proc/version 2>/dev/null; then echo "wsl"
  elif [[ "$(uname -s)" == MINGW* ]] || [[ "$(uname -s)" == MSYS* ]]; then echo "gitbash"
  else echo "linux"; fi
}

kill_claude() {
  local pid="$1"
  case "$(detect_platform)" in
    wsl|linux)
      kill -- -"$pid" 2>/dev/null || true
      sleep 1
      pkill -9 -P "$pid" 2>/dev/null || true
      kill -9 "$pid" 2>/dev/null || true
      ;;
    gitbash)
      taskkill //PID "$pid" //T //F 2>/dev/null || true
      sleep 1
      kill -9 "$pid" 2>/dev/null || true
      ;;
  esac
}
```

### API availability check

```bash
wait_for_api() {
  local max_wait=${1:-900}  # 15 phút default
  local waited=0 interval=30
  while [ "$waited" -lt "$max_wait" ]; do
    if timeout 30 claude -p "respond with exactly: OK" \
         --max-turns 1 --output-format text 2>/dev/null | grep -qi "OK"; then
      return 0
    fi
    sleep "$interval"
    waited=$(( waited + interval ))
    [ "$interval" -lt 120 ] && interval=$(( interval + 15 ))
  done
  return 1
}
```

### Error detection from log

```bash
detect_error() {
  local recent=$(tail -50 "$1" 2>/dev/null || echo "")
  if echo "$recent" | grep -qiE "API Error: 500|api_error|Internal Server Error|displayModel"; then
    echo "500"; return; fi
  if echo "$recent" | grep -qiE "rate.?limit|rate_limit_error|429|Too Many Requests"; then
    echo "429"; return; fi
  if echo "$recent" | grep -qiE "overloaded|overloaded_error|529"; then
    echo "529"; return; fi
  if echo "$recent" | grep -qiE "request_too_large|too.large|413"; then
    echo "413"; return; fi
  if echo "$recent" | grep -qiE "authentication_error|permission_error|401|403"; then
    echo "AUTH"; return; fi
  echo "NONE"
}
```

### Full watchdog script

```bash
#!/usr/bin/env bash
set -euo pipefail
WORKDIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$WORKDIR"

LOG="$WORKDIR/LIVE_LOG.md"
MAX_RESTARTS=500
MAX_RESTARTS_PER_HOUR=8
STALL_TIMEOUT=1200          # 20 min no output → stall
ERROR_SCAN_INTERVAL=10      # check log mỗi 10s
API_WAIT_MAX=900             # 15 min max chờ API

MAX_COST=$(grep -oP 'MAX_COST_USD:\s*\K[0-9]+' "$WORKDIR/AEGIS.md" 2>/dev/null || echo 50)
ALERT_COST=$(grep -oP 'ALERT_COST_USD:\s*\K[0-9]+' "$WORKDIR/AEGIS.md" 2>/dev/null || echo 30)
SESSION_COST_EST=9

export ANTHROPIC_MODEL="${ANTHROPIC_MODEL:-claude-opus-4-6}"
export CLAUDE_CODE_EFFORT_LEVEL=high

count=0; total_cost=0; restart_timestamps=()
log() { local m="[$(date +%H:%M)] WD: $*"; echo "$m"; echo "$m" >> "$LOG"; }

# ── Exponential wait ──
get_wait_time() {
  local error_type="$1" restart_count="$2" base=60
  case "$error_type" in
    500) base=60;; 429) base=90;; 529) base=30;; 413) base=10;; STALL) base=5;; *) base=60;;
  esac
  local mult=1
  for i in $(seq 1 "$restart_count"); do
    mult=$(( mult * 2 )); [ "$mult" -gt 10 ] && mult=10
  done
  echo $(( base * mult > 600 ? 600 : base * mult ))
}

# ── Restart rate limiting ──
check_restart_limit() {
  local now=$(date +%s) one_hour_ago=$(( $(date +%s) - 3600 ))
  restart_timestamps=( $(printf '%s\n' "${restart_timestamps[@]}" | awk -v c="$one_hour_ago" '$1>c') )
  if [ "${#restart_timestamps[@]}" -ge "$MAX_RESTARTS_PER_HOUR" ]; then
    log "RATE LIMIT: ${#restart_timestamps[@]} restarts/hour — pausing 30min"
    sleep 1800; return 1
  fi
  restart_timestamps+=("$(date +%s)"); return 0
}

# ── State snapshot ──
save_state() {
  local fid=$(jq -r '[.[]|select(.passes==false and .blocked==false)][0].id // "none"' \
    "$WORKDIR/feature_list.json" 2>/dev/null)
  local err=$(tail -3 "$LOG" 2>/dev/null | grep -i "error\|fail" | tail -1)
  cat > "$WORKDIR/.last_state.json" << EOF
{"current_feature_id":$fid,"last_error":"$(echo "$err"|tr '"' "'")","timestamp":"$(date -Iseconds)","session_number":$count}
EOF
}

# ── Thrashing detection ──
check_thrashing() {
  local rc=$(git -C "$WORKDIR" log --since="30 minutes ago" --oneline 2>/dev/null | wc -l)
  local cp=$(jq '[.[]|select(.passes==true)]|length' "$WORKDIR/feature_list.json" 2>/dev/null || echo 0)
  local pp=$(cat "$WORKDIR/.thrash_check" 2>/dev/null || echo 0)
  echo "$cp" > "$WORKDIR/.thrash_check"
  [ "$rc" -gt 10 ] && [ "$((cp - pp))" -eq 0 ] && return 1
  return 0
}

# ── Budget ──
check_budget() {
  total_cost=$((total_cost + SESSION_COST_EST))
  log "COST: ~\$${SESSION_COST_EST}/session — TOTAL: ~\$${total_cost}/\$${MAX_COST}"
  if [ "$total_cost" -ge "$MAX_COST" ]; then
    echo "Budget exceeded" > "$WORKDIR/BUDGET_EXCEEDED"; exit 1
  fi
  if [ "$total_cost" -ge "$ALERT_COST" ]; then
    log "BUDGET ALERT: \$${total_cost} of \$${MAX_COST} used"
  fi
}

# ── Log rotation ──
rotate_log() {
  local lines=$(wc -l < "$LOG" 2>/dev/null || echo 0)
  if [ "$lines" -gt 500 ]; then
    mkdir -p "$WORKDIR/logs"
    mv "$LOG" "$WORKDIR/logs/LIVE_LOG_$(date +%Y%m%d_%H%M%S).md"
    echo "# LIVE_LOG.md — rotated $(date)" > "$LOG"
  fi
}

# ── MAIN LOOP ──
log "Resilient Watchdog v5.3 started — budget \$${MAX_COST}"

while [ "$count" -lt "$MAX_RESTARTS" ]; do
  [ -f "$WORKDIR/PAUSE" ] && { log "PAUSED"; sleep 60; continue; }
  [ -f "$WORKDIR/BUDGET_EXCEEDED" ] && { log "Budget exceeded"; exit 1; }
  check_restart_limit || continue
  rotate_log
  save_state

  # ── Build prompt ──
  THRASH_WARNING=""
  check_thrashing || THRASH_WARNING="CẢNH BÁO: session trước bị thrashing. Chọn approach KHÁC."

  PROMPT="Đọc AEGIS.md. Bạn là CODING AGENT. ${THRASH_WARNING}
Đọc .last_state.json nếu có. Tiếp tục coding từ feature chưa hoàn thành."

  # ── Spawn fresh session (NEVER --continue) ──
  OUTLOG="$WORKDIR/.watchdog_output.log"
  log "Launch #$((count + 1)) — FRESH session"

  claude --model "$ANTHROPIC_MODEL" --dangerously-skip-permissions \
    -p "$PROMPT" > "$OUTLOG" 2>&1 &
  CLAUDE_PID=$!

  # ── Monitor for errors ──
  ERROR=""
  while kill -0 "$CLAUDE_PID" 2>/dev/null; do
    sleep "$ERROR_SCAN_INTERVAL"

    ERROR=$(detect_error "$OUTLOG")
    if [ "$ERROR" != "NONE" ]; then
      log "ERROR: $ERROR detected — killing session"
      [ "$ERROR" = "AUTH" ] && { kill_claude "$CLAUDE_PID"; log "AUTH ERROR — fix credentials"; exit 1; }
      break
    fi

    # Stall check
    LAST_MOD=$(stat -c %Y "$OUTLOG" 2>/dev/null || echo 0)
    if [ $(( $(date +%s) - LAST_MOD )) -gt "$STALL_TIMEOUT" ]; then
      ERROR="STALL"; log "STALL: no output ${STALL_TIMEOUT}s"; break
    fi
  done

  # ── Handle result ──
  if [ "$ERROR" != "" ] && [ "$ERROR" != "NONE" ]; then
    kill_claude "$CLAUDE_PID"
    count=$((count + 1))
    WAIT=$(get_wait_time "$ERROR" "$count")
    log "Waiting ${WAIT}s (error=$ERROR, restart=#$count)"
    sleep "$WAIT"
    wait_for_api "$API_WAIT_MAX" || { log "API unavailable — retry in 5min"; sleep 300; continue; }
  else
    wait "$CLAUDE_PID" 2>/dev/null; EC=$?
    count=$((count + 1))
    check_budget
    if [ "$EC" -eq 0 ]; then
      PENDING=$(jq '[.[]|select(.passes==false and .blocked==false)]|length' \
        "$WORKDIR/feature_list.json" 2>/dev/null || echo 0)
      [ "$PENDING" -eq 0 ] && { log "ALL FEATURES DONE"; exit 0; }
      log "Clean exit, $PENDING features remain — restarting in 10s"
      sleep 10
    else
      ERROR=$(detect_error "$OUTLOG")
      WAIT=$(get_wait_time "${ERROR:-UNKNOWN}" "$count")
      log "Crashed (exit=$EC, error=$ERROR) — waiting ${WAIT}s"
      sleep "$WAIT"
      wait_for_api "$API_WAIT_MAX" || { sleep 300; continue; }
    fi
  fi
done

log "Max restarts reached — manual intervention needed"
exit 1
```

---

## scripts/resilient-worker.sh

Worker wrapper cho multi-agent mode. Cùng logic kill+fresh nhưng scoped cho 1 worktree.

```bash
#!/usr/bin/env bash
# Usage: bash scripts/resilient-worker.sh <worker-dir> <worker-num>
# Monitors 1 worker, kills on error, spawns fresh with WORKER_ID context
# Exits when all assigned features done

set -euo pipefail
WDIR="$1"; WNUM="$2"
WORKDIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG="$WORKDIR/LIVE_LOG.md"
MAX_WORKER_RESTARTS=10

# Source shared functions
source "$(dirname "$0")/resilient-watchdog.sh" --functions-only 2>/dev/null || {
  # Inline if can't source: detect_platform, kill_claude, wait_for_api, detect_error
  # (copy from resilient-watchdog.sh)
}

PROMPT="Đọc CLAUDE.md. Bạn là WORKER AGENT.
Đọc WORKER_ID để biết features assigned.
Session trước bị crash — đây là session mới.
Đọc WORKER_LOG.md để biết features nào đã PASS.
Tiếp tục coding features chưa xong."

cd "$WDIR" || exit 1
RESTART=0

while [ "$RESTART" -lt "$MAX_WORKER_RESTARTS" ]; do
  # Check if all assigned features done
  if grep -q "ALL ASSIGNED FEATURES DONE" WORKER_LOG.md 2>/dev/null; then
    echo "[$(date +%H:%M)] Worker $WNUM: all done" >> "$LOG"
    exit 0
  fi

  OUTLOG="$WDIR/.worker_output.log"
  claude --model "${ANTHROPIC_MODEL:-claude-opus-4-6}" --dangerously-skip-permissions \
    -p "$PROMPT" > "$OUTLOG" 2>&1 &
  CPID=$!

  # Monitor
  ERROR=""
  while kill -0 "$CPID" 2>/dev/null; do
    sleep 10
    ERROR=$(detect_error "$OUTLOG")
    [ "$ERROR" != "NONE" ] && break
  done

  if [ "$ERROR" != "NONE" ] && [ -n "$ERROR" ]; then
    kill_claude "$CPID"
    RESTART=$((RESTART + 1))
    WAIT=$((60 * RESTART > 600 ? 600 : 60 * RESTART))
    echo "[$(date +%H:%M)] Worker $WNUM: error=$ERROR, restart #$RESTART, wait ${WAIT}s" >> "$LOG"
    sleep "$WAIT"
    wait_for_api 900 || { sleep 300; continue; }
  else
    wait "$CPID" 2>/dev/null
    RESTART=$((RESTART + 1))
    sleep 10
  fi
done

echo "[$(date +%H:%M)] Worker $WNUM: max restarts reached" >> "$LOG"
exit 1
```

---

## scripts/multi-agent.sh

Orchestrator script cho multi-agent mode. Dependency-aware, heartbeat, platform-aware.

```bash
#!/usr/bin/env bash
# AEGIS v5.3 Multi-Agent Orchestrator Script
# Usage: bash scripts/multi-agent.sh [NUM_WORKERS]

set -euo pipefail
WORKDIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$WORKDIR"

NUM_WORKERS=${1:-3}
LOG="$WORKDIR/LIVE_LOG.md"
SESSION="agent"
HEARTBEAT_TIMEOUT=300   # 5 phút không heartbeat → worker dead
PLATFORM=$(detect_platform)

export ANTHROPIC_MODEL=claude-opus-4-6
export CLAUDE_CODE_EFFORT_LEVEL=high

log() { echo "[$(date +%H:%M)] MULTI: $*" | tee -a "$LOG"; }

# ── Cleanup old worktrees ──
cleanup() {
  log "Cleaning up worktrees..."
  for i in $(seq 1 "$NUM_WORKERS"); do
    git worktree remove ".worktrees/worker-$i" --force 2>/dev/null || true
    git branch -D "worker-$i" 2>/dev/null || true
  done
  rm -rf .worktrees
}
trap cleanup EXIT

# ── Create worktrees (idempotent) ──
log "Creating $NUM_WORKERS worktrees..."
mkdir -p .worktrees
for i in $(seq 1 "$NUM_WORKERS"); do
  [ -d ".worktrees/worker-$i" ] && continue
  git worktree add ".worktrees/worker-$i" -b "worker-$i" dev 2>/dev/null || \
    git worktree add ".worktrees/worker-$i" "worker-$i" 2>/dev/null || true
  cp CLAUDE.md ".worktrees/worker-$i/CLAUDE.md" 2>/dev/null || true
  cp BLUEPRINT.md ".worktrees/worker-$i/BLUEPRINT.md" 2>/dev/null || true
  cp feature_list.json ".worktrees/worker-$i/feature_list.json" 2>/dev/null || true
  log "Worktree worker-$i ready"
done

# ── Orchestrator assigns features (dependency-aware topological sort) ──
log "Launching orchestrator to assign features (dependency-aware)..."
claude --model claude-opus-4-6 --dangerously-skip-permissions \
  -p "Đọc AEGIS.md. Bạn là ORCHESTRATOR AGENT trong multi-agent mode v5.
Có $NUM_WORKERS workers tại .worktrees/worker-1 đến worker-$NUM_WORKERS.

Nhiệm vụ:
1. Đọc feature_list.json → lấy tất cả features pending (passes=false, blocked=false)
2. Topological sort theo depends_on:
   - Wave 1: features với depends_on=[] (independent)
   - Wave 2+: features mà dependencies đã ở wave trước
3. CHỈ assign wave 1 features cho lần chạy này
4. Phân features cho $NUM_WORKERS workers theo category (giảm conflict)
5. Tạo WORKER_ID file trong mỗi .worktrees/worker-N/ với format:
   WORKER_NUM=N
   BRANCH=worker-N
   ASSIGNED_FEATURES=[id1,id2,...]
   CATEGORY=category_name
   WAVE=1
6. Cập nhật WORKERS.md với assignment table
7. KHÔNG spawn workers — script sẽ làm bước đó
8. Exit khi xong assignment."

# ── Spawn workers (platform-aware) ──
log "Spawning $NUM_WORKERS workers..."
declare -A WORKER_PIDS
for i in $(seq 1 "$NUM_WORKERS"); do
  WDIR="$WORKDIR/.worktrees/worker-$i"
  [ ! -f "$WDIR/WORKER_ID" ] && { log "Worker $i has no WORKER_ID — skipping"; continue; }

  case "$PLATFORM" in
    wsl|linux)
      # tmux: mỗi worker 1 pane, wrap bởi resilient-worker.sh
      tmux split-window -t "$SESSION" -h \
        "bash scripts/resilient-worker.sh '$WDIR' $i"
      tmux select-layout -t "$SESSION" tiled
      ;;
    gitbash)
      # Không có tmux → background processes
      bash scripts/resilient-worker.sh "$WDIR" "$i" \
        > "$WORKDIR/.watchdog/worker-$i.log" 2>&1 &
      WORKER_PIDS[$i]=$!
      ;;
  esac

  log "Worker $i spawned"
  sleep 2
done

log "All workers spawned. Monitoring with heartbeat..."

# ── Monitor workers ──
while true; do
  sleep 120
  ALL_DONE=true
  for i in $(seq 1 "$NUM_WORKERS"); do
    WDIR="$WORKDIR/.worktrees/worker-$i"
    [ -d "$WDIR" ] || continue

    WORKER_ALIVE=false
    if [ -f "$WDIR/HEARTBEAT" ]; then
      LAST_BEAT=$(cat "$WDIR/HEARTBEAT")
      NOW=$(date +%s)
      ELAPSED=$(( NOW - LAST_BEAT ))
      [ "$ELAPSED" -lt "$HEARTBEAT_TIMEOUT" ] && WORKER_ALIVE=true
    elif [ -f "$WDIR/WORKER_ID" ]; then
      WORKER_ALIVE=true
    fi

    if $WORKER_ALIVE; then
      ALL_DONE=false
      COMMITS=$(cd "$WDIR" && git log --oneline "worker-$i" ^dev 2>/dev/null | wc -l)
      log "Worker $i: running ($COMMITS commits)"
    else
      ASSIGNED_DONE=$(cd "$WDIR" && grep -c "PASS" WORKER_LOG.md 2>/dev/null || echo 0)
      ASSIGNED_TOTAL=$(grep -oP 'ASSIGNED_FEATURES=\[\K[^\]]+' "$WDIR/WORKER_ID" 2>/dev/null | tr ',' '\n' | wc -l)
      if [ "$ASSIGNED_DONE" -lt "$ASSIGNED_TOTAL" ]; then
        log "Worker $i: DEAD ($ASSIGNED_DONE/$ASSIGNED_TOTAL done) — respawning via resilient-worker"
        case "$PLATFORM" in
          wsl|linux) tmux split-window -t "$SESSION" -h "bash scripts/resilient-worker.sh '$WDIR' $i"
                     tmux select-layout -t "$SESSION" tiled ;;
          gitbash)   bash scripts/resilient-worker.sh "$WDIR" "$i" > "$WORKDIR/.watchdog/worker-$i.log" 2>&1 &
                     WORKER_PIDS[$i]=$! ;;
        esac
      else
        log "Worker $i: finished ($ASSIGNED_DONE/$ASSIGNED_TOTAL done)"
      fi
    fi
  done

  $ALL_DONE && { log "All workers finished. Starting wave merge..."; break; }
done

# ── Wave merge ──
log "Merging worker branches into dev..."
git checkout dev
for i in $(seq 1 "$NUM_WORKERS"); do
  if git rev-parse --verify "worker-$i" >/dev/null 2>&1; then
    COMMITS=$(git log --oneline "worker-$i" ^dev | wc -l)
    if [ "$COMMITS" -gt 0 ]; then
      log "Merging worker-$i ($COMMITS commits)..."
      if git merge "worker-$i" --no-edit; then
        log "worker-$i merged OK"
      else
        log "worker-$i CONFLICT — launching orchestrator to resolve"
        claude --model claude-opus-4-6 --dangerously-skip-permissions \
          -p "Git merge conflict. Resolve all conflicts, keeping both sides' intent. Run 'git add .' then 'git commit --no-edit' when done."
      fi
      if ! npm run build 2>&1 >/dev/null; then
        log "Build fail after merging worker-$i — launching fix"
        claude --model claude-opus-4-6 --dangerously-skip-permissions \
          -p "Build fail after merging worker-$i. Fix errors, commit, exit."
      fi
    fi
  fi
done

# ── Post-merge verification ──
log "Running full build + test after all merges..."
if npm run build 2>&1 && npm test 2>&1; then
  log "Post-merge build+test PASS"
  git push origin dev
else
  log "Post-merge build+test FAIL — launching fix agent"
  claude --model claude-opus-4-6 --dangerously-skip-permissions \
    -p "Build hoặc test fail sau khi merge workers. Fix tất cả errors, commit, rồi exit."
fi

# ── Update governance ──
log "Updating feature_list.json from worker results..."
claude --model claude-opus-4-6 --dangerously-skip-permissions \
  -p "Đọc WORKER_LOG.md từ mỗi .worktrees/worker-*/.
Cập nhật feature_list.json: set passes=true cho features đã pass, tăng retry_count cho features fail.
Cập nhật PROGRESS.md và WORKERS.md.
Commit: 'chore: update governance after multi-agent wave'.
Exit khi xong."

log "Wave complete. Cleaning up worktrees..."
# cleanup runs via trap
```

---

## Deploy scripts

### Vercel (Frontend)
```bash
cd [frontend-dir]
STAGING_URL=$(npx vercel deploy --token "$VERCEL_TOKEN" --yes 2>&1 | grep -o 'https://[^ ]*')
echo "Staging: $STAGING_URL"
curl -sf "$STAGING_URL/api/health" || { echo "Staging health check FAIL"; exit 1; }
npx vercel deploy --prod --token "$VERCEL_TOKEN" --yes
```

### Cloudflare Workers (API)
```bash
cd [api-dir]
CLOUDFLARE_API_TOKEN=$CF_TOKEN npx wrangler deploy --env staging
curl -sf "https://staging-api.example.com/health" || exit 1
CLOUDFLARE_API_TOKEN=$CF_TOKEN npx wrangler deploy
```

### Cloudflare Pages
```bash
npx wrangler pages deploy [build-dir] --project-name [name] --branch staging
npx wrangler pages deploy [build-dir] --project-name [name]
```

### GitHub Actions
Tạo .github/workflows/deploy.yml tự động deploy khi push main.
