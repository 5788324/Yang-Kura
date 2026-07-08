# MVP-94 更新

当前版本：`0.132.0-mvp94`。copy-only preflight 真实化，但仍不执行真实 copy，不创建目录，不写 OperationLog。Renderer 不接收 absolutePath 或 file://。

当前最新版本：0.129.0-mvp91。MVP-91：copy only 导入前执行合同 / 二次确认设计；冻结预检、OperationLog、失败列表、跳过列表和 disabled-preview-only 执行状态，不执行 copy / move / delete / rename。

## MVP-91 / 0.129.0-mvp91

Current baseline: `0.128.0-mvp90`.

MVP-91 adds the copy only import execution readiness contract. It defines preflight checks, confirmation requirements, file execution plans, OperationLog preview fields, failureList and skippedList, while keeping the execution button disabled-preview-only. This round does not execute copy, move, delete, rename, SQLite writes, provider calls, mpv integration, absolutePath exposure, or file:// exposure.

Next recommended task: MVP-92 copy only 最小真实样本准备；真实 copy 前建议 Codex 本机关键验收。

当前最新版本：0.125.0-mvp87。MVP-87：RJ 专辑导入只读识别；只处理 sourceRootToken + relativePaths，生成 ImportTask preview，不执行文件操作。


## MVP-86 / 0.124.0-mvp86

Current baseline: `0.124.0-mvp86`.

MVP-86 adds the 导入器 UI 壳 / ImporterPage preview shell. It shows mock ImportTask previews, source options, metadata candidates, conflict preview, target path plan, and guarded boundaries. This round does not execute import operations. No copy, move, delete, rename, real import IPC, SQLite, download Provider, absolutePath exposure, or file:// exposure was added.

Next recommended task: MVP-87 RJ 专辑导入只读识别.

# Yang-Kura MVP85 / 0.123.0-mvp85

当前最新版本：0.123.0-mvp85。MVP-85：ImportTask / DownloadTask / DownloadManifest / MetadataSource 数据模型合同。本轮只冻结导入器、下载器、Manifest、MetadataSource、ImportTargetPlan、ImportConflictReport 的类型和文档；不接真实导入器、不接下载 Provider、不复制 / 移动 / 删除 / 重命名真实媒体文件，不改扫描 / 写 index / 播放内核链路。

- Current version: `0.123.0-mvp85`
- 新增锚点：`mvp85-import-download-models`、`mvp85-model-cards`、`mvp85-import-task-contract`、`mvp85-download-task-contract`、`mvp85-metadata-source-contract`、`mvp85-download-manifest-contract`、`mvp85-model-guardrails`。
- 新增文档：`docs/IMPORT_DOWNLOAD_MODEL_CONTRACT_MVP85.md`、`docs/CURRENT_ROADMAP_MVP85.md`、`docs/CODEX_PUSH_READY_MVP85.md`。
- 新增 verifier：`npm run verify:mvp85-import-download-models`，并已接入 `verify:all`。
- Codex 推送准备：本包可作为 clean source，用 `docs/CODEX_PUSH_READY_MVP85.md` 的步骤在本机标准 Git 推送。

---

# Yang-Kura MVP82 / 0.120.0-mvp82

当前最新版本：0.120.0-mvp82。MVP-82：DeepSeek UI bug sweep。根据 DeepSeek 对 LyricsPanel / Dashboard / AsmrLibrary / MusicLibrary 的二次审查，本轮修复残留无效 Tailwind utility、补齐 animate-scale-up、增加时长格式容错，并继续保持真实扫描 / 写 index / 播放内核 / 文件安全链路不变。GitHub 因公司网络暂不推送。

- Current version: `0.120.0-mvp82`
- 新增锚点：`mvp82-ui-bug-sweep`、`mvp82-ui-bug-sweep-fixes`、`mvp82-ui-bug-sweep-notes`、`mvp82-ui-bug-sweep-guardrails`。
- 新增文档：`docs/UI_BUG_SWEEP_MVP82.md`、`docs/CURRENT_ROADMAP_MVP82.md`、`docs/DEEPSEEK_REVIEW_RESULT_MVP81.md`。
- 新增 verifier：`npm run verify:mvp82-ui-bug-sweep`，并已接入 `verify:all`。

