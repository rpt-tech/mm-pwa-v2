[2026-02-19 00:09] BLOCKED: husky install hook missing since package not installed
Reason: npm install fails because the post-install Husky hook (`husky install && npm run prepare:hooks`) references `husky` but the mono repo has no husky dependency. Need either to install husky dependency or remove the undefined hook before dependency installation can succeed.
[RESOLVED 2026-02-21] Fixed by: (1) adding guarded `prepare` script in apps/web/package.json that only runs husky when .git exists, (2) switching vercel.json to pnpm install --frozen-lockfile so Vercel no longer triggers the broken npm post-install hook.

[2026-02-21 05:32] BLOCKED: GitHub Secrets missing for full CI/CD pipeline
Reason: The following secrets need to be added to GitHub repo Settings → Secrets → Actions:
  - VERCEL_TOKEN: Get from https://vercel.com/account/tokens (needed for CLI deploy in CI)
  - VERCEL_ORG_ID: Get from Vercel team settings (needed for vercel link)
  - VERCEL_PROJECT_ID: Get from .vercel/project.json after running vercel link locally
Without these, Vercel deploys in CI will be skipped (Git integration still works as fallback).
CLOUDFLARE_API_TOKEN: Already configured ✓

[2026-02-21 05:50] BLOCKED: GitHub Secrets incomplete for full CI/CD
Reason: deploy.yml now requires VERCEL_ORG_ID + VERCEL_PROJECT_ID in addition to VERCEL_TOKEN.
Without these, Vercel CLI deploys in CI will fail (Vercel Git integration fallback still works).
Action needed — GitHub repo → Settings → Secrets → Actions → add:
  - VERCEL_TOKEN: https://vercel.com/account/tokens
  - VERCEL_ORG_ID: Vercel team settings page
  - VERCEL_PROJECT_ID: apps/web/.vercel/project.json (run `vercel link` locally first)
CLOUDFLARE_API_TOKEN: Already configured ✓

[2026-02-21 08:30] BLOCKED: Vercel CLI v50 deploy fails with scope error
Reason: Vercel CLI v50.17.1 ignores --scope flag when --token is provided in non-interactive mode. 
Network calls to api.vercel.com also appear blocked in this WSL environment.
Workaround: Push to main branch and let GitHub Actions CI/CD handle deployment, OR user runs deploy manually.
