# PROJECT_STATE

## 当前状态

```text
核心版本：0.169.0-beta.2
代码事实来源：GitHub main
Beta 1：已发布并完成远端资产回读
Beta 2：个人日用版发布候选
U34～U36：架构基础与契约整备完成
U37-A：资源库页面状态与错误恢复完成
U37-B：首页与音声库列表 UI 完成
U37-C：RJ 详情 UI 完成
U37-D：音乐库与详情 UI 完成
当前任务：发布 0.169.0 Beta 2 个人日用版
发布条件：核心回归 + portable / NSIS + 安装卸载与数据保留 + 发布资产回读
大型功能：长期冻结，除非用户明确重新解冻
```

Yang-Kura 已完成本地媒体库主要日常页面的正式 UI 迁移，具备播放、字幕、导入、元数据、维护和 Windows 发布主链。项目仅供个人本地使用，不商业化、不对外分享。当前不增加大型功能，只完成 `v0.169.0-beta.2` 的发布门禁、GitHub prerelease 和远端资产校验。

## 开放跟踪

- [Issue #65：完成媒体库并发布个人日用版](https://github.com/5788324/Yang-Kura/issues/65)
- [Issue #66：渐进式结构治理与质量提升](https://github.com/5788324/Yang-Kura/issues/66)

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
- `v0.168.0-beta.1` prerelease 与三个资产完成远端文件名、大小和 SHA-256 校验。

## 当前产品判断

| 维度 | 判断 |
|---|---|
| 核心功能完整度 | 高，日常本地媒体库主链已完成 |
| Windows 可交付性 | Beta 1 已验证；Beta 2 正在执行发布门禁 |
| UI 状态 | 首页、音声库、RJ 详情、音乐库及主要钻取页面均已正式迁移 |
| 技术债 | 持续解决，采用渐进式拆分，不推倒重写 |
| 当前阻断 | 仅剩 Beta 2 发布与资产回读，不再追加功能 |
| 大功能 | 长期冻结，不从历史待办自动恢复 |

## U37：媒体库正式页面 — 已完成

### U37-A

- 页面连接状态统一分类。
- 首页、音声库、RJ 详情和音乐库具备页面级错误隔离和原地重试。
- 无效 RJ 详情 ID 有明确恢复入口。

### U37-B

- 正式 `HomeLibraryPage` 和 `AsmrLibraryPage` 替换旧生产路由。
- 支持搜索、排序、多维筛选、网格/列表、多选和批量加入歌单。
- 保留大库搜索索引、渲染窗口、root token、相对路径和元数据覆盖语义。

### U37-C

- 正式 `RjDetailPage` 与 `RjMetadataDialog` 替换旧 RJ 详情。
- 保留播放、队列、收藏、字幕、文件健康、外部打开、文件定位、本地覆盖和 DLsite 差异预览。
- 评分、听音状态和笔记写入本地覆盖层，不修改媒体文件。

### U37-D

- 正式 `MusicLibraryPage` 替换旧音乐库。
- 完成歌曲、专辑、艺术家、文件夹四种视图。
- 专辑、艺术家和文件夹支持钻取详情、返回、播放全部和全部入队。
- 支持搜索、排序、仅看收藏、多选、全选当前结果和批量加入队列。
- 新增深色/浅色语义样式、窄窗口、键盘和 reduced-motion。
- 删除旧 `src/components/MusicLibrary.tsx`，不保留双轨。
- U32 Electron 审计验证四视图、详情钻取、批量队列、收藏筛选和窄窗口。

## 当前任务：发布 0.169.0 Beta 2 个人日用版

本阶段不开发新产品功能，只完成：

1. 版本号、package-lock、发布计划和说明一致；
2. 发布 tag 和标题在 GitHub 上无冲突；
3. TypeScript、生产构建、U28～U32、focused verifiers 和 stable regression 通过；
4. portable、NSIS、首次安装、重复安装、卸载、数据保留和进程退出通过；
5. 创建 `v0.169.0-beta.2` GitHub prerelease；
6. 回读 Release 的目标提交、资产名、大小和 SHA-256；
7. 记录发布清单并关闭 Issue #65。

## 发布后的长期维护

```text
真实使用 Bug
→ 日常体验、性能和 UI 优化
→ 持续技术债治理
→ 必要的小功能补全
```

三播放器深度重写、设置/维护 UI 重构、历史清理和质量门禁可在发布后按真实收益继续推进，不再阻断个人日用版。

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
