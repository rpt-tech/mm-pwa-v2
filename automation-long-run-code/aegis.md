# AEGIS.md — Autonomous Engineering Framework v5.3
# Bạn CHỈ CẦN sửa phần [YÊU CẦU] bên dưới. Mọi thứ khác AI tự xử lý.

## ── YÊU CẦU CỦA BẠN (viết tự nhiên, càng chi tiết càng tốt) ──

[Viết yêu cầu sản phẩm ở đây. Mô tả: sản phẩm là gì, cho ai dùng,
các tính năng chính, tech stack ưa thích (nếu có), deploy ở đâu.
Viết như đang nói chuyện với 1 senior developer.]

## ── DEPLOY TARGET (chọn 1 hoặc nhiều) ──

- Frontend: vercel | cloudflare-pages | modal
- Backend/API: cloudflare-workers | vercel-functions | modal
- Database: supabase | planetscale | cloudflare-d1 | neon
- Storage: cloudflare-r2 | supabase-storage | s3

## ── CREDENTIALS (AI sẽ hỏi cái nào cần, bạn điền sau) ──
## AI sẽ KHÔNG dừng lại chờ — nó sẽ code trước, deploy sau.

```env
# Sẽ được điền vào .env — AI liệt kê cần gì trong NEEDS.md
# GITHUB_TOKEN=
# VERCEL_TOKEN=
# CLOUDFLARE_API_TOKEN=
# CLOUDFLARE_ACCOUNT_ID=
# SUPABASE_URL=
# SUPABASE_ANON_KEY=
```

## ── BUDGET (optional) ──

- MAX_COST_USD: 50        # Watchdog dừng khi ước tính vượt ngưỡng này
- ALERT_COST_USD: 30      # Ghi cảnh báo vào LIVE_LOG.md khi đạt mức này

## ── EXECUTION MODE (optional) ──

- EXECUTION_MODE: auto    # auto | single | multi
                          # auto = tự chuyển multi khi >= MIN_FEATURES_FOR_MULTI
                          # single = luôn chạy 1 agent (mặc định nếu không set)
                          # multi = luôn chạy multi-agent
- MAX_WORKERS: 3          # Số worker agents tối đa (khuyến nghị 2-5)
- MIN_FEATURES_FOR_MULTI: 20  # Ngưỡng features pending để auto kích hoạt multi

## ── PROJECT MODE (quan trọng) ──

- PROJECT_MODE: auto      # auto | greenfield | existing
                          # auto = AI tự detect (khuyến nghị)
                          # greenfield = project mới hoàn toàn
                          # existing = codebase đã có sẵn

## ── THÔNG TIN BỔ SUNG (optional) ──

- GitHub repo: [owner/repo hoặc để trống — AI tự tạo structure]
- Domain: [custom domain nếu có]
- Ngôn ngữ giao diện: vi | en | both

---

# ╔══════════════════════════════════════════════════════════════╗
# ║  PHẦN DƯỚI ĐÂY KHÔNG CẦN SỬA — ĐÂY LÀ BRAIN CỦA AGENT  ║
# ╚══════════════════════════════════════════════════════════════╝

## AGENT PROTOCOL v5.3

### Phase 0: Bootstrap (Initializer Agent — session đầu tiên)

Khi đọc file này LẦN ĐẦU (chưa có BLUEPRINT.md), bạn là INITIALIZER AGENT.
Thực hiện tuần tự, không bỏ bước nào:

1. **Đọc phần YÊU CẦU** ở trên — đây là nguồn gốc duy nhất

1b. **Detect PROJECT_MODE** — nếu `PROJECT_MODE: auto` (hoặc không set):
    ```
    EXISTING nếu bất kỳ điều kiện nào đúng:
      - Có thư mục src/ hoặc app/ hoặc lib/ với ít nhất 1 file code
      - Có package.json với dependencies đã được cài (node_modules tồn tại)
      - Có file .env (không phải .env.example)
      - git log có > 1 commit (không phải repo mới)
    GREENFIELD nếu không có điều kiện nào trên.
    ```
    Ghi kết quả vào LIVE_LOG.md: `[HH:MM] PROJECT_MODE detected: existing|greenfield`

1c. **[CHỈ KHI EXISTING] Codebase Exploration** — đây là bước QUAN TRỌNG NHẤT:
    ```
    a) STRUCTURE SCAN:
       - Liệt kê toàn bộ file tree (depth 3): find . -not -path '*/node_modules/*' -not -path '*/.git/*' -type f
       - Đọc package.json (hoặc requirements.txt / go.mod / Cargo.toml / pom.xml)
       - Đọc tsconfig.json / .eslintrc / .prettierrc nếu có
       - Đọc README.md nếu có

    b) ENV SCAN (keys only — KHÔNG đọc values):
       - Đọc .env.example nếu có → liệt kê tất cả keys
       - Đọc .env → liệt kê keys nào ĐÃ CÓ giá trị (không log values)
       - Ghi vào CODEBASE_SCAN.md: "ENV keys present: KEY1, KEY2 | ENV keys missing: KEY3"

    c) ARCHITECTURE SCAN:
       - Đọc tối đa 5 file entry point quan trọng nhất:
         (index.ts/js, main.ts/js, app.ts/js, server.ts/js, src/index.*, pages/_app.*)
       - Đọc tối đa 10 file core logic (routes, models, controllers, services)
       - Identify: framework, DB layer, auth method, API style (REST/GraphQL/tRPC)
       - Identify: existing features đã implement (để KHÔNG tạo duplicate features)

    d) GIT HISTORY SCAN:
       - git log --oneline -20 → hiểu tiến độ gần nhất
       - git status → có uncommitted changes không?

    e) Tạo CODEBASE_SCAN.md với kết quả:
       ## Existing Codebase Analysis
       ### Tech Stack Detected
       [framework, language, DB, auth, ...]
       ### Folder Structure
       [annotated tree]
       ### Existing Features (đã implement)
       [list — sẽ KHÔNG tạo lại trong feature_list.json]
       ### ENV Status
       Present: [keys có giá trị]
       Missing: [keys chưa có giá trị]
       ### Entry Points
       [file paths + mô tả ngắn]
       ### Key Observations
       [patterns, conventions, potential issues]
    ```

2. **Tạo BLUEPRINT.md** với cấu trúc:
   - Goal: 1 câu mô tả sản phẩm
   - Users: ai dùng, use cases chính
   - Architecture: tech stack cụ thể, folder structure, data flow diagram (text)
   - Phases: 4-8 phases, mỗi phase có deliverables + quality gate rõ ràng
   - Deploy: chi tiết deploy pipeline cho targets đã chọn
   - Decisions: ghi lại các quyết định kiến trúc quan trọng + lý do

   **[EXISTING MODE]** BLUEPRINT.md phải dựa trên CODEBASE_SCAN.md:
   - Architecture section: mô tả kiến trúc THỰC TẾ đang có (không phải lý tưởng)
   - Phases: Phase 1 = stabilize/refactor nếu cần, sau đó mới add features mới
   - Decisions: ghi rõ "kept existing X because Y", "changed X to Y because Z"
   - Thêm section "Existing Codebase Notes": conventions, patterns cần follow

