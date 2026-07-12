# RUN_ME_FIRST

```powershell
$env:NODE_OPTIONS="--max-old-space-size=8192"
npm ci --ignore-scripts --no-audit --no-fund
npm run verify:stable
```

版本应为 `0.167.0-mvp129`，GitHub main 应为 `316d8127d6d423a1d9e6930b8b804a3bac11140e`。先读 `AI_HANDOFF/00_READ_THIS_FIRST.md`；MVP130 禁止合入。
