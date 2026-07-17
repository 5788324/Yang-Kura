# PROJECT_ROADMAP

> Yang-Kura 长期开发路线真源。代码事实以最新 GitHub `main` 为准；当前状态见 `PROJECT_STATE.md`；UI 规则见 `docs/DESIGN.md`。

## 1. 当前基线

```text
版本：0.168.0-beta.1
Beta 1：已发布并完成远端资产校验
U34～U36：架构与 Design System 基础完成
U37-A：完成
U37-B：完成
U37-C：完成
当前任务：U37-D 音乐库与详情 UI
个人日用版发布：U37 完成后
大型功能：长期冻结，除非用户明确重新解冻
```

开放跟踪：

- [Issue #65：完成媒体库并发布个人日用版](https://github.com/5788324/Yang-Kura/issues/65)
- [Issue #66：渐进式结构治理与质量提升](https://github.com/5788324/Yang-Kura/issues/66)

## 2. 产品目标

Yang-Kura 是个人使用的 Windows 本地音频媒体库，覆盖：

- ASMR/RJ 音声库；
- 普通本地音乐库；
- 统一 Track 播放器；
- 字幕与歌词；
- 歌单、队列、历史和续播；
- 导入、元数据和资源维护。

当前目标：

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
- 建立风险分级 CI 和快速交付规则。
- 建立唯一 IPC channel/error 契约。
- 建立暮夜琥珀、雾光象牙语义 Design Token 和共享 UI 组件。
- 正式主题与生产 AppShell 投入运行。
- App Router、TopBar、QueueDrawer、PlayerOverlayHost 已拆分。
- Main IPC 注册按 Library、Media、Player、Metadata、Importer 分域。

### U37-A / U37-B / U37-C

- 页面连接状态、无效选择和渲染错误恢复已完成。
- 正式首页与音声库生产页面已完成。
- 音声库已具备搜索、排序、筛选、网格/列表、多选和批量加入歌单。
- 正式 RJ 详情、音轨列表和元数据编辑弹窗已完成。
- 本地覆盖、DLsite 选择性应用、播放、队列、收藏、外部打开和文件管理器定位语义保持不变。

## 4. 当前发布主线

### U37-D：音乐库与详情

- 迁移歌曲、专辑、艺术家、文件夹四种视图及其钻取页面。
- 统一工具栏、搜索、筛选、排序和页面状态。
- 补齐多选、批量加入队列、收藏筛选和外部打开反馈。
- 完成深色/浅色、小窗口、键盘、空状态和 Electron 回归矩阵。
- 同步整理音乐库与钻取页面被触碰的高耦合逻辑。

### 个人日用版发布

U37-D 完成后立即进入 Windows 发布候选，不再等待所有后续 UI 和结构工作。

发布条件：

- 首页、音声库、RJ 详情、音乐库及主要详情使用正式 UI；
- 本地扫描、Index、播放、字幕、歌单、队列、历史、导入、元数据和维护无回归；
- 没有数据丢失、索引损坏、导入回滚失败或双重播放等阻断问题；
- portable、NSIS、安装、重复安装、卸载、用户数据保留和进程退出通过；
- 发布说明记录已知限制。

## 5. 发布后的持续维护

发布后不再自动进入大型功能开发，优先处理：

1. 真实使用中发现的 Bug；
2. 日常操作、播放、字幕、搜索和大库性能优化；
3. UI、窗口/DPI、键盘、动效和无障碍修复；
4. 技术债和代码质量持续治理；
5. 小型且明确有收益的功能补全。

三播放器深度重写、设置/维护 UI 整理、历史清理和质量门禁可在日用发布后继续推进，不再统一阻塞首次使用。

## 6. 技术债治理

技术债必须持续解决，详见 Issue #66。

高优先级：

- `electron/main.ts` 按领域继续拆分；
- `SettingsPage.tsx` 拆分日常设置与 AI 维护；
- `DiagnosticsPage.tsx` 归档历史运行时内容；
- `useAudioPlayer.ts` 拆分 Controller、Backend、Queue/History、Subtitle 和持久化；
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

## 7. 快速交付规则

```text
一次读取和全局搜索
→ 批量修改相关项
→ targeted 验证
→ 一个 PR
→ PR 收口时一次稳定回归
→ squash merge
```

小型 UI、文案、局部逻辑、测试、文档和同一链路上的多个缺陷默认合并处理。

真实文件删除/移动/覆盖、数据格式迁移、导入回滚、安装和发布仍使用临时目录或副本、备份、回滚与专项验收。

## 8. 长期冻结的大功能

以下项目只有用户明确重新解冻后才允许重新评估：

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
