# AEGIS v5.2 — Quick Start Guide

> 5 phút setup. AI code liên tục nhiều ngày. Bạn chỉ check 2-3 lần/ngày.

---

## Cài đặt (1 lần duy nhất)

```bash
# Claude Code + tools
npm install -g @anthropic-ai/claude-code   # hoặc brew install claude-code
brew install tmux jq                        # macOS
# sudo apt install tmux jq                  # Ubuntu/WSL

# Verify
claude --version   # cần >= 2.x

# Set model (thêm vào ~/.bashrc hoặc ~/.zshrc)
export ANTHROPIC_MODEL=claude-opus-4-6
export CLAUDE_CODE_EFFORT_LEVEL=high
```

---

## Tạo project mới (Greenfield)

```bash
mkdir my-project && cd my-project
```

Tạo **1 file duy nhất** `AEGIS.md` — copy nội dung từ `aegis.md` trong repo này, sửa phần `[YÊU CẦU CỦA BẠN]`:

```markdown
## ── YÊU CẦU CỦA BẠN ──

Tôi muốn tạo một SaaS dashboard cho quản lý inventory.
Có real-time stock tracking, low-stock alerts, barcode scanning.
Tech: Next.js + Supabase. Deploy: Vercel + Cloudflare Workers.
```

## Dùng với codebase đã có (Existing)

```bash
cd /path/to/existing-project
```

Tạo `AEGIS.md` với yêu cầu của bạn, thêm:

```markdown
## ── PROJECT MODE ──
- PROJECT_MODE: existing   # hoặc auto (AI tự detect)
```

Bootstrap sẽ tự động:
1. Scan toàn bộ codebase (file tree, entry points, core logic)
2. Đọc `.env` — lấy key names, không log values
3. Tạo `CODEBASE_SCAN.md` (tech stack, existing features, ENV status)
4. Tạo `NEEDS.md` chỉ với keys thực sự còn thiếu (keys đã có → `[x]` ngay)
5. Tạo `feature_list.json` chỉ với features MỚI (không rebuild những gì đã có)

**Config tùy chọn** (trong AEGIS.md):

| Config | Mặc định | Ý nghĩa |
|--------|----------|---------|
| `PROJECT_MODE` | auto | `greenfield` / `existing` / `auto` |
| `MAX_COST_USD` | 50 | Watchdog dừng khi vượt budget |
| `EXECUTION_MODE` | auto | `single` / `multi` / `auto` |
| `MAX_WORKERS` | 3 | Số worker agents cho multi-agent mode |
| `MIN_FEATURES_FOR_MULTI` | 20 | Ngưỡng auto-switch sang multi-agent |

**supervision_level trong feature_list.json** (v5.1):
- `"auto"` (default) — agent tự code và commit
- `"supervised"` — agent dừng trước commit, chờ `echo "approve #ID" >> STEERING.md`

---

## Launch

```bash
# Lần đầu — Bootstrap + bắt đầu code (cả greenfield lẫn existing)
claude --model claude-opus-4-6 --dangerously-skip-permissions \
  -p "Đọc AEGIS.md và thực hiện Phase 0: Bootstrap rồi bắt đầu code Phase 1 ngay."

# Chạy tự động liên tục (sau khi bootstrap xong)
chmod +x scripts/agent-watchdog.sh
tmux new-session -d -s agent 'bash scripts/agent-watchdog.sh'
```

---

## Điều khiển từ phone (SSH)

```bash
# Xem status
bash scripts/health-check.sh
tail -20 LIVE_LOG.md

# Điều khiển (viết vào STEERING.md)
echo "fix bug login page"           >> STEERING.md    # fix bug gấp
echo "skip #7"                      >> STEERING.md    # bỏ qua feature
echo "add thêm export CSV"          >> STEERING.md    # thêm tính năng
echo "unblock #7"                   >> STEERING.md    # retry feature blocked
echo "approve #7"                   >> STEERING.md    # approve supervised feature (v5.1)
echo "add-env VERCEL_TOKEN xxx"     >> STEERING.md    # cung cấp credential
echo "pause"                        >> STEERING.md    # tạm dừng

# Slash commands trong Claude Code session (v5.1)
/status       # quick status dashboard
/unblock 7    # reset feature #7
/rollback 7   # git reset về checkpoint feature #7

# Xem AI cần gì
cat NEEDS.md      # credentials cần cung cấp
cat BLOCKED.md    # features bị stuck
```

