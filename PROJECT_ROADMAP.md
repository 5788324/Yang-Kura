# PROJECT_ROADMAP

> Yang-Kura 长期开发路线真源。代码事实以最新 GitHub `main` 为准；当前状态见 `PROJECT_STATE.md`；UI 规则见 `docs/DESIGN.md`。

## 1. 当前基线

```text
版本：0.169.0-beta.2
Beta 1：已发布并完成远端资产校验
Beta 2：个人日用版已发布并完成远端资产校验
U34～U36：架构与 Design System 基础完成
U37-A～U37-D：媒体库正式页面完成
U38-A～U38-C：播放器渐进式治理完成
U39-A：播放器底栏主题一致性完成
U39-B：设置与 AI 维护入口边界完成
当前任务：真实 Bug、字幕体验与日常 UI 优先
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
+ AI 可持续维护
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
- 建立统一 IPC 契约、语义 Design Token 和共享 UI。
- 正式主题、AppShell、Router、Overlay 与 Main IPC 分域投入运行。

### U37：媒体库正式页面 — 全部完成

- U37-A：页面连接状态、无效选择和渲染错误恢复。
- U37-B：正式首页、音声库、搜索筛选、网格/列表、多选和批量加入歌单。
- U37-C：正式 RJ 详情、共享音轨列表、本地元数据覆盖和 DLsite 选择性应用。
- U37-D：正式音乐库、歌曲/专辑/艺术家/文件夹四视图及钻取详情。
- 旧音乐库生产组件已删除，不保留长期双轨实现。

### U38：播放器渐进式治理 — 全部完成

- U38-A：Queue、History、续播、兼容快照和节流持久化进入独立边界。
- U38-B：HTMLAudio、mpv、媒体解析、fallback 与后端同步进入 `usePlayerBackend.ts`。
- U38-C：字幕请求代次、过期结果丢弃、来源变化重载、结果映射和当前曲目/Queue 同步进入 `usePlayerSubtitles.ts`。
- `useAudioPlayer.ts` 只保留 Controller、完成策略和用户操作协调。
- 不再继续开启纯播放器拆分阶段。

### U39：日常体验

- U39-A：播放器底栏、控制、进度和弹层统一使用语义主题 Token，并完成 U30 主题/无障碍验证。
- U39-B：设置页新增独立 AI 维护入口，维护概览、性能诊断和完整历史诊断采用逐级按需加载。
- `diagnostics` 继续保持隐藏维护路由，不回到一级侧栏。
- 现有资源库检修、索引清理、备份和恢复能力暂不删除，后续触碰对应功能时再迁移。

### Beta 2 个人日用版发布 — 已完成

- tag：`v0.169.0-beta.2`
- Release ID：`355486824`
- 目标提交：`14bc78a81c827882efc232c6c6c12f0d8ed04542`
- portable、NSIS、安装、重复安装、卸载、用户数据保留和进程退出通过。
- GitHub prerelease 的资产名、大小、下载文件 SHA-256 和远端 digest 全部通过。
- 发布证据：`release/beta2-publication-state.json`。

## 4. 当前主线：个人项目快速维护

默认顺序：

1. 修复真实使用中发现的 Bug；
2. 优化字幕、播放、搜索、队列和大库性能；
3. 修复 UI、窗口/DPI、键盘、主题、动效和无障碍问题；
4. 补充小型且明确有日常收益的功能；
5. 只有修改相关链路时，才顺带处理对应技术债。

不再连续推进纯内部重构。重大风险仍优先：数据丢失、索引损坏、导入回滚失败、双重播放、安装升级失败和进程残留。

## 5. 风险分级验证

### 低风险：UI、Hook、状态管理

```text
TypeScript
→ production build
→ 相关功能 E2E
→ 定向 verifier
```

播放器 Renderer 使用 `Player Fast Validation`；设置、导航和维护表层使用 `UI Fast Validation`。低风险任务不默认执行完整 U28～U32、stable regression 或安装包链。

### 中风险：播放器后端、文件读取、受控写入

增加对应 Electron E2E、临时目录和失败回滚测试。除非打包环境相关，否则仍不默认安装/卸载。

### 高风险：Electron Main、安装器、依赖、用户数据目录、正式发布

执行完整回归、portable、NSIS、首次安装、重复安装、卸载、数据保留和进程回收。

## 6. 技术债治理

剩余高收益项：

- `electron/main.ts` 在下一次修改对应领域时继续下沉；
- `SettingsPage.tsx` 的真实检修状态和工具按功能逐块迁移到独立维护 Feature；
- `DiagnosticsPage.tsx` 逐步归档历史运行时内容；
- `src/types.ts` 在新增领域类型时建立独立事实源；
- 历史 MVP verifier 和 package 元数据逐步退出日常运行时；
- TypeScript strict 对新目录和迁移目录逐步收紧。

固定规则：

- 不进行全项目推倒重写；
- 不为目录整齐而搬代码；
- 不长期保留新旧实现双轨；
- 用户可感知成果优先；
- 历史字符串测试逐步替换为行为测试。

## 7. 快速交付规则

```text
一次读取和全局搜索
→ 批量修改相关项
→ targeted 验证
→ 一个 PR
→ squash merge
```

- 功能和必要文档在同一 PR 收口。
- 不创建额外文档收口 PR。
- 不因一句历史文案重复执行完整 CI。
- 真实文件删除/移动/覆盖、数据格式迁移、导入回滚、安装和发布仍使用临时目录或副本、备份、回滚与专项验收。

## 8. 长期冻结的大功能

只有用户明确重新解冻后才允许重新评估：

- 正式下载器 / MVP130；
- SQLite 全面迁移；
- OpenList / WebDAV；
- Player Core v2 或新播放器内核；
- 完整 AI Agent；
- Arsm_Transcribe 正式接入；
- 云同步、在线账号和插件市场；
- 与本地媒体库日常使用无关的大型 Provider。

## 9. 自主管理

用户只接收最终成果，不承担测试、排错、Git 或发布操作。ChatGPT 负责实现、测试、文档、PR、合并和发布；Codex 仅用于自动化无法替代的 Windows 实机、显示缩放、声卡/驱动或安装器差异验证。
