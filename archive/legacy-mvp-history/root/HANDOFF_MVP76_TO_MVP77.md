# HANDOFF — MVP-76 to MVP-77

Current version: `0.115.0-mvp77`

## 本轮完成

MVP-77 完成“打包版回归验收清单 / UI 布局审查 / DeepSeek 对照验收提示词”。本轮不扩功能，主要用于用户当前不方便人工验收时，先把可机器检查和可交给 DeepSeek/Codex 的验收内容固定下来。

## 新增文件

- `src/services/packagedRegressionReviewService.ts`
- `docs/CURRENT_ROADMAP_MVP77.md`
- `docs/PACKAGED_REGRESSION_REVIEW_MVP77.md`
- `docs/DEEPSEEK_REVIEW_PROMPT_MVP77.md`
- `scripts/verify-mvp77-packaged-regression-review.mjs`
- `HANDOFF_MVP76_TO_MVP77.md`
- `PACKAGE_MANIFEST_MVP77_HANDOFF.txt`

## 修改文件

- `src/components/DiagnosticsPage.tsx`
- `src/services/index.ts`
- `package.json`
- `package-lock.json`
- `README.md`
- `PROJECT_STATE.md`
- `NEXT_CHAT_HANDOFF.md`
- `RUN_ME_FIRST.md`
- `docs/PROJECT_STATE.md`
- `docs/NEXT_CHAT_HANDOFF.md`
- `docs/RUN_ME_FIRST.md`
- `00_NEW_CHAT_START_HERE.md`
- `NEW_CHAT_PROMPT.md`
- `NEW_CHAT_PROMPT_FULL.md`
- `CODEX_MINIMAL_PROMPTS.md`

## 验收重点

- 播放栏进度条稳定性。
- 首页日常入口是否优先。
- 音声库 / 音乐库卡片布局是否仍有溢出风险。
- 诊断页历史信息是否默认折叠。
- DeepSeek 对照审查提示词是否明确“不改代码，只审查”。

## 安全边界

- 不接 SQLite。
- 不接下载器。
- 不接 ASMR.one / DLsite / 网易云元数据抓取。
- 不接 mpv。
- 不删除 / 移动 / 重命名真实媒体文件。
- 不向 Renderer 暴露 absolutePath。
- 不向 Renderer 暴露 file://。
- 不改真实扫描 / 写 index / 播放内核链路。

## 建议下一轮

MVP-78：播放器歌词页 / 大播放器窄屏布局继续检查。
