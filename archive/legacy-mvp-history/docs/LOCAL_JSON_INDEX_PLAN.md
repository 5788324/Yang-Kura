# Local JSON Index Plan

## 1. 当前阶段结论

Yang-Kura 当前仍是 React + Vite + TypeScript UI 原型。本阶段只建立 Local JSON Index 的数据模型入口，不实现真实扫描、不写真实 `library-index.json`、不接 Electron、不写 SQLite。

MVP 数据路线：

```text
mockData.ts
  ↓
libraryIndexAdapter.fromMockData()
  ↓
LocalJsonIndex 内存对象
  ↓
后续 fixture scanner / Electron scanner 复用同一 schema
```

## 2. 为什么 MVP 先用 JSON

| 方案 | 当前判断 |
|---|---|
| Local JSON Index | 快、直观、容易调试，适合 MVP |
| SQLite | 稳定、适合长期查询，但 schema/migration 会拖慢早期验证 |

结论：MVP 先 `library-index.json`，SQLite 放到 Beta 阶段再评估。

## 3. schemaVersion

第一版固定：

```ts
schemaVersion: 1
```

后续变更必须新增迁移说明，不允许悄悄改变字段含义。

## 4. 顶层结构

```ts
interface LocalJsonIndex {
  schemaVersion: 1;
  generatedAt: string;
  sourceKind: 'mock' | 'local-json' | 'fixture' | 'electron-scan';
  roots: LibraryRoot[];
  collections: LibraryCollection[];
  tracks: LibraryTrack[];
  covers: CoverSource[];
  subtitles: SubtitleSource[];
  warnings: string[];
}
```

## 5. 核心抽象

### 5.1 LibraryRoot

资源库根目录。示例：

```text
E:\arsm
F:\Music
D:\歌曲
```

字段重点：

```text
id
name
rootPath
libraryType: asmr / music / mixed
scanProfile: asmr-rj / music-folder / mixed-folder
sourceKind
createdAt
updatedAt
```

### 5.2 LibraryCollection

集合层。ASMR/RJ 与普通音乐不强行混成同一种“专辑”，但都归入 Collection。

| 类型 | collectionType |
|---|---|
| RJ 作品 | rj_work |
| 音乐专辑 | music_album |
| 文件夹专辑 | music_folder |
| 后续生成歌单集合 | playlist_generated |

### 5.3 LibraryTrack

播放器统一播放 Track。Track 可以来自 RJ 作品，也可以来自普通音乐专辑。

字段重点：

```text
id
rootId
collectionId
kind: audio / video / image / text / archive / other
title
displayArtist
displayAlbum
rjId
trackNo
durationSeconds
source
subtitles
cover
tags
```

### 5.4 TrackSource

Track 的实际来源。当前 MVP-01 只允许 `sourceKind: mock`。

后续 Electron 阶段才允许：

```text
local-file
file-url
```

### 5.5 SubtitleSource

字幕/LRC 来源。当前 MVP-01 只支持 mock lines 语义，不读真实 LRC 文件。

后续支持：

```text
音频文件名.ja.lrc
音频文件名.zh.lrc
音频文件名.bilingual.lrc
音频文件名.lrc
```

## 6. ASMR/RJ 与普通音乐映射

### ASMR/RJ

```text
LibraryRoot: 音声库根目录
Collection: RJ 作品
Track: RJ 作品下的 mp3/wav/flac/m4a/ogg 音轨
SubtitleSource: 同名 LRC/SRT/VTT/ASS
CoverSource: folder.jpg / cover.jpg / png / webp
```

### 普通音乐

```text
LibraryRoot: 音乐库根目录
Collection: 专辑 / 艺术家专辑 / 文件夹专辑
Track: 单首歌曲
SubtitleSource: 同名 .lrc
CoverSource: 内嵌封面 / folder.jpg / cover.jpg
```

## 7. 当前禁止事项

MVP-01 禁止：

```text
不接 Electron
不读真实目录
不扫 E:\arsm
不写 library-index.json
不写 SQLite
不调用 fs / child_process
不接真实 HTMLAudio
不读 LRC / SRT / VTT / ASS 文件
不改下载器为真实下载
不做文件删除 / 移动 / 重命名 / 修复
```

## 8. 后续阶段

```text
P1: Demo 降级 + Local JSON Index 类型入口
P2: fixture scanner，只扫 tests/fixtures/library_sample
P3: Electron IPC 合同，不扫真实盘
P4: 小样本真实目录 dry-run
P5: 写入 library-index.json
P6: UI 读取真实 index
P7: HTMLAudio 本地播放
P8: LRC 读取与高亮
```

---

# P2 Update: Fixture Scanner Layer

P2 adds a fixture-only scanner layer before any real directory scanning.

New files:

```text
src/services/fixtureLibraryScanner.ts
src/services/fixtureLibrarySample.ts
tests/fixtures/library_sample/
docs/FIXTURE_SCANNER_PLAN.md
scripts/verify-mvp02-fixture-scanner.ts
```

The scanner accepts virtual entries and returns `LocalJsonIndex` with `sourceKind: "fixture"`.

It does not:

- read a real directory,
- write `library-index.json`,
- connect Electron,
- use SQLite,
- call HTMLAudio,
- touch `E:\\arsm` or any real library path.

## MVP-03 fixture report diagnostic layer

Before real scanning, Yang-Kura now validates the future index shape through a fixture-only report layer:

```text
fixture virtual entries
  -> fixtureLibraryScanner.scanVirtualEntries()
  -> LocalJsonIndex(sourceKind="fixture")
  -> fixtureScannerReportService.analyze()
  -> FixtureScannerReport
```

The report stage is intentionally read-only and write-free. It exists to validate scanner rules before Electron or real disk access is introduced.


## MVP-05 fixture implications

The future Local JSON Index must support non-audio assets without pretending they are playable music. `LibraryTrack.kind` may be `audio`, `video`, `image`, `text`, or `other`. MVP scanning should keep video and image assets in the index for diagnostics and external-open workflows, while audio remains the first internal playback target.
