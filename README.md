# Yang-Kura

> 核心版本：`0.168.0-beta.1`  
> 代码事实来源：GitHub `main`  
> 当前阶段：U33 Beta 发布候选；目标 tag `v0.168.0-beta.1`

Yang-Kura 是个人使用的 Windows 本地音频媒体库，支持 ASMR/RJ 音声与普通音乐。技术栈为 React、Vite、TypeScript 和 Electron；当前数据路线为 Local JSON Index，SQLite 后置。

## 当前能力

- 本地目录选择、只读扫描、`library-index.json` 写入、备份和读取。
- 音声库、音乐库、首页、详情、歌单、队列和播放历史。
- HTMLAudio 播放，mpv 子进程后端与 HTMLAudio fallback。
- LRC、SRT、VTT、ASS 字幕读取。
- 图片、视频、文件外部打开和文件管理器定位。
- copy-only 导入闭环；move-only 小样本受控闭环。
- ASMR/音乐本地元数据覆盖、备份恢复和 DLsite 单 RJ Provider。
- 50,000 曲目生成数据性能基准。
- 缺失文件检查、受控索引清理、备份列表、恢复和维护历史。
- Windows portable 与 NSIS installer 打包链。

## 最近产品化增量

U02～U08 已完成：

- 干净配置不再注入演示媒体、收藏、最近播放和歌单。
- 首页、顶栏和一级导航改为真实产品状态。
- 中文页面语言、可见键盘焦点和系统减少动画支持。
- 弹窗及全屏播放层支持 Escape、焦点进入和焦点返回。
- 移除 ASMR 详情与全屏播放器中的伪造进度、字幕关联和演示书签。
- 播放器底栏开始使用现有主题 token。
- Pull Request 自动在 Windows runner 上执行 UI verifier、稳定回归和生产构建。

U02～U32 已完成产品化、播放器可靠性、三主题与窗口矩阵、导入事务、发布候选 UI、portable 和 NSIS 安装链验收；当前进入 U33 Beta 发布。

## 当前冻结决策

- **MVP129 仍是核心功能版本。** 后续 U 编号表示产品化、UI、结构和质量增量，不自动扩展大功能。
- **MVP130 下载器实验包单独封存，暂不合入。**
- 不根据旧待办自动继续下载器、SQLite 或 Player Core 大重构。
- 结构优化采用渐进方式：只拆当前正在维护、职责明确拥挤的模块。
- 当前阶段优先完成真实 Windows GUI 验收、定向缺陷修复和新 Beta 发布链。

## 常用验证

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run verify:stable
npm run build:electron
npm run desktop:smoke-check:strict
npm run desktop:pack
npm run desktop:dist
npm audit --audit-level=high
```

`npm run verify:all` 兼容地指向 `verify:stable`。MVP01～MVP111 的历史快照 verifier 已归档，不再作为发布门禁；当前 PR 还会自动运行 `scripts/verify-u*.mjs`。

## 安全边界

- Renderer 不接收 `absolutePath` 或 `file://`。
- 不自动覆盖、删除或清理真实媒体文件。
- move-only 仅限明确确认的小样本流程。
- 索引写入必须备份、复核和读回校验。
- Provider 不自动覆盖本地元数据。
- 下载器实验代码不在稳定候选中。

新对话从 [`AI_HANDOFF/00_READ_THIS_FIRST.md`](AI_HANDOFF/00_READ_THIS_FIRST.md) 开始。当前状态和剩余路线分别见 [`PROJECT_STATE.md`](PROJECT_STATE.md) 与 [`PROJECT_ROADMAP.md`](PROJECT_ROADMAP.md)。
