# MVP-88 音乐专辑 / 单曲只读识别

版本：`0.126.0-mvp88`

## 目的

MVP-88 在 MVP-87 的 RJ 专辑只读识别之后，加入普通音乐导入预览。

它只处理 tokenized relativePaths，不接真实文件系统，不读取 ID3 / FLAC tag，不执行任何文件操作。

## 新增服务

```text
src/services/musicImportReadOnlyDetectionService.ts
```

核心导出：

```text
musicImportReadOnlyDetectionService
inferArtistAlbumFromFolder
classifyMusicImportRelativePath
isProtectedMusicDownload
buildMusicImportReadonlyPreview
```

## 识别范围

支持只读推断：

```text
music-album
music-singles
mixed
unknown
```

基础规则：

```text
单一顶层目录 + 音频 → music-album
根级多个音频 → music-singles
多个顶层目录 / 多组音频 → mixed
无音频 → unknown blocker
```

## 元数据来源

MVP-88 只从文件夹名推断：

```text
Artist - Album
Artist – Album
Artist — Album
```

并生成 local-folder MetadataSource。

`music-tags` 只作为后续占位，不读取真实 ID3 / FLAC tag。

## 受保护格式边界

识别但不处理：

```text
ncm
qmc
mflac
mgg
kgm
```

这些只进入 warning / blocker，不转换、不解密、不导入为可播放 Track。

## UI 锚点

```text
mvp88-music-import-readonly-detection
mvp88-music-import-category-counts
mvp88-music-shape-detection
mvp88-music-detected-import-task
mvp88-music-readonly-file-classification
mvp88-music-metadata-preview
mvp88-music-protected-format-warning
mvp88-music-readonly-guardrails
```

## 诊断页锚点

```text
mvp88-music-import-readonly-detection-diagnostics
mvp88-music-detection-rule-cards
mvp88-music-import-category-counts
mvp88-music-readonly-import-task
mvp88-music-readonly-guardrails
```

## 安全边界

```text
不读取真实导入目录
不复制文件
不移动文件
不删除文件
不重命名文件
不写 library-index.json
不接 SQLite
不接下载 Provider
不接 mpv
Renderer 不接收 absolutePath
Renderer 不接收 file://
```

## 验证

```bash
npm run verify:mvp88-music-import-readonly-detection
npm run verify:all
```

## 本轮验证结果

```text
npm ci --ignore-scripts: PASS（有 Electron moderate audit 提示）
npm run lint: PASS
npm run build:electron: PASS
npm run verify:mvp88-music-import-readonly-detection: PASS
npm run verify:all: PASS，完整跑完
npm run build: PASS，有 Vite chunk size warning
npm audit --audit-level=high: PASS；只有 Electron moderate，不是 high
```
