# MVP-04 Fixture Report UI / Diagnostics 接入

本轮目标是把 MVP-03 的 `fixtureScannerReportService` 接到诊断页，让扫描报告在 UI 中可见。

## 本轮新增能力

诊断页现在展示：

- `report.status`: `pass / needs-review / blocked`
- summary：root / collection / track / audio / video / cover / subtitle / quality score
- diagnostics：缺封面、无音频、缺字幕、重复 RJ、重复 track path
- nextActions：下一轮应处理的受控动作
- collection quality preview：每个 fixture collection 的质量分、音频数、字幕数、封面状态

## 数据来源

只允许：

```text
fixtureLibrarySampleEntries
  ↓
fixtureLibraryScanner.scanVirtualEntries()
  ↓
fixtureScannerReportService.analyze()
  ↓
DiagnosticsPage display
```

## 明确禁止

本轮仍然禁止：

- 不读真实硬盘
- 不扫描 `E:\arsm`
- 不写 `library-index.json`
- 不接 Electron
- 不接 SQLite
- 不访问 localStorage
- 不调用 HTMLAudio
- 不删除 / 移动 / 重命名文件

## 设计原则

这不是“真实扫描页”，而是 fixture scanner 的可视化报告。它用于下一阶段 fixture scanner 规则扩展和 UI 验收。

## 下一轮建议

MVP-05 可以继续做：

- fixture case 扩展：重复 RJ、空目录、视频类 ASMR、图片/CG 目录、字幕多语言
- 或者做 fixture scanner report export：导出 JSON / Markdown 字符串，仍不写真实文件


## MVP-05 UI additions

Diagnostics now labels the section as MVP-05 Fixture Case Report and displays image track count, image/CG-only collection count, and metadata-only collection count. Duplicate RJ and duplicate track path groups are expected in the expanded fixture set.
