# CODEX_MINIMAL_PROMPTS

Codex 额度少，非必要不安排。

只有在需要本机实机验收 / Git 合并 / 打包检查时才使用 Codex。需要 Codex 时，必须在同一轮回复中直接给完整提示词，不分两轮补。

## 当前最小命令

```powershell
$repoRoot = "G:\Codex\Yang Kura"
$env:NPM_CONFIG_CACHE = "$repoRoot\.npm-cache"
$env:npm_config_cache = "$repoRoot\.npm-cache"

npm ci --ignore-scripts --no-audit --no-fund --prefer-offline --cache "$repoRoot\.npm-cache"
npm run lint
npm run build:electron
npm run verify:mvp108-importer-final-regression-checklist
npm run verify:mvp109-ui-engineering-panel-cleanup
npm run verify:mvp110-global-daily-ui-cleanup
npm run verify:mvp111-ui-cleanup-closeout-baseline-sync
npm run test:importer:smoke
npm run build
npm audit --audit-level=high
```

## Scope

For MVP111 merge, Codex should only validate commands, commit, and push if requested. It should not implement new features.
