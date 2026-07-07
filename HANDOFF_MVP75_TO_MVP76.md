# HANDOFF — MVP-75 to MVP-76

Current version: `0.114.0-mvp76`

## 本轮完成

MVP-76 完成“音声库 / 音乐库卡片视觉统一”。本轮主要响应 UI 布局检查要求，修正媒体库卡片和歌曲行的拥挤、溢出和列宽问题。

## 新增文件

- `src/services/libraryCardLayoutPolishService.ts`
- `docs/CURRENT_ROADMAP_MVP76.md`
- `docs/LIBRARY_CARD_LAYOUT_UNITY_MVP76.md`
- `scripts/verify-mvp76-card-layout-unity.mjs`
- `HANDOFF_MVP75_TO_MVP76.md`
- `PACKAGE_MANIFEST_MVP76_HANDOFF.txt`

## 修改文件

- `src/components/AsmrLibrary.tsx`
- `src/components/MusicLibrary.tsx`
- `src/components/DiagnosticsPage.tsx`
- `src/services/index.ts`
- `package.json`
- `package-lock.json`
- `README.md`
- `PROJECT_STATE.md`
- `NEXT_CHAT_HANDOFF.md`
- `RUN_ME_FIRST.md`
- `docs/PROJECT_STATE.md`
- `docs/NEXT_CHAT_HANDOFF.md`
- `docs/RUN_ME_FIRST.md`
- `00_NEW_CHAT_START_HERE.md`
- `NEW_CHAT_PROMPT.md`
- `NEW_CHAT_PROMPT_FULL.md`
- `CODEX_MINIMAL_PROMPTS.md`

## 安全边界

- 不接 SQLite。
- 不接下载器。
- 不接 ASMR.one / DLsite / 网易云元数据抓取。
- 不接 mpv。
- 不删除 / 移动 / 重命名真实媒体文件。
- 不向 Renderer 暴露 absolutePath。
- 不向 Renderer 暴露 file://。
- 不改真实扫描 / 写 index / 播放内核链路。

## 建议下一轮

MVP-77：打包版回归验收清单更新，重点让用户在 Windows 打包版里验证 MVP71～MVP76 的 UI 收口没有破坏导入、播放、字幕和外部打开。
