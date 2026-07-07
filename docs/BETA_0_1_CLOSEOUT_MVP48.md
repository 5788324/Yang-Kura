# Yang-Kura MVP-48 — Beta 0.1 阶段收口

Version: `0.86.0-mvp48`

## 收口目标

MVP-48 将 Yang-Kura 当前阶段固定为 **个人可用 Beta 0.1** 基线。

它不是功能扩张轮，而是确认：

```text
现有本地媒体库链路可以继续作为稳定基线；
后续工作应优先做 UI / 播放器 / 浏览体验打磨；
SQLite、下载器、元数据抓取、mpv 继续后置。
```

## 当前可用主链路

- 选择本地资源库目录。
- 只读 dry-run 扫描。
- 写入 / 备份 `library-index.json`。
- 读取 `library-index.json` 到音声库 / 音乐库。
- 播放本地音频。
- 读取 LRC / SRT / VTT / ASS 字幕。
- 视频 / 图片 / 文件夹外部打开。
- 最近播放、继续播放、队列、歌单持久化。
- 本地封面读取与 fallback 封面。
- Windows 打包链路与打包版回归验收清单。

## Beta 回归重点

1. 打包版正常启动，不黑屏。
2. 首页、设置页、诊断页可进入。
3. 重新选择同一个资源库后可读取已有 index。
4. 音声库 / 音乐库显示真实记录。
5. 至少一个本地音频可播放、暂停、继续播放。
6. 同名字幕可以显示。
7. 视频 / 图片 / 文件夹外部打开正常。
8. 主界面不显示原始 absolutePath 或 file://。

## 本轮代码变化

新增：

```text
src/services/betaCloseoutService.ts
scripts/verify-mvp48-beta-closeout.mjs
docs/CURRENT_ROADMAP_MVP48.md
docs/BETA_0_1_CLOSEOUT_MVP48.md
HANDOFF_MVP47_TO_MVP48.md
PACKAGE_MANIFEST_MVP48_HANDOFF.txt
```

更新：

```text
src/components/DiagnosticsPage.tsx
src/services/index.ts
package.json
README.md
PROJECT_STATE.md
NEXT_CHAT_HANDOFF.md
RUN_ME_FIRST.md
docs/PROJECT_STATE.md
docs/NEXT_CHAT_HANDOFF.md
docs/RUN_ME_FIRST.md
00_NEW_CHAT_START_HERE.md
NEW_CHAT_PROMPT.md
NEW_CHAT_PROMPT_FULL.md
```

## 本轮没有做

- 不接 SQLite。
- 下载器。
- ASMR.one / DLsite / 网易云元数据抓取。
- mpv 后端。
- 不删除 / 移动 / 重命名真实媒体文件。
- 暴露 absolutePath 给 Renderer。
- 暴露 file:// 给 Renderer。
- 改扫描、索引写入、播放、字幕、打包核心逻辑。
