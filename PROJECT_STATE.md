# PROJECT_STATE

## 当前状态

```text
核心版本：0.169.0-beta.2
代码事实来源：GitHub main
Beta 1：已发布并完成远端资产回读
Beta 2：个人日用版已发布并完成远端资产回读
U34～U36：架构基础与契约整备完成
U37-A～U37-D：媒体库正式页面完成
U38-A～U38-C：播放器结构治理完成
U39-A：播放器底栏语义主题一致性完成
U39-B：设置与 AI 维护入口边界完成
当前任务：日常体验与真实 Bug 优先
大型功能：长期冻结，除非用户明确重新解冻
```

Yang-Kura 已完成本地媒体库主要日常页面的正式 UI 迁移，并发布 `v0.169.0-beta.2` 个人日用 prerelease。播放器会话、后端和字幕边界已经收口；底部播放器已进入语义主题体系；设置页现在通过独立入口打开 AI 维护概览，完整历史诊断保持按需加载。

## 发布事实

- Release：[`v0.169.0-beta.2`](https://github.com/5788324/Yang-Kura/releases/tag/v0.169.0-beta.2)
- Release ID：`355486824`
- 目标提交：`14bc78a81c827882efc232c6c6c12f0d8ed04542`
- 发布时间：`2026-07-17T05:21:02Z`
- 资产：portable、NSIS setup、`SHA256SUMS.txt`
- 证据：`release/beta2-publication-state.json`
- Issue #65：完成并关闭
- 当前开放主线：[Issue #66：渐进式结构治理与质量提升](https://github.com/5788324/Yang-Kura/issues/66)

## 已完成的产品能力

- ASMR/RJ 与普通音乐双资源库。
- Local JSON Index 写入、读取、备份、恢复和维护。
- HTMLAudio、mpv、自动 fallback、Seek、队列、历史和续播。
- LRC、SRT、VTT、ASS 与双语字幕。
- copy-only 与受控 move-only 导入事务、失败回滚和 OperationLog。
- 本地元数据覆盖、恢复和 DLsite 单 RJ Provider。
- 缺失文件、受控索引清理、备份保留和维护历史。
- 50,000 曲目生成数据性能基准。
- portable、NSIS、安装、重复安装、卸载、数据保留和进程回收。
- 首页、音声库、RJ 详情、音乐库及专辑/艺术家/文件夹钻取页面完成正式迁移。
- 底部播放器和播放弹层已使用主题语义色，不再固定为深黑 zinc 表面。
- 设置页可进入独立 AI 维护概览，性能与完整诊断按需加载。

## 当前产品判断

| 维度 | 判断 |
|---|---|
| 核心功能完整度 | 高，个人本地媒体库主链已完成 |
| Windows 可交付性 | Beta 2 已发布并完成远端资产验证 |
| UI 状态 | 主要页面、播放器与维护入口进入正式主题体系 |
| 当前重点 | 真实 Bug、字幕实际体验、日常 UI 和用户可感知功能 |
| 技术债 | 持续解决，不连续进行纯内部重构 |
| 大功能 | 长期冻结，不从历史待办自动恢复 |

## U38 播放器治理结论

```text
U38-A：Queue / History / Persistence
→ U38-B：Controller / Backend
→ U38-C：Subtitle lifecycle / state
→ 播放器连续结构治理收口
```

U38-C 新增 `usePlayerSubtitles.ts`，集中字幕请求代次、过期结果丢弃、字幕来源变更重载、格式结果映射和当前曲目/Queue 状态同步。真实后端、Seek、完成策略、Queue、History 和续播行为保持不变。

## U39 日常体验

### U39-A 播放器底栏主题一致性

- `PlayerBar` 根表面改用 `player-bg`、`border-color` 和 `text-primary`。
- 曲目信息、主控制区、辅助控制、进度条和临时弹层使用语义 Token。
- 新增全局播放器 region 语义和统一品牌色焦点反馈。
- 不修改播放状态、mpv/HTMLAudio、Queue、字幕、Seek 或续播逻辑。

### U39-B 设置与 AI 维护入口边界

- 新增 `SettingsMaintenanceEntry.tsx`，设置页顶部提供明确维护入口。
- `AppRouter` 连接 `settings` 与隐藏的 `diagnostics` 路由。
- `DiagnosticsPageShell` 支持返回设置和返回维护概览。
- 维护概览只加载真实 Index 状态；性能诊断和完整历史诊断二次加载。
- 不删除现有索引检修、清理、备份或恢复能力。

## 快速开发模式

- 普通 UI、Hook 和状态管理改动：TypeScript、生产构建、相关功能 E2E 和定向 verifier。
- 播放器 Renderer 改动进入 `Player Fast Validation`；设置、导航和维护表层进入 `UI Fast Validation`。
- portable、NSIS、安装和卸载仅在 Electron Main、安装器、依赖、打包配置或正式发布发生变化时执行。
- 一个任务使用一个 PR，功能和必要文档同一 PR 收口。
- 不再为历史文件位置或旧文案重复执行发布级验证。

## 技术债治理

技术债跟踪见 Issue #66：

- `electron/main.ts` 继续按领域下沉实现；
- `SettingsPage.tsx` 后续把现有检修状态和工具逐块迁移到独立维护 Feature；
- `DiagnosticsPage.tsx` 归档历史运行时内容；
- `src/types.ts` 按领域拆分；
- 历史 MVP verifier 和 package 元数据退出日常运行时；
- 新目录与迁移目录逐步收紧 TypeScript strict。

处理方式：真实 Bug 和用户体验优先；修改哪个用户链路，再同步整理该链路。禁止为了目录整齐搬代码，也禁止长期保留旧实现和新实现双轨。

## 长期冻结

除非用户明确重新解冻，否则禁止启动或合入：

- 正式下载器 / MVP130；
- SQLite 全面迁移；
- OpenList / WebDAV；
- Player Core v2 或新播放器内核；
- 完整 AI Agent；
- Arsm_Transcribe 正式集成；
- 云同步、在线账号、插件市场；
- 与本地媒体库日常使用无关的大型 Provider。

## AI 自主管理规则

用户不承担测试、排错、构建、Git、文档或发布操作。ChatGPT 负责规划、开发、自动测试、PR、合并和交付；Codex 只用于 CI 无法替代的 Windows 实机、驱动、声卡、显示缩放或安装器差异测试。

<!-- 历史发布候选基线：0.167.0-mvp129 -->
