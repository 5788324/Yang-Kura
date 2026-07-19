# Yang-Kura 工作日志

> 只记录当前有效事实。代码与合并事实以 GitHub 为准，候选验收以最新有效 Codex 或 DeepSeek 实机报告为准。

## 2026-07-16～2026-07-17

- U34～U37：架构、Design System、IPC 分域和正式媒体库页面完成。
- Beta 2：`v0.169.0-beta.2`，Release ID `355486824`，portable、setup 和 SHA256SUMS 远端一致。
- U38：Queue、History、Persistence、HTMLAudio/mpv Backend 和 Subtitle lifecycle 分离。
- U39：日常体验、授权持久化、架构门禁和完整 Windows/打包验收。

## 2026-07-18

### U40-A～U40-D3

- 快速维护规则、全产品旅程、UI 收口、真实库读取与分组、独立 Profile、单实例、主题、歌单、导入页和 HTMLAudio 停滞状态完成。
- Issue #66 关闭。

### Git Fast Lane v2

- 一个任务一个分支和 PR。
- 普通维护按 L0～L2，正式发布按 L3。
- 用户不承担 Git、构建、测试或发布。

### Beta 3 正式日用发布收口 — 进行中

- PR #91 建立，目标版本 `0.170.0-beta.3`。
- 发布计划、Release Notes、构建/安装/发布工作流和远端资产验证脚本已加入候选分支。
- Beta 2 保持冻结；Beta 3 只允许合入 main 后创建 prerelease。
- 发布收口被 B3-MAJ-001 阻断。

### B3-MAJ-001

- 首次 Codex：合法 WAV 已索引，但点击后播放器无当前音轨，队列为 0；`PARTIAL / NO-GO`。
- 第二次 Codex：正确基线再次复现两个详情页入口均无播放器状态；`FAIL / NO-GO`。
- 远端随后加入 TrackRow、播放器后端和真实鼠标 E2E 尝试，但不能以 CI 通过替代 Windows 复测。
- v1 本地包修改旧 `AsmrDetail.tsx`，生产路由不使用该文件；作废。
- v2 本地包正确定位生产链；lint、Renderer 和 Electron build 通过，但 E2E 在 `RJ detail action backend duration` 超时；Codex 恢复临时改动，无提交、无推送；作废。
- v3 本地包只在对话中生成，没有执行、没有验证、没有推送；明确废弃，不进入 Git。

### 用户确认 1.0 最终路线

```text
完成 Beta 3
→ 全面审查 UI、功能和所有按钮的全功能链路
→ 自动化修复与回归
→ Codex 或 DeepSeek Windows 实机全量验收
→ 清理无用文件和历史遗留
→ 发布正式 1.0.0
→ 后续只维护 Bug、UI 和明确的小功能
```

- 1.0 前不得因为 Beta 3 发布成功就跳过全产品审查。
- 全产品审查必须覆盖生产路由、页面、菜单、按钮、快捷键、播放器、资源库、Index、导入、元数据、设置、安装器和数据保留。
- 每个按钮检查 UI → Hook/Service → IPC/Main → 后端/文件系统 → 成功反馈、失败提示与恢复链。
- 自动化通过后，ChatGPT 生成固定 branch/SHA 的实机提示词，由用户转发；用户不亲自测试。
- 实机报告无 Blocker/Major 且必要项全部 PASS 后，才允许清理项目并发布 1.0.0。
- 1.0 后默认进入维护模式，不主动规划大版本；大型功能仅在用户明确需要时单独立项。

### Git Fast Lane v2.1

```text
锁定并同步源码一次
→ 本地集中完成分析、开发、批量修改、自动测试和文档
→ 审查完整 diff
→ 1～2 个逻辑提交
→ 统一推送一次
→ 一次必要 CI
→ 需要实机时输出固定 SHA 提示词
→ Codex 或 DeepSeek 实机验收
→ ChatGPT 合并和发布
```

- 候选稳定前不逐文件远程提交、不边改边推、不反复触发 CI。
- 多文件任务必须批量提交。
- 通常一次推送；真实 CI 失败最多追加一次修复推送。
- 文档与代码在同一轮最终推送前同步。
- 用户只转发实机提示词，不承担 Git、构建、测试或排错。