---

<!-- MVP-81 status marker -->
当前最新版本：0.119.0-mvp81。MVP-81：离线 Demo 封面清扫。根据 DeepSeek 运行时审查中发现的远程图片失败/控制台噪音，本轮移除 UI 原型中的 Unsplash Demo 封面请求，统一改为 coverArtworkService 生成的本地 SVG data URL 封面。不接 SQLite / 下载器 / 元数据抓取 / mpv，不删除 / 移动 / 重命名真实媒体文件，不向 Renderer 暴露 absolutePath 或 file://。

## MVP-81 update — 离线 Demo 封面清扫

- Current version: `0.119.0-mvp81`
- 新增锚点：`mvp81-offline-demo-cover-cleanup`、`mvp81-offline-cover-checks`、`mvp81-offline-cover-guardrails`。
- 新增 service：`src/services/offlineDemoCoverCleanupService.ts`。
- 新增 verifier：`npm run verify:mvp81-offline-demo-cover-cleanup`，并已接入 `verify:all`。
- Demo 封面改为本地生成 SVG，不再请求 Unsplash。
- 本轮只做 UI Demo 离线封面和控制台噪音清扫，不改真实扫描 / 写 index / 播放内核链路。

<!-- MVP-78 status marker -->
当前最新版本：0.116.0-mvp78。MVP-78：播放器大页 / 歌词页布局审查。DeepSeek 对 MVP-77 的对照验收结论为 PASS；本轮继续处理经典 / 黑胶 / 歌词三种播放页在窄屏、长标题、长歌词和底部控制栏场景下的布局稳定性，并补强全屏播放页进度条的 clamp / safe duration。不接 SQLite / 下载器 / 元数据抓取 / mpv，不删除 / 移动 / 重命名真实媒体文件，不向 Renderer 暴露 absolutePath 或 file://。

## MVP-78 update — 播放器大页 / 歌词页布局审查

- Current version: `0.116.0-mvp78`
- 新增锚点：`mvp78-player-panel-layout-review`、`mvp78-full-player-responsive-shell`、`mvp78-player-header-wrap-safe`、`mvp78-classic-visual-clamp`、`mvp78-vinyl-size-clamp`、`mvp78-lyrics-reading-width`、`mvp78-bottom-control-safe-wrap`。
- 新增 service：`src/services/playerPanelLayoutReviewService.ts`。
- 新增 verifier：`npm run verify:mvp78-player-layout-review`，并已接入 `verify:all`。
- 新增 DeepSeek 验收记录：`docs/DEEPSEEK_REVIEW_RESULT_MVP77.md`。
- 本轮只做播放器大页 / 歌词页 UI 布局和进度显示安全收口，不改真实扫描 / 写 index / 播放内核链路。

<!-- MVP-77 status marker -->
当前最新版本：0.115.0-mvp77。MVP-77：打包版回归验收清单 / UI 布局审查 / DeepSeek 对照验收提示词。当前用户在公司不方便人工验收，本轮把 MVP71～MVP76 的首页、播放栏、诊断页、音声库和音乐库布局收口转成机器验证、人工验收清单和 DeepSeek/Codex 对照审查提示词。不接 SQLite / 下载器 / 元数据抓取 / mpv，不删除 / 移动 / 重命名真实媒体文件，不向 Renderer 暴露 absolutePath 或 file://。

## MVP-77 update — 打包版回归验收 / UI 布局审查

