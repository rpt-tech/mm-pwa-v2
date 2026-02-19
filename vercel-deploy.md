# Vercel Deployment Guide

This document captures the **manual deployment flow** for the `/apps/web` frontend plus the CLI quirks we encountered (missing scope, interactive link requirement, dependency fixes). Follow every step before pushing a release so `vercel build` succeeds and the deployment log is complete.

## 1. Preparation

1. **Workspace & credentials**
   - Work inside `/mnt/d/mm-new-pwa/apps/web`.
   - The root `.env` contains secrets you must not commit. In particular the deployment token is stored as `VERCEL_TOKEN`.
   - Make sure `pnpm`, `npm`, or `corepack` versions align with the project. Vercel reports `pnpm@10.x` automatically, so do not force `pnpm@9` unless explicitly required.

2. **Dependencies (critical)**
   - Ensure the package contains these dependencies (`apps/web/package.json`):
     - `lucide-react` (icons used across headers, cart, product components)
     - `@apollo/client` (GraphQL client used in multiple pages)
     - `husky`, `npm-run-all` (postinstall hooks and helper scripts)
   - Install with fallback if husky hooks fail:
     ```bash
     cd /mnt/d/mm-new-pwa/apps/web
     NPM_CONFIG_IGNORE_SCRIPTS=true npm install
     ```
     Then run `npm install` again (without ignoring scripts) once husky exists.
   - If `@hookform/resolvers` complains about `run-s`, install `npm-run-all` globally or in devDependencies first.
   - If `microbundle` is missing for certain dependency builds, install it globally: `npm install -g microbundle`.

3. **Build locally**
   - Run `npm run build`. The Vite build outputs a `dist/` folder and logs chunk sizes.
   - Resolve any `TS2307` errors before continuing (missing modules cause Vercel build to abort).
   - Warnings about chunk size > 500KB can be noted but do not block deployment.

## 2. Linking Vercel (interactive step)

Vercel CLI rejects non-interactive commands unless the project is linked to a scope/team. Since our pipeline runs `npx vercel` non-interactively, **link once manually**:

1. Open a terminal where you can interact.
2. Run:
   ```bash
   cd /mnt/d/mm-new-pwa/apps/web
   export VERCEL_TOKEN="$(grep '^VERCEL_TOKEN=' ../../.env | cut -d= -f2-)"
   npx vercel login --token "$VERCEL_TOKEN"  # optional if not logged in yet
   npx vercel link --scope admin-rpts-projects --token "$VERCEL_TOKEN"
   ```
3. CLI will ask you to select or create a project. Choose the existing `mm-pwa-v2` project under the `admin-rpts-projects` scope. That interaction writes `.vercel/project.json` with `projectId` and `orgId` for future commands.
4. After linking, non-interactive deploys no longer fail with `missing_scope`.

If you cannot run an interactive terminal here, request the `.vercel/project.json` file from someone who can link the project, then place it under `/apps/web/.vercel` before running deploy commands.

## 3. Deploy command

Once the link exists, deploy with:

```bash
cd /mnt/d/mm-new-pwa/apps/web
VERCEL_TOKEN="$(grep '^VERCEL_TOKEN=' ../../.env | cut -d= -f2-)"
npx vercel deploy --prod --scope admin-rpts-projects --token "$VERCEL_TOKEN" --yes
```

- The `--scope` flag matches the required team and prevents `missing_scope` errors.
- Replace `--prod` with `--prebuilt` if you already built and want to skip `vercel build`.
- If you later need to rerun `vercel build` yourself, just run `npm run build` and ensure artifacts exist.

## 4. Post-deployment logging

1. Append `LIVE_LOG.md` with each major action (install, build, deploy) using:
   ```txt
   [HH:MM] Description — ✓/✗ result — next step
   ```
2. Update `PROGRESS.md` with the feature name (`Frontend production deploy`), status `✓ Done`, the Vercel URL (from CLI output), notes about any warnings, and completion timestamp.
3. Clear `STEERING.md` if it contains instructions; note blockers in `BLOCKED.md` if they occur during deployment.
4. Commit the dependency/build/deploy docs with a message such as `feat: fix deps for vercel build` and push to `dev`. This ensures CI picks up the same environment.

## 5. Troubleshooting

| Symptom | Fix |
| --- | --- |
| Vercel CLI says `missing_scope` even with `--scope` | Create `.vercel/project.json` by running `vercel link --scope admin-rpts-projects` interactively or on another machine. |
| `missing_scope` even during `link` | Ensure `VERCEL_TOKEN` is exported and valid, then re-run link with `--scope` + `--token`. If still failing, use `VERCEL_ORG_ID=team_SPURAaXYLYv8jRmxzYddXCTy` for the link command. |
| Build fails for `lucide-react` or `@apollo/client` | Add them to dependencies (done) and reinstall before building. |
| Husky hook cannot run | Install `husky` and run `npx husky install` after `npm install`. If still blocked, temporarily set `NPM_CONFIG_IGNORE_SCRIPTS=true` for install. |
| Postinstall `run-s` missing | Install `npm-run-all` as devDependency (already in package). |

## 6. Automation hints

- To script everything, create `/scripts/deploy-vercel.sh`:
  ```bash
  #!/usr/bin/env bash
  set -euo pipefail
  cd /mnt/d/mm-new-pwa/apps/web
  npm install
  npm run build
  token=$(grep '^VERCEL_TOKEN=' ../../.env | cut -d= -f2-)
  npx vercel deploy --prod --scope admin-rpts-projects --token "$token" --yes
  ```
- Make the script executable and run it from CI. Ensure the runner has access to the required tokens.

Deploys triggered by CI should also append logs to `LIVE_LOG.md` (either automatically or via manual summary) and update `PROGRESS.md` after the deployment completes.
