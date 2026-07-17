# RUN_ME_FIRST

仅供 AI/Codex 环境使用，用户无需运行。

```bash
git pull --ff-only origin main
npm ci --ignore-scripts --no-audit --no-fund
npm rebuild electron
npm run patch:electron-builder
npm run lint
npm run build
npm run build:electron
npm run verify:stable
```

接手前确认：

- `package.json` 版本与 `PROJECT_STATE.md` 当前核心版本一致；
- 当前版本应为 `0.169.0-beta.2`；
- Beta 2 已发布并完成远端资产校验；
- U38-A Queue/History/Persistence 与 U38-B Controller/Backend 分离已完成；
- 当前主线是 U38-C Subtitle loader 与字幕状态；
- 代码来自最新 `origin/main`。
