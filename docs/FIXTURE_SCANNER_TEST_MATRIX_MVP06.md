# MVP-06 Fixture Scanner Test Matrix / Planned Scanner Contract

本阶段目标：把 MVP-02~MVP-05 的 fixture scanner 与 report 结果固化为正式测试矩阵，并为未来真实 scanner 定义输入、输出、错误、安全边界。

## 当前阶段

```text
sourceKind = fixture
只分析内存数据
不读真实目录
不写 library-index.json
不接 Electron
不接 SQLite
```

## 新增服务

```text
src/services/fixtureScannerTestHarness.ts
src/services/plannedScannerContractService.ts
```

## Test matrix

必须覆盖：

| 用例 | 目的 |
|---|---|
| source-kind-fixture-only | 确保 harness 只处理 fixture index |
| two-library-roots | 确认 ASMR / music 双库根存在 |
| rj-work-detected | 确认 RJ collection 能识别 |
| music-album-detected | 确认普通音乐 album/folder 能识别 |
| audio-video-image-covered | 确认 audio/video/image 三类 track 覆盖 |
| subtitle-matching | 确认同名字幕匹配可用 |
| duplicate-rj-diagnostic | 确认重复 RJ 只报告不合并 |
| duplicate-path-diagnostic | 确认重复 relativePath 只报告不修复 |
| metadata-only-diagnostic | 确认空目录/仅封面场景能报告 |
| image-only-diagnostic | 确认图片/CG-only collection 能报告 |
| safe-relative-path-only | 确认 fixture 不生成真实绝对路径或 file:// |

## Planned real scanner contract

未来真实 scanner 的输入必须类似：

```text
ScannerRequest
- rootId
- rootPath：用户明确选择，不允许硬编码 E:\arsm
- libraryType：asmr / music / mixed
- scanProfile：asmr-rj / music-folder / mixed-folder
- mode：dry-run 优先，write-index 后置
- limits：maxEntries / maxDepth / includeHidden=false / followSymlinks=false
```

输出必须类似：

```text
ScannerResult
- LocalJsonIndex draft
- ScannerReport
- errors
- warnings
- previewOnly=true 时不写文件
```

## 禁止事项

```text
不扫描全盘
不硬编码 E:\arsm
不删除 / 移动 / 重命名文件
dry-run 阶段不写 library-index.json
扫描阶段不播放媒体
扫描阶段不联网抓元数据
扫描阶段不上传路径或媒体内容
```

## 下一阶段

MVP-07 才考虑把 scanner contract 更细地映射到 Settings / Diagnostics 的用户操作流。真实目录扫描继续后置。
