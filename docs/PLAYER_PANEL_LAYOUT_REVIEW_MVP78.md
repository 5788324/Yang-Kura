# MVP-78 — 播放器大页 / 歌词页布局审查

版本：`0.116.0-mvp78`

## 背景

MVP-71 到 MVP-77 已经连续做了首页、播放栏、诊断页、音声库和音乐库的日常化收口。MVP-78 继续检查播放器大页：经典模式、黑胶模式和歌词模式。

## 已处理问题

1. 全屏播放页进度条增加 safe duration、finite guard 和 clamp。
2. 进度百分比被限制在 0～100，range value 被限制在 0～duration。
3. 无有效 duration 时进度拖动被禁用。
4. 顶部模式切换区允许换行，小窗口不横向溢出。
5. 黑胶 / 经典封面尺寸改为 viewport clamp，低高度窗口下自动缩小。
6. 底部控制栏小窗口下改为纵向堆叠，按钮允许换行。
7. 歌词正文增加最大宽度和安全 padding，长句不贴边。
8. 诊断页新增默认折叠的 MVP-78 播放器布局审查区。

## 锚点

- `mvp78-player-panel-layout-review`
- `mvp78-full-player-responsive-shell`
- `mvp78-player-header-wrap-safe`
- `mvp78-classic-visual-clamp`
- `mvp78-vinyl-size-clamp`
- `mvp78-lyrics-reading-width`
- `mvp78-bottom-control-safe-wrap`
- `mvp78-player-layout-modes`
- `mvp78-player-layout-guardrails`

## 验收命令

```bash
npm ci --ignore-scripts
npm run lint
npm run build:electron
npm run verify:mvp78-player-layout-review
npm run verify:all
npm run build
npm audit --audit-level=high
```

如果 `verify:all` 因环境耗时超时，记录超时点，并从后续 MVP verifier 分段补跑。

## 安全边界

- 不接 SQLite。
- 不删除 / 移动 / 重命名真实媒体文件。
- 不向 Renderer 暴露 absolutePath。
- 不向 Renderer 暴露 file://。