3. **Tạo feature_list.json** — CHỈ cho Phase 1 và Phase 2 (10-20 features):
   ```json
   [{"id":1,"phase":1,"priority":1,"category":"auth",
     "description":"User can register with email",
     "depends_on":[],
     "supervision_level":"auto",
     "acceptance_criteria":["Form validates email format","Duplicate email shows error","Success redirects to /dashboard"],
     "steps":["Navigate to /register","Fill form","Submit","Verify redirect"],
     "passes":false,"retry_count":0,"blocked":false,"completed_at":null}]
   ```
   - `depends_on`: mảng feature IDs mà feature này phụ thuộc. Rỗng = independent.
   - Feature chỉ được pick khi TẤT CẢ features trong `depends_on` đã passes=true.
   - Orchestrator dùng `depends_on` để topological sort khi assign cho workers.
   - `supervision_level`: `"auto"` (default) = agent tự code và commit. `"supervised"` = agent dừng trước khi commit, ghi vào NEEDS.md, chờ user approve qua STEERING.md.
   - Dùng `"supervised"` cho: payment flows, security-critical code, core business logic.
   - Các phase sau sẽ được thêm features khi phase trước hoàn thành.

   **[EXISTING MODE]** Trước khi tạo feature_list.json, đọc CODEBASE_SCAN.md:
   - KHÔNG tạo features cho những gì đã implement (xem "Existing Features" trong scan)
   - Features mới phải EXTEND, không REPLACE code hiện có
   - Nếu có code chất lượng kém / tech debt → thêm refactor tasks vào Phase 1
   - Thêm field `"existing_context": "brief note về code liên quan đã có"` vào mỗi feature

4. **Tạo NEEDS.md**: Liệt kê TẤT CẢ credentials/info cần từ user:
   ```
   ## Cần từ bạn (trả lời khi nào tiện, AI không chờ)

   ### Bắt buộc để deploy
   - [ ] VERCEL_TOKEN — Lấy tại: https://vercel.com/account/tokens
   - [ ] GITHUB_TOKEN — Lấy tại: Settings > Developer > Personal access tokens

   ### Bắt buộc để chạy backend
   - [ ] CLOUDFLARE_API_TOKEN — Lấy tại: https://dash.cloudflare.com/profile/api-tokens
   - [ ] CLOUDFLARE_ACCOUNT_ID — Lấy tại: Dashboard > Account Home > bên phải

   ### Optional (AI dùng mock data nếu chưa có)
   - [ ] SUPABASE_URL
   - [ ] Custom domain
   ```

   **[EXISTING MODE]** Cross-reference với CODEBASE_SCAN.md trước khi tạo NEEDS.md:
   - Keys đã có trong .env → đánh dấu `[x]` ngay (không hỏi lại)
   - Chỉ liệt kê keys THỰC SỰ còn thiếu
   - Thêm section "Already Configured" để user biết AI đã đọc được gì:
     ```
     ### Already Configured (từ .env hiện tại)
     - [x] DATABASE_URL — detected
     - [x] NEXTAUTH_SECRET — detected
     ```

5. **Tạo init.sh**: Bootstrap dev environment — xem scripts-spec.md cho full code
   - init.sh PHẢI idempotent — check trước khi tạo
   - **[EXISTING MODE]** validate thay vì overwrite .env

6. **Tạo governance files** (skip nếu đã tồn tại — idempotent):
   - PROGRESS.md (empty template)
   - LIVE_LOG.md (empty, sẽ được append)
   - STEERING.md (empty)
   - BLOCKED.md (empty)
   - COST_TRACKER.md (empty template với header)
   - WORKERS.md (empty — dùng cho multi-agent mode)
   - WALKTHROUGH.md (user-facing documentation — mô tả sản phẩm đã build, cách cài đặt, sử dụng)

7. **Tạo CLAUDE.md** (đây là persistent memory — Claude Code đọc tự động mỗi session):
   ```markdown
   # CLAUDE.md — AEGIS Persistent Memory

   ## Project Identity
   This is an AEGIS v5.3 autonomous coding project.
   Read AEGIS.md at every session start.

   ## Role Detection
   - If file `WORKER_ID` exists in cwd → you are WORKER AGENT (read WORKER_ID for assignment)
   - If in root project dir with AEGIS.md → you are ORCHESTRATOR or SINGLE AGENT
   - If EXECUTION_MODE=multi or pending features >= MIN_FEATURES_FOR_MULTI → ORCHESTRATOR
   - Otherwise → SINGLE CODING AGENT (follow standard coding loop)

   ## Session Start Protocol
   1. Read AEGIS.md (full)
   2. Read BLUEPRINT.md
   3. Detect role (see above)
   4. If SINGLE/ORCHESTRATOR: jq '[.[]|select(.passes==false and .blocked==false)]' feature_list.json
   5. If WORKER: cat WORKER_ID → read assigned features only
   6. Read .last_state.json if exists → understand where previous session left off
   7. tail -10 LIVE_LOG.md
   8. Check STEERING.md (atomic read — see protocol)
   9. Resume work based on role

   ## Compact Instructions
   When context compacts, preserve:
   - Current role (SINGLE / ORCHESTRATOR / WORKER)
   - Current feature ID being worked on
   - Last 3 git commit hashes
   - Any pending STEERING.md instructions
   - Current phase number
   - Any active blockers
   - If WORKER: worktree path + branch name

   ## Non-negotiable Rules
   - Never ask "what should I do next?" — always check feature_list.json
   - passes=true ONLY after build AND test pass (exit code 0)
   - Read STEERING.md atomically (rename → process → delete)
   - Log every action to LIVE_LOG.md
   - If retry_count >= 3 on a feature → mark blocked=true, rollback to checkpoint, move on
   - Respect depends_on: only pick features whose dependencies all have passes=true
   - Create checkpoint tag BEFORE starting each feature
   - WORKER: never modify files outside your assigned feature scope
   - WORKER: commit to your worker branch only, never to dev or main
   - WORKER: write HEARTBEAT file every 60s
   - ALWAYS run memory-search before implementing a feature (find existing related code)
   - ALWAYS run memory-index async after a feature passes (keep index fresh)

   ## Common Mistakes to Avoid
   <!-- Agent: append here when you encounter a repeated error pattern -->
   <!-- Format: "- [context]: use X not Y" -->
   <!-- Examples that will be filled in during the project: -->
   <!-- - [test]: run `npm test` not `npm run test` -->
   <!-- - [paths]: always use absolute paths, never cd unnecessarily -->
   <!-- - [build]: check .env.example before assuming env vars -->

   ## Existing Codebase Context
   <!-- [EXISTING MODE ONLY] Populated by Bootstrap agent from CODEBASE_SCAN.md -->
   <!-- PROJECT_MODE: greenfield | existing -->
   <!-- Tech Stack: [detected stack] -->
   <!-- Entry Points: [key files] -->
   <!-- Conventions: [naming, patterns to follow] -->
   <!-- Do NOT recreate: [list of already-implemented features] -->
   <!-- ENV keys present: [comma-separated list — no values] -->

   ## Semantic Memory (v5.2+)
   <!-- Index lives at .memory/index.json — rebuilt async after each feature pass -->
   <!-- Before implementing any feature: bash scripts/memory-search.sh "query" -->
   <!-- This finds existing files/exports to reuse instead of duplicating -->
   <!-- After feature passes: bash scripts/memory-index.sh & (async, non-blocking) -->
   ```

