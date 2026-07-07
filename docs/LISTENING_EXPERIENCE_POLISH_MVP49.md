# MVP-49 — 播放器与首页视觉精修

版本：`0.87.0-mvp49`

## 目标

MVP-49 继续把 Yang-Kura 从“工具面板”收成“中文本地音频播放器”。

本轮重点：

```text
首页听音频入口更轻
底部播放器状态更清楚
主界面继续少放工程信息
```

## 具体变化

### 1. 首页听音频入口

首页保留旧的 `mvp39-media-overview` 验证锚点，并新增：

```text
mvp49-home-media-focus
```

用于展示：

- 继续播放。
- 最近播放。
- 音声库。
- 音乐库。

这些卡片使用 `listeningExperiencePolishService` 统一生成，避免继续把文案和状态计算堆进 `Dashboard.tsx`。

### 2. 底部播放器状态条

播放器底栏新增：

```text
mvp49-player-status-strip
```

用于展示：

- 播放状态。
- 音声 / 音乐类型。
- 本地音频 / 示例音频来源。
- 字幕状态。

播放策略文案从“播放策略：...”缩短为“策略：...”，降低底栏文字压力。

### 3. 诊断页收口说明

诊断页新增：

```text
mvp49-listening-polish
```

该区块只说明本轮做了哪些 UI / 布局收口，不暴露主界面，也不新增真实文件能力。

## 没有做的事

本轮没有做：

- 不接 SQLite。
- 不接下载器。
- 不接 ASMR.one / DLsite / 网易云元数据抓取。
- 不接 mpv 后端。
- 不删除 / 移动 / 重命名真实媒体文件。
- 不暴露 absolutePath。
- 不暴露 file://。
- 不改真实扫描链路。
- 不改写 index 逻辑。
- 不改真实播放内核。
- 不改字幕读取逻辑。
- 不改打包逻辑。

## 验证

```bash
npm ci --ignore-scripts
npm run lint
npm run build:electron
npm run verify:all
npm run build
npm audit --audit-level=high
```