### 第一轮：B3-MAJ-001 诊断增强

- 起始 HEAD：`7f088a077afb8f172511f291309c461db6fe8a56`。
- 标准 `git clone` 因当前执行环境无法解析 `github.com` 失败；未改用逐文件提交。
- 使用 GitHub 连接器按固定 SHA 读取源码，最终使用单一 tree/commit 统一推送。
- 新增独立诊断探针，但第一候选在 TypeScript/构建阶段失败；唯一修复推送后构建和 U29 通过。
- Beta 3 RJ 专项随后因探针变量拼写错误 `SNAPSHOT_EXRESSION` / `SNAPSHOT_EXPRESSION` 提前退出，没有产生播放器根因证据。
- 第一轮最终 HEAD：`f947dc2cb4182b1a7031575d6b97d5d89bcc3e5d`；PR 保持 Draft / NO-GO。

### 第二轮：诊断修复与增量 CI 试运行

- 起始 HEAD：`f947dc2cb4182b1a7031575d6b97d5d89bcc3e5d`。
- 用户允许将同链路、简单且验证方式一致的任务合并处理，避免过度拆分和上下文浪费。
- 用户确认 Codex 和 DeepSeek 都可在实机协助；ChatGPT 负责选择执行端并提供固定 branch/SHA 提示词。
- 本轮范围：修正探针变量、增加独立静态自检、让 Player Fast Validation 只比较本次推送差异、避免专项诊断触发全产品 Branch Validation、生成固定 HEAD 的源码快照 Artifact。
- 本轮仍不修改播放器业务行为；只有取得完整 PlayerState、HTMLAudio、mpv 和 IPC 时间线后才决定最小修复。
- 源码快照和增量 CI 暂按 v2.2 试运行；若下一轮读取、修改和验证速度明显提升，再固定为默认流程。

## 当前结论

```text
公开版本：0.169.0-beta.2
下一版本目标：0.170.0-beta.3
正式稳定版目标：1.0.0
当前任务：第二轮诊断修复与增量 CI 试运行
PR #91：草稿、禁止合并
Beta 3 Release：尚未创建
大型功能：长期冻结，只有明确需求后启动
Git：源码快照试运行、本地集中修改、单一提交、统一推送
实机执行：Codex 或 DeepSeek，均使用固定 branch/SHA 提示词
```

### 第三轮：真实库边界调整与正式实机结果

- 用户确认 `E:\arsm` 可以作为可写扫描目标；Index 与 backup 更新不属于失败，资源仍在持续下载。
- 正式 SHA `1f839e5298d96a61ceaf8e4621b17244c0f8946a` 的真实大库扫描 PASS：137 个作品或专辑、7145 条音轨。
- 媒体本体、字幕、封面和专辑目录数量没有减少。
- 实机暴露三个阻断：mpv ENOENT、HTMLAudio 真实 WAV duration/progress 为 0、同 Profile 重启后黑屏。
- 用户补充发现专辑封面重复，加入 B3-MAJ-004。

### 第四轮：真实播放、重启和封面合并修复

- 起点 HEAD：`1f839e5298d96a61ceaf8e4621b17244c0f8946a`。
- `yang-kura-media://` 改为 main 侧 MIME、Content-Length、Range/206/416 和流式响应。
- mpv 改为显式可选增强后端；新 Profile 默认 HTMLAudio，未安装 mpv 时不再进入 backend spawn。
- 大 Index 不再与完整派生 RJWorks/MusicAlbums 一起重复写入 localStorage；启动时从持久化授权目录自动重新读 Index。
- 修复 umbrella collection 拆分后多个真实 RJ 继承同一封面；扫描和归一化均按实际 collection 目录独立选封面。
- CoverArtwork 在 `src` 更新后退出旧失败状态。
- 同轮修正 U32 为当前推送差异门禁，普通 Electron 运行时代码不再触发 portable/NSIS 完整打包。
- 本地 lint、Renderer build、Electron build、诊断探针和 Beta 3 runtime-hardening verifier PASS。
- 当前环境缺少可下载的 Electron binary，GUI E2E 等待 GitHub Actions；不因此追加第二次本地补丁推送。