---

## Multi-Agent Mode (chạy song song)

Kích hoạt khi project có >= 20 features pending (hoặc set `EXECUTION_MODE: multi`):

```bash
# Chạy manual
bash scripts/multi-agent.sh 3    # 3 workers

# Hoặc tự động (EXECUTION_MODE: auto trong AEGIS.md)
# Agent tự chuyển khi đủ features
```

**Cách hoạt động:**
```
Orchestrator (phân task, merge)
  ├── Worker 1 (git worktree riêng → code auth features)
  ├── Worker 2 (git worktree riêng → code dashboard features)
  └── Worker 3 (git worktree riêng → code API features)
```

- Workers commit vào branches `worker-1`, `worker-2`, `worker-3`
- Orchestrator merge → `dev` → verify build+test → push
- Chi phí ~3-4x cao hơn single-agent, nhưng nhanh ~2-3x

---

## Files được tạo (sau Bootstrap)

```
my-project/
├── AEGIS.md            ← bạn tạo (1 file duy nhất)
├── CLAUDE.md           ← persistent memory (auto-read mỗi session)
├── BLUEPRINT.md        ← architecture + phases
├── feature_list.json   ← 10-20 features cho phase 1-2
├── CODEBASE_SCAN.md    ← [existing mode] tech stack, existing features, ENV status
├── NEEDS.md            ← credentials cần từ bạn (existing: chỉ keys thực sự thiếu)
├── PROGRESS.md         ← completion log
├── LIVE_LOG.md         ← real-time action log
├── STEERING.md         ← bạn viết lệnh vào đây
├── BLOCKED.md          ← features stuck sau 3 retries
├── COST_TRACKER.md     ← session cost log
├── WORKERS.md          ← multi-agent worker status
├── .memory/            ← [v5.2] index.json — file paths + exports + descriptions
├── .claude/
│   ├── settings.json        ← v5.1: Stop hook + PostToolUse lint hook
│   ├── hooks/lint-check.sh  ← async lint sau mỗi file edit
│   └── commands/            ← /status, /unblock, /rollback
├── scripts/
│   ├── agent-watchdog.sh    ← auto-restart + budget guard
│   ├── health-check.sh      ← quick status dashboard
│   ├── aegis-start.sh       ← convenience launcher
│   ├── multi-agent.sh       ← multi-agent orchestrator
│   ├── memory-index.sh      ← [v5.2] build semantic memory index
│   └── memory-search.sh     ← [v5.2] query index trước khi implement
└── src/                     ← code xuất hiện ở đây
```

---

## Recovery

| Sự cố | Giải pháp |
|--------|-----------|
| API crash | Watchdog tự restart với context recovery |
| Hết credit | Watchdog chờ 15 phút → retry |
| Feature bị loop | Auto-skip sau 3 retries → BLOCKED.md |
| Session stall 40p | Watchdog force restart |
| Budget exceeded | `rm BUDGET_EXCEEDED` hoặc tăng `MAX_COST_USD` |
| Muốn dừng | `echo "pause" >> STEERING.md` |
| Code hỏng nặng | `git reset --hard [hash]` → restart |
| Supervised feature chờ | `echo "approve #ID" >> STEERING.md` |
| AI rebuild code đã có | Kiểm tra CODEBASE_SCAN.md → thêm vào "Existing Features" |
| .env bị overwrite | init.sh existing mode không overwrite — chỉ validate |
| Memory index stale | `bash scripts/memory-index.sh` để rebuild thủ công |

---

> **AEGIS v5.2** — Autonomous Engineering & Governance Intelligence System
> Claude Opus 4.6 · Context Recovery · Loop Detection · Budget Guard · Multi-Agent Parallel · Stop Hook · Supervision Level · Existing Codebase Mode · **Semantic Memory**
