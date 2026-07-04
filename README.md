# Yang-Kura Audio Library UI Prototype

这是一个 **React + Vite + TypeScript** 的本地音频媒体库 UI 原型。

项目目标：

```text
ASMR / RJ 音声库
+ 流行音乐库
+ 全部音频
+ 歌单
+ 最近播放
+ 统一播放器
+ LRC / 字幕
```

## 先读

新对话或新 AI 接手时，先读：

```text
NEXT_CHAT_HANDOFF.md
RUN_ME_FIRST.md
PROJECT_STATE.md
```

## 当前真实状态

当前压缩包是 UI 原型，不是完整 Electron 应用。

已有：

```text
React/Vite 页面
mockData
localStorage 模拟状态
模拟播放器进度
ASMR / 流行音乐 / 歌单 / 设置 / 诊断 / 播放器 UI
```

未有：

```text
Electron 主进程
真实本地目录扫描
真实音频播放
真实 LRC 文件读取
SQLite
Windows 安装包
```

## 运行

```bash
npm install
npm run lint
npm run build
npm run dev
```

## 验证交接文档

```bash
npm run verify:handoff
```

## 路线

短期先不要继续无限 UI 打磨，优先顺序：

```text
运行基线
数据模型
Local JSON Index
真实扫描 dry-run
真实播放验证
Electron 打包
```


## MVP-01 Update · Demo 降级与 Local JSON Index 模型入口

本轮目标是把 UI 原型中容易误导的“真实能力”降级为明确 Demo，并建立未来 `library-index.json` 的类型入口。

当前仍然不是完整 Electron 应用，不是真实扫描器，不是真实播放器，不是 SQLite 应用。

已新增：

- `docs/LOCAL_JSON_INDEX_PLAN.md`
- `src/services/libraryIndexAdapter.ts`
- `src/types.ts` 中的 `LibraryRoot / LibraryCollection / LibraryTrack / TrackSource / SubtitleSource / CoverSource / LocalJsonIndex`
- `scripts/verify-mvp01-demo-index.mjs`

本轮不做：Electron、真实目录扫描、读取 `E:\arsm`、写 `library-index.json`、SQLite、HTMLAudio、LRC 文件读取、真实下载、文件修复。

---

## MVP-02 · Fixture Scanner

本轮新增 fixture 级 scanner，用于在不读取真实硬盘的前提下验证：目录样本如何转换成 `LocalJsonIndex`。

新增文件：

```text
src/services/fixtureLibraryScanner.ts
src/services/fixtureLibrarySample.ts
tests/fixtures/library_sample/
docs/FIXTURE_SCANNER_PLAN.md
scripts/verify-mvp02-fixture-scanner.ts
```

当前 scanner 只接受虚拟 entries：

```text
fixtureLibrarySampleEntries
  ↓
fixtureLibraryScanner.scanVirtualEntries()
  ↓
LocalJsonIndex { sourceKind: "fixture" }
```

它不会：

```text
读取真实目录
扫描 E:\\arsm
写 library-index.json
接 Electron
接 SQLite
读取音频
读取 LRC 文件内容
删除 / 移动 / 重命名文件
```

验收命令：

```bash
npm run verify:mvp02-fixture-scanner
npm run verify:all
```

## MVP-03：Fixture Scanner Report / Diagnostics Layer

本轮新增 fixture scanner 的诊断报告层，仍然不接真实文件系统。

新增：

```text
src/services/fixtureScannerReportService.ts
docs/FIXTURE_SCANNER_REPORT.md
scripts/verify-mvp03-fixture-report.ts
```

能力：

```text
LocalJsonIndex fixture result
  ↓
FixtureScannerReport
  ↓
summary / diagnostics / duplicate groups / next actions
```

诊断项包括：

```text
缺封面 collection
无音频 collection
音频 track 缺字幕
重复 RJ id
重复 track relativePath
collection quality score
report status: pass / needs-review / blocked
```

安全边界：

```text
不读真实硬盘
不扫描 E:\arsm
不写 library-index.json
不接 Electron
不接 SQLite
不访问 localStorage
不调用 HTMLAudio
不删除 / 移动 / 重命名 / 修复文件
```

验证：

```bash
npm run verify:mvp03-fixture-report
npm run verify:all
```

## MVP-04 · Fixture Report UI / Diagnostics 接入

本轮把 MVP-03 的 `fixtureScannerReportService` 接入 `DiagnosticsPage`。

新增能力：

- 诊断页显示 Fixture Scanner Report。
- 显示 `pass / needs-review / blocked` 状态。
- 显示 fixture summary：roots / collections / tracks / audio / video / quality score。
- 显示缺封面、无音频、音频缺字幕、重复 RJ、重复 Track 路径统计。
- 显示 diagnostics、duplicate groups、nextActions、collection quality preview。
- 新增 `docs/FIXTURE_REPORT_UI.md`。
- 新增 `scripts/verify-mvp04-fixture-report-ui.ts`。

