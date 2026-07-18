# PROJECT_ROADMAP

> Yang-Kura 长期开发路线真源。代码事实以最新 GitHub `main` 为准；当前状态见 `PROJECT_STATE.md`。

## 1. 当前基线

```text
版本：0.169.0-beta.2
Beta 1 / Beta 2：已发布并完成远端资产校验
U34～U36：架构与 Design System 基础完成
U37-A～U37-D：媒体库正式页面完成
U38-A～U38-C：播放器渐进式治理完成
U39-A～U39-E：日常体验与审计问题修复完成
U39-F：增量架构防回退门禁完成
U39-G：最终综合验收完成
U40-A：个人项目快速维护规则完成
U40-B：全产品用户旅程与交互覆盖验收完成
U40-C：UI 细节收口完成
当前任务：按需日常维护
大型功能：长期冻结
```

当前开放跟踪：Issue #66。Issue #65 的媒体库和个人日用版发布目标已经完成。

## 2. 产品目标

Yang-Kura 是个人使用的 Windows 本地音频媒体库，覆盖 ASMR/RJ、普通音乐、统一播放器、字幕、歌单、Queue、History、续播、导入、元数据和资源维护。

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
- ASMR/RJ、普通音乐、首页、详情、收藏、歌单、Queue 和 History。
- HTMLAudio、mpv、fallback、Seek 和进程回收。
- LRC、SRT、VTT、ASS 字幕。
- copy-only、受控 move-only、事务回滚和 OperationLog。
- 本地元数据覆盖、恢复与 DLsite 单 RJ Provider。
- portable、NSIS、安装、卸载和用户数据保留。

### U34～U37

- 完成架构审计、统一 IPC、语义 Token、共享 UI、AppShell、Router 和 Main IPC 分域。
- 正式首页、音声库、RJ 详情和音乐库替换旧生产路由。
- 音乐库支持歌曲、专辑、艺术家和文件夹四视图。

### U38 播放器治理

- U38-A：Queue、History、续播和会话持久化进入独立边界。
- U38-B：HTMLAudio、mpv、媒体解析、fallback 与 Seek 进入 `usePlayerBackend.ts`。
- U38-C：字幕请求代次、过期结果丢弃和状态同步进入 `usePlayerSubtitles.ts`。
- 连续播放器拆分已经收口。

### U39 日常体验与质量

- U39-A：播放器底栏和弹层统一使用语义主题 Token。
- U39-B：设置页新增 AI 维护入口，历史诊断按需加载。
- U39-C：root token 授权持久化并支持旧 Index token 接管。
- U39-D：雾光象牙建立静态 WCAG 与真实 Electron 对比度验收。
- U39-E：空音乐库和导入器空来源状态不再显示空壳或误导性示例。
- U39-F：禁止 PR 新增显式 `any`、Renderer 裸 IPC、实现层跨层导入和相对导入循环。
- U39-G：同一候选提交完成完整 Windows 回归、portable/NSIS 和安装交付验收。

### U40 个人项目维护与 UI 收口

- U40-A：建立个人项目风险分级验证、单 PR 收口和核心文档集中维护规则。
- U40-B：建立 U28～U32 与全产品用户旅程组合验收；6/6 套件、635 个可见控件状态、未覆盖 0、运行时错误 0。
- U40-C：收口浅色维护页辨识度、稀疏音乐集合布局、全屏歌词视觉一致性和窄窗口设置页密度。
- U40-C 使用语义样式覆盖，不修改产品行为；U30、U32、U40-B 相关旅程及 Windows 构建通过。

### Beta 2 发布

- tag：`v0.169.0-beta.2`
- Release ID：`355486824`
- 目标提交：`14bc78a81c827882efc232c6c6c12f0d8ed04542`
- portable、NSIS、安装、重复安装、卸载、数据保留和远端资产回读通过。

## 4. 当前主线：按需日常维护

默认顺序：

1. 修复真实使用中发现的 Bug；
2. 处理明确的字幕、播放、搜索、日常 UI 或性能问题；
3. 实现用户主动提出的小型功能；
4. 修改相关链路时顺带处理局部技术债。

U40-C 完成后不继续自动预排内部治理轮次，也不为关闭清单进行大规模搬迁。

重大风险仍优先：数据丢失、Index 损坏、导入回滚失败、双重播放、安装升级失败和进程残留。

## 5. 综合验收能力

- `U39 Final Acceptance`：同一 Windows 候选提交执行 U28～U32、U39-A～F、stable regression、portable、NSIS、安装卸载、用户数据保留和页面完整性。
- `U40-B Full Product Acceptance`：按需执行全产品页面、控件、播放、字幕、导入、主题、窗口和键盘旅程。
- `U40-C UI Polish`：执行 TypeScript、production/Electron build、语义 Token verifier、U30、U32 和 U40-B 相关用户旅程。

历史综合说明见 `docs/U39_FINAL_ACCEPTANCE.md`，全产品说明见 `docs/U40B_FULL_PRODUCT_ACCEPTANCE.md`，UI 收口说明见 `docs/U40C_UI_POLISH.md`。

## 6. 风险分级验证

### 低风险：UI、Hook、状态管理

```text
TypeScript
→ production build
→ 相关 E2E
→ 定向 verifier
```

播放器 Renderer 使用 `Player Fast Validation`；设置、导航、主题和页面表层使用 `UI Fast Validation`。

### 架构增量

`Architecture Guardrails` 比较 PR base 与 head：

- 禁止新增显式 `any`；
- 禁止 Renderer 裸 IPC；
- 禁止新增 Renderer / Electron 实现层跨层导入；
- 禁止新增相对导入循环；
- 现有 1 个历史循环作为基线保留。

纯门禁变更不执行完整 U28～U32 或安装包链。

### 中风险

播放器后端、文件读取和受控写入增加对应 Electron E2E、临时目录和失败回滚测试。

### 高风险

Electron Main、安装器、依赖、用户数据目录和正式发布变化执行完整回归、portable、NSIS、首次安装、重复安装、卸载、数据保留和进程回收。

## 7. 技术债治理

剩余项继续由 Issue #66 跟踪：

- `SettingsPage.tsx` 的真实检修状态和工具在触碰对应功能时逐块迁移；
- `DiagnosticsPage.tsx` 历史运行时内容逐步归档；
- `electron/main.ts` 和 `src/types.ts` 只在修改对应领域时下沉；
- 当前 1 个历史相对导入环在触碰相关链路时清理；
- 历史 MVP verifier 和 package 元数据逐步退出日常运行时；
- TypeScript strict 对新目录和迁移目录逐步收紧。

固定规则：不推倒重写、不为目录整齐搬代码、不长期保留双轨、用户可感知成果优先。

## 8. 快速交付规则

```text
一次读取和全局搜索
→ 批量修改相关项
→ targeted 验证
→ 一个 PR
→ squash merge
```

功能和必要文档在同一 PR 收口。真实文件写入、数据迁移、导入回滚、安装和发布继续使用临时目录或副本、备份和专项验收。

## 9. 长期冻结

正式下载器、SQLite 全面迁移、OpenList/WebDAV、Player Core v2、完整 AI Agent、Arsm_Transcribe 正式接入、云同步、在线账号、插件市场和无关大型 Provider。

## 10. 自主管理

用户只接收最终成果，不承担测试、排错、Git 或发布操作。ChatGPT 负责实现、测试、文档、PR、合并和发布；Codex 仅用于自动化无法替代的 Windows 实机、显示缩放、声卡、驱动或安装器差异验证。
