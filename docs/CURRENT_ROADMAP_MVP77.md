# CURRENT ROADMAP — MVP-77

Current version: `0.115.0-mvp77`

## 本轮定位

MVP-77 是 Beta 0.1 后的回归验收准备轮：**打包版回归验收清单 / UI 布局审查 / DeepSeek 对照验收提示词**。

用户当前在公司，不方便做人工 GUI 验收；本轮不扩功能，只把 MVP71～MVP76 的 UI 收口转成可复核的机器验证、静态布局检查、人工验收清单和 DeepSeek 对照审查提示词。

## 已完成

- 新增 `src/services/packagedRegressionReviewService.ts`。
- 诊断页新增 `mvp77-packaged-regression-review` 默认折叠区。
- 新增 `docs/PACKAGED_REGRESSION_REVIEW_MVP77.md`。
- 新增 `docs/DEEPSEEK_REVIEW_PROMPT_MVP77.md`。
- 新增 `scripts/verify-mvp77-packaged-regression-review.mjs` 并接入 `verify:all`。
- 新增 `HANDOFF_MVP76_TO_MVP77.md` 与 `PACKAGE_MANIFEST_MVP77_HANDOFF.txt`。

## 审查重点

- 播放栏进度条：不越界、不 NaN、拖拽 seek 稳定。
- 首页：日常入口优先，工程信息后置。
- 音声库 / 音乐库：卡片列宽、封面比例、长标题、状态换行、窄屏按钮区。
- 诊断页：MVP 历史和 verifier 细节默认折叠。
- DeepSeek / Codex 对照审查：只做验证，不改业务链路。

## 安全边界

- 不接 SQLite。
- 不接下载器。
- 不接 ASMR.one / DLsite / 网易云元数据抓取。
- 不接 mpv。
- 不删除 / 移动 / 重命名真实媒体文件。
- 不向 Renderer 暴露 absolutePath。
- 不向 Renderer 暴露 file://。
- 不改真实扫描 / 写 index / 播放内核链路。

## 下一轮建议

MVP-78：播放器歌词页 / 大播放器窄屏布局继续检查，重点看黑胶模式、歌词模式、右侧信息栏在不同窗口宽度下是否拥挤。