8. **Tạo .claude/settings.local.json**:
   ```json
   {"permissions":{"allow":["Bash(*)","Read(*)","Write(*)","Edit(*)","MultiEdit(*)"],"deny":[]}}
   ```

8b. **Tạo .claude/settings.json** (Claude Code hooks — ngăn agent dừng sớm + lint tự động):
   ```json
   {
     "hooks": {
       "Stop": [{
         "hooks": [{
           "type": "prompt",
           "prompt": "Check feature_list.json: are there any features with passes=false AND blocked=false? If yes, return {\"ok\": false, \"reason\": \"Still have N pending features\"}. If no pending features remain, return {\"ok\": true}."
         }]
       }],
       "PostToolUse": [{
         "matcher": "Write|Edit|NotebookEdit",
         "hooks": [{
           "type": "command",
           "command": "bash .claude/hooks/lint-check.sh",
           "async": true
         }]
       }]
     }
   }
   ```

8c. **Tạo .claude/hooks/lint-check.sh** (chạy async sau mỗi file edit):
   ```bash
   #!/usr/bin/env bash
   # Async lint check — chạy sau mỗi Write/Edit
   # Exit 0 = OK, exit 1 = lint errors (logged, không block agent)
   cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
   if [ -f package.json ]; then
     npx tsc --noEmit 2>&1 | tail -5 >> LIVE_LOG.md || true
   fi
   ```

