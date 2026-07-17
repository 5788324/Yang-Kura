# Yang-Kura

> 当前版本：`0.168.0-beta.1`  
> 代码事实来源：GitHub `main`  
> 当前阶段：U37 媒体库正式页面完成；准备 Windows 发布候选与个人日用版

Yang-Kura 是个人使用、不商业化、不对外分享的 Windows 本地音频媒体库，面向 ASMR/RJ 音声与普通本地音乐。技术栈为 React、Vite、TypeScript 和 Electron；当前数据路线为 Local JSON Index，SQLite 长期冻结。

## 当前能力

- 本地目录选择、扫描、`library-index.json` 写入、备份、恢复和读取。
- 正式首页、音声库、RJ 详情、音乐库及专辑/艺术家/文件夹钻取页面。
- 搜索、排序、筛选、收藏、多选、批量加入歌单或播放队列。
- HTMLAudio、mpv 子进程后端与自动 fallback。
- LRC、SRT、VTT、ASS 与双语字幕。
- 图片、视频、文本、文件外部打开和文件管理器定位。
- copy-only 与受控 move-only 导入事务、失败回滚和 OperationLog。
- ASMR/音乐本地元数据覆盖、备份恢复和 DLsite 单 RJ Provider。
- 缺失文件检查、受控索引清理、备份保留和维护历史。
- 50,000 曲目生成数据性能基准。
- Windows portable、NSIS、安装、重复安装、卸载和用户数据保留链。

## 已发布基线

`v0.168.0-beta.1` 已作为 GitHub prerelease 发布。portable、setup 与 `SHA256SUMS.txt` 的文件名、大小、目标提交和 SHA-256 已完成远端回读校验。

Beta 1 已证明核心媒体库和 Windows 发布主链可用。U37 已完成所有主要媒体库正式页面迁移；当前不再开发新的大型功能，而是完成 Windows 发布候选验收并发布个人日用版。

## 当前主线

当前开放跟踪：

- [Issue #65：完成媒体库并发布个人日用版](https://github.com/5788324/Yang-Kura/issues/65)
- [Issue #66：渐进式结构治理与质量提升](https://github.com/5788324/Yang-Kura/issues/66)

执行顺序：

```text
U37 媒体库正式页面完成
→ Windows portable / NSIS 发布候选验收
→ 发布个人日用版
→ 长期日用维护：修 Bug、优化 UI/性能/播放体验、持续解决技术债
```

三播放器、设置/维护 UI 深度重写、历史清理等不再阻塞首次日用发布，可在发布后按真实使用反馈继续完成。

## U37 完成内容

- `HomeLibraryPage`：资源库状态、继续播放、最近播放、常用入口和歌单入口。
- `AsmrLibraryPage`：搜索、排序、多维筛选、网格/列表、多选和批量加入歌单。
- `RjDetailPage` / `RjMetadataDialog`：RJ 详情、音轨、字幕状态、个人记录、本地覆盖和 DLsite 选择性应用。
- `MusicLibraryPage`：歌曲、专辑、艺术家、文件夹四种视图及钻取详情。
- 音乐库保留播放、队列、收藏、外部打开、文件定位、元数据覆盖和大库渲染窗口。
- 旧 `MusicLibrary.tsx` 生产实现已移除，不保留长期双轨。

## 开发原则

- 保留现有业务和必要的数据保护能力，不推倒重写。
- 项目仅供个人本地使用，不引入多租户、权限审批、审计合规、遥测平台等企业级负担。
- 风险控制与实际影响成比例：普通 UI、文案、局部逻辑和结构整理走快速通道。
- 简单、低风险且相关的任务默认合并完成，避免过度拆轮、重复 CI 和文档膨胀。
- 只有真实文件删除/移动/覆盖、数据迁移、安装发布等高影响操作保留专项隔离、备份、回滚和发布验收。
- 每修改一个用户链路，同步整理被触碰的高耦合业务模块，技术债不得无限后置。
- UI 必须遵守 [`docs/DESIGN.md`](docs/DESIGN.md)，日常层与 AI 维护层分离。

## 长期冻结的大功能

除非用户以后明确重新解冻，否则不启动：

- 正式下载器 / MVP130；
- SQLite 全面迁移；
- OpenList / WebDAV；
- Player Core v2 或新播放器内核；
- 完整 AI Agent；
- Arsm_Transcribe 正式集成；
- 云同步、在线账号和插件市场；
- 与本地媒体库日常使用无关的大型 Provider。

## 验证策略

低风险改动：

```text
TypeScript / 构建
→ 相关专项测试或现有 Electron 场景
→ PR 收口时一次稳定回归
```

高影响改动：

```text
临时目录或副本
→ 失败回滚验证
→ Windows 发布候选验收
→ 最终稳定回归
```

不要求每个小修改重复运行完整 Windows、portable、NSIS 和历史发布链。

## 必要数据边界

以下边界继续保留，因为它们直接防止个人媒体库损坏，而不是企业级形式要求：

- Renderer 不接收不必要的绝对路径或 `file://`。
- 不自动覆盖或删除真实媒体文件。
- 索引写入保留备份和读回校验。
- Provider 不自动覆盖用户本地元数据。
- 文件事务、安装和恢复实验使用临时目录或副本。

## 项目文档

- 当前状态：[`PROJECT_STATE.md`](PROJECT_STATE.md)
- 长期路线：[`PROJECT_ROADMAP.md`](PROJECT_ROADMAP.md)
- UI 规则：[`docs/DESIGN.md`](docs/DESIGN.md)
- 当前交接：[`AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`](AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md)
- 自主管理规则：[`AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`](AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md)
