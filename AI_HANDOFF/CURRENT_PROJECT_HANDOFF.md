# Yang-Kura 当前项目交接

> **用途：新对话、ChatGPT、Codex 或其他 AI 接手 Yang-Kura 时的当前权威交接。**
>
> 代码事实以最新 GitHub `main` 为准；状态见 `PROJECT_STATE.md`，工作记录见 `AI_HANDOFF/WORKLOG.md`，长期顺序见 `PROJECT_ROADMAP.md`，UI 规则见 `docs/DESIGN.md`。

## 1. 项目

```text
仓库：https://github.com/5788324/Yang-Kura.git
主分支：main
当前版本：0.168.0-beta.1
平台：Windows x64
技术栈：React + Vite + TypeScript + Electron
用途：ASMR/RJ 与普通音乐的个人本地音频媒体库
当前索引：Local JSON Index
Beta 1：已发布并完成远端资产校验
U34：完成
U35-A：完成
U35-B：完成
U36-A：完成
U36-B：完成
U36-C：完成
当前任务：U37 首页、资源库与详情 UI
目标版本：0.169.0-beta.2
```

必须从最新 `origin/main` 接手。禁止使用旧 ZIP、历史 MVP 包、旧工作区或文档中的旧固定 SHA 作为代码来源。

## 2. 必读顺序

1. `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`
2. `PROJECT_STATE.md`
3. `AI_HANDOFF/WORKLOG.md`
4. `PROJECT_ROADMAP.md`
5. `docs/architecture/ARCHITECTURE_AUDIT.md`
6. `docs/architecture/DEPENDENCY_MAP.md`
7. `docs/architecture/REFACTOR_BACKLOG.md`
8. `docs/architecture/U35A_FOUNDATION.md`
9. `docs/architecture/U35B_PRODUCTION_SHELL.md`
10. `docs/architecture/U36A_SHELL_ROUTER_IPC.md`
11. `docs/architecture/U36B_APP_SHELL_ROUTER_OVERLAYS.md`
12. `docs/architecture/U36C_MAIN_IPC_DOMAINS.md`
13. `docs/DESIGN.md`
14. `AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`
15. `docs/RELEASE_NOTES_0.168.0-beta.1.md`
16. `MVP130_EXPERIMENTAL_DO_NOT_MERGE.md`

## 3. 固定协作分工

用户只接收最终成果，不测试、不排错、不运行命令、不维护 Git、不创建 tag 或 Release。

ChatGPT 负责计划、架构、代码、自动测试、Windows CI、Electron/CDP、文件系统临时样本、截图审查、Git、PR、文档、合并和发布。简单、低风险且相关的任务允许合并处理。

Codex 只处理 GitHub runner 无法替代的真实本机、显示器/DPI、硬件、声卡、驱动、安装器或系统集成测试。Codex 默认只测试，不修改源码。

## 4. 已完成事实

### 核心产品

- ASMR/RJ 与普通音乐双资源库。
- Local JSON Index 写入、读取、备份、恢复和维护。
- HTMLAudio、mpv、自动 fallback、Seek、队列、历史和续播。
- LRC、SRT、VTT、ASS 与双语字幕。
- copy-only、受控 move-only、失败回滚和 OperationLog。
- 本地元数据覆盖、恢复和 DLsite 单 RJ Provider。
- portable、NSIS、安装、重复安装、卸载、数据保留和进程回收。
- `v0.168.0-beta.1` prerelease 与三个资产完成远端校验。

### U34

- 完成架构审计、依赖图、重构待办和行为冻结。
- 固化风险分级与快速交付规则。
- 文档任务改走轻量 CI。

### U35-A / U35-B

- 建立唯一 `IPC_CHANNELS`、`IpcResult<T>`、`IpcError`。
- 建立暮夜琥珀、雾光象牙语义 Token 与共享 UI primitives。
- 两套正式主题投入运行。
- Renderer 入口接入 ThemeRuntimeBridge 与 AppShell production bridge。

### U36-A：完成

