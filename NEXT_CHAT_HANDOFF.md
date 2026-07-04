# Yang-Kura 下一对话交接文档

> 交接用途：当前对话上下文已经接近上限。把本文件连同压缩包交给新对话后，新对话应先阅读本文件，再检查源码，不要凭旧上下文臆测项目状态。

---

## 0. 给新对话的第一句话

请直接复制下面这段给新对话：

```text
你现在接手 Yang-Kura 项目。请先阅读压缩包根目录的 NEXT_CHAT_HANDOFF.md、RUN_ME_FIRST.md、README.md、package.json，然后再检查 src/ 目录。不要先写代码。先给我输出：
1. 当前源码真实状态；
2. 能运行的命令；
3. 下一轮最小任务计划；
4. 你发现的风险和禁止事项。

项目定位：Yang-Kura 是本地个人音频媒体库 UI 原型，目标是 ASMR/RJ 音声库 + 流行音乐库 + 统一播放器。当前压缩包是 React/Vite/AI Studio 风格 UI 原型，不是已经接完真实 Electron 扫描和真实音频播放的正式应用。必须以源码实际存在的文件为准。
```

---

## 1. 项目一句话定位

**Yang-Kura = 本地个人音频媒体库 UI 原型。**

目标不是单纯 ASMR 工具，而是：

```text
ASMR / RJ 音声库
+ 流行音乐库
+ 全部音频
+ 歌单
+ 最近播放
+ 统一播放器
+ LRC / 字幕
+ 后续本地扫描和真实播放
```

路线已经从“只做 RJ/ASMR 资源库”扩展成“ASMR/RJ + 普通音乐 + 播放器”的统一本地媒体库。播放器只关心 Track / Queue / Progress / Lyrics / Cover / Playlist；ASMR 和音乐的区别主要在资源库组织方式。

---

## 2. 当前压缩包真实状态

当前压缩包实际源码是 **AI Studio / React / Vite UI 原型**。

当前技术栈：

```text
React 19
TypeScript
Vite
Tailwind CSS 4
lucide-react
motion
localStorage mock persistence
```

当前源码结构：

```text
metadata.json
package.json
README.md
index.html
src/
  App.tsx
  main.tsx
  types.ts
  mockData.ts
  quickFiltersData.ts
  index.css
  hooks/
    useAudioPlayer.ts
    useLocalStorage.ts
  components/
    Sidebar.tsx
    Dashboard.tsx
    AsmrLibrary.tsx
    AsmrDetail.tsx
    MusicLibrary.tsx
    PlaylistPage.tsx
    DownloaderPage.tsx
    SettingsPage.tsx
    DiagnosticsPage.tsx
    PlayerBar.tsx
    LyricsPanel.tsx
```

重要说明：

```text
当前压缩包没有 electron/ 目录。
当前压缩包没有真实文件扫描器。
当前压缩包没有 Local JSON Index service。
当前压缩包没有真实 HTMLAudio / file:// 播放链路。
当前压缩包没有真实 LRC 文件读取 IPC。
当前压缩包没有打包用 electron-builder 配置。
```

如果新对话记得之前有 Electron / diagnostics service / external player dry-run 等内容，必须先以当前压缩包实际文件为准。那些是前面规划和迭代方向，不应当假装本压缩包已经完整包含。

---

## 3. 当前已经有的功能

### 3.1 页面与导航

`App.tsx` 中已有页面：

```text
dashboard      首页 / 最近播放
asmr-lib       Asmr 音声库
music-lib      流行音乐库
playlists      歌单
downloader     下载器演示页
settings       设置页
diagnostics    诊断页
```

`Sidebar.tsx` 提供左侧导航。

### 3.2 数据来源

当前主要数据来自：

```text
src/mockData.ts
localStorage
```

`App.tsx` 中使用 `useLocalStorage` 模拟 SQLite 状态：

```ts
sqlite_rj_works
sqlite_playlists
sqlite_music_albums
sqlite_favorites
sqlite_settings
```

这些命名只是 UI 原型用的 localStorage key，不代表已经接入 SQLite。

