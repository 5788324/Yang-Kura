# U30 日常 UI、三主题、窗口、DPI 与键盘验收

## 结论

```text
AUTOMATED GO
```

U30 按个人自用项目快速通道，将多个相关低风险 UI 问题合并在一轮处理。验收使用 Windows GitHub Actions、真实 Electron 窗口和 Chromium DevTools Protocol 自动完成，不需要用户或 Codex 手工测试。

## 已完成

- 现代持久化队列恢复时，旧版“秒级断点续播”提示不再重复出现。
- 播放队列支持 Escape 关闭，并把焦点返回队列触发按钮。
- 全屏歌词播放器继续支持 Escape 关闭。
- 侧栏、主内容区和 PlayerBar 针对 1040×680 最小窗口收紧布局。
- 窄窗口隐藏次要 PlayerBar 控件，但保留播放主控和真实资源库状态。
- 顶栏资源状态在窄窗口只截断，不使用 `display:none`。
- 全局 `focus-visible` 和 `prefers-reduced-motion` 合同完成。

## 自动窗口与主题矩阵

| 主题 | 视口 | deviceScaleFactor | 结果 |
|---|---:|---:|---|
| dark | 1040×680 | 1.00 | PASS |
| acrylic-mist | 1280×800 | 1.25 | PASS |
| ocean-drops | 1600×900 | 1.50 | PASS |

每个场景检查：

- 页面无横向文档溢出；
- 根容器保持在视口内；
- 侧栏保持可操作宽度；
- PlayerBar 完整可见；
- 首页、音声库、音乐库、歌单和设置页可切换；
- 关键截图成功生成。

## 键盘与状态真实性

自动验证：

```text
现代队列恢复
→ 旧续播提示不存在
→ 打开播放队列
→ Escape 关闭
→ 焦点返回队列按钮
→ 打开全屏歌词
→ Escape 关闭
→ reduced-motion 抑制持续装饰动画
```

最初的紧凑布局曾隐藏整个资源库状态标签，U28 回归因此发现“尚未选择资源库”不可见。最终实现改为文本截断，并重新通过 U28、U29、U30 三套 Electron E2E。

## 最终验证

正式 HEAD 通过：

- high / critical 依赖审计；
- TypeScript；
- Renderer 与 Electron 构建；
- U28 资源库 Electron E2E；
- U29 播放器 Electron E2E；
- U30 UI 与可访问性矩阵；
- 全部 `verify-u*.mjs`；
- `npm run verify:stable`；
- 最终生产构建。

## 永久回归合同

保留：

- `scripts/test-u30-ui-matrix.mjs`
- `scripts/verify-u30-ui-fast-track.mjs`
- `.github/workflows/branch-validation.yml` 中的 U30 矩阵步骤

U31 及后续改动必须继续通过 U28～U30 三套 Electron 回归。
