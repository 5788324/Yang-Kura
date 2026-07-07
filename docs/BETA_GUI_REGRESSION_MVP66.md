# MVP-66 — Beta 0.1 GUI 全链路回归确认

Version: `0.104.0-mvp66`

## 背景

MVP-65 已修复诊断页 `Cannot read properties of undefined (reading 'map')` 问题，诊断页可正常进入。MVP-66 将项目推进到 Beta 0.1 GUI 全链路回归确认。

## 回归命令

```bash
node -v
npm -v
npm ci --ignore-scripts
npm run verify:all
npm run build
npm run desktop:setup
npm run desktop:smoke-check:strict
npm run dev:electron
```

## GUI 检查项

- 首页能打开，不白屏。
- 音声库能打开。
- 音乐库能打开。
- 歌单页能打开。
- 播放器底栏正常显示。
- 设置页能打开，并显示 `mvp66-beta-gui-regression`。
- 诊断页能打开，并显示 `mvp66-beta-gui-regression`。
- 不再出现 `mvp64-diagnostics-runtime-fallback`。
- 不再出现 `Cannot read properties of undefined`。

## 真实小样本资源库

建议使用真实小样本资源库，而不是一开始用完整大库：

- 1 个 ASMR / 音声目录，包含 1～3 个音频和可选字幕。
- 1 个音乐目录，包含 1～2 个音频和可选歌词。
- 可包含图片 / 视频 / 文本，用于确认外部打开。

流程：

1. 选择目录。
2. dry-run scan。
3. 写入 / 备份 `library-index.json`。
4. 读取 index。
5. 播放音频。
6. 读取 LRC / SRT / VTT / ASS 字幕，或显示明确空状态。
7. 外部打开视频 / 图片 / 文件夹。

## PASS 标准

- GUI 页面连续切换稳定。
- 诊断页正常显示，不黑视图，不进入 fallback。
- 主界面不直接显示真实盘符路径或 `file://`。
- Renderer 不接收 `absolutePath`。
- 无删除 / 移动 / 重命名真实媒体文件入口。
- 发现问题只记录到 MVP-67，不在 MVP-66 扩功能。

## 安全边界

- 不接 SQLite。
- 不接下载器。
- 不接 ASMR.one / DLsite / 网易云元数据抓取。
- 不接 mpv。
- 不删除 / 移动 / 重命名真实媒体文件。
- 不改真实扫描 / 写 index / 播放内核链路。
