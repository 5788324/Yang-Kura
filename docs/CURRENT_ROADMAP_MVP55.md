# CURRENT ROADMAP — MVP-55

Current version: `0.93.0-mvp55`

## 本轮目标

MVP-55 做组件体检与低风险结构清理计划，同时补一个设置页维护提示和诊断页完整组件体检区块。

本轮不是大重构。

## 已完成

- 新增 `src/services/componentHealthReviewService.ts`。
- 设置页关于页新增 `mvp55-settings-component-health`。
- 诊断页新增 `mvp55-component-health-review`。
- 记录主要页面组件体积、风险和后续动作。
- 固定低风险清理策略：先抽 service，不一次性拆大组件。
- 新增 verifier 并接入 `verify:all`。

## 本轮继续不做

- SQLite
- 下载器
- ASMR.one / DLsite / 网易云元数据抓取
- mpv 后端
- 真实扫描链路改动
- `library-index.json` 写入 / 读取链路改动
- HTMLAudio 播放内核改动
- 字幕读取链路改动
- 打包逻辑改动
- 删除、移动、重命名真实媒体文件
- 向 Renderer 暴露 `absolutePath` 或 `file://`

## 下一轮建议

MVP-56 可以继续做低风险任务：

- 设置页 / 关于页文案继续收口；或
- 播放器 / 首页小范围视觉 polish；或
- 音声详情页摘要模型抽离；或
- 打包版人工回归后的缺陷修复。

仍不建议进入 SQLite、下载器、元数据抓取、mpv、高级文件整理、批量重命名。