- Current version: `0.115.0-mvp77`
- 新增锚点：`mvp77-packaged-regression-review`、`mvp77-machine-checks`、`mvp77-ui-layout-checks`、`mvp77-manual-regression-checks`、`mvp77-deepseek-review-prompt`。
- 新增 service：`src/services/packagedRegressionReviewService.ts`。
- 新增 verifier：`npm run verify:mvp77-packaged-regression-review`，并已接入 `verify:all`。
- 新增 DeepSeek 对照审查提示词：`docs/DEEPSEEK_REVIEW_PROMPT_MVP77.md`。
- 本轮只做验收准备和静态 UI 布局审查，不改真实扫描 / 写 index / 播放内核链路。



<!-- MVP-76 status marker -->
当前最新版本：0.114.0-mvp76。MVP-76：音声库 / 音乐库卡片视觉统一。重点修正卡片列宽、封面比例、长标题截断、状态标签换行和音乐歌曲行窄屏拥挤问题。不接 SQLite / 下载器 / 元数据抓取 / mpv，不删除 / 移动 / 重命名真实媒体文件，不向 Renderer 暴露 absolutePath 或 file://。

## MVP-76 update — 音声库 / 音乐库卡片视觉统一

- Current version: `0.114.0-mvp76`
- 新增锚点：`mvp76-card-layout-unity`、`mvp76-asmr-card-layout-unity`、`mvp76-music-card-layout-unity`、`mvp76-music-track-layout-unity`。
- 新增 service：`src/services/libraryCardLayoutPolishService.ts`。
- 新增 verifier：`npm run verify:mvp76-card-layout-unity`，并已接入 `verify:all`。
- 音声库和音乐库卡片使用更安全列宽、固定封面比例、两行标题、状态换行和窄屏操作区换行。
- 仍不改真实扫描 / 写 index / 播放内核链路。

<!-- MVP-70 status marker -->
当前最新版本：0.108.0-mvp70。MVP-70：Beta 0.1 最终交接包。用户本机真实链路已通过：选择音声库目录 → 一键扫描并应用 → 音频、歌词、图片、视频均可播放或打开。当前状态为 Beta 0.1 RC 可交付包 / 可暂停开发 / 可后续维护。后续只修真实缺陷，不接 SQLite / 下载器 / 元数据抓取 / mpv，不删除 / 移动 / 重命名真实媒体文件。

## MVP-70 update — Beta 0.1 最终交接包

- Current version: `0.108.0-mvp70`
- 本轮定位：最终交接说明轮；不扩功能，只固定接手规则、轻量验证命令和后续维护路线。
- 用户本机已确认：选择音声库目录 → 一键扫描并应用 → 音频播放、歌词读取、图片打开、视频打开均可通过。
- 新增锚点：`mvp70-beta-final-handoff`。
- 新增 service：`src/services/betaFinalHandoffService.ts`。
- 新增 verifier：`npm run verify:mvp70-beta-final-handoff`，并已接入 `verify:all`。
- 仍不接 SQLite / 下载器 / 元数据抓取 / mpv；不删除 / 移动 / 重命名真实媒体文件；不向 Renderer 暴露 absolutePath 或 file://。

<!-- Legacy MVP-69 marker for verifier compatibility: 0.107.0-mvp69 / MVP-69 / Beta 0.1 Release Candidate -->

<!-- MVP-69 status marker -->
当前最新版本：0.107.0-mvp69。MVP-69：Beta 0.1 Release Candidate 整包确认。真实样本链路已通过：选择音声库目录 → 一键扫描并应用 → 音频、歌词、图片、视频均可播放或打开。当前状态为 Beta 0.1 GUI PASS 候选 / RC。后续只修真实缺陷，不接 SQLite / 下载器 / 元数据抓取 / mpv，不删除 / 移动 / 重命名真实媒体文件。


## MVP-69 update — Beta 0.1 Release Candidate 整包确认

- Current version: `0.107.0-mvp69`
- 本轮定位：Beta 0.1 RC 整包确认；不扩功能，只固定真实样本通过状态、RC 能力边界和后续只修缺陷策略。
- 用户本机已确认：选择音声库目录 → 一键扫描并应用 → 音频播放、歌词读取、图片打开、视频打开均可通过。
- 新增锚点：`mvp69-beta-release-candidate`。
- 新增 service：`src/services/betaReleaseCandidateService.ts`。
- 新增 verifier：`npm run verify:mvp69-beta-release-candidate`，并已接入 `verify:all`。
- 仍不接 SQLite / 下载器 / 元数据抓取 / mpv；不删除 / 移动 / 重命名真实媒体文件；不向 Renderer 暴露 absolutePath 或 file://。



