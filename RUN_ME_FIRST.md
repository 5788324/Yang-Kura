# RUN_ME_FIRST

新对话 / 新机器接手 Yang-Kura 时，先做下面这些。

## 1. 确认版本

```bash
node -p "require('./package.json').version"
```

期望：

```text
0.146.0-mvp108
```

## 2. 安装依赖

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

## 3. 最小验证

```bash
npm run lint
npm run build:electron
npm run verify:mvp108-importer-final-regression-checklist
npm run test:importer:smoke
npm run build
npm audit --audit-level=high
```

## 4. 当前不要做

```text
不要开下载器
不要开 SQLite
不要开 mpv
不要做大批量 move
不要自动删除 / 覆盖 / 清理源目录
不要把工程说明重新堆回主界面
```

## 5. 继续前先读

```text
PROJECT_STATE.md
PROJECT_ROADMAP.md
NEXT_CHAT_HANDOFF.md
docs/PROJECT_OVERVIEW.md
docs/IMPORTER_SMOKE_TEST_MVP108.md
```
