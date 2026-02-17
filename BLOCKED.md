# Blocked Items

Ghi lại các blockers theo format:
```
[YYYY-MM-DD HH:MM] BLOCKED: Mô tả vấn đề
Reason: Lý do cụ thể
```

---

[2026-02-17 13:23] BLOCKED: Cloudflare API token thiếu quyền
Reason: Token cần permission 'Workers Scripts:Edit' và 'User Details:Read'
Phase: 0 | Component: BFF deploy
Tried: Deploy với CLOUDFLARE_API_TOKEN từ .env
Workaround: Skip BFF deploy, tiếp tục deploy frontend Vercel, frontend sẽ call trực tiếp Magento GraphQL endpoint tạm thời