### 3.3 播放器

`src/hooks/useAudioPlayer.ts` 已有模拟播放器状态：

```text
currentTrack
isPlaying
progress
volume
queue
currentIndex
isMuted
loopMode
```

它会用 `setInterval` 模拟播放进度，并写入 localStorage：

```text
last_played_track_id
last_played_progress
last_played_track_json
```

注意：这不是浏览器真实 Audio，也不是 Electron 本地文件播放。

### 3.4 播放器 UI

已有：

```text
PlayerBar.tsx      底部播放器栏
LyricsPanel.tsx    歌词/播放器详情页
```

用户之前要求播放器有三种风格：经典 / 黑胶 / 歌词。当前源码中应继续检查 `LyricsPanel.tsx` 是否已有对应模式和布局，不要直接重写。

### 3.5 资源库 UI

已有：

```text
AsmrLibrary.tsx
AsmrDetail.tsx
MusicLibrary.tsx
PlaylistPage.tsx
```

ASMR 方向重点是：

```text
RJ 作品 / 专辑
音轨文件
字幕 / 翻译
标签
播放记录
个人备注
```

音乐方向重点是：

```text
专辑
歌手
歌曲
歌单
歌词
最近播放
```

---

## 4. 当前最重要的路线结论

### 4.1 UI 方向

UI / 播放器交互参考 YesPlayMusic，但不 fork YesPlayMusic。

原因：YesPlayMusic 适合作为 UI 参考、播放器布局参考、底部播放栏参考、歌词页参考、专辑/歌单页参考；但它是网易云音乐生态，不适合作为 Yang-Kura 的业务底座。

### 4.2 播放器能力参考

播放器底层能力可以研究 SPlayer-Next / mpv / FFmpeg 思路，但当前不直接 fork SPlayer-Next。

原因：SPlayer-Next 功能强，但技术栈复杂，包括 Vue / TypeScript / Electron / Rust native modules / FFmpeg / pnpm workspace 等。对 AI 长期维护来说复杂度较高。

### 4.3 当前推荐路线

```text
YesPlayMusic-like UI
+ 自研本地音频媒体库
+ ASMR/RJ 与流行音乐双库
+ 播放器统一播放 Track
+ 后端与真实数据逻辑自己控制
```

### 4.4 AI Studio / Gemini 的定位

当前压缩包源自 AI Studio 风格前端原型。AI Studio / Gemini 适合做漂亮 UI 原型，但不能直接当正式本地应用主线。

正式应用需要：

```text
读取本地目录
读取本地 SQLite / JSON index
隐私本地化
不上传媒体文件
不依赖云端
```

---

## 5. 绝对禁止事项

新对话接手后，除非用户明确授权，否则禁止：

```text
不删除真实媒体文件
不移动真实媒体文件
不重命名真实媒体文件
不自动整理文件夹
不扫描用户硬盘全盘
不联网抓元数据
不上传任何本地路径或媒体内容
不接真实下载器
不自动调用外部播放器
不假装已经接入 SQLite / Electron / 本地扫描
不把 mock 按钮写成真实危险动作
```

当前阶段所有真实文件能力都必须是：

```text
先 dry-run
先报告
先确认
后执行
```

---

## 6. 新对话接手后的第一轮建议任务

不要继续无限 UI 打磨。下一阶段应该开始把项目从“漂亮 UI 原型”向“真实数据闭环”推进。

### 推荐下一轮任务：MVP-01 文档与运行基线

目标：让压缩包本身更容易被任何 AI / 用户接手。

任务：

```text
1. 运行 npm install
2. 运行 npm run lint
3. 运行 npm run build
4. 修复 TypeScript / Vite 明确错误
5. 添加 RUN_ME_FIRST.md
6. 添加 PROJECT_STATE.md
7. 更新 README.md，删除或弱化 AI Studio 默认部署说明
8. 确认 app 在浏览器预览能打开
9. 输出修改报告
```

### 推荐第二轮任务：MVP-02 真实扫描前的数据模型准备

不要直接扫描本地硬盘，先定义前端可接收的数据结构。

任务：

