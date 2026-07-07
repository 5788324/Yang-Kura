# CURRENT ROADMAP — MVP-80 设置页 / 诊断页最终日常化检查

## 当前版本

```text
0.118.0-mvp80
```

## 本轮目标

MVP-80 只做设置页和诊断页的用户可见层级收口：

1. 设置页继续优先显示资源库入口、主题、隐私与文件安全说明。
2. 诊断页继续优先显示日常诊断摘要。
3. Scanner / Contract / Bridge / Dry-run / IPC / Stub / MVP 编号继续收进高级工具、AI 维护区或默认折叠历史区。
4. 不改真实扫描、写 index、播放内核、外部打开、字幕读取链路。

## 不做

```text
不接 SQLite
不接下载器
不接 ASMR.one / DLsite / 网易云元数据抓取
不接 mpv
不删除 / 移动 / 重命名真实媒体文件
不向 Renderer 暴露 absolutePath
不向 Renderer 暴露 file://
不改真实扫描 / 写 index / 播放内核链路
```

## 验收

```bash
npm ci --ignore-scripts
npm run lint
npm run build:electron
npm run verify:mvp80-settings-diagnostics-daily-finalize
npm run verify:all
npm run build
npm audit --audit-level=high
```
