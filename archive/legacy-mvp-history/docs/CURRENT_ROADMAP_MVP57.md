# CURRENT ROADMAP MVP-57

当前版本：`0.95.0-mvp57`

## 本轮目标

MVP-57 聚焦音声详情页右侧栏精修：把评分、听后状态、个人笔记、资源记录、字幕状态收成更用户向的本地听音面板。

## 本轮允许

- 新增 `asmrDetailSideRailService`。
- 右侧栏增加 `mvp57-asmr-side-rail`。
- 诊断页增加 `mvp57-asmr-detail-side-rail-review`。
- 更新 README / PROJECT_STATE / NEXT_CHAT_HANDOFF / RUN_ME_FIRST / docs 对应副本。
- 新增 verifier 并接入 `verify:all`。

## 本轮禁止

- 不接 SQLite。
- 不接下载器。
- 不接元数据抓取。
- 不接 mpv。
- 不改扫描、索引写入、播放内核、字幕读取链路。
- 不删除、移动、重命名真实媒体文件。
- 不向 Renderer 暴露 `absolutePath` 或 `file://`。
- 不做 `AsmrDetail.tsx` 一次性大拆分。

## 下一轮建议

MVP-58 可继续做设置页 / 关于页个人使用流程收口，或继续播放器 / 音声详情页小范围视觉修复。
