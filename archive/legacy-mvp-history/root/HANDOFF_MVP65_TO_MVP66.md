# HANDOFF MVP-65 → MVP-66

Version: `0.104.0-mvp66`

## 本轮完成

MVP-66 固定 Beta 0.1 GUI 全链路回归确认路径。

新增：

- `src/services/betaGuiRegressionService.ts`
- `docs/CURRENT_ROADMAP_MVP66.md`
- `docs/BETA_GUI_REGRESSION_MVP66.md`
- `scripts/verify-mvp66-beta-gui-regression.mjs`
- `PACKAGE_MANIFEST_MVP66_HANDOFF.txt`

UI anchor：

- 设置页：`mvp66-beta-gui-regression`
- 诊断页：`mvp66-beta-gui-regression`

## 验证

标准源码验证：

```bash
npm ci --ignore-scripts
npm run lint
npm run build:electron
npm run verify:mvp66-beta-gui-regression
npm run verify:all
npm run build
npm audit --audit-level=high
npm run desktop:smoke-check
npm run desktop:acceptance-plan
```

本机 GUI 回归：

```bash
npm run desktop:setup
npm run desktop:smoke-check:strict
npm run dev:electron
```

## 下一轮建议

MVP-67：真实样本回归缺陷修复。

不要进入 SQLite、下载器、元数据抓取、mpv、高级文件整理、批量重命名或大组件一次性拆分。