<!-- MVP-68 status marker -->
当前最新版本：0.106.0-mvp68。MVP-68：Beta 0.1 RC 使用说明 / 打包说明 / 诊断页折叠计划收口。真实样本链路已通过：选择音声库目录 → 一键扫描并应用 → 音频、歌词、图片、视频均可播放或打开。不接 SQLite / 下载器 / 元数据抓取 / mpv，不删除 / 移动 / 重命名真实媒体文件。

# RUN ME FIRST — Yang-Kura

Current version: `0.107.0-mvp69`
## MVP-67 update — Beta 0.1 RC 收口

- Current version: `0.107.0-mvp69`
- 本轮定位：真实样本回归通过记录 + Beta 0.1 Release Candidate 收口。
- 用户本机已确认：选择音声库目录 → 一键扫描并应用 → 音频播放、歌词读取、图片打开、视频打开均可通过。
- 新增锚点：`mvp67-beta-rc-closeout`。
- 新增 service：`src/services/betaRcCloseoutService.ts`。
- 新增 verifier：`npm run verify:mvp67-beta-rc-closeout`，并已接入 `verify:all`。
- 仍不接 SQLite / 下载器 / 元数据抓取 / mpv；不删除 / 移动 / 重命名真实媒体文件；不向 Renderer 暴露 absolutePath 或 file://。

## Install and validate source

```bash
npm ci --ignore-scripts
npm run lint
npm run build:electron
npm run verify:all
npm run build
npm audit --audit-level=high
```

## Local GUI regression on Windows

Use Node 22 LTS and npm 10.x.

```bash
npm run desktop:setup
npm run desktop:smoke-check:strict
npm run dev:electron
```

`npm run dev:electron` is the compatibility alias for `npm run desktop:dev`.

If port 3000 is occupied, close the occupying process or set:

```bash
set YANG_KURA_VITE_DEV_URL=http://127.0.0.1:3001
npm run dev:electron
```

PowerShell:

```powershell
$env:YANG_KURA_VITE_DEV_URL="http://127.0.0.1:3001"
npm run dev:electron
```

## What this package is

This package is the MVP-63 Electron resolved binary path false-negative fix round.

It keeps the project on:

- React + Vite + TypeScript + Electron
- Local JSON Index first
- SQLite postponed
- Chinese UI

## What changed in MVP-61

- Added `localRegressionFixService`.
- Settings/About has `mvp61-local-regression-fix`.
- Diagnostics has `mvp61-local-regression-fix-review`.
- Added `dev:electron`, `desktop:setup`, and `desktop:smoke-check:strict`.
- Hardened Electron smoke check strict mode.
- Filtered `collection.folderPath` display against absolute paths and `file://`.

## Safety boundary

Do not add SQLite, downloader, metadata scraping, mpv, or real media file mutation. Renderer must not receive `absolutePath` or `file://`.

## Scope note

不是：SQLite 版、下载器、元数据抓取器、mpv 后端、真实文件整理工具或批量重命名工具。


---

## MVP-62 更新：Electron strict smoke / setup 可靠性修复

当前版本：`0.100.0-mvp62`。

MVP-62 只修本机 GUI 回归阻塞：

- `desktop:setup` 升级为 install + `npm rebuild electron` + `electron --version` 验证。
- `desktop:smoke-check:strict` 在 Windows 下通过 `cmd.exe /d /c` 启动 `.cmd` wrapper，避免 `EINVAL`。
- strict smoke 会检查 `path.txt`、resolved Electron binary 和 `electron --version`。
- 本机 GUI 回归建议 Node 22.12+ / npm 10.x；正式 engine 仍是 Node `>=22 <23` / npm `>=10 <11`。
- 新增设置页标记 `mvp62-electron-regression-hardening` 和诊断页标记 `mvp62-electron-regression-hardening-review`。

推荐本机 GUI 回归流程：

```bash
nvm use 22
npm ci --ignore-scripts
npm run verify:all
npm run build
npm run desktop:setup
npm run desktop:smoke-check:strict
npm run dev:electron
```

仍不进入 SQLite、下载器、元数据抓取、mpv、高级文件整理、批量重命名或大组件一次性拆分。Renderer 仍不接收 `absolutePath` 或 `file://`。


---

## MVP-63 更新：Electron resolved binary 路径误判修复

当前版本：`0.101.0-mvp63`。

MVP-63 只修 MVP-62 本机回归报告中的 false negative：

- 当 `node_modules/electron/path.txt` 内容是 `electron.exe` 时，`desktop:setup` 和 `desktop:smoke-check:strict` 现在会优先检查 `node_modules/electron/dist/electron.exe`。
- `scripts/setup-electron-desktop.mjs` 与 `scripts/desktop-smoke-check.mjs` 新增 candidate path 解析，不再误查 `node_modules/electron/electron.exe`。
- 保留 MVP-62 的 Windows `.cmd` 启动方式：`cmd.exe /d /c electron.cmd --version`。
- 新增设置页标记 `mvp63-electron-binary-path-fix` 和诊断页标记 `mvp63-electron-binary-path-fix-review`。
- 诊断页黑视图问题不在本轮源码内声称已修复；修完 strict smoke 后需要本机 GUI 复测。

推荐本机 GUI 回归流程：

```bash
nvm use 22
npm ci --ignore-scripts
npm run verify:all
npm run build
npm run desktop:setup
npm run desktop:smoke-check:strict
npm run dev:electron
```

本轮仍不进入 SQLite、下载器、元数据抓取、mpv、高级文件整理、批量重命名或大组件一次性拆分。Renderer 仍不接收 `absolutePath` 或 `file://`。


---

## MVP-64 诊断页黑视图修复

当前版本：`0.103.0-mvp65`。

本轮新增 `DiagnosticsRuntimeBoundary`，在 App 层包裹 `DiagnosticsPage`。如果诊断页局部区块运行时报错，应显示 `mvp64-diagnostics-runtime-fallback` 中文安全降级页，不再让 Electron 窗口整窗黑屏。设置页记录 `mvp64-diagnostics-black-view-fix` 复测说明。

继续保持：Local JSON Index 优先；SQLite / 下载器 / 元数据抓取 / mpv 后置；不删除 / 移动 / 重命名真实媒体文件；Renderer 不接收 `absolutePath` / `file://`。


## MVP-65 更新

当前版本：`0.103.0-mvp65`。修复诊断页 `undefined.map` 运行时异常，新增 `toArray` 兜底和 `verify:mvp65-diagnostics-map-guard`。安全边界不变。

---

## MVP-66 更新：Beta 0.1 GUI 全链路回归确认

当前版本：`0.105.0-mvp67`。

MVP-66 不增加新功能，只固定 Beta 0.1 GUI 全链路回归确认路径。

新增设置页 / 诊断页 anchor：`mvp66-beta-gui-regression`。

本轮确认重点：

- Node 22 / npm 10 环境下执行 `verify:all`、`build`、`desktop:setup`、`desktop:smoke-check:strict`、`dev:electron`。
- 首页、音声库、音乐库、歌单页、播放器、设置页、诊断页可连续切换。
- 诊断页不再出现黑视图、`mvp64-diagnostics-runtime-fallback` 或 `Cannot read properties of undefined`。
- 用真实小样本资源库确认 dry-run scan、写入 / 读取 `library-index.json`、本地音频播放、字幕读取和外部打开。
- 主界面不直接显示真实盘符路径或 `file://`。
- 不删除 / 移动 / 重命名真实媒体文件。

