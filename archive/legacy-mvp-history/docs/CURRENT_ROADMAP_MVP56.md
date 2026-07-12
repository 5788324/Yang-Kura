# CURRENT ROADMAP — MVP-56

Current version: `0.94.0-mvp56`

## 本轮目标

MVP-56 做音声详情页摘要模型抽离与小范围 UI 收口。

目标不是大重构，而是让 `AsmrDetail.tsx` 不再继续堆详情摘要、音轨状态和路径文案判断。

## 已完成

- 新增 `src/services/asmrDetailSurfaceService.ts`。
- 音声详情页新增 `mvp56-asmr-detail-summary`。
- 音轨列表新增 `mvp56-asmr-track-summary`。
- 诊断页新增 `mvp56-asmr-detail-surface-review`。
- 默认 `F:\ASMR\...` 示例收成 `<资源库记录>/...`。
- 主界面“文件路径”文案收成“本地记录 / 资源库记录”。
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
- `AsmrDetail.tsx` 一次性大拆分

## 下一轮建议

MVP-57 可以继续低风险推进：

- 音声详情页右侧栏小范围 polish；或
- 音轨行组件拆分计划；或
- 歌单页 / 播放器回归小修。

仍不建议进入 SQLite、下载器、元数据抓取、mpv、高级文件整理、批量重命名。
