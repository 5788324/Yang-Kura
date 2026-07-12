# DeepSeek Review Prompt — MVP-77

把下面内容发给 DeepSeek / OpenCode 做对照验收。要求它只审查，不改源码。

```text
请审查 Yang-Kura MVP77 源码包，重点检查 MVP71～MVP76 的 UI 收口是否破坏主链路。

当前基线：
- package.json version 必须是 0.115.0-mvp77
- React + Vite + TypeScript + Electron
- Local JSON Index 优先，SQLite 后置
- Beta 0.1 主链路已经可用：选择目录 → 一键扫描并应用 → 音频播放 → 歌词读取 → 图片/视频外部打开

本轮只做验收，不改代码。

请执行：
1. npm ci --ignore-scripts
2. npm run lint
3. npm run build:electron
4. npm run verify:mvp77-packaged-regression-review
5. npm run build
6. npm audit --audit-level=high

如果 npm run verify:all 超时，记录超时点，不要乱改；分段补跑 MVP61～MVP77 verifier。

重点静态审查：
1. PlayerBar 进度条是否 clamp，是否避免 NaN / 超过 100%。
2. Dashboard 首页是否仍有明显工程区块可见。
3. AsmrLibrary / MusicLibrary 卡片是否有列宽、标题溢出、按钮拥挤风险。
4. DiagnosticsPage 是否默认折叠 MVP 历史 / verifier / IPC / Contract 信息。
5. 新增 MVP77 是否只增加验收清单和提示词，不接真实新功能。

严禁事项：
- 不接 SQLite
- 不接下载器
- 不接 ASMR.one / DLsite / 网易云元数据抓取
- 不接 mpv
- 不删除 / 移动 / 重命名真实媒体文件
- 不向 Renderer 暴露 absolutePath
- 不向 Renderer 暴露 file://
- 不改真实扫描 / 写 index / 播放内核链路

输出格式：
- 结论：PASS / NEEDS_FIX / STOP
- 命令结果
- UI 布局风险
- 是否发现安全边界破坏
- 建议下一步
```