```text
1. 在 types.ts 中增加 LibraryRoot / Collection / TrackSource / SubtitleSource 草案
2. 保持兼容现有 RJWork / MusicAlbum / AudioTrack
3. 写 docs/LOCAL_INDEX_SCHEMA_DRAFT.md
4. 不写真实扫描代码
5. 不写 Electron IPC
6. 只整理数据模型和 mock adapter
```

### 推荐第三轮任务：MVP-03 Local JSON Index mock adapter

目标：先让 UI 通过统一接口读数据，不再直接散落读 mockData。

任务：

```text
1. 新建 src/services/libraryIndexAdapter.ts
2. 输入 mockData，输出统一 LibraryRoot / Collection / AudioTrack
3. UI 暂时仍显示现有数据
4. 不读真实文件
5. 不写本地文件
```

---

## 7. 未来真实数据闭环顺序

真正要做到“个人可用 MVP”，顺序应该是：

```text
选择目录
  ↓
扫描目录 dry-run
  ↓
识别 LibraryRoot / Collection / Track
  ↓
识别封面和 LRC
  ↓
写入 library-index.json
  ↓
UI 读取真实 index
  ↓
播放本地文件
  ↓
LRC 同步显示
  ↓
打包 Electron
```

当前压缩包还在第 0~1 步之前：UI 原型阶段。

---

## 8. 数据模型方向

不要把 ASMR 和音乐硬塞成同一种“专辑”。建议三层：

```text
LibraryRoot
  -> Collection
      -> Track / MediaFile
```

### 8.1 LibraryRoot

```ts
interface LibraryRoot {
  id: string;
  name: string;
  rootPath: string;
  libraryType: 'asmr' | 'music' | 'mixed';
  scanProfile: 'asmr_rj' | 'music_album' | 'folder_album';
  createdAt: string;
  updatedAt: string;
}
```

### 8.2 Collection

ASMR：Collection = RJ 作品。  
音乐：Collection = 专辑 / 文件夹专辑。

```ts
interface Collection {
  id: string;
  libraryRootId: string;
  collectionType: 'rj_work' | 'music_album' | 'music_folder' | 'playlist_generated';
  codeRaw?: string;
  codeNorm?: string;
  title: string;
  artist?: string;
  circle?: string;
  album?: string;
  folderPath: string;
  coverPath?: string;
  status: 'ok' | 'missing-cover' | 'missing-audio' | 'warning';
  createdAt: string;
  updatedAt: string;
}
```

### 8.3 Track

```ts
interface Track {
  id: string;
  collectionId: string;
  libraryRootId: string;
  filePath: string;
  relativePath: string;
  title: string;
  artist?: string;
  album?: string;
  discNo?: number;
  trackNo?: number;
  durationSeconds?: number;
  sizeBytes?: number;
  mtimeMs?: number;
  coverPath?: string;
  lyricsPath?: string;
  playable: boolean;
}
```

---

## 9. ASMR/RJ 资源库功能优先级

ASMR 不是普通歌单逻辑，应按：

```text
作品 / RJ 专辑 → 音轨文件 → 字幕/翻译/标签/播放记录
```

必须优先支持：

```text
本地资源库路径
RJ 号识别
作品标题
社团 / CV
封面
音轨列表
字幕状态
个人标签
播放进度
最近播放
未听 / 听完 / 弃坑
```

后续再做：

```text
元数据抓取
字幕编辑
LRC 生成
批量标签
重复检测
缺文件检测
睡眠定时
```

---

## 10. 流行音乐库功能优先级

流行音乐库按普通音乐逻辑：

```text
歌曲
歌手
专辑
歌单
歌词
最近播放
```

第一版只需要：

```text
按文件夹专辑分组
读取文件名作为标题
显示封面
播放队列
歌单收藏
LRC 同名匹配
```

不要一开始做复杂 ID3 写入、封面写入、音乐下载、在线元数据。

---

## 11. 播放器路线

### 当前状态

`useAudioPlayer.ts` 是模拟播放器，只推进进度，不播放真实音频。

### 第一阶段