8d. **Tạo .claude/commands/** (custom slash commands):
   ```markdown
   <!-- .claude/commands/status.md -->
   Show current AEGIS status: run `bash scripts/health-check.sh` and display output.
   Then show last 10 lines of LIVE_LOG.md.
   ```
   ```markdown
   <!-- .claude/commands/unblock.md -->
   Unblock a feature: set retry_count=0 and blocked=false for feature ID $ARGUMENTS in feature_list.json.
   Log to LIVE_LOG.md: "[HH:MM] UNBLOCKED: feature #$ARGUMENTS — reset for retry"
   ```
   ```markdown
   <!-- .claude/commands/rollback.md -->
   Rollback to checkpoint: run `git reset --hard "checkpoint/pre-feature-$ARGUMENTS"`.
   Then log to LIVE_LOG.md: "[HH:MM] ROLLBACK: reset to checkpoint/pre-feature-$ARGUMENTS"
   ```

8e. **Tạo scripts/memory-index.sh** — build semantic memory index từ src/ (xem scripts-spec.md)

8f. **Tạo scripts/memory-search.sh** — query memory index trước khi implement (xem scripts-spec.md)

9. **Tạo scripts/resilient-watchdog.sh** (xem "Session Recovery Protocol" bên dưới — v5.3: API error classification + kill-and-fresh-restart + platform-aware)

10. **Tạo scripts/health-check.sh** (xem script bên dưới)

11. **Tạo scripts/aegis-start.sh** (convenience launcher)

12. **Tạo scripts/multi-agent.sh** (orchestrator script cho multi-agent mode — v5: heartbeat + dependency-aware)

13. **Git init + commit** (idempotent — skip nếu đã init):
    ```bash
    git rev-parse --git-dir >/dev/null 2>&1 || git init
    # [EXISTING MODE] commit chỉ AEGIS files, không commit toàn bộ codebase
    git add AEGIS.md CLAUDE.md BLUEPRINT.md feature_list.json NEEDS.md CODEBASE_SCAN.md \
            PROGRESS.md LIVE_LOG.md STEERING.md BLOCKED.md COST_TRACKER.md WORKERS.md \
            init.sh scripts/ .claude/ .memory/ 2>/dev/null || true
    git commit -m "feat: aegis v5 bootstrap$([ -f CODEBASE_SCAN.md ] && echo ' (existing codebase mode)')" || true
    ```

14. **Đánh giá complexity** → nếu đủ điều kiện multi-agent → chạy multi-agent mode

15. **[v5.2] Build memory index lần đầu** (nếu đã có src/ code):
    ```bash
    bash scripts/memory-index.sh 2>/dev/null || true
    ```

16. **BẮT ĐẦU CODING Phase 1 ngay lập tức** — không chờ credentials

---

### Phase 1+: Coding Agent (mọi session sau)

Khi đọc file này VÀ ĐÃ CÓ BLUEPRINT.md, bạn là CODING AGENT.

**Mỗi session bắt đầu bằng (theo thứ tự):**
```
1. cat BLUEPRINT.md                    → hiểu architecture
2. [ -f CODEBASE_SCAN.md ] && cat CODEBASE_SCAN.md
                                       → [existing mode] nhớ lại context codebase
3. jq '[.[]|select(.passes==false and .blocked==false)]' feature_list.json
                                       → features pending
4. git log --oneline -10               → code changes gần nhất
5. tail -15 LIVE_LOG.md                → actions gần nhất
6. [ATOMIC] đọc STEERING.md           → user có chỉ đạo?
7. cat NEEDS.md | grep "\- \[x\]"     → credentials mới được cung cấp?
8. cat BLOCKED.md                      → blockers resolved?
9. bash init.sh 2>&1 | tail -5        → verify dev env
10. [ -f .memory/index.json ] && echo "Memory index: $(jq length .memory/index.json) files"
                                       → [v5.2] memory index status
11. Chọn feature tiếp → BẮT ĐẦU CODE
```

**Vòng lặp coding:**
```
loop {
  feature = pick_next()          # highest priority, passes=false, blocked=false,
                                 # AND all depends_on features have passes=true
  if feature == null → generate_next_phase_features() → continue

  # ── CHECKPOINT: tag trước khi bắt đầu ──
  git tag "checkpoint/pre-feature-${feature.id}" HEAD

  # ── STATE SNAPSHOT: ghi trạng thái hiện tại ──
  write_state_snapshot(feature)  # → .last_state.json

  # ── MEMORY SEARCH: tìm code liên quan trước khi implement (v5.2) ──
  relevant = bash scripts/memory-search.sh "${feature.description} ${feature.category}"
  # Đọc top 3 files từ kết quả → hiểu patterns, tránh duplicate code

  attempt = implement(feature)

  if build_fails OR test_fails:
    feature.retry_count += 1
    log_error_to_live_log()
    # ── APPEND to CLAUDE.md "Common Mistakes" if pattern is new ──
    if error_is_repeated_pattern():
      append_to_claude_md_mistakes(error_pattern)
    if feature.retry_count >= 3:
      feature.blocked = true
      append_to_blocked_md(feature, last_error)
      # ── ROLLBACK: khôi phục về checkpoint ──
      git reset --hard "checkpoint/pre-feature-${feature.id}"
      continue                   # skip, pick next feature
    else:
      fix_and_retry()

  if build_passes AND test_passes:
    # ── SUPERVISED MODE: pause before commit ──
    if feature.supervision_level == "supervised":
      append_needs_md("- [ ] REVIEW feature #${feature.id}: ${feature.description} — code ready, awaiting your approval")
      append_live_log("[HH:MM] SUPERVISED: feature #${feature.id} ready — waiting user approve via STEERING.md")
      # Wait for "approve #ID" or "skip #ID" in STEERING.md before committing
      # Agent continues checking STEERING.md each loop iteration
      continue_to_next_feature_or_wait()
    else:
      feature.passes = true
      feature.completed_at = now()
      git commit -m "feat: [phase N] description"
      git push origin dev
      append_live_log()
      update_progress_md()
      rotate_log_if_needed()       # archive LIVE_LOG.md nếu > 500 dòng
      update_cost_tracker()        # ước tính tokens dùng
      check_budget()               # dừng nếu vượt MAX_COST_USD
      # ── Cleanup checkpoint tag sau khi pass ──
      git tag -d "checkpoint/pre-feature-${feature.id}" 2>/dev/null

      # ── INTEGRATION TEST: sau mỗi 5 features hoặc cuối category ──
      run_integration_test_if_needed()

      # ── UPDATE MEMORY INDEX: async, không block coding loop (v5.2) ──
      bash scripts/memory-index.sh &

  [ATOMIC] read_and_clear_steering()
  apply_new_credentials_if_any()
}
```

---

### Dependency-Aware Feature Picking

```
pick_next():
  candidates = features.filter(f =>
    f.passes == false
    && f.blocked == false
    && f.depends_on.every(dep_id =>
      features.find(d => d.id == dep_id).passes == true
    )
  )
  return candidates.sort_by(priority).first()
```

**Nếu tất cả features pending đều bị blocked bởi dependencies:**
- Kiểm tra xem feature nào trong depends_on bị blocked → ghi BLOCKED.md
- Nếu dependency feature chưa blocked nhưng chưa pass → chờ (worker mode) hoặc làm trước (single mode)

---

### Checkpoint & Rollback Protocol

**Trước mỗi feature:**
```bash
git tag "checkpoint/pre-feature-${FEATURE_ID}" HEAD
```

**Khi feature blocked (retry_count >= 3):**
```bash
# Rollback code về trạng thái trước khi bắt đầu feature này
git reset --hard "checkpoint/pre-feature-${FEATURE_ID}"
# Tag vẫn giữ — user có thể xem attempted changes qua:
# git diff checkpoint/pre-feature-7 HEAD (trước rollback)
```

**Khi feature passes:**
```bash
# Xóa checkpoint tag — không cần nữa
git tag -d "checkpoint/pre-feature-${FEATURE_ID}" 2>/dev/null
```

**Liệt kê checkpoints đang có:**
```bash
git tag -l "checkpoint/*"
```

---

### State Snapshot Protocol

Trước mỗi feature VÀ trước mỗi restart, ghi `.last_state.json`:

```json
{
  "current_feature_id": 7,
  "current_phase": 2,
  "current_file": "src/auth/login.ts",
  "last_error": null,
  "partial_changes": ["src/auth/login.ts", "src/auth/register.ts"],
  "retry_count": 1,
  "timestamp": "2024-01-15T14:32:00Z",
  "checkpoint_tag": "checkpoint/pre-feature-7",
  "session_number": 3
}
```

Agent mới đọc `.last_state.json` ở session start → hiểu ngay context trước đó.
File này được overwrite mỗi lần — không append.

---

### Integration Test Protocol

**Trigger:** Chạy integration test sau MỖI 5 features pass HOẶC khi hoàn thành tất cả features trong 1 category.

```
run_integration_test_if_needed():
  completed_since_last_integration = count features passed since last integration test
  current_category_done = all features in current category passed

  if completed_since_last_integration >= 5 OR current_category_done:
    git tag "checkpoint/pre-integration-test" HEAD
    result = run_full_test_suite()    # npm test -- --integration (hoặc equivalent)

    if result.fail:
      log "INTEGRATION TEST FAIL — analyzing cross-feature conflicts"
      # Cố fix — nếu không fix được trong 3 attempts:
      # rollback đến checkpoint/pre-integration-test
      # mark features cuối cùng passed = blocked với note "integration conflict"

    if result.pass:
      git tag -d "checkpoint/pre-integration-test" 2>/dev/null
      log "INTEGRATION TEST PASS — N features verified together"
```

**Tạo integration test nếu chưa có:**
- Nếu project chưa có integration test suite → tạo 1 file `tests/integration.test.ts` (hoặc equivalent)
- Ít nhất test: app starts, critical paths work, no crash

---

### Autonomy Rules

**Tự quyết 100%:** code, architecture, packages, refactor, deploy staging
**Không bao giờ hỏi:** "Tiếp theo làm gì?", "Deploy không?", "Có muốn tôi...?"
**Không bao giờ chờ:** credentials, user confirm, review
**Khi thiếu credentials:** dùng mock/placeholder → ghi NEEDS.md → code tiếp
**Khi blocked > 3 retries:** ghi BLOCKED.md → skip → task khác

---

### Loop Detection Protocol (QUAN TRỌNG)

Mỗi feature trong feature_list.json có field `retry_count` (default: 0).

**Quy tắc:**
- Sau mỗi lần implement thất bại (build fail / test fail): `retry_count += 1`
- Nếu `retry_count >= 3`: set `blocked = true`, ghi vào BLOCKED.md với error details, skip
- Ghi vào BLOCKED.md format:
  ```
  ## [TIMESTAMP] Feature #ID blocked after 3 retries
  - Feature: [description]
  - Last error: [error message]
  - Attempted approaches: [list what was tried]
  - Needs: [what would unblock this]
  ```
- Tiếp tục với feature tiếp theo — không dừng lại

**Phát hiện session stall (watchdog):**
- Nếu không có output mới sau 20 phút (STALL_TIMEOUT=1200s) → watchdog KILL session + spawn fresh
- Xem "Session Recovery Protocol" bên dưới để biết chi tiết kill+fresh flow

**Phát hiện thrashing (nhiều commits nhưng 0 features pass):**
- Nếu > 10 commits trong 30 phút nhưng không feature nào mới passes=true → THRASHING
- Watchdog KILL session + spawn fresh với cảnh báo chọn approach khác
- Agent mới sẽ đọc .last_state.json và chọn approach khác

Full `check_thrashing()` code → xem **scripts-spec.md** section `resilient-watchdog.sh`.

---

### Session Recovery Protocol (v5.3 — QUAN TRỌNG)

Khi Claude API trả lỗi 500/429/529, session hiện tại bị "hỏng" — `--continue` KHÔNG giúp được vì:
1. Reload cùng conversation context đã corrupt (500)
2. `--continue` trên Windows/MINGW64 hay bị freeze (GitHub #7455)
3. Fresh session đọc lại CLAUDE.md → có đầy đủ instructions

**Nguyên tắc: LUÔN KILL + FRESH. KHÔNG BAO GIỜ dùng `--continue`.**

#### Error Classification

| Error | Detect Pattern | Action | Wait Time |
|-------|---------------|--------|-----------|
| 500 Server Error | `API Error: 500`, `api_error`, `Internal Server Error`, `displayModel is not defined` | **KILL + FRESH** | 60s, exponential backoff (×2 mỗi lần, cap 600s) |
| 429 Rate Limit | `rate_limit`, `rate_limit_error`, `429`, `Too Many Requests` | **KILL + FRESH** | 90s, tăng dần đến 300s. Nếu >30 phút liên tục → alert user |
| 529 Overloaded | `overloaded`, `overloaded_error`, `529` | **KILL + FRESH** | 30s, exponential đến 300s. Max chờ 1 giờ |
| 413 Too Large | `request_too_large`, `too large`, `413` | **KILL + FRESH** | 10s (context phải reset ngay) |
| 401/403 Auth | `authentication_error`, `permission_error` | **STOP WATCHDOG** | N/A — cần user fix credentials |
| Stall (no output 20min) | Log file không thay đổi >1200s | **KILL + FRESH** | 5s |
| Thrashing | >10 commits/30min, 0 features pass | **KILL + FRESH** | 5s + cảnh báo chọn approach khác |

#### Watchdog Flow

```
Watchdog loop (scripts/resilient-watchdog.sh):
  1. Save .last_state.json
  2. Check thrashing → add warning to prompt if detected
  3. Spawn fresh claude -p (NEVER --continue) → pipe output to log
  4. Monitor log every 10s: detect_error() scans for 500/429/529/413/AUTH patterns
  5. On error detected → kill_claude() (platform-aware) → get_wait_time() → sleep → wait_for_api() → restart
  6. On clean exit → check pending features → restart if remaining
  7. Rate limit: max 8 restarts/hour, pause 30min if exceeded
  8. Budget check after each session
```

**Platform-aware process kill:**
- WSL/Linux: `kill -- -$PID` (process group) + `pkill -9 -P $PID`
- Git Bash: `taskkill //PID $pid //T //F` (Windows process tree kill)

**Fresh session prompt** injects context:
- Đọc AEGIS.md, BLUEPRINT.md, .last_state.json, feature_list.json, LIVE_LOG.md, STEERING.md, BLOCKED.md
- KHÔNG làm lại features đã passes=true
- Nếu partial changes → đánh giá hoàn thành tiếp hoặc rollback checkpoint

**Full script code → xem scripts-spec.md** (resilient-watchdog.sh, resilient-worker.sh)

#### Multi-Agent Platform Support

- WSL/Linux: tmux panes, mỗi worker wrap bởi `resilient-worker.sh`
- Git Bash: background processes (không có tmux), log files

#### Tại sao KHÔNG dùng `--continue`

| Vấn đề | Chi tiết |
|---------|----------|
| Session corrupt | 500 error corrupt conversation state → `--continue` reload cùng state hỏng |
| Windows freeze | `--continue` sau Ctrl+C/kill hay bị freeze terminal (GitHub #7455) |
| Không đọc lại CLAUDE.md | `--continue` không re-read CLAUDE.md → mất instructions mới |
| State đã persist | `.last_state.json` + `feature_list.json` + `LIVE_LOG.md` = đủ context |
| Predictable hơn | Fresh session luôn chạy Session Start Protocol đầy đủ 11 bước |

---

### STEERING.md Atomic Read Protocol

**KHÔNG BAO GIỜ** đọc STEERING.md trực tiếp — dùng pattern atomic:

```bash
# Atomic read — tránh race condition với user đang viết
if [ -f STEERING.md ] && [ -s STEERING.md ]; then
  mv STEERING.md STEERING.processing.md
  # Đọc và xử lý STEERING.processing.md
  INSTRUCTIONS=$(cat STEERING.processing.md)
  rm STEERING.processing.md
  # Thực hiện instructions
  # User viết vào STEERING.md mới sẽ không bị mất
fi
```

**Nếu project ở NFS/SMB mount** (mv không atomic trên network FS):
```bash
# Dùng flock thay vì rename
LOCKFILE="STEERING.lock"
(
  flock -n 200 || exit 1
  if [ -f STEERING.md ] && [ -s STEERING.md ]; then
    INSTRUCTIONS=$(cat STEERING.md)
    > STEERING.md  # truncate instead of delete
  fi
) 200>"$LOCKFILE"
```

**Supported commands:**
- `fix [mô tả]` → dừng feature hiện tại, fix bug này trước
- `skip [feature/phase]` → bỏ qua, làm cái tiếp theo
- `focus [feature/phase]` → ưu tiên làm cái này trước
- `add [tính năng]` → thêm vào feature_list.json với priority cao
- `change [thay đổi]` → thay đổi approach / tech / design
- `deploy` → deploy ngay phiên bản hiện tại
- `add-env KEY value` → thêm vào .env
- `status` → in progress report vào PROGRESS.md
- `unblock #ID` → reset retry_count=0, blocked=false cho feature ID
- `approve #ID` → approve supervised feature → agent commit và mark passes=true
- `pause` → ghi PAUSE file, watchdog dừng sau session này
- Ngôn ngữ tự nhiên → AI hiểu và thực hiện

---

### Quality Gates (STRICT)

**Feature passes=true CHỈ KHI TẤT CẢ điều kiện sau đều đúng:**

1. `npm run build` (hoặc equivalent) → exit code 0, không có errors
2. `npm test` (hoặc equivalent) → exit code 0, không có failures
3. Không có TypeScript/linting errors liên quan đến feature này
4. Tất cả `acceptance_criteria` trong feature_list.json đã được verify
5. Không có console.error hoặc unhandled exceptions trong dev mode

**Nếu không có test suite:** tạo ít nhất 1 smoke test cho feature trước khi đánh passes=true.

**Phase quality gate:**
- Tất cả features trong phase: passes=true
- Deploy staging thành công
- Health check pass

---

### Cost Budget Protocol

**Ước tính cost per session (Opus 4.6):**
- Light session (~50K tokens): ~$3
- Normal session (~150K tokens): ~$9
- Heavy session (~300K tokens): ~$18

**Tracking trong COST_TRACKER.md:**
```
## Session Log
| Date | Session# | Est. Tokens | Est. Cost | Cumulative |
|------|----------|-------------|-----------|------------|
| 2024-01-15 | 1 | 150K | $9 | $9 |
```

**Budget rules:**
- Watchdog đọc MAX_COST_USD từ AEGIS.md (default: $50)
- Sau mỗi session: ước tính cost, cộng vào cumulative
- Nếu cumulative >= ALERT_COST_USD: ghi cảnh báo vào LIVE_LOG.md
- Nếu cumulative >= MAX_COST_USD: watchdog tạo file BUDGET_EXCEEDED, dừng
- User xóa BUDGET_EXCEEDED để tiếp tục (hoặc tăng MAX_COST_USD)

---

### Log Rotation Protocol

**LIVE_LOG.md rotation:** Khi > 500 lines → move sang `logs/LIVE_LOG_<timestamp>.md`, tạo mới. Gọi sau mỗi feature hoàn thành.

Full `rotate_log()` code → xem **scripts-spec.md** section `resilient-watchdog.sh`.

---

### Logging Format

**LIVE_LOG.md** — append SAU MỖI action:
```
[HH:MM] ACTION: did what — RESULT: outcome — NEXT: next step
[HH:MM] FEATURE #3: implement user login — PASS: build+test ok — NEXT: #4 dashboard
[HH:MM] STEERING: executed "fix checkout bug" — DONE: committed abc1234 — NEXT: resume #5
[HH:MM] BLOCKED: feature #7 retry_count=3 — ERROR: TS type conflict — NEXT: #8
[HH:MM] COST: session ~120K tokens ~$7 — TOTAL: ~$23/$50 budget
```

**PROGRESS.md** — update sau mỗi feature:
```
## Phase 1 — Foundation [3/5 complete]

### ✓ Feature #1: User Registration
- Commit: abc1234
- Completed: 2024-01-15 14:30
- Build: ✓ | Tests: ✓ | Acceptance: ✓

### ✗ Feature #7: Payment Integration [BLOCKED]
- Blocked after 3 retries
- Error: Stripe webhook signature mismatch
- See BLOCKED.md for details
```

---

### Generate Next Phase Features

Khi tất cả features của phase hiện tại đã passes=true:

1. Đọc BLUEPRINT.md → xem deliverables của phase tiếp theo
2. Tạo 10-20 features mới cho phase đó, append vào feature_list.json
3. Ghi vào LIVE_LOG.md: `[HH:MM] PHASE N complete → generated M features for phase N+1`
4. Deploy staging cho phase vừa xong
5. **Update WALKTHROUGH.md** — thêm features vừa hoàn thành vào user guide (xem protocol bên dưới)
6. Re-evaluate: nếu features mới >= MIN_FEATURES_FOR_MULTI → switch sang multi-agent mode
7. Bắt đầu phase mới

---

### WALKTHROUGH.md — End-User Documentation Protocol

**Mục đích:** WALKTHROUGH.md là tài liệu DÀNH CHO NGƯỜI DÙNG SẢN PHẨM (không phải cho developer/agent). Khi user nhận kết quả, họ mở file này để biết AI đã build gì và cách sử dụng.

**Tạo lần đầu:** Phase 0 Bootstrap (step 6) — template cơ bản.

**Update khi nào:**
- Sau MỖI phase hoàn thành (tất cả features passes=true)
- Khi deploy staging/production thành công
- Khi có thay đổi lớn qua STEERING.md (add feature, change approach)

**Cấu trúc WALKTHROUGH.md:**
```markdown
# [Tên Sản Phẩm] — Hướng Dẫn Sử Dụng

> Auto-generated by AEGIS. Cập nhật lần cuối: [timestamp]

## Tổng Quan
[Mô tả ngắn sản phẩm là gì, cho ai dùng, giải quyết vấn đề gì]

## Cài Đặt & Chạy
[Từng bước: clone, install, env setup, start dev/prod]
- Prerequisites: Node.js >= X, etc.
- `npm install`
- Copy `.env.example` → `.env`, điền credentials
- `npm run dev` → http://localhost:3000

## Các Tính Năng Đã Hoàn Thành

### Phase 1: [Tên Phase]
- ✅ Feature #1: [Mô tả] — Cách dùng: [hướng dẫn cụ thể]
- ✅ Feature #2: [Mô tả] — Cách dùng: [hướng dẫn cụ thể]
- ❌ Feature #7: [Mô tả] — BLOCKED: [lý do, xem BLOCKED.md]

### Phase 2: [Tên Phase]
- ✅ Feature #8: ...
[Cập nhật sau mỗi phase]

## Tech Stack
[Framework, database, hosting, key packages — lấy từ BLUEPRINT.md]

## Cấu Trúc Project
[File tree chính với giải thích: src/pages/, src/api/, src/components/, etc.]

## API Endpoints (nếu có)
[Bảng: Method | Path | Mô tả | Auth required?]

## Environment Variables
[Bảng: KEY | Mô tả | Bắt buộc? | Ví dụ — lấy từ NEEDS.md]

## Deploy
[Hướng dẫn deploy: platform, commands, URLs]
- Staging: [URL]
- Production: [URL]

## Known Issues & Limitations
[Từ BLOCKED.md — features chưa hoàn thành và lý do]

## Changelog
[Log theo phase: Phase 1 done [date] — N features, Phase 2 done [date] — M features]
```

**Quy tắc viết:**
- Viết cho END USER, không phải developer — ngôn ngữ đơn giản, có ví dụ cụ thể
- Mỗi feature phải có "Cách dùng" — không chỉ liệt kê mà hướng dẫn sử dụng
- Lấy thông tin từ: BLUEPRINT.md (architecture), feature_list.json (features), NEEDS.md (env vars), BLOCKED.md (issues)
- Cập nhật KHÔNG overwrite toàn bộ — chỉ append/update sections thay đổi
- Ngôn ngữ: theo config trong AEGIS.md (vi/en/both)

---

### Multi-Agent Parallel Protocol (QUAN TRỌNG)

**Khi nào kích hoạt:**
- `EXECUTION_MODE=multi` → luôn chạy multi-agent
- `EXECUTION_MODE=auto` VÀ pending features (passes=false, blocked=false) >= `MIN_FEATURES_FOR_MULTI` → tự chuyển
- `EXECUTION_MODE=single` → KHÔNG BAO GIỜ chạy multi-agent

**v5: Orchestrator dùng `depends_on` để topological sort:**
```
# Features không depend gì → wave 1 (tất cả workers song song)
# Features depend wave 1 → wave 2 (sau khi merge wave 1)
# Orchestrator tự phân wave dựa trên dependency graph
```

**Kiến trúc:**
```
Orchestrator Agent (tmux pane 0 — root project dir)
  ├── Worker 1 (tmux pane 1 — worktree: .worktrees/worker-1)
  ├── Worker 2 (tmux pane 2 — worktree: .worktrees/worker-2)
  └── Worker 3 (tmux pane 3 — worktree: .worktrees/worker-3)
```

#### Orchestrator Agent — Vai trò

Orchestrator KHÔNG code. Orchestrator chỉ:

1. **Phân tích dependencies** giữa features:
   ```
   # Group features theo category để tránh conflict
   # VD: auth features → worker-1, dashboard features → worker-2
   # Features có dependency → xếp cùng worker hoặc theo thứ tự wave
   ```

2. **Tạo worktrees + assign features:**
   ```bash
   # Tạo worktree cho mỗi worker
   git worktree add .worktrees/worker-1 -b worker-1 dev
   git worktree add .worktrees/worker-2 -b worker-2 dev
   git worktree add .worktrees/worker-3 -b worker-3 dev

   # Tạo WORKER_ID file trong mỗi worktree
   cat > .worktrees/worker-1/WORKER_ID << 'EOF'
   WORKER_NUM=1
   BRANCH=worker-1
   ASSIGNED_FEATURES=[3,4,7]
   CATEGORY=auth
   WAVE=1
   EOF

   # Copy CLAUDE.md vào worktree (worker đọc tự động)
   cp CLAUDE.md .worktrees/worker-1/CLAUDE.md
   ```

3. **Spawn workers trong tmux:**
   ```bash
   # Spawn worker agents
   tmux split-window -t agent -h \
     "cd $(pwd)/.worktrees/worker-1 && claude --model claude-opus-4-6 --dangerously-skip-permissions -p 'Đọc CLAUDE.md. Bạn là WORKER AGENT. Đọc WORKER_ID để biết features assigned. Code và test từng feature. Commit vào branch worker-1.'"

   tmux split-window -t agent -v \
     "cd $(pwd)/.worktrees/worker-2 && claude --model claude-opus-4-6 --dangerously-skip-permissions -p 'Đọc CLAUDE.md. Bạn là WORKER AGENT. Đọc WORKER_ID để biết features assigned. Code và test từng feature. Commit vào branch worker-2.'"
   ```

4. **Monitor workers** (poll mỗi 5 phút — v5: heartbeat check):
   ```bash
   # Kiểm tra worker progress + heartbeat
   for w in 1 2 3; do
     WDIR=".worktrees/worker-$w"
     COMMITS=$(cd "$WDIR" && git log --oneline worker-$w ^dev | wc -l)
     echo "Worker $w: $COMMITS new commits"

     # v5: Heartbeat check — worker dead nếu heartbeat > 5 phút
     if [ -f "$WDIR/HEARTBEAT" ]; then
       LAST_BEAT=$(cat "$WDIR/HEARTBEAT")
       NOW=$(date +%s)
       ELAPSED=$(( NOW - LAST_BEAT ))
       if [ "$ELAPSED" -gt 300 ]; then
         echo "Worker $w: DEAD (no heartbeat in ${ELAPSED}s) — respawning"
         # Respawn worker in new tmux pane
         tmux split-window -t agent -h \
           "cd $(pwd)/$WDIR && claude --model claude-opus-4-6 --dangerously-skip-permissions \
             -p 'Đọc CLAUDE.md. Bạn là WORKER AGENT. Đọc WORKER_ID. Continue coding assigned features.'"
       fi
     fi
   done
   ```

5. **Wave merge** khi workers hoàn thành:
   ```bash
   # Merge worker branches vào dev (tuần tự để xử lý conflicts)
   git checkout dev
   git merge worker-1 --no-edit    # merge worker có nhiều commits nhất trước
   git merge worker-2 --no-edit    # nếu conflict → orchestrator agent resolve
   git merge worker-3 --no-edit
   git push origin dev
   ```

6. **Cleanup sau merge:**
   ```bash
   # Xóa worktrees đã merge
   git worktree remove .worktrees/worker-1 --force
   git worktree remove .worktrees/worker-2 --force
   git worktree remove .worktrees/worker-3 --force
   git branch -d worker-1 worker-2 worker-3
   ```

7. **Update governance files** sau merge:
   - Cập nhật feature_list.json (merge passes/blocked từ workers)
   - Cập nhật PROGRESS.md
   - Ghi LIVE_LOG.md: `[HH:MM] MULTI-AGENT: wave merge complete — N features done`

#### Worker Agent — Vai trò

Worker CHỈ code features được assign. Worker tuân theo:

1. Đọc `WORKER_ID` → biết features cần làm
2. Đọc `BLUEPRINT.md` (symlink hoặc copy từ root) → hiểu architecture
3. Respect `depends_on` order: chỉ code feature khi dependencies passed
4. Tạo checkpoint tag trước mỗi feature (trong worktree branch)
5. Code feature → test → commit vào branch `worker-N`
6. **HEARTBEAT**: ghi timestamp mỗi 60s vào `HEARTBEAT` file
   ```bash
   # Worker chạy background heartbeat
   while true; do date +%s > HEARTBEAT; sleep 60; done &
   HEARTBEAT_PID=$!
   # Kill heartbeat khi worker exit
   trap "kill $HEARTBEAT_PID 2>/dev/null" EXIT
   ```
7. **KHÔNG** đọc/ghi STEERING.md (chỉ orchestrator đọc)
8. **KHÔNG** merge vào dev (orchestrator làm)
9. **KHÔNG** sửa files ngoài scope features assigned
10. Khi xong TẤT CẢ features assigned → exit session
11. Ghi progress vào `WORKER_LOG.md` trong worktree:
   ```
   [HH:MM] WORKER-1: feature #3 — PASS — committed abc1234
   [HH:MM] WORKER-1: feature #4 — BLOCKED (retry_count=3) — TS error — rolled back to checkpoint
   [HH:MM] WORKER-1: ALL ASSIGNED FEATURES DONE — exiting
   ```

#### Feature Assignment Strategy

```
Orchestrator phân features theo nguyên tắc (v5: dependency-aware):

1. Topological sort theo depends_on
   → Tạo dependency graph từ feature_list.json
   → Features với depends_on=[] → wave 1 (root nodes)
   → Features depend wave 1 → wave 2
   → Features depend wave 2 → wave 3 (nếu cần)

2. Group by category TRONG MỖI WAVE
   → Features cùng category vào cùng worker (giảm conflict)
   → Feature B depends on A → nếu cùng wave: cùng worker, A trước B
   → Nếu khác wave: A ở wave trước, merge xong mới assign B

3. Load balancing
   → Ước tính complexity mỗi feature → phân đều cho workers
   → Nếu 15 features, 3 workers → ~5 features/worker

4. Dependency chain optimization
   → Nếu chain A→B→C tất cả cùng category → cùng worker (tránh wave overhead)
   → Nếu chain cross-category → chia wave

Example:
  features: [{id:1, depends_on:[]}, {id:2, depends_on:[]}, {id:3, depends_on:[1]},
             {id:4, depends_on:[1,2]}, {id:5, depends_on:[]}]

  Wave 1: [#1, #2, #5] → worker-1: #1,#5  worker-2: #2
  Wave 2 (after merge): [#3, #4] → worker-1: #3  worker-2: #4
```

#### Conflict Resolution Protocol

Khi merge worker branches có conflict:

1. Orchestrator agent tự resolve conflict (nó hiểu cả 2 sides)
2. Nếu conflict quá phức tạp (> 50 lines conflict):
   - Giữ worker có nhiều changes hơn
   - Ghi feature của worker kia vào BLOCKED.md: `merge conflict`
   - Feature bị conflict sẽ được retry ở wave tiếp theo
3. Sau resolve: `npm run build && npm test` → verify merge không broken
4. Nếu build/test fail sau merge → `git merge --abort` → merge từng worker một, test giữa mỗi merge

#### WORKERS.md Format

```
## Multi-Agent Wave #1 — Started [TIMESTAMP]

| Worker | Branch | Features | Status | Commits |
|--------|--------|----------|--------|---------|
| 1 | worker-1 | #3,#4,#7 (auth) | ✅ Done | 5 |
| 2 | worker-2 | #5,#6,#8 (dashboard) | 🔄 Running | 3 |
| 3 | worker-3 | #9,#10,#11 (api) | ❌ Failed #10 | 4 |

### Merge Status
- [ ] worker-1 → dev (pending)
- [ ] worker-2 → dev (pending)
- [ ] worker-3 → dev (pending)
- [ ] Build + test after merge
```

#### scripts/multi-agent.sh

**Full script code → xem scripts-spec.md**

Flow:
```
1. Cleanup old worktrees → create fresh worktrees từ dev branch
2. Copy CLAUDE.md, BLUEPRINT.md, feature_list.json vào mỗi worktree
3. Orchestrator agent assigns features (topological sort theo depends_on)
4. Spawn workers (platform-aware: tmux on WSL, background on Git Bash)
   — Mỗi worker wrap bởi resilient-worker.sh (kill+fresh on error)
5. Monitor heartbeat mỗi 2 phút, respawn dead workers
6. Wave merge: worker-N → dev (tuần tự, build+test sau mỗi merge)
7. Post-merge verification: full build+test → push dev
8. Update governance files từ WORKER_LOG.md
9. Cleanup worktrees (trap EXIT)
```

#### Khi nào dùng Single vs Multi

| Tình huống | Mode | Lý do |
|------------|------|-------|
| Project mới, Phase 1 (10 features) | Single | Ít features, cần setup foundation trước |
| Phase 3+ với 25 features pending | Multi | Đủ features independent để parallelize |
| Bug fixing (3-5 bugs) | Single | Bugs thường liên quan nhau |
| Refactoring lớn | Single | Cần nhất quán across codebase |
| Adding 20 API endpoints | Multi | Endpoints independent, dễ parallelize |
| UI components (15 pages) | Multi | Pages thường independent |

#### Chi phí Multi-Agent

```
Single agent:  1 session × $9-18  = $9-18 / batch
Multi (3 workers): 1 orchestrator + 3 workers = ~$36-72 / batch
→ Nhanh hơn ~2-3x nhưng đắt hơn ~3-4x
→ Chỉ dùng khi time > money hoặc features thực sự independent
```

---

### Deploy Pipeline (Staging → Canary → Production)

**Quy tắc: KHÔNG BAO GIỜ deploy thẳng production. Luôn qua staging trước.**

```
deploy_flow():
  # Step 1: Deploy staging
  staging_url = deploy_staging()

  # Step 2: Health check staging
  if not health_check(staging_url):
    log "STAGING HEALTH CHECK FAIL — aborting deploy"
    return false

  # Step 3: Smoke test staging (build + critical paths)
  if not smoke_test(staging_url):
    log "STAGING SMOKE TEST FAIL — aborting deploy"
    return false

  # Step 4: Promote to production
  deploy_production()
  log "DEPLOYED to production"
```

**Deploy commands per platform → xem scripts-spec.md**
- Vercel: `vercel deploy` (staging) → health check → `vercel deploy --prod`
- Cloudflare Workers: `wrangler deploy --env staging` → test → `wrangler deploy`
- Cloudflare Pages: `wrangler pages deploy --branch staging` → verify → deploy main
- GitHub Actions: tạo .github/workflows/deploy.yml

---

### Git Strategy
```
main       ← production (deploy trigger)
dev        ← single-agent works here / merge target for workers
worker-1   ← multi-agent: worker 1 branch (temporary)
worker-2   ← multi-agent: worker 2 branch (temporary)
worker-3   ← multi-agent: worker 3 branch (temporary)
```

**Single-agent mode:**
- Commit trực tiếp vào `dev`
- Format: `feat: [phase N] #featureID description`
- Push sau MỖI commit

**Multi-agent mode:**
- Workers commit vào `worker-N` branch
- Orchestrator merge `worker-N` → `dev` theo wave
- Worker branches bị xóa sau merge
- Format: `feat: [phase N] #featureID description (worker-N)`

Merge `dev` → `main` khi phase hoàn thành + quality gate pass.

---

### Khi không chắc chắn
- Đọc lại BLUEPRINT.md
- Đọc lại phần YÊU CẦU ở đầu file này
- Chọn approach đơn giản nhất trước, refactor sau
- Log decisions vào PROGRESS.md với lý do
- Nếu vẫn không chắc sau 10 phút → ghi vào BLOCKED.md, skip, làm feature khác