### 第五轮：U40-D 工作流与 U40-B 真实 Index 测试修复

- R4 正式候选 HEAD：`6caf3ce347ea094d465856800d5071736e2ac159`。
- R4 本地与大部分 Windows CI 通过；唯一失败是 `test-u40b-full-product-journey.mjs` 等待 `u29SourceReady` 超时。
- 根因不是工作流 runner 卡死：U40-B fixture 仍写旧 `sqlite_rj_works/sqlite_music_albums` 和持久化队列；当前产品会清理旧派生缓存，并从持久化队列移除 `rootPathToken`，导致测试永远无法恢复 source-ready。
- U40-B 改为生成 UTF-8 BOM `library-index.json`，通过正式目录授权和“读取已有记录”进入播放器，再验证真实 tokenized queue、字幕和一秒音频自然结束。
- U40-D workflow 新增 `requires_full_e2e`：文档和静态验证器修改只跑 focused regressions；运行时代码、Electron E2E、U40-B fixture 或 workflow 修改才跑完整 Windows 套件。
- 完整产品 Journey 提前执行并设置 10 分钟 step 上限，避免前序重复 E2E 全部完成后才暴露 fixture 失败。
- 工作方式已更新：ChatGPT 只读拉取 GitHub，在本地完成开发、测试、文档和完整源码包，不再创建 Blob、Commit、PR 评论或更新分支。
- Codex / DeepSeek 负责将源码包应用到固定 SHA、创建单一提交并推送；Codex 继续执行 `E:\arsm`、声卡、mpv 和同 Profile 重启等实机验收。

### R5 Windows PASS 与 R6 点击加固收口

- PR #91 远端 R5 HEAD：`84e3caabec37a8de3843a51068b15bce76385524`；该 SHA 的 Documentation、Architecture、Branch、Player Fast、U40-B、U40-D、U32 和 Personal Beta 3 Release scope 全部 PASS。
- Windows fresh clone 使用 `E:\arsm` 读取 137 个作品或专辑、6979 条音轨；RJ00331318 两个播放入口、duration/progress、pause/resume/seek、上一首/下一首、音量/静音和同 Profile 重启续播 PASS。
- 资源保护：音频 8086、字幕 11149、封面 4895、专辑目录 267，均未减少；无删除、异常移动或重命名。
- B3-MAJ-001、B3-MAJ-002、B3-MAJ-003 关闭。B3-MAJ-004 自动映射验证 PASS，但真实多专辑视觉核对尚未完成。
- R5 实机工作区把 `TrackRow` 主区域从父级 `onClickCapture` 加固为按钮直接 `onClick`，且全部自动化和真实库复测 PASS；该一文件产品修复尚未进入远端。
- R6 源码包固化 direct activation，并让 Beta 3 详情页 E2E 明确断言 `data-track-row-activation=direct`。
- 后续不重复全套播放测试，只执行新 SHA 两入口短测、真实多专辑封面核对，以及 `%TEMP%` 小样本导入事务/冲突/失败回滚/OperationLog。
- Git 分工保持：ChatGPT 只读拉取和交付源码包；Codex / DeepSeek 单一提交和推送；Codex 负责 Windows 实机门禁。


## 2026-07-19 — Beta 3 发布与 U41-A 审计

### Beta 3

- PR #91 更新为 R6 PASS，解除 Draft，并以 squash 合并。
- `main`：`8a92978bbd07aa9f490ec15c9037366793168e2c`。
- 发布：`v0.170.0-beta.3` prerelease。
- 真实库播放、重启、封面、导入事务后端和资源保护门禁完成。

### U41-A 全产品审计

- 锁定合并后的 `main`，不做 Git 写入。
- 枚举 8 个生产路由、268 个静态控件标记、215 个代码模块。
- 识别 67 个不可达实现模块、15 个 workflow、85 个 verifier。
- 确认 1 个 Blocker：日常 Importer 没有真实 UI 执行闭环。
- 确认 Major：伪数据刷新、旧版本字符串、Electron 补丁、Importer bundle、冻结下载器生产路由和旧巨页清理。
- lint、Renderer/Electron build、U30、50,000 音轨、Index maintenance、Importer transaction backend 和 stable regression PASS。
- Linux stable 的两个 CRLF mpv fixture 通过临时 LF 转换验证，原文件恢复；后续由 U41-C 正式修复。

