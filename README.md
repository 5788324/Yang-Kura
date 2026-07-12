# Yang-Kura

> 当前稳定候选：`0.167.0-mvp129`  
> GitHub `main`：`0.158.0-mvp120` / `55e33b3`  
> Round 4 Windows 发布门禁：**PASS**

Yang-Kura 是个人使用的 Windows 本地音频媒体库，支持 ASMR/RJ 音声与普通音乐。技术栈为 React、Vite、TypeScript 和 Electron；当前数据路线为 Local JSON Index，SQLite 后置。

## 当前能力

- 本地目录选择、只读扫描、`library-index.json` 写入/备份/读取。
- 音声库、音乐库、首页、详情、歌单、队列和播放历史。
- HTMLAudio 播放，mpv 子进程后端与 HTMLAudio fallback。
- LRC、SRT、VTT、ASS 字幕读取。
- 图片、视频、文件外部打开和文件管理器定位。
- copy-only 导入闭环；move-only 小样本受控闭环。
- ASMR/音乐本地元数据覆盖、备份恢复和 DLsite 单 RJ Provider。
- 50,000 曲目生成数据性能基准。
- 缺失文件检查、受控索引清理、备份列表、恢复和维护历史。
- Windows portable 与 NSIS installer 打包。

## 当前冻结决策

- **MVP129 是准备合入 GitHub 的稳定候选。**
- **MVP130 下载器实验包单独封存，暂不合入。**
- 不继续 MVP131，不继续扩展下载器。
- 下一步先完成稳定包整理、Git 合入和真实日常使用观察。
- SQLite、系统媒体控制、批量元数据和下载生态均后置，只有明确需要时再启动。

## 验证

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run verify:stable
npm run desktop:setup
npm run desktop:smoke-check:strict
npm run desktop:pack
npm run desktop:dist
npm audit --audit-level=high
```

`npm run verify:all` 现在兼容地指向 `verify:stable`。MVP01～MVP111 的历史快照 verifier 已归档，不再作为发布门禁。

## 安全边界

- Renderer 不接收 `absolutePath` 或 `file://`。
- 不自动覆盖、删除或清理真实媒体文件。
- move-only 仅限明确确认的小样本流程。
- 索引写入必须备份、复核和读回校验。
- Provider 不自动覆盖本地元数据。
- 下载器实验代码不在稳定候选中。

新对话从 [`00_NEW_CHAT_START_HERE.md`](00_NEW_CHAT_START_HERE.md) 开始。历史材料位于 `archive/legacy-mvp-history/`。
