# Yang-Kura Current Roadmap — MVP-23

当前版本：`0.61.0-mvp23`。

当前主线：

```text
React + Vite + TypeScript
+ Electron shell
+ Tokenized root
+ 只读 dry-run scanner
+ library-index.json preview
+ confirmed library-index.json write
```

## 本轮状态

MVP-23 已允许用户主动确认后写入 `library-index.json`。

流程：

```text
选择目录
→ rootPathToken
→ 只读 dry-run
→ 生成 index 写入预览
→ 用户确认
→ 写入 library-index.json
→ 如有旧文件先生成 library-index.backup-*.json
→ 读回校验 schemaVersion / roots / collections / tracks
```

## 个人项目实用边界

本项目是个人本地媒体库，不商业化，不公开分发资源。当前边界调整为：

- 允许用户主动选择目录后读取目录项。
- 允许用户确认后在所选目录写入 `library-index.json`。
- 不继续卡死所有真实文件访问。

仍禁止：

- 删除媒体文件。
- 移动媒体文件。
- 重命名媒体文件。
- 批量修复真实文件。
- 返回 `absolutePath` 给 Renderer。
- 返回 `file://` 给 Renderer。
- 接 SQLite。
- 联网抓元数据。

## 下一步

MVP-24：UI 读取真实 `library-index.json`，让音声库 / 音乐库开始显示真实资源。

后续：

```text
MVP-25：HTMLAudio 本地音频播放
MVP-26：LRC / 字幕读取
MVP-27：视频 / 图片外部打开
MVP-28：Windows 打包
Beta：UI 精修，重点参考网易云播放器页和首页媒体感
```
