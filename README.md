# Yang-Kura

> 当前版本：`0.168.0-beta.1`  
> 代码事实来源：GitHub `main`  
> 当前阶段：Beta 1 已发布；准备 `0.169.0-beta.2` 架构与 UI 联合整备

Yang-Kura 是个人使用的 Windows 本地音频媒体库，面向 ASMR/RJ 音声与普通本地音乐。技术栈为 React、Vite、TypeScript 和 Electron；当前数据路线为 Local JSON Index，SQLite 继续后置。

## 当前能力

- 本地目录选择、扫描、`library-index.json` 写入、备份、恢复和读取。
- 音声库、音乐库、首页、详情、收藏、歌单、队列和播放历史。
- HTMLAudio、mpv 子进程后端与自动 fallback。
- LRC、SRT、VTT、ASS 与双语字幕。
- 图片、视频、文本、文件外部打开和文件管理器定位。
- copy-only 与受控 move-only 导入事务、失败回滚和 OperationLog。
- ASMR/音乐本地元数据覆盖、备份恢复和 DLsite 单 RJ Provider。
- 缺失文件检查、受控索引清理、备份保留和维护历史。
- 50,000 曲目生成数据性能基准。
- Windows portable、NSIS、安装、重复安装、卸载和用户数据保留链。

## Beta 1

`v0.168.0-beta.1` 已作为 GitHub prerelease 发布。portable、setup 与 `SHA256SUMS.txt` 的文件名、大小、目标提交和 SHA-256 已完成远端回读校验。

Beta 1 证明核心媒体库和 Windows 发布主链可用，但现有代码经过长期连续迭代后需要结构整备；现有 UI、主题和动画也未达到长期产品目标。

## 当前主线：Beta 2

Beta 2 目标版本为 `0.169.0-beta.2`，原则上不增加大型业务功能。

```text
联合审计
→ 架构边界与设计系统
→ App Shell、状态和 IPC 契约
→ 资源库与详情 UI 重写
→ 经典/黑胶/歌词播放器重写
→ 导入器、设置和维护 UI 重写
→ 质量门禁、旧 UI 清理
→ Windows Beta 2 发布
```

核心原则：

- 保留现有业务和数据安全边界；
- 不推倒重写；
- 每迁移一个页面，同步整理被触碰的业务模块；
- UI 必须遵守 [`docs/DESIGN.md`](docs/DESIGN.md)；
- 主题必须是完整材质系统，不是换色；
- 动画统一、克制并支持 reduced-motion；
- 日常层与 AI 维护层严格分离。

## 功能冻结

Beta 2 完成前继续冻结：

- 正式下载器 / MVP130；
- SQLite 全面迁移；
- OpenList/WebDAV；
- Player Core v2；
- 完整 AI Agent；
- Arsm_Transcribe 正式集成；
- 云同步、在线账号和插件市场。

## 常用验证

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm audit --audit-level=high
npm run lint
npm run build:electron
npm run verify:stable
npm run build
npm run desktop:smoke-check:strict
npm run desktop:dist
```

当前 PR 还会运行 U28～U32 的 Electron/Windows 真实功能门禁和 `scripts/verify-u*.mjs`。

## 安全边界

- Renderer 不接收绝对路径或 `file://`。
- 不自动覆盖、删除或清理真实媒体文件。
- move-only 仅限明确确认的小样本流程。
- 索引写入必须备份、复核和读回校验。
- Provider 不自动覆盖本地元数据。
- 破坏性测试、安装和恢复实验使用临时目录或副本。

## 项目文档

- 当前状态：[`PROJECT_STATE.md`](PROJECT_STATE.md)
- 长期路线：[`PROJECT_ROADMAP.md`](PROJECT_ROADMAP.md)
- UI 规则：[`docs/DESIGN.md`](docs/DESIGN.md)
- 当前交接：[`AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`](AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md)
- 自主管理规则：[`AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`](AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md)