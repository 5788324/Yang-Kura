# RUN_ME_FIRST

先读：

```text
AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md
PROJECT_STATE.md
PROJECT_ROADMAP.md
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
npm run build
```

版本应为 `0.167.0-mvp129`，但 HEAD 必须以执行时最新 `origin/main` 为准，不得依赖旧固定 SHA。当前任务是先核对用户所说的 U28 修复是否已推送并合入，再按交接文档继续。MVP130 禁止合入。