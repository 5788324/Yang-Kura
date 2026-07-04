# PROJECT_STATE

## 当前状态

Yang-Kura 当前压缩包是 React/Vite UI 原型。

## 已有

- 首页 / 最近播放
- Asmr 音声库
- 流行音乐库
- 歌单页
- 下载器演示页
- 设置页
- 诊断页
- 底部播放器栏
- 歌词 / 播放器详情页
- mockData
- localStorage 状态模拟
- 模拟播放进度

## 未有

- Electron 主进程
- preload bridge
- 真实本地目录扫描
- library-index.json
- SQLite
- 真实音频播放
- 本地 LRC 文件读取
- Windows 安装包

## 下一阶段优先级

1. 运行基线：npm install / lint / build。
2. 文档基线：README / NEXT_CHAT_HANDOFF / PROJECT_STATE。
3. 数据模型：LibraryRoot / Collection / Track。
4. Local JSON Index 草案。
5. 真实扫描 dry-run。
6. 真实播放验证。


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

## MVP-02 状态：Fixture Scanner

当前已新增 P2 fixture 级 scanner。

### 已有

- `tests/fixtures/library_sample/`：受控样本目录说明与占位文件。
- `src/services/fixtureLibrarySample.ts`：虚拟 fixture entries。
- `src/services/fixtureLibraryScanner.ts`：将虚拟 entries 转成 `LocalJsonIndex`。
- `docs/FIXTURE_SCANNER_PLAN.md`：P2 范围和禁止事项。
- `scripts/verify-mvp02-fixture-scanner.ts`：运行 scanner 并校验输出。

### 仍未有

- 真实目录扫描。
- Electron 目录选择。
- 写入真实 `library-index.json`。
- SQLite。
- HTMLAudio 真实播放。
- 外部 LRC 文件读取。

### 重要边界

P2 scanner 只扫虚拟 entries。`tests/fixtures/library_sample/` 里的文件是占位说明，不是运行时真实扫描目标。

## MVP-03 状态：Fixture Scanner Report

当前新增的是 fixture scanner 的报告/诊断层，不是真实扫描器。

已新增：

- `src/services/fixtureScannerReportService.ts`
- `docs/FIXTURE_SCANNER_REPORT.md`
- `scripts/verify-mvp03-fixture-report.ts`

当前可以分析：

- root / collection / track / cover / subtitle 统计
- collection 缺封面
- collection 无音频/视频
- audio track 缺字幕
- duplicate RJ id
- duplicate track relativePath
- collection quality score

仍未实现：

- Electron
- 真实目录扫描
- 真实 `library-index.json` 写入
- SQLite
- HTMLAudio 真实播放
- 本地 LRC 文件读取

## MVP-04 状态更新：Fixture Report UI

已完成：

- `fixtureLibrarySampleEntries` → `fixtureLibraryScanner.scanVirtualEntries()` → `fixtureScannerReportService.analyze()` → `DiagnosticsPage` 展示。
- 诊断页新增 fixture scanner report UI。
- 报告可见字段：summary、diagnostics、duplicate groups、nextActions、collection quality preview。

仍未完成：

- 真实目录扫描。
- Electron main/preload/IPC。
- 写入 `library-index.json`。
- SQLite。
- HTMLAudio 真实播放。
- LRC 文件读取。

当前仍是 React/Vite UI 原型 + fixture-only scanner/report。


## MVP-05 state update

Current state now includes expanded fixture scanner cases. The scanner/report pipeline can model realistic ASMR/RJ and music library edge cases in memory:

- duplicate RJ folders
- empty / cover-only folders
- video ASMR
- image/CG-only collection
- multi-language subtitles
- multi-disc / bonus subfolders
- duplicate track relative path
- missing-cover music album

This is still not a real scanner. The project still does not read user disk paths, write `library-index.json`, use SQLite, or attach Electron IPC.


## MVP-06 状态补充

当前已经完成 fixture scanner 的测试矩阵和 planned real scanner contract。

已有：

- fixture scanner
- fixture report
- fixture report UI
- 扩展 fixture cases
- fixture scanner test harness
- planned scanner contract

仍未有：

- 真实目录扫描
- Electron IPC
- `library-index.json` 写入
- SQLite
- HTMLAudio 真实播放
- LRC 文件读取

下一轮不要直接扫真实盘。建议先做 MVP-07：把 scanner contract 进一步映射到设置页/诊断页的用户操作流，或补 virtual path parser 单元用例。

## MVP-08 状态：Virtual Path Parser

已新增虚拟路径解析器，当前用途是为 fixture scanner 和未来真实 scanner 固定路径语义。

新增能力：

- `RJ01234567_作品/01_本編.mp3` → rj_work + audio track。
- `Aimer - Walpurgis/01 Walpurgis.flac` → music_album + audio track。
- `Disc 2/01_特典.wav` → discNo=2 + bonus role。
- `cg/01.png` → image track，不误判为 cover。
- `.zh.lrc` / `.ja.lrc` / `.bilingual.lrc` → subtitle language。

仍未实现：真实扫描、Electron IPC、写入 `library-index.json`、SQLite、真实音频播放。

## MVP-08.1 状态：Validation Friendly Package

本轮只处理验收链路，不新增业务功能。

已完成：

- `package.json` 固定推荐验收环境：Node 22 LTS + npm 10。
- 新增 `scripts/verify-env.mjs` 与 `npm run verify:env`。
- `verify:mvp02` ~ `verify:mvp08` 从 `tsx *.ts` 改为 `node *.mjs`。
- 移除直接 `tsx` devDependency，降低 Windows npm ci 失败概率。
- 新增 `docs/WINDOWS_VALIDATION.md`。
- 将实体 fixture 树收缩为 ASCII-safe manifest；真实运行样本仍来自 `src/services/fixtureLibrarySample.ts` 的虚拟 entries。

当前仍未实现：真实目录扫描、Electron IPC、写入 `library-index.json`、SQLite、真实音频播放、LRC 文件读取。