- 建立 `src/app/navigation.ts` 页面元数据事实源。
- Sidebar 改用统一导航注册表。
- Preload 请求类型拆到 `electron/preload/contracts.ts`。
- `electron/preload.ts` 全部使用 `IPC_CHANNELS`。
- `window.yangKura` API、Root token、相对路径和安全边界保持不变。

### U36-B：完成

- 新增 `src/app/TopBar.tsx`。
- 新增 `src/app/AppRouter.tsx`，集中页面 lazy loading 和内部维护路由。
- 新增 `src/app/QueueDrawer.tsx`，集中队列 UI 与 Escape 行为。
- 新增 `src/app/PlayerOverlayHost.tsx`，集中 Lyrics 与断点续播覆盖层。
- `App.tsx` 只保留顶层状态、业务协调和壳组合。
- Index、播放、字幕、元数据、导入事务和路径安全行为保持不变。

### U36-C：完成

- Main 注册层按 Library、Media、Player、Metadata、Importer 分域。
- `electron/main.ts` 不再直接拥有 `ipcMain.handle/removeHandler`。
- 注册 channel 全部来自 `IPC_CHANNELS`。
- 文件事务、Index、mpv、Provider、Preload API 和路径安全边界未改变。

## 5. 当前任务：U37

```text
首页信息架构与空状态
+ 音声库 / 音乐库页面级 Design System 迁移
+ RJ / 专辑详情层级
+ 高级筛选、多选与错误恢复
+ 被页面触碰的资源库与元数据模块纵向整理
```

执行原则：

1. 先迁移首页与资源库日常主路径，再处理详情与高级操作。
2. 每次只拆被当前页面触碰的业务模块，不横向重写全部 Service。
3. 深色、浅色、键盘、窗口尺寸和 reduced-motion 同步验收。
4. 保持真实 Index、播放、元数据覆盖和导入入口可用。

明确不做：

- 不同时重写播放器核心；
- 不进行 SQLite、OpenList/WebDAV、下载器或 AI Agent 开发；
- 不新增历史字符串 verifier 锚点。

## 6. 后续顺序

```text
U37 首页/资源库/详情
→ U38 经典/黑胶/歌词播放器
→ U39 导入器/设置/维护
→ U40 历史清理和质量门禁
→ U41 0.169.0-beta.2 发布
```

## 7. 执行效率硬规则

```text
一次全局搜索
→ 批量修改
→ targeted 验证
→ 一个 PR
→ 一次最终完整门禁
→ squash merge
```

- 第一次提交前搜索全部旧阶段、固定 SHA、verifier 和 workflow path 依赖。
- 禁止逐个失败反复推送和重复完整 CI。
- 禁止新增隐藏 DOM、HTML 注释、`sr-only` 或 package metadata 锚点。
- 文档 PR 不打 portable/NSIS，不重建历史 Beta Release。
- CI 状态仅在启动、完成、合并三个节点检查。
- 高风险文件事务、数据迁移、安装和发布仍严格验证。

## 8. UI 硬规则

- 中文用户界面；工程术语只进入 AI 维护或开发文档。
- 内容优先，不把所有信息塞进等宽卡片。
- 主题必须改变完整材质系统，不得只换强调色。
- 动画克制、统一并支持 reduced-motion。
- 经典、黑胶、歌词三播放器角色必须清晰。
- 日常界面不得展示 MVP、verifier、命令行、绝对路径或测试状态。
- 与 `docs/DESIGN.md` 冲突时，以 `docs/DESIGN.md` 为准。

## 9. 功能冻结

Beta 2 完成前禁止启动或合入：

- 正式下载器 / MVP130；
- SQLite 全面迁移；
- OpenList/WebDAV；
- Player Core v2；
- 完整 AI Agent；
- Arsm_Transcribe 正式集成；
- 云同步、在线账号、插件市场；
- 与 Beta 2 无关的大型 Provider。

## 10. 风险边界

- Renderer 不接收绝对路径或 `file://`。
- 真实媒体文件不参与破坏性自动测试。
- 导入、清理、恢复和安装实验使用临时目录或副本。
- 每个 PR 必须保持现有业务可运行，禁止跨多轮留下不可用中间态。
- Beta 2 可能仍无商业代码签名，SmartScreen 可显示未知发布者。
