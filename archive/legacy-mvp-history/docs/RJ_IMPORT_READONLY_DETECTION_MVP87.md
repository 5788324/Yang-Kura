# MVP-87 RJ 专辑导入只读识别

版本：`0.125.0-mvp87`。

## 目标

把 MVP86 的导入器 UI 壳推进到第一步真实模型能力：**RJ 专辑只读识别**。

本轮仍然不接真实文件系统，只处理已经传入的 tokenized preview 数据：

```text
sourceRootToken
sourceDisplayName
relativePaths[]
```

## 新增能力

- `normalizeRjCode()`：从 `RJ01588893` / `RJ1588893` / 文件夹名中提取并标准化 RJ 号。
- `classifyImportRelativePath()`：按扩展名分类。
- `buildRjImportReadonlyPreview()`：生成只读 ImportTask preview。
- `rjImportReadOnlyDetectionService.getModel()`：为导入器页面和诊断页提供展示模型。

## 输出

- ImportTask preview
- ImportFileContract[]
- MetadataSourceContract[]
- ImportConflictReportContract
- ImportTargetPlanContract
- categoryCounts
- warnings / blockers

## 安全边界

本轮不调用：

```text
fs.copyFile
fs.rename
fs.rm
fs.unlink
ipcMain.handle("yang-kura:import")
fetch
better-sqlite3
```

copy only 后置到 MVP91，move 后置到 MVP92+。
