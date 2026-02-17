# CLAUDE.md - MVP PWA Project

## Autonomy Level: MAXIMUM

Bạn có toàn quyền quyết định mọi thứ trong project này:

### ✅ Quyền tự quyết hoàn toàn:
- **Code & Architecture:** Tự do refactor, restructure, chọn patterns
- **Packages:** Cài/gỡ dependencies bất cứ lúc nào
- **Git:** Commit và push lên branch `dev` tự do
- **Deploy:** Deploy staging bất cứ lúc nào cần test
- **Production:** Merge vào `main` và deploy production khi sẵn sàng
- **Subagents:** Spawn subagents với `--dangerously-skip-permissions` để tăng tốc

### 🛑 Hard Stops - CHỈ dừng khi:

1. **Thiếu credentials/API keys** không có trong codebase hoặc env
   - Ghi vào `BLOCKED.md` với format:
     ```
     [YYYY-MM-DD HH:MM] BLOCKED: Cần API key cho [service]
     Reason: [lý do cụ thể]
     ```

2. **Blocked hoàn toàn > 30 phút** đã thử mọi hướng giải quyết
   - Ghi vào `BLOCKED.md`
   - Skip task đó
   - Chuyển sang task khác có thể làm được

### 📝 Logging liên tục

**QUAN TRỌNG:** Append vào `LIVE_LOG.md` sau MỖI action:

```
[HH:MM] action — result — next step
```

Ví dụ:
```
[14:23] Install @tanstack/react-query — ✓ installed v5.17.0 — setup QueryProvider
[14:25] Create QueryProvider wrapper — ✓ src/providers/QueryProvider.tsx — integrate to App
[14:27] Integrate QueryProvider to App.tsx — ✓ wrapped Router — test API call
[14:30] Test API call with useQuery — ✓ works, data fetched — commit changes
[14:32] git commit "feat: add react-query setup" — ✓ pushed to dev — next: implement user auth
```

### 🎯 Steering

Sau mỗi task hoàn thành, **BẮT BUỘC** check `STEERING.md`:

1. Đọc nội dung (nếu có)
2. Adjust hướng đi theo chỉ dẫn
3. **XÓA nội dung** trong `STEERING.md` sau khi đọc
4. Tiếp tục task tiếp theo

Format `STEERING.md` (do user viết):
```
[Priority] Task/direction
[Optional] Context/notes
```

### 📊 Progress Tracking

Cập nhật `PROGRESS.md` sau mỗi feature hoàn thành:

```markdown
## [Feature Name]
- **Status:** ✓ Done / 🚧 In Progress / ⏸️ Blocked / ❌ Cancelled
- **Staging URL:** https://staging.example.com/feature-path
- **Notes:** Any important notes, decisions, or blockers
- **Completed:** YYYY-MM-DD HH:MM
```

### 🚀 Workflow

1. **Start task** → Log to `LIVE_LOG.md`
2. **Work autonomously** → Log every significant action
3. **Hit blocker?**
   - Try alternatives (max 30 min)
   - If still blocked → `BLOCKED.md` → skip → next task
4. **Complete feature** → Update `PROGRESS.md`
5. **Check `STEERING.md`** → Adjust if needed → Clear file
6. **Repeat**

### 💡 Decision Making

**Không cần hỏi cho:**
- Chọn library/package nào
- Refactor code structure
- Thay đổi architecture
- Deploy staging
- Merge và deploy production (khi confident)
- Tạo/xóa files
- Thay đổi config

**Chỉ hỏi khi:**
- Cần credentials/secrets KHÔNG có trong `.env`
- Blocked > 30 phút không có cách giải quyết

**TUYỆT ĐỐI KHÔNG HỎI:**
- "Tiếp theo làm gì?" → Đọc MIGRATION_PLAN.md, làm phase tiếp theo
- "Deploy không?" → Tự deploy
- "Có muốn tôi...?" → Cứ làm
- Sau khi hoàn thành 1 task → NGAY LẬP TỨC bắt đầu task tiếp theo
- KHÔNG BAO GIỜ dừng chờ user confirm

### 🎨 Code Standards

- **TypeScript strict mode**
- **ESLint + Prettier** (auto-fix)
- **Functional components** với hooks
- **Tailwind CSS** cho styling
- **React Query** cho data fetching
- **Zustand** cho global state (nếu cần)
- **Vitest + Testing Library** cho tests

