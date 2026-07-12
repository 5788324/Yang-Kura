# RUN_ME_FIRST

```powershell
$env:NODE_OPTIONS="--max-old-space-size=8192"
npm ci --ignore-scripts --no-audit --no-fund
npm run verify:stable
npm run desktop:setup
npm run desktop:smoke-check:strict
```

版本应为 `0.167.0-mvp129`。MVP130 禁止合入。
