# Codex：MVP119 最小复验与合入

请对 `0.157.0-mvp119` 做命令验证和 Windows Electron 快检。不要开发新功能，不重构，不扫描或操作真实大库。

重点确认：

- 首次查询单个 RJ 可以得到网络结果或明确错误。
- 第二次“查询（优先缓存）”命中缓存且不再次联网。
- 5 秒内连续“重新查询”被节流。
- 5 秒后“重新查询”可再次联网。
- 最近查询时间、缓存来源、缓存有效期显示正确。
- 清除缓存后当前预览仍保留；下一次普通查询重新联网。
- 网络失败时页面提示可粘贴标准 JSON。
- 候选信息不会自动保存，仍需填入表单并点击保存。
- 不显示 absolutePath/file://，不修改媒体文件，不接 SQLite。

命令：

```powershell
npm ci --ignore-scripts --no-audit --no-fund --prefer-offline --cache "G:\Codex\Yang Kura\.npm-cache"
npm run lint
npm run build:electron
npm run verify:mvp118-dlsite-single-rj-provider
npm run verify:mvp119-provider-cache-throttle
npm run test:importer:smoke
npm run build
npm audit --audit-level=high
```

PASS 后：

```powershell
git add .
git commit -m "feat: add MVP119 provider cache and throttling"
git push origin main
```