### 📦 Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **State:** React Query + Zustand
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod
- **HTTP:** Axios
- **PWA:** Vite PWA Plugin
- **Testing:** Vitest + Testing Library

### 🔄 Git Workflow

```bash
# Tự do commit và push
git add .
git commit -m "feat: descriptive message"
git push origin dev

# Deploy staging tự động trigger (nếu có CI/CD)

# Khi ready for production
git checkout main
git merge dev
git push origin main
# Production deploy tự động trigger
```

### 📱 Project Context

**MVP PWA** - Progressive Web App với các tính năng:
- User authentication
- Offline-first architecture
- Push notifications
- Responsive design
- Fast, optimized performance

**Mục tiêu:** Ship MVP nhanh nhất có thể với quality cao.

---

## 🔄 Multi-Day Autonomous Protocol

Project này chạy liên tục 3-4 ngày, ~150 prompts/ngày. User steer qua phone SSH + tmux.

### Session Resume
Mỗi khi bắt đầu session MỚI (hoặc resume sau khi hết quota):
1. Đọc `PROGRESS.md` → biết đang ở phase nào
2. Đọc `LIVE_LOG.md` (20 dòng cuối) → biết action gần nhất
3. Đọc `STEERING.md` → user có chỉ đạo mới không
4. Đọc `BLOCKED.md` → có gì bị block không
5. Đọc `MIGRATION_PLAN.md` → biết plan tổng thể
6. Tiếp tục từ checkpoint cuối cùng

### Quota Management
- Sau mỗi component/feature hoàn thành → `git commit && git push origin dev`
- Mỗi ~30 phút → update `PROGRESS.md` checkpoint
- Trước khi hết quota → commit TẤT CẢ, push, ghi checkpoint rõ ràng

### Git Commit Strategy
- Commit sau MỖI component/feature hoàn thành (KHÔNG tích lũy changes lớn)
- Format: `feat: [phase] [component/feature name]`
- Push ngay sau commit để user có thể review từ phone

### Deploy Strategy
- **Frontend (Vercel):**
  ```bash
  cd apps/web && VERCEL_TOKEN=$(grep VERCEL_TOKEN ../../.env | cut -d= -f2) npx vercel --prod --token $VERCEL_TOKEN --yes
  ```
- **BFF (Cloudflare Workers):**
  ```bash
  cd apps/bff && CLOUDFLARE_API_TOKEN=$(grep CLOUDFLARE_API_TOKEN ../../.env | cut -d= -f2) npx wrangler deploy
  ```
- Deploy staging sau mỗi phase hoàn thành để test
- CF Account ID: `3215d8c2be0ce3c84386a52aa03ad93b`
- Tất cả tokens nằm trong `.env` (root project) - file này KHÔNG commit vào git
- Trên WSL, project ở `/mnt/d/mm-new-pwa/`

### Source Reference
Khi migrate component, LUÔN đọc source tại:
`pwacng-release-backup/pwacng-release/src/`
- Business logic → `@theme/BaseComponents/{ComponentName}/`
- Overrides → `override/Components/{ComponentName}/`
- Talons (hooks) → `@theme/Talons/{Feature}/` + `override/Talons/{Feature}/`
- GQL queries → tìm file `*.gql.js` trong component dir
- i18n strings → `@theme/translate/vi-VN.json`
- GraphQL schema ref → `lastCachedGraphQLSchema.json`

### Migration Quality Rules
- Copy business logic 1:1, KHÔNG simplify hoặc skip edge cases
- Mỗi GraphQL query phải match field-for-field với source
- Test mỗi query với live backend (`https://online.mmvietnam.com/graphql`)
- Giữ nguyên custom fields: `ecom_name`, `unit_ecom`, `mm_product_type`, `is_alcohol`, `allow_pickup`

---

## TL;DR

1. ✅ Làm tất cả, quyết định tất cả
2. 📝 Log mọi action vào `LIVE_LOG.md`
3. 🛑 Chỉ dừng khi thiếu credentials hoặc blocked > 30 phút
4. 🎯 Check `STEERING.md` sau mỗi task
5. 📊 Update `PROGRESS.md` sau mỗi feature
6. 🚀 Ship fast, iterate fast
7. 🔄 Resume từ checkpoint khi bắt đầu session mới
8. 💾 Commit + push sau mỗi feature, KHÔNG tích lũy