安全边界不变：

- 不读真实硬盘。
- 不扫描 `E:\arsm`。
- 不写 `library-index.json`。
- 不接 Electron。
- 不接 SQLite。
- 不访问 localStorage。
- 不调用 HTMLAudio。


## MVP-05 · Fixture case expansion

MVP-05 expands the fixture-only scanner sample set before any real disk scanning. It adds duplicate RJ, empty/cover-only folders, video ASMR, image/CG assets, multi-language subtitles, multi-disc/bonus folders, duplicate track paths, and missing-cover music cases.

New files:

- `docs/FIXTURE_CASES_MVP05.md`
- `scripts/verify-mvp05-fixture-cases.ts`

Updated files:

- `src/services/fixtureLibrarySample.ts`
- `src/services/fixtureLibraryScanner.ts`
- `src/services/fixtureScannerReportService.ts`
- `src/components/DiagnosticsPage.tsx`
- `tests/fixtures/library_sample/README.md`

Boundary remains unchanged: no real disk scan, no Electron, no SQLite, no `library-index.json` writes, no downloader changes.


## MVP-06 · Fixture Scanner Test Harness / Planned Scanner Contract

本轮新增 fixture scanner 的正式 test matrix 和未来真实 scanner 的合同草案。

新增：

- `src/services/fixtureScannerTestHarness.ts`
- `src/services/plannedScannerContractService.ts`
- `docs/FIXTURE_SCANNER_TEST_MATRIX_MVP06.md`
- `scripts/verify-mvp06-fixture-harness.ts`

诊断页新增 `MVP-06 Fixture Scanner Test Matrix / Planned Scanner Contract` 区块，展示：

- test cases / passed / failed / required failed
- source / safety gates
- library shape
- media recognition
- diagnostic edge cases
- planned scanner input/output/error/safety contract
- forbidden actions
- next implementation order

边界不变：不读真实盘、不写 `library-index.json`、不接 Electron、不接 SQLite、不改下载器。


## MVP-07 · Scanner Contract UI Flow

本轮把 MVP-06 的 planned real scanner contract 映射到设置页用户操作流。

新增：

- `src/services/scannerContractUiFlowService.ts`
- `docs/SCANNER_CONTRACT_UI_FLOW_MVP07.md`
- `scripts/verify-mvp07-scanner-ui-flow.ts`

设置页 `存储路径` 新增 `MVP-07 Scanner Contract UI Flow / 扫描前安全流程` 区块，展示：

- path-demo / dry-run-preview / write-index-confirm 三阶段
- `maxEntries / maxDepth / includeHidden=false / followSymlinks=false`
- 扫描前安全确认 checklist
- 用户可见操作步骤

当前仍然不读取真实目录、不写 `library-index.json`、不接 Electron、不接 SQLite。

## MVP-08：Virtual Path Parser

本轮新增虚拟路径解析层，用于在真实 scanner 前先稳定路径语义：

- `src/services/virtualLibraryPathParser.ts`
- `src/services/virtualPathParserCases.ts`
- `docs/VIRTUAL_PATH_PARSER_MVP08.md`
- `scripts/verify-mvp08-virtual-path-parser.ts`

当前只解析受控 virtual path 字符串，不读真实目录、不写 `library-index.json`、不接 Electron、不接 SQLite。

可识别：RJ、music album、Disc、特典、CG、cover、subtitle、多语言字幕、track number、反斜杠归一化。

---

## MVP-08.1 · Validation Friendly Package

本轮不是新功能开发，而是解决 Windows / npm / zip 验收问题。

已调整：

```text
- 固定推荐验收环境：Node 22 LTS + npm 10
- package.json 增加 engines 与 packageManager
- 新增 npm run verify:env
- TypeScript verifier 改为 Node .mjs 静态验收脚本
- 移除直接 tsx 依赖，避免 tsx-4.23.0.tgz 下载失败阻断 npm ci
- 新增 docs/WINDOWS_VALIDATION.md
- 实体 fixture 文件树改为 ASCII-safe manifest，避免 PowerShell 解压中日文路径报错
```

标准验收：

```bash
npm ci
npm run verify:env
npm run lint
npm run verify:all
npm run build
npm audit --audit-level=high
npm run dev
```

Windows 详细说明见：

```text
docs/WINDOWS_VALIDATION.md
```

MVP-08.1 仍然不接 Electron、不读真实硬盘、不扫描 `E:\arsm`、不写 `library-index.json`、不写 SQLite、不接真实音频播放。
