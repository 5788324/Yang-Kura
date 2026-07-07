# MVP-52 — 资源库浏览回归修复

Version: `0.90.0-mvp52`

## 目标

本轮只做音声库 / 音乐库浏览层的 Beta 回归修复，不推进后端能力。

重点：

```text
音声库空状态更清楚
音乐库曲目信息去重
浏览摘要更稳定
诊断页记录本轮边界
```

## 新增文件

```text
src/services/libraryBetaRegressionPolishService.ts
scripts/verify-mvp52-library-regression-polish.mjs
docs/CURRENT_ROADMAP_MVP52.md
docs/LIBRARY_REGRESSION_POLISH_MVP52.md
HANDOFF_MVP51_TO_MVP52.md
PACKAGE_MANIFEST_MVP52_HANDOFF.txt
```

## UI 锚点

```text
mvp52-asmr-beta-regression
mvp52-music-beta-regression
mvp52-library-regression-polish
```

## 实际修复

1. 音声库在无结果时使用更明确的中文空状态。
2. 音声库筛选摘要增加轻量状态 chip，说明当前浏览方式、结果数量和筛选状态。
3. 音乐库筛选摘要增加轻量状态 chip，说明当前视图、结果数量和筛选状态。
4. 音乐库曲目副标题通过 `getTrackSecondaryLine(track)` 生成，避免艺术家 / 专辑重复显示。
5. 诊断页新增本轮回归修复说明。

## 不变范围

本轮不做：

- 不接 SQLite。
- 不接下载器。
- 不接 ASMR.one / DLsite / 网易云元数据抓取。
- 不接 mpv。
- 不改扫描链路。
- 不改 `library-index.json` 写入 / 读取链路。
- 不改 HTMLAudio 播放内核。
- 不改字幕读取链路。
- 不删除 / 移动 / 重命名真实媒体文件。
- 不向 Renderer 暴露 `absolutePath`。
- 不向 Renderer 暴露 `file://`。

## 验证

```bash
npm ci --ignore-scripts
npm run lint
npm run build:electron
npm run verify:all
npm run build
npm audit --audit-level=high
```
