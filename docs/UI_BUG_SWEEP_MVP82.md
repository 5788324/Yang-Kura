# UI_BUG_SWEEP_MVP82

## 摘要

MVP-82 根据 DeepSeek 对 MVP81 的 UI 审查结果做小范围 bugfix。

本轮目标不是继续美化，而是消除静态可确认的 UI 细节缺陷：无效 Tailwind 类、缺失动画定义和时长格式化容错。

## 已修复

| 类别 | 修复 |
|---|---|
| Tailwind scale | `scale-102` / `scale-104` 改为有效 `scale-105` |
| LyricsPanel 弱背景 | `bg-white/2` 改为 `bg-white/5` |
| 弹窗动画 | 新增 `--animate-scale-up` 和 `@keyframes scaleUp` |
| Dashboard 时长 | 非法时长显示 `--:--`，避免 `NaN:NaN` |
| AsmrLibrary 总时长 | 非法时长显示 `未统计`，避免 `NaN小时NaN分钟` |
| MusicLibrary / Playlist / AsmrDetail | 时长格式增加 finite guard |
| LyricsPanel | `formatTime` 增加 finite guard；进度条 clamp 保持不回退 |

## 复核说明

DeepSeek 提到 LyricsPanel `progressPercent` 未 clamp；在 MVP78 / MVP81 实体源码中已经存在 clamp：

```ts
const progressPercent = totalDuration > 0 ? clamp((currentDisplayProgress / totalDuration) * 100, 0, 100) : 0;
```

因此本轮没有重复改播放器进度逻辑，只通过 verifier 保证它不回退。

## 验证

新增：

```bash
npm run verify:mvp82-ui-bug-sweep
```

并接入：

```bash
npm run verify:all
```
