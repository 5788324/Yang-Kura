# U39-D 雾光象牙浅色主题对比度

## 问题

U39 Windows 综合审计确认深色主题可读，但浅色主题存在系统性低对比度：

- 三级文字 `--yk-text-3` 在浅色表面上约为 2.8–3.5:1；
- 主强调色按钮的白字约为 4.16:1；
- success / warning / danger / info 被用作小字号文本时，多数组合低于 4.5:1；
- 旧 Tailwind 变量与 Beta 2 `--yk-*` Token 并存，只修一套会导致页面之间继续不一致。

## 决策

新增 `src/styles/theme-contrast-bridge.css`，作为主题迁移期的无障碍兼容层：

1. 只覆盖 `theme-mist-ivory`；
2. 同步新语义 Token 与旧变量；
3. 小字号文字和状态色对所有浅色表面至少达到 4.5:1；
4. 可交互边界对所有浅色表面至少达到 3:1；
5. 白字对主强调色及 Hover 色至少达到 4.5:1；
6. 原生下拉选项和键盘焦点继续使用同一浅色语义色。

## 当前颜色合同

| 用途 | Token | 值 | 最低目标 |
| --- | --- | --- | --- |
| 三级文字 | `--yk-text-3` | `#6f6055` | 4.5:1 |
| 主强调色 | `--yk-accent` | `#9c482f` | 文本 4.5:1；白字 4.5:1 |
| 强调 Hover | `--yk-accent-hover` | `#873b27` | 白字 4.5:1 |
| 成功 | `--yk-success` | `#456a50` | 4.5:1 |
| 警告 | `--yk-warning` | `#8a5b17` | 4.5:1 |
| 危险 | `--yk-danger` | `#9b4745` | 4.5:1 |
| 信息 | `--yk-info` | `#48667f` | 4.5:1 |
| 弱边界 | `--yk-border-subtle` | `#8f8074` | 3:1 |
| 强边界 | `--yk-border-strong` | `#78685c` | 3:1 |

## 验收

- `scripts/verify-u39d-light-theme-contrast.mjs`：解析最终 Token，计算 WCAG 相对亮度与对比度；
- `scripts/test-u39d-light-theme-contrast.mjs`：在真实 Electron 中加载雾光象牙，确认 html、body 和 AppRoot 主题一致，旧变量与新 Token 一致，并重复计算运行时对比度；
- `scripts/test-u30-ui-matrix.mjs`：继续覆盖三档窗口/DPI、页面横向溢出、Escape、焦点恢复和 reduced-motion；
- UI Fast Validation：执行 TypeScript、Renderer/Electron build、U30、U39-D 静态和 Electron 验收。

## 非范围

本轮不修改播放器状态、mpv/HTMLAudio、资源库授权、Index、导入器、安装器或主题信息架构。