下一轮建议：MVP-67 真实样本回归缺陷修复。

仍不进入 SQLite、下载器、元数据抓取、mpv、高级文件整理、批量重命名或大组件一次性拆分。

---

## MVP-71 更新：主界面简化 / 诊断页折叠 / AI 维护区收口

```text
version: 0.109.0-mvp71
基线来源：0.108.0-mvp70 Beta 0.1 最终交接包
```

本轮只调整信息架构，不新增真实能力。首页突出继续播放、最近播放、最近加入、音声库入口、音乐库入口和歌单入口；工程 / verifier / MVP 历史 / Electron / IPC / Contract / Scanner 等信息默认收进 AI 维护区、开发者详情、历史验证和高级诊断。

安全边界保持不变：不接 SQLite、不接下载器、不接 ASMR.one / DLsite / 网易云元数据抓取、不接 mpv、不删除 / 移动 / 重命名真实媒体文件、不向 Renderer 暴露 absolutePath 或 file://，不改真实扫描 / 写 index / 播放内核链路。



## MVP-72 更新：日常界面继续收口 / 工程标签继续后置

```text
version: 0.111.0-mvp73
基线：0.109.0-mvp71
类型：UI / 信息架构收口
```

本轮记录：

```text
1. 已新增 dailySurfaceCleanupService。
2. 首页、设置页、诊断页继续减少可见工程阶段标签。
3. 诊断页新增“日常诊断”摘要，工程 / verifier / MVP 历史继续默认折叠。
4. 真实扫描、写 index、播放内核、外部打开链路没有改动。
5. GitHub 仍非最新开发基线；后续回住所再推 MVP70/MVP71/MVP72。
```

下一步建议：

```text
MVP-73：播放器大页视觉继续精修，重点做黑胶 / 歌词 / 封面氛围。
```


## MVP-73 更新：播放器大页日常视觉收口

当前版本：`0.111.0-mvp73`。

本轮在 MVP-72 基础上继续收口播放器大页：新增 `playerDailyVisualFocusService`，让播放器可见表层优先显示当前音轨、封面 / 黑胶 / 歌词、队列、字幕状态和睡前控制。工程、verifier、MVP 历史、Electron、IPC、Scanner、Contract 等信息继续后置到诊断页 / AI 维护区。

安全边界不变：不接 SQLite，不接下载器，不接 ASMR.one / DLsite / 网易云元数据抓取，不接 mpv，不删除 / 移动 / 重命名真实媒体文件，不向 Renderer 暴露 absolutePath，不向 Renderer 暴露 file://，不改真实扫描 / 写 index / 播放内核链路。

兼容验证记录：MVP-72 基线版本 `0.110.0-mvp72`，当前继续升级到 `0.111.0-mvp73`。

---

## MVP-74 更新记录

当前版本：`0.112.0-mvp74`。

本轮主题：MVP-74 播放器底栏 / 首页重复入口继续清理。

已完成：

- 新增 `src/services/playerBarDailyCleanupService.ts`。
- 底部播放器新增 `mvp74-playerbar-daily-control-strip`，可见信息压缩为标题、播放控制、队列、字幕、音量、喜欢、歌单和播放结束策略。
- 首页新增 `mvp74-home-daily-entry-cleanup`，继续保留继续播放、最近播放、最近加入、音声库、音乐库、歌单入口。
- `mvp59-home-beta-polish` 与 `mvp39-media-overview` 默认后置为隐藏维护 marker，减少首页重复入口和工程说明。
- 不接 SQLite，不接下载器，不接元数据抓取，不接 mpv，不删除 / 移动 / 重命名真实媒体文件，不向 Renderer 暴露 absolutePath 或 file://，不改真实扫描 / 写 index / 播放内核链路。

下一步建议：MVP-75 诊断页 MVP 历史按阶段分组折叠。


## MVP-75 更新记录

当前版本：`0.113.0-mvp75`。

本轮主题：MVP-75 诊断页 MVP 历史按阶段分组折叠，并修复播放器底栏歌曲进度动画条稳定性。

