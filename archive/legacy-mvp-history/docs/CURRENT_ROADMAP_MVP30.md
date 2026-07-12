# CURRENT_ROADMAP_MVP30

当前版本：`0.68.0-mvp30`

## 本轮定位

MVP-30 是 **打包版首次使用体验收口**，不是新业务功能轮。

目标是让用户打开 packaged app 后，不必理解 MVP / Contract / Stub / dry-run 等工程概念，也能完成：

```text
选择目录
→ 读取已有 library-index.json
→ 或一键扫描、写入、读取并应用
→ 去音声库 / 音乐库播放
```

## 已完成主链路

```text
真实目录选择
rootPathToken
只读 dry-run 扫描
写入 library-index.json
读取并应用 index
HTMLAudio 播放本地音频
LRC / SRT / VTT / ASS 字幕读取
视频 / 图片 / 文件外部打开
Windows portable / installer 打包
packaged app 黑屏修复
```

## MVP-30 新增

- 设置页新增「打包版快速导入」推荐入口。
- 已选目录后可直接点击「读取现有 index」。
- 首次使用或资源变更时可点击「一键扫描并应用」。
- 「一键扫描并应用」内部顺序为 dry-run → 生成写入预览 → 写入/备份 index → 读取并应用。
- 首页主横幅从原型话术改为本地媒体库使用导向。
- 新增打包版使用说明：`docs/PACKAGED_APP_USER_GUIDE_MVP30.md`。

## 本轮仍不做

```text
SQLite
下载器
联网元数据抓取
字幕生成 / 转录 / 翻译
内置视频播放器
批量删除 / 移动 / 重命名 / 整理媒体文件
网易云式播放器美术级精修
```

## 下一步建议

MVP-30 通过后，优先顺序建议：

1. MVP-30.1：打包版手工反馈修复。
2. UI-01：首页 / 设置页 / 诊断页去工程化。
3. Player-UI-01：播放器页参考网易云进行视觉精修。
4. Beta-01：SQLite 是否接入评估。