浏览器内可先接 HTMLAudio：

```text
mp3 / wav 优先
flac / ape / m4a 兼容性要测试
```

### 第二阶段

Electron 下用 `file://` URL 播放本地文件。

### 第三阶段

格式不支持时，外部播放器 fallback：

```text
mpv
VLC
系统默认播放器
```

但外部播放器必须先做 dry-run 命令预览，不自动启动。

---

## 12. UI 打磨原则

当前 UI 已经比较丰富，但信息密度偏高。后续原则：

```text
主页面给用户看媒体内容
诊断页放工程状态
设置页放路径和安全选项
开发解释不要塞满首页
播放器优先突出封面、标题、播放按钮、进度、歌词、队列
```

主题和字体要注意：

```text
深色 / 浅色 / 雾面主题都要检查
字体不能太小
中日文路径和标题不能溢出
播放器三模式都要独立检查
```

---

## 13. 运行命令

当前项目命令来自 `package.json`：

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

说明：

```text
npm run dev      Vite 开发预览
npm run lint     TypeScript noEmit 检查
npm run build    生成 dist
npm run preview  预览 dist
```

如果新对话无法运行 npm，应只改文档或小范围源码，不要声称已验证。

---

## 14. 新对话必须先输出的接手检查清单

新对话接手后，第一条回复应包含：

```text
1. 我已经检查了 package.json / src/App.tsx / src/types.ts / src/hooks/useAudioPlayer.ts。
2. 当前项目是 React/Vite UI 原型，不是完整 Electron 应用。
3. 当前播放器是模拟进度，不是真实音频播放。
4. 当前数据是 mockData + localStorage，不是真实扫描。
5. 下一步建议先跑 npm run lint / npm run build。
6. 下一步开发任务不要碰真实文件。
```

---

## 15. 交接结论

当前最有价值的工作不是继续堆页面，而是：

```text
先整理运行基线
再统一数据模型
再做 Local JSON Index
再接真实扫描
再接真实播放
最后才做 Electron 打包
```

如果下一对话只做一件事，做这个：