完成内容：

- 新增 `src/services/diagnosticsHistoryFoldService.ts`。
- 诊断页新增 `mvp75-diagnostics-history-folded`，按阶段折叠资源库扫描、Electron / IPC、播放 / 字幕、UI 收口、Beta / 交接历史。
- 播放器底栏新增 `mvp75-playerbar-progress-stability`。
- 进度条增加 clamp / finite guard，避免 NaN、负宽度、超过 100%。
- 拖拽 seek 改用 `pendingSeekValueRef`，避免 `onMouseUp` 读到旧 `dragValue`。
- 无有效时长时禁用 range seek。

安全边界：不接 SQLite；不接下载器；不接 ASMR.one / DLsite / 网易云元数据抓取；不接 mpv；不删除 / 移动 / 重命名真实媒体文件；不向 Renderer 暴露 absolutePath / file://；不改真实扫描 / 写 index / 播放内核链路。


---

## MVP-79 播放器 UI bugfix / 0.117.0-mvp79

本轮根据 DeepSeek 对 MVP-78 后播放器组件的 `NEEDS_FIX` 审查，修复无效 Tailwind 类、`animate-bounce-subtle` 定义、PlayerBar 整栏误触发歌词页、More 死按钮、LRC 小数秒解析、LyricsPanel 睡前暗屏时钟刷新和 cover 背景图保护。

安全边界保持不变：不接 SQLite，不接下载器，不接 ASMR.one / DLsite / 网易云元数据抓取，不接 mpv，不删除 / 移动 / 重命名真实媒体文件，不向 Renderer 暴露 absolutePath 或 file://，不改真实扫描 / 写 index / 播放内核链路。

新增验证：`npm run verify:mvp79-player-ui-bugfix`。

## MVP-80：设置页 / 诊断页最终日常化检查

当前版本：`0.118.0-mvp80`。

本轮只做用户可见层级收口：设置页继续优先展示资源库、主题、隐私与文件安全说明；诊断页继续以日常诊断摘要开头；Scanner / Contract / Bridge / Dry-run / IPC / Stub / MVP 历史继续默认折叠或进入 AI 维护区。

安全边界不变：不接 SQLite，不接下载器，不接 ASMR.one / DLsite / 网易云元数据抓取，不接 mpv，不删除 / 移动 / 重命名真实媒体文件，不向 Renderer 暴露 absolutePath 或 file://，不改真实扫描 / 写 index / 播放内核链路。

MVP-80 验证命令：

```bash
npm ci --ignore-scripts
npm run lint
npm run build:electron
npm run verify:mvp80-settings-diagnostics-daily-finalize
npm run verify:all
npm run build
npm audit --audit-level=high
```

## MVP-83 Update

version: `0.121.0-mvp83`

MVP-83：Beta 0.1 阶段性收口 / GitHub 推送准备。公司网络仍不执行 GitHub 推送；当前最新开发基线是本地源码包，不是远程 `main`。本轮新增推送准备文档、诊断页推送准备区和 verifier，不改真实扫描 / 写 index / 播放内核 / 文件安全链路。

推荐回住所后先运行：`npm ci --ignore-scripts`、`npm run verify:all`、`npm run build`、`npm audit --audit-level=high`，再按 `docs/GITHUB_PUSH_PREP_MVP83.md` 推送。

## MVP-84 Update — 导入器 / 下载生态 / 项目总规划并入

Version: `0.122.0-mvp84`

本轮吸收 `Yang-Kura_项目总规划与讨论总结.md` 的结论：下一阶段从导入器 / 入库器开始，不从下载器或 mpv 开始。导入器先服务已有 RJ 专辑、普通音乐专辑、单曲和手动下载目录；文件操作从 `copy only` 开始，未来 `move` 必须有预览、确认、操作日志和失败记录。

GitHub 推送已用标准 git 路径尝试，但当前环境无法解析 `github.com`，因此本轮不强推远程，继续生成本地 clean source 包。