### Git Fast Lane v2.1

- ChatGPT 只读拉取 GitHub并交付完整源码包。
- Codex / DeepSeek 对固定父 SHA 应用源码包，单一提交、一次推送。
- U41-A 只提交审计和文档，不混入产品修复。
- 下一轮 U41-B 集中实现真实 Importer、移除伪刷新和统一版本源。

## 2026-07-19 — U41-B 日常用户入口

- 固定父 SHA：`8a92978bbd07aa9f490ec15c9037366793168e2c`；远端无 U41 分支/PR。
- 日常 Importer 从历史约 4000 行模型页替换为真实四步流程：来源扫描、目标/方式、预检、事务与 Index 刷新。
- 来源与目标目录选择增加 `selectionRole`，Windows E2E 可用独立临时目录。
- copy/move 复用 U31 transaction、OperationLog、rollback；Index patch 强制备份。
- `libraryReadCoordinatorService.acceptResult` 接收写后读回结果，避免 UI 使用旧缓存。
- 生产音声库移除“刷新卡片显示信息”及随机封面/虚构音轨 handler。
- Vite 从 `package.json` 注入 `__YANG_KURA_APP_VERSION__`；Settings About 通过内部 `APP_VERSION` 读取版本，不再硬编码 Beta 2。
- 源码版本同步为 `0.170.0-beta.3`。
- Importer production chunk 从约 255 KB 降至 22.03 KB；历史 importer services 退出生产 graph，留 U41-D 批量清理。
- 新增 U41-B focused verifier、Windows workflow 和可见 Importer Electron E2E。
- 本地 lint、Renderer/Electron build、U40-D 兼容、U31、U30、runtime hardening、50,000 音轨和 MVP129 PASS。
- Windows E2E 在当前 Linux 环境 `NOT RUN`，不得视为 PASS；必须由 Draft PR CI 和 Codex 完成。
- Git 仍由 ChatGPT 只读交付源码包；DeepSeek/Codex 单一提交、一次推送、Draft PR。

## 2026-07-19 — U41-C 运行时与跨平台门禁

- 远端 `main` 仍为 `8a92978bbd07aa9f490ec15c9037366793168e2c`，没有 U41 分支或 PR；U41-C 基于未推送的 U41-B 完整候选继续开发。
- Electron 依赖范围升级到 `^39.8.10`，lockfile 固定 `39.8.10`；`desktop:setup` 与当前维护模型同步。
- `npm audit --audit-level=moderate` 结果为 0 vulnerability。
- BrowserWindow 显式关闭 `nodeIntegrationInWorker`、`nodeIntegrationInSubFrames`、`webviewTag`，并拒绝 Renderer `window.open()`。
- `yang-kura-media://` 保持 tokenized root、安全相对路径、静态 MIME、Range 和 `corsEnabled=true（Electron 39 renderer fetch 兼容；token 与相对路径校验不变）`；Windows U28/U29 继续作为动态门禁。
- 两个 mpv executable fixture 永久转换为 LF；新增 `.gitattributes`，Linux stable 不再需要临时转换。
- TopBar 资源库状态增加 `role=status`、`aria-live=polite`、`aria-atomic=true`。
- 设置维护入口不再声称拥有完整历史诊断，改为真实资源统计与按需性能检查。
- 新增 U41-C focused verifier 和单一 Windows runtime/packaging workflow，合并运行 audit、U28、U29、portable、NSIS 和 U32。
- 本地 lint、Renderer/Electron build、U41-B/U41-C verifier、runtime hardening、U31、U30、50,000 音轨、MVP129 和 stable regression PASS。
- 当前 Linux 环境在 `npm rebuild electron` 时因 GitHub DNS `EAI_AGAIN` 无法下载 39.8.10 binary；U41-B visible E2E、U28/U29 和打包严格为 `NOT RUN`，等待 Draft PR CI/Codex。
- 因 U41-B 尚未远端集成，交付改为 U41-A+B+C 累积单一分支/提交，避免两轮依赖链和重复 CI。
