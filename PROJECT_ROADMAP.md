# PROJECT_ROADMAP

> Yang-Kura 长期开发路线真源。代码事实以最新 GitHub `main` 为准；当前状态见 `PROJECT_STATE.md`；UI 规则见 `docs/DESIGN.md`。

## 1. 当前基线

```text
版本：0.169.0-beta.2
Beta 1：已发布并完成远端资产校验
Beta 2：个人日用版已发布并完成远端资产校验
U34～U36：架构与 Design System 基础完成
U37-A：完成
U37-B：完成
U37-C：完成
U37-D：完成
U38-A：播放器 Queue/History/Persistence 分离完成
U38-B：播放器 Controller/Backend 分离完成
当前任务：U38-C Subtitle loader 与字幕状态
大型功能：长期冻结，除非用户明确重新解冻
```

当前开放跟踪：

- Issue #66：渐进式结构治理与质量提升

Issue #65 的媒体库和个人日用版发布目标已经完成。

## 2. 产品目标

Yang-Kura 是个人使用的 Windows 本地音频媒体库，覆盖 ASMR/RJ、普通音乐、统一播放器、字幕/歌词、歌单/队列/历史/续播、导入、元数据和资源维护。

```text
媒体库可长期日用
+ 现有能力可信
+ UI 清晰舒服
+ 代码可持续维护
```

## 3. 已完成主线

### 核心媒体能力

- Electron Windows 桌面壳与路径 token。
- Local JSON Index 写入、读取、备份、恢复和维护。
- ASMR/RJ、普通音乐、首页、详情、收藏、歌单、队列和历史。
- HTMLAudio、mpv、fallback、Seek 和进程回收。
- LRC、SRT、VTT、ASS 字幕。
- copy-only、受控 move-only、事务回滚和 OperationLog。
- 本地元数据覆盖、恢复与 DLsite 单 RJ Provider。
- 50,000 曲目性能基准。
- portable、NSIS、安装、卸载和用户数据保留。

### U34～U36

- 完成架构审计、依赖图、重构待办和不可破坏行为清单。
- 建立风险分级 CI、统一 IPC 契约、语义 Design Token 和共享 UI。
- 正式主题、AppShell、Router、Overlay 与 Main IPC 分域投入运行。

### U37：媒体库正式页面 — 全部完成

- U37-A：页面连接状态、无效选择和渲染错误恢复。
- U37-B：正式首页、音声库、搜索筛选、网格/列表、多选和批量加入歌单。
- U37-C：正式 RJ 详情、共享音轨列表、本地元数据覆盖和 DLsite 选择性应用。
- U37-D：正式音乐库、歌曲/专辑/艺术家/文件夹四视图及钻取详情。
- 旧音乐库生产组件已删除，不保留长期双轨实现。

### U38：播放器渐进式治理 — 进行中

- U38-A：Queue、History、续播、兼容快照和节流持久化从中央 Hook 抽离。
- U38-B：HTMLAudio 生命周期、mpv client、媒体解析、fallback 与后端同步进入 `usePlayerBackend.ts`。
- `useAudioPlayer.ts` 保留 Controller、完成策略、用户操作和字幕协调，对外 API 不变。
- 当前剩余 U38-C：Subtitle loader 与字幕状态边界。

### Beta 2 个人日用版发布 — 已完成

- tag：`v0.169.0-beta.2`
- Release ID：`355486824`
- 目标提交：`14bc78a81c827882efc232c6c6c12f0d8ed04542`
- portable、NSIS、安装、重复安装、卸载、用户数据保留和进程退出通过。
- GitHub prerelease 的资产名、大小、下载文件 SHA-256 和远端 digest 全部通过。
- 发布证据：`release/beta2-publication-state.json`。

## 4. 当前主线：长期日用维护

默认顺序：

1. 修复真实使用中发现的 Bug；
2. 优化播放、字幕、搜索、队列和大库性能；
3. 修复 UI、窗口/DPI、键盘、主题、动效和无障碍问题；
4. 持续解决技术债、拆分高耦合模块、改善测试与文档；
5. 补充小型且明确有日常收益的功能。

重大风险优先：数据丢失、索引损坏、导入回滚失败、双重播放、安装升级失败和进程残留。

## 5. 技术债治理

高优先级：

- `electron/main.ts` 按领域继续拆分；
- `SettingsPage.tsx` 拆分日常设置与 AI 维护；
- `DiagnosticsPage.tsx` 归档历史运行时内容；
- `useAudioPlayer.ts` 完成 Subtitle loader 与字幕状态拆分；
- `src/types.ts` 按领域拆分；
- 历史 MVP verifier 和 package 元数据退出日常运行时；
- TypeScript strict 对新目录和迁移目录逐步收紧。

固定规则：

- 不进行全项目推倒重写；
- 不为目录整齐而搬代码；
- 不长期保留新旧实现双轨；
- 修改哪个用户链路，就同步整理该链路；
- 新代码不得新增裸 IPC、跨层引用、循环依赖或隐藏 verifier 锚点；
- 历史字符串测试逐步替换为行为测试。

## 6. 快速交付规则

```text
一次读取和全局搜索
→ 批量修改相关项
→ targeted 验证
→ 一个 PR
→ PR 收口时一次稳定回归
→ squash merge
```

真实文件删除/移动/覆盖、数据格式迁移、导入回滚、安装和发布仍使用临时目录或副本、备份、回滚与专项验收。

## 7. 长期冻结的大功能

只有用户明确重新解冻后才允许重新评估：

- 正式下载器 / MVP130；
- SQLite 全面迁移；
- OpenList / WebDAV；
- Player Core v2 或新播放器内核；
- 完整 AI Agent；
- Arsm_Transcribe 正式接入；
- 云同步、在线账号和插件市场；
- 与本地媒体库日常使用无关的大型 Provider。

## 8. 自主管理

用户只接收最终成果，不承担测试、排错、Git 或发布操作。ChatGPT 负责实现、测试、文档、PR、合并和发布；Codex 仅用于自动化无法替代的 Windows 实机、显示缩放、声卡/驱动或安装器差异验证。