```text
确认当前 React/Vite 原型能 npm install + npm run lint + npm run build 通过，并更新 README / PROJECT_STATE，把真实状态写清楚。
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

## MVP-02 Handoff Update

上一轮完成了 fixture 级 scanner。

新增：

```text
src/services/fixtureLibraryScanner.ts
src/services/fixtureLibrarySample.ts
tests/fixtures/library_sample/
docs/FIXTURE_SCANNER_PLAN.md
scripts/verify-mvp02-fixture-scanner.ts
```

当前允许继续做的下一步：

```text
P3：fixture scanner contract / scanner report 层
```

下一步仍然不要直接扫真实盘。建议先做：

- 增加 scanner report summary。
- 增加 duplicate / missing cover / missing subtitle 的 fixture 诊断字段。
- 增加 fixture scanner 的 UI 只读展示或文档报告。
- 继续禁止 Electron / 真实扫描 / 写 `library-index.json`。

验收命令：

```bash
npm run verify:all
npm run verify:mvp02-fixture-scanner
```

## MVP-03 Handoff：Fixture Scanner Report

最新状态：MVP-03 已加入 fixture scanner report / diagnostics layer。

新接手 AI 必须理解：

```text
fixtureLibraryScanner.ts 只把虚拟 entries 转成 LocalJsonIndex。
fixtureScannerReportService.ts 只分析内存 LocalJsonIndex。
两者都不是实际文件扫描器。
```

当前新增服务：

```text
src/services/fixtureScannerReportService.ts
```

它输出：

```text
FixtureScannerReport
- summary
- diagnostics
- collections
- tracks
- duplicateRjGroups
- duplicateTrackPathGroups
- nextActions
```

继续禁止：

```text
不要接 Electron
不要读 E:\arsm
不要扫描真实目录
不要写 library-index.json
不要写 SQLite
不要接真实 Audio
不要读本地 LRC
不要自动修复/删除/移动/重命名文件
```

下一轮建议：MVP-04 可以做 fixture report 的 UI/diagnostics 接入，或者扩展 fixture cases。仍然不进入真实盘。

## MVP-04 交接补充

MVP-04 已把 fixture scanner report 接入诊断页。

新对话接手时请确认：

- `src/components/DiagnosticsPage.tsx` 引入 `fixtureLibraryScanner`、`fixtureLibrarySampleEntries`、`fixtureScannerReportService`。
- 诊断页新增 `MVP-04 Fixture Scanner Report / 只读诊断` 区块。
- 该区块只分析 fixture 内存数据，不读真实文件系统。
- 新增 `docs/FIXTURE_REPORT_UI.md`。
- 新增 `scripts/verify-mvp04-fixture-report-ui.ts`，并接入 `npm run verify:all`。

下一轮建议：MVP-05 fixture case 扩展或 fixture report export。仍不要接 Electron、真实扫描、SQLite、真实播放。


## MVP-05 handoff note

Latest completed stage: MVP-05 Fixture Case Expansion.

The next assistant must treat `fixtureLibrarySampleEntries` as the only input source. The added cases intentionally create warnings/errors in fixture report output; do not auto-fix, merge, delete, rename, or normalize them.

Next recommended stage: MVP-06 fixture scanner test harness / planned scanner contract, still fixture-only. Do not jump directly to real `E:\arsm` scanning.


## MVP-06 接手重点

上一轮已完成 `fixtureScannerTestHarness` 与 `plannedScannerContractService`。

新对话接手后必须知道：

1. 当前 scanner 仍然只处理 fixture entries。
2. `plannedScannerContractService` 只是合同，不是真实 scanner。
3. 不允许硬编码 `E:\arsm`。
4. 不允许扫描全盘。
5. 不允许在 dry-run 阶段写 `library-index.json`。
6. 重复 RJ / 重复路径只报告，不合并、不删除、不重命名。

建议下一轮：MVP-07 scanner contract UI flow / virtual path parser tests。

## 最新交接：MVP-08 Virtual Path Parser

当前最新版增加了路径解析基础层：

```text
src/services/virtualLibraryPathParser.ts
src/services/virtualPathParserCases.ts
docs/VIRTUAL_PATH_PARSER_MVP08.md
scripts/verify-mvp08-virtual-path-parser.ts
```

新对话接手时必须知道：

1. 解析器只处理 virtual path 字符串。
2. 不能把它理解成真实文件扫描。
3. 下一轮可以考虑让 `fixtureLibraryScanner` 使用该 parser，减少重复规则。
4. 仍然禁止读真实盘、写 `library-index.json`、接 Electron、接 SQLite。

推荐下一轮：MVP-09，把 fixture scanner 内部的扩展名/RJ/cover/subtitle/disc 判断逐步收敛到 `virtualLibraryPathParser`。

---

## MVP-08.1 接手补充：Validation Friendly Package

上一轮 Codex 本地验收 STOP 的原因是环境链路：`npm ci` 因网络/npm 问题失败，导致 `tsc / vite / tsx` 不存在。dist 静态预览曾能打开，主页面未白屏。

MVP-08.1 的目标是降低验收阻力，而不是继续开发新功能。

关键变化：

```text
1. 推荐验收环境固定为 Node 22 LTS + npm 10。
2. 新增 verify:env。
3. 移除直接 tsx 依赖。
4. verify:mvp02 ~ verify:mvp08 改为 node .mjs 静态验收脚本。
5. 新增 docs/WINDOWS_VALIDATION.md。
6. 实体 fixture 文件树改为 ASCII-safe manifest，避免部分 Windows 解压工具处理中日文路径失败。
```

正式验收命令：

```bash
npm ci
npm run verify:env
npm run lint
npm run verify:all
npm run build
npm audit --audit-level=high
npm run dev
```

注意：`npm audit` 如果使用镜像源失败，不代表项目有漏洞。正式 audit 用官方 npm registry，或按 `docs/WINDOWS_VALIDATION.md` 处理。

下一轮如果验收 PASS，再做 MVP-09：让 `fixtureLibraryScanner` 复用 `virtualLibraryPathParser`，减少重复判断逻辑。
