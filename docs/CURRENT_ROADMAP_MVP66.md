# CURRENT ROADMAP MVP-66 — Beta 0.1 GUI 全链路回归确认

Version: `0.104.0-mvp66`

## 本轮定位

MVP-66 不增加新功能，只把 Beta 0.1 候选包的 GUI 全链路回归路径固定下来。

目标：在 Node 22 / npm 10 环境下，用真实小样本资源库确认首页、音声库、音乐库、详情页、播放器、设置页、诊断页、播放、字幕、外部打开和安全边界是否具备 Beta 0.1 GUI PASS 条件。

## 本轮新增

- `src/services/betaGuiRegressionService.ts`
- `docs/BETA_GUI_REGRESSION_MVP66.md`
- `scripts/verify-mvp66-beta-gui-regression.mjs`
- `HANDOFF_MVP65_TO_MVP66.md`
- `PACKAGE_MANIFEST_MVP66_HANDOFF.txt`

## 后续路线

1. MVP-66：GUI 全链路回归确认。
2. MVP-67：真实样本回归缺陷修复。
3. MVP-68：Beta 0.1 使用说明 / 打包说明收口。
4. MVP-69：Beta 0.1 Release Candidate。

## 不做

- SQLite
- 下载器
- ASMR.one / DLsite / 网易云元数据抓取
- mpv
- 删除 / 移动 / 重命名真实媒体文件
- Renderer `absolutePath` / `file://`
- 大组件一次性拆分