后续建议：`MVP-85` 做 `ImportTask / DownloadTask / Manifest / MetadataSource` 数据模型合同。


---

## MVP-88 更新：音乐专辑 / 单曲只读识别

当前版本：`0.126.0-mvp88`。

本轮新增 `mvp88-music-import-readonly-detection`：导入器现在可以基于 tokenized `relativePaths` 生成普通音乐专辑 / 单曲集合的只读 ImportTask 预览，支持 `inferArtistAlbumFromFolder`、`classifyMusicImportRelativePath`、`isProtectedMusicDownload` 和 `buildMusicImportReadonlyPreview`。

边界：不读取真实目录，不读取 ID3 / FLAC tag，不转换或解密受保护格式，不复制 / 移动 / 删除 / 重命名文件，不写 `library-index.json`，不接 SQLite / 下载 Provider / mpv，不暴露 `absolutePath` 或 `file://`。

下一轮建议：MVP-89 冲突检测：同 RJ、同文件、同专辑、hash 策略。

## MVP-89 验证

运行 `npm run verify:mvp89-import-conflict-detection`，再运行 `npm run verify:all`。MVP89 只做导入冲突检测预览，不计算真实 hash，不执行文件操作。

---

## MVP-90：目标路径规划预览

当前版本：`0.128.0-mvp90`。

本轮新增 `importTargetPathPlanningPreviewService` 与 `mvp90-target-path-planning-preview`，统一 ASMR / Music / Singles / Mixed 的目标目录规则，提供 `sanitizePathSegment` / `sanitizeFileName`，预览非法字符清理、同目标文件名追加序号、长路径提醒和 `overwrite: false` 策略。

本轮仍然只是 preview：不打开真实目录，不读取真实文件系统，不复制、不移动、不删除、不重命名真实媒体文件，不写 `library-index.json`，不接 SQLite / Provider / mpv，不向 Renderer 暴露 `absolutePath` 或 `file://`。

推荐验证：

```bash
npm ci --ignore-scripts
npm run lint
npm run build:electron
npm run verify:mvp90-target-path-planning
npm run verify:all
npm run build
npm audit --audit-level=high
```

下一轮建议：MVP91：copy only 导入前执行合同 / 二次确认设计。仍不建议直接执行真实 copy。

## MVP-92 更新：copy only 最小真实样本准备

版本：`0.131.0-mvp93`。本轮新增 Codex 本机验收任务书、一次性样本目录要求、copy-only IPC 合同和 main-side copy contract。仍不执行真实 copy，不移动 / 删除 / 重命名文件，不写 `library-index.json`，不接 SQLite，不暴露 `absolutePath` 或 `file://`。



## MVP-93 copy-only main-side stub

version: `0.131.0-mvp93`

本轮新增 copy-only main-side stub / preload methods / blocked result contract。真实 copy 仍不执行；不创建目录、不复制、不移动、不删除、不重命名、不覆盖、不写 OperationLog、不写 `library-index.json`，Renderer 仍不接收 `absolutePath` 或 `file://`。

Codex 当前不需要介入；若下一轮进入真实 copy 前置验证，应暂停开发并使用 `docs/CODEX_COPY_ONLY_GATE_MVP93.md` 的提示词让 Codex 本机验收。


## MVP-95 copy-only executor / 0.133.0-mvp95

当前阶段：MVP-95。

本轮加入真实 copy-only executor：Electron main 侧允许在二次确认后执行 copy-only。

安全边界：
- 只 copy，不 move/delete/rename。
- overwriteAllowed=false，目标已存在进入 skippedList。
- 使用 COPYFILE_EXCL 防覆盖竞态。
- 只在 targetRootPathToken 下创建目标父目录。
- OperationLog 只返回 preview，不落盘。
- 不写 library-index.json。
- Renderer 不接收 absolutePath，不接收 file://。

Codex gate：MVP95 涉及真实 fs.copyFile / fs.mkdir，源码包生成后必须交给 Codex 做本机最小样本验收。
