# PLAYER UI BUGFIX MVP-79

版本：`0.117.0-mvp79`

## 背景

DeepSeek 对 MVP-78 后的播放器组件做了静态审查和运行时验证，结论是 `NEEDS_FIX`，不是 `STOP`。主要问题集中在 PlayerBar 与 LyricsPanel 的 UI 细节：无效 Tailwind 类、死按钮、整栏误触发歌词页、LRC 小数秒解析不严谨、暗屏时钟不刷新。

## 修复清单

| 项目 | 处理 |
|---|---|
| Tailwind 无效类 | 替换 `zinc-850` / `zinc-750` / `sky-450` / `py-0.2` / `scale-102/103/97/98` |
| `animate-bounce-subtle` | 在 `src/index.css` 中补齐 theme token 和 keyframes |
| PlayerBar 根点击 | 移除整栏点击打开歌词页，仅保留封面 / 标题等明确入口 |
| More 死按钮 | 增加 toast 反馈和 title / aria-label，避免无响应 |
| LRC 解析 | 使用 `parseInt(fraction) / Math.pow(10, fraction.length)` |
| 睡前暗屏时钟 | 增加 `sleepClockText` 状态和 interval 刷新 |
| cover 背景图 | `currentTrack.coverUrl` 为空时不设置 backgroundImage |

## 安全说明

本轮只修 UI 表层问题，不改变真实链路：

```text
不接 SQLite
不接下载器
不接 ASMR.one / DLsite / 网易云元数据抓取
不接 mpv
不删除 / 移动 / 重命名真实媒体文件
不向 Renderer 暴露 absolutePath
不向 Renderer 暴露 file://
不改真实扫描 / 写 index / 播放内核链路
```

## 验证

新增：

```bash
npm run verify:mvp79-player-ui-bugfix
```

建议整体验证：

```bash
npm ci --ignore-scripts
npm run lint
npm run build:electron
npm run verify:mvp79-player-ui-bugfix
npm run build
npm audit --audit-level=high
```
