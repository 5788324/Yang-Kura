# RUN_ME_FIRST

## 1. 确认工作区与最新 Git

```powershell
git status --short
git fetch origin --prune
git checkout main
git pull --ff-only origin main
node -p "require('./package.json').version"
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
git log -5 --oneline --decorate
git status --short
```

期望：

```text
version = 0.167.0-mvp129
branch = main
HEAD = origin/main
工作区 clean
```

不要在长期文档中依赖固定 SHA。每次接手都记录当时实际 HEAD。

工作区存在未提交改动时停止，不要 stash、reset 或覆盖用户工作。

## 2. 先读当前交接

```text
AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md
AI_HANDOFF/00_READ_THIS_FIRST.md
PROJECT_STATE.md
PROJECT_ROADMAP.md
```

当前路线是 U28 资源库授权、真实 Index、浏览与播放闭环。用户反馈问题可能已推送修复，因此必须先核对最新提交、分支和 PR。

## 3. 安装与稳定回归

```powershell
$env:NODE_OPTIONS="--max-old-space-size=8192"
npm ci --ignore-scripts --no-audit --no-fund
npm audit --audit-level=high
npm run verify:stable
npm run build
```

`verify:all` 是兼容别名。MVP01～MVP111 历史 verifier 已归档，不作为当前发布门禁。

## 4. Windows 发布检查（仅在路线要求时）

```powershell
npm run desktop:setup
npm run desktop:smoke-check:strict
npm run desktop:pack
npm run desktop:dist
```

U28 首先完成资源库真实闭环；不要提前把完整安装发布链当作 U28 的替代验收。

## 5. 当前禁止事项

- 不合入 MVP130。
- 不自动启动完整 AI Agent、SQLite、OpenList/WebDAV 或 Player Core v2。
- 不执行 `npm audit fix` 或盲目升级 Electron。
- 不对真实大库执行 move-only、清理、覆盖或批量写入。
- 不删除真实媒体、备份或用户 AppData。
- 不用 Demo 状态、配置注入或手工改 JSON 绕过真实 GUI 授权。
- 不把历史归档重新移回活跃根目录。