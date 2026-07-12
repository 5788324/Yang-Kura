# HANDOFF MVP-61 → MVP-62

当前版本：`0.100.0-mvp62`

MVP-62 修复 MVP-61 本机 Codex 回归报告中的剩余阻塞：

- `desktop:smoke-check:strict` Windows `.cmd` 直接 spawn 导致 `EINVAL`。
- `desktop:setup` 只 install 不 rebuild，Electron 缺 `path.txt / dist/electron.exe`。
- 本机 GUI 回归推荐 Node 22.12+ / npm 10.x。

新增：

- `scripts/setup-electron-desktop.mjs`
- `src/services/electronRegressionHardeningService.ts`
- `docs/CURRENT_ROADMAP_MVP62.md`
- `docs/ELECTRON_REGRESSION_HARDENING_MVP62.md`
- `scripts/verify-mvp62-electron-regression-hardening.mjs`

下一步：让 Codex 在本机用 Node 22.12+ / npm 10.x 重跑 GUI 回归。
