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
branch = main
HEAD = origin/main
工作区 clean
package.json 版本与 PROJECT_STATE.md 当前核心版本一致
```

不要在长期文档中依赖固定 SHA。每次接手都记录当时实际 HEAD。工作区存在未提交改动时停止，不要 stash、reset 或覆盖用户工作。

## 2. 先读当前交接

```text
AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md
PROJECT_STATE.md
PROJECT_ROADMAP.md
AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md
AI_HANDOFF/00_READ_THIS_FIRST.md
```

当前阶段以 `PROJECT_STATE.md` 和最新 GitHub 状态为准。U02～U32 已完成，当前主线是 U33 Beta 发布；U27 的历史 Major 已在 U28 关闭。

## 3. 安装与稳定回归

```powershell
$env:NODE_OPTIONS="--max-old-space-size=8192"
npm ci --ignore-scripts --no-audit --no-fund
npm audit --audit-level=high
npm run verify:stable
npm run build:electron
```

`verify:all` 是兼容别名。MVP01～MVP111 历史快照 verifier 已归档，不作为当前发布门禁；当前 PR 还必须运行全部 `scripts/verify-u*.mjs` 和对应 Electron E2E。

## 4. Windows 发布检查

```powershell
npm run desktop:setup
npm run desktop:smoke-check:strict
npm run desktop:pack
npm run desktop:dist
```

U33 的版本、tag、资产名、prerelease 状态和发布顺序以 `release/u33-release-plan.json` 为准。PR 阶段只构建和验收；只有合入 `main` 后的 main-only publish job 可以创建 tag 与 Release。

## 5. 当前禁止事项

- 不合入 MVP130。
- 不自动启动完整 AI Agent、SQLite、OpenList/WebDAV、Player Core v2 或全局架构重写。
- 不执行 `npm audit fix` 或盲目升级 Electron。
- 不对真实媒体库执行测试性 move-only、清理、覆盖或批量写入。
- 不删除真实媒体、备份或用户 AppData。
- 不用 Demo 状态、配置注入或手工改 JSON 绕过真实 GUI 授权。
- 不把历史归档重新移回活跃根目录。
- 不要求用户运行命令、测试、排错或维护 Git。
