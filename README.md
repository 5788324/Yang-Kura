# Yang-Kura

> 当前稳定发布：`0.168.0-beta.1`  
> 发布 tag：`v0.168.0-beta.1`  
> 代码事实来源：GitHub `main`  
> 当前阶段：Beta 1 已完成，准备 Beta 2 架构、代码质量与 UI 系统重构

Yang-Kura 是个人使用的 Windows 本地音频媒体库，面向 ASMR / RJ 音声与普通本地音乐。技术栈为 React、Vite、TypeScript 和 Electron；当前媒体库数据路线继续使用 Local JSON Index，SQLite 后置。

## 当前能力

- 本地目录授权、扫描、`library-index.json` 写入、备份和读取；
- 音声库、音乐库、首页、详情、歌单、队列和播放历史；
- HTMLAudio、mpv 子进程后端及自动 fallback；
- LRC、SRT、VTT、ASS 字幕；
- 图片、视频、文本和文件外部打开及文件管理器定位；
- copy-only 导入闭环与受控 move-only；
- 本地元数据覆盖、备份恢复和 DLsite 单 RJ Provider；
- 缺失文件检查、受控索引清理、备份恢复和维护历史；
- 50,000 曲目生成数据性能基准；
- Windows portable、NSIS、安装、重复安装、卸载和用户数据保留；
- GitHub prerelease、SHA-256 和远端发布资产冻结校验。

## Beta 1 状态

`0.168.0-beta.1` 已完成：

- U28 资源库授权和真实 Index 闭环；
- U29 播放器、续播、队列、完成策略和字幕全流程；
- U30 三主题、窗口、DPI、键盘、焦点和 reduced-motion；
- U31 导入器事务、失败清理和回滚；
- U32 发布候选 UI、portable、NSIS、安装升级卸载；
- U33 tag、prerelease、资产、SHA-256 和远端回读。

发布资产和目标提交已记录在 `release/u33-publication-state.json`，后续 main 提交不得改变已发布 Beta 1 的固定资产。

## 当前主线：Beta 2

Beta 2 目标版本为 `0.169.0-beta.2`。

本阶段不增加大型业务功能，统一处理：

1. 代码结构、模块边界、IPC、类型、状态、错误、测试和文档治理；
2. Design Token、深浅主题、App Shell、核心页面、三种播放器、动画和真实功能入口的 UI 重写。

执行路线：

```text
U34 代码库与 UI 联合审计
→ U35 设计系统、基础组件和 App Shell
→ U36 契约、状态和 IPC 边界
→ U37 首页、音声库、详情和音乐库
→ U38 PlayerBar、经典、黑胶、歌词和队列
→ U39 导入器、设置、AI 维护和二级流程
→ U40 清理、质量、兼容和 Beta 2 发布
```

详细文档：

- [`PROJECT_STATE.md`](PROJECT_STATE.md)：当前状态；
- [`docs/PROJECT_PROGRESS.md`](docs/PROJECT_PROGRESS.md)：进度与后续安排；
- [`docs/BETA2_MASTER_PLAN.md`](docs/BETA2_MASTER_PLAN.md)：Beta 2 总体计划；
- [`docs/ARCHITECTURE_QUALITY_PLAN.md`](docs/ARCHITECTURE_QUALITY_PLAN.md)：架构与代码质量规则；
- [`docs/DESIGN.md`](docs/DESIGN.md)：UI 设计系统和验收规则；
- [`AI_HANDOFF/00_READ_THIS_FIRST.md`](AI_HANDOFF/00_READ_THIS_FIRST.md)：新对话入口。

## Beta 2 前冻结项

- 正式下载器和 MVP130 扩展；
- SQLite 全面迁移；
- OpenList / WebDAV / 云同步；
- 新大型 Provider；
- 转录 Worker 正式集成；
- Player Core v2 或更换播放内核；
- 插件平台和其他大型功能。

大功能将在 Beta 2 发布并完成真实使用观察后重新排序。

## 常用验证

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm audit --audit-level=high
npm run build:electron
npm run verify:stable
npm run build
npm run desktop:smoke-check:strict
npm run desktop:pack
npm run desktop:dist
```

PR 继续运行 U28～U32 Electron E2E、专项 verifier、稳定回归、生产构建和相关 Windows 打包门禁。

## 安全边界

- Renderer 不接收或持久化 absolutePath、file:// 和临时媒体 URL；
- 不自动覆盖、删除、移动或清理真实媒体文件；
- move-only 只在明确确认和受控事务中运行；
- Index 写入必须备份、复核和读回；
- Provider 不自动覆盖本地元数据；
- AI 维护和诊断信息不得污染日常界面；
- 下载器实验代码不进入 Beta 2 主线。

## 协作方式

- ChatGPT 负责规划、架构、开发、测试、Git、PR、文档、发布和最终验收；
- Codex 只承担 CI 无法覆盖的 Windows 实机验证，不修改源码；
- 用户决定产品方向和视觉选择，不承担测试、排错和项目维护；
- Stitch、Lovable 和 AppDeploy 只作为设计探索和交互原型来源，正式实现以 GitHub `main` 与 `docs/DESIGN.md` 为准。
