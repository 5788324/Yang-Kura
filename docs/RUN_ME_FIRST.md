# RUN_ME_FIRST

先读：

```text
AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md
PROJECT_STATE.md
PROJECT_ROADMAP.md
AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md
```

然后执行：

```powershell
git status --short
git fetch origin --prune
git checkout main
git pull --ff-only origin main
git rev-parse HEAD
git status --short

$env:NODE_OPTIONS="--max-old-space-size=8192"
npm ci --ignore-scripts --no-audit --no-fund
npm audit --audit-level=high
npm run verify:stable
npm run build:electron
```

版本必须与根目录 `PROJECT_STATE.md` 一致，HEAD 必须以执行时最新 `origin/main` 为准，不得依赖旧固定 SHA。当前主线是 U33 Beta 发布；继续核对开放 PR、Actions、tags 和 Releases，完成 PR 门禁、合并、main-only prerelease 发布和资产回读。MVP130、SQLite、OpenList/WebDAV、Player Core v2 和完整 AI Agent继续冻结。
