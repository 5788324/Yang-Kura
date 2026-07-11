# RUN_ME_FIRST

新对话 / 新机器接手 Yang-Kura 时，先做下面这些。

## 1. 确认版本

```bash
node -p "require('./package.json').version"
```

期望：

```text
0.158.0-mvp120
```

## 2. 确认 GitHub 基线

```text
GitHub main 当前正式基线：0.146.0-mvp108 / 2e4a4aa
MVP109～MVP113：待合入 UI 日常化与审计修复整理包
```

## 3. 安装依赖

Windows 主仓库建议使用仓库内缓存：

```powershell
$repoRoot = "G:\Codex\Yang Kura"
$env:NPM_CONFIG_CACHE = "$repoRoot\.npm-cache"
$env:npm_config_cache = "$repoRoot\.npm-cache"

npm ci --ignore-scripts --no-audit --no-fund --prefer-offline --cache "$repoRoot\.npm-cache"
```

临时环境可用：

```bash
npm ci --ignore-scripts --no-audit --no-fund --prefer-offline --cache .npm-cache
```

## 4. 最小验证

```bash
npm run lint
npm run build:electron
npm run verify:mvp108-importer-final-regression-checklist
npm run verify:mvp109-ui-engineering-panel-cleanup
npm run verify:mvp110-global-daily-ui-cleanup
npm run verify:mvp111-ui-cleanup-closeout-baseline-sync
npm run verify:mvp112-ui-audit-bugfix
npm run verify:mvp113-accessibility-label-hotfix
npm run verify:mvp114-local-metadata-overrides
npm run verify:mvp115-music-metadata-management
npm run test:importer:smoke
npm run build
npm audit --audit-level=high
```

## 5. 当前不要做

```text
不要开下载器
不要开 SQLite
不要开 mpv
不要做大批量 move
不要自动删除 / 覆盖 / 清理源目录
不要把工程说明重新堆回主界面
```

## 6. 继续前先读

```text
PROJECT_STATE.md
PROJECT_ROADMAP.md
NEXT_CHAT_HANDOFF.md
docs/UI_CLEANUP_CLOSEOUT_BASELINE_SYNC_MVP111.md
```


## MVP112 UI 审计修复

当前整理包版本为 `0.150.0-mvp112`。已根据 Codex GUI 审计修复绝对路径显示、下载页重复 key、切页滚动、导入器首屏、诊断页默认负载和音乐库无障碍问题。GitHub main 的已知正式基线仍需以实际仓库 HEAD 为准。

## MVP113 无障碍标签热修复

当前整理包版本为 `0.151.0-mvp113`。Codex 对 MVP112 复验时确认主要修复均通过，仅剩音乐库与音声库的可访问标签仍包含 MVP76 工程文案。本轮已将其改为“音乐库歌曲列表”“音乐专辑列表”“音声作品列表”，不改布局或真实业务链路。GitHub main 当前仍为 `0.146.0-mvp108 / 2e4a4aa`，待 Codex 复验后统一提交 MVP109～MVP113。

MVP114 快速验证：

```bash
npm run lint
npm run build:electron
npm run verify:mvp112-ui-audit-bugfix
npm run verify:mvp113-accessibility-label-hotfix
npm run verify:mvp114-local-metadata-overrides
npm run build
```

## MVP119 重点验证

```bash
npm run build:electron
npm run verify:mvp118-dlsite-single-rj-provider
npm run verify:mvp119-provider-cache-throttle
```


## MVP120：DLsite 查询总截止时间热修复

单个 RJ 查询的默认 12 秒现在是整个查询的总预算。最多 6 个候选 URL 共享剩余时间，不再发生 6 × 12 秒的串行等待。
