# CURRENT ROADMAP — MVP-65

版本：`0.103.0-mvp65`

主题：诊断页 undefined.map 运行时异常修复。

本轮只修 DiagnosticsPage 点击后触发的 `Cannot read properties of undefined (reading 'map')`。
不新增功能，不改扫描、写 index、播放内核、字幕读取、打包链路，不接 SQLite / 下载器 / 元数据抓取 / mpv，不删除 / 移动 / 重命名真实媒体文件。

验收：

```bash
npm ci --ignore-scripts
npm run lint
npm run build:electron
npm run verify:mvp65-diagnostics-map-guard
npm run verify:all
npm run build
npm audit --audit-level=high
```
