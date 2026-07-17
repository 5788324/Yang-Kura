# PROJECT_STATE

## 当前状态

```text
核心版本：0.169.0-beta.2
代码事实来源：GitHub main
Beta 1：已发布并完成远端资产回读
Beta 2：个人日用版已发布并完成远端资产回读
U34～U36：架构基础与契约整备完成
U37-A：资源库页面状态与错误恢复完成
U37-B：首页与音声库列表 UI 完成
U37-C：RJ 详情 UI 完成
U37-D：音乐库与详情 UI 完成
U38-A：播放器 Queue/History/Persistence 分离完成
当前任务：U38-B 播放器 Controller 与 Backend 边界
大型功能：长期冻结，除非用户明确重新解冻
```

Yang-Kura 已完成本地媒体库主要日常页面的正式 UI 迁移，并发布 `v0.169.0-beta.2` 个人日用 prerelease。portable、NSIS、安装卸载、用户数据保留、目标提交、远端资产名、大小和 SHA-256 均已自动校验。项目现在进入真实使用驱动的维护阶段，不再以新增大型功能数量为目标。

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

## 当前产品判断

| 维度 | 判断 |
|---|---|
| 核心功能完整度 | 高，个人本地媒体库主链已完成 |
| Windows 可交付性 | Beta 2 已发布并完成远端资产验证 |
| UI 状态 | 主要日常页面和详情均已正式迁移 |
| 当前重点 | 真实 Bug、日常体验、性能、播放和技术债 |
| 技术债 | 持续解决，采用渐进式拆分，不推倒重写 |
| 大功能 | 长期冻结，不从历史待办自动恢复 |

## 当前任务：长期日用维护与 Issue #66 技术债治理

```text
真实使用 Bug
→ 日常 UI / 性能 / 播放体验
→ 技术债和代码质量
→ 必要的小功能补全
```

默认优先级：

1. 数据丢失、索引损坏、导入回滚、双重播放、安装升级等阻断问题；
2. 播放、字幕、队列、搜索和大库性能；
3. 窗口/DPI、键盘、主题、动效和无障碍；
4. 高耦合模块渐进拆分；
5. 明确有日常收益的小功能。

## 技术债治理

技术债跟踪见 Issue #66：

- `electron/main.ts` 继续按领域下沉实现；
- `SettingsPage.tsx` 拆分日常设置与 AI 维护；
- `DiagnosticsPage.tsx` 归档历史运行时内容；
- `useAudioPlayer.ts` 拆分 Controller、Backend、Queue/History、Subtitle 和持久化；
- `src/types.ts` 按领域拆分；
- 历史 MVP verifier 和 package 元数据退出日常运行时；
- 新目录与迁移目录逐步收紧 TypeScript strict。

处理方式：修改哪个用户链路，就同步整理该链路。禁止为了目录整齐搬代码，也禁止长期保留旧实现和新实现双轨。

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
