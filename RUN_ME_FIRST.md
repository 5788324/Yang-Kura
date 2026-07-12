# RUN_ME_FIRST

## 1. 确认版本与 Git

```powershell
node -p "require('./package.json').version"
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
git status --short
```

期望：

```text
version = 0.167.0-mvp129
branch = main
HEAD = origin/main = 316d8127d6d423a1d9e6930b8b804a3bac11140e
工作区 clean
```

## 2. 安装与稳定回归

```powershell
$env:NODE_OPTIONS="--max-old-space-size=8192"
npm ci --ignore-scripts --no-audit --no-fund
npm run verify:stable
```

`verify:all` 是兼容别名。MVP01～MVP111 历史 verifier 已归档，不作为发布门禁。

## 3. Windows 发布检查（需要时）

```powershell
npm run desktop:setup
npm run desktop:smoke-check:strict
npm run desktop:pack
npm run desktop:dist
npm audit --audit-level=high
```

## 4. 接手与任务提示词

先读 `AI_HANDOFF/00_READ_THIS_FIRST.md`。完整 Codex/DeepSeek 提示词放在 `AI_HANDOFF/`，不要要求用户在聊天中复制长提示词。

## 5. 当前禁止事项

- 不合入 MVP130。
- 不自动开发 MVP131。
- 不执行 `npm audit fix` 或盲目升级 Electron。
- 不对真实大库执行 move-only 测试。
- 不删除真实媒体、备份或用户 AppData。
- 不把历史归档重新移回活跃根目录。
