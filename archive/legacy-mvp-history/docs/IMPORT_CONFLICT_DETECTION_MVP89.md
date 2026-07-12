# MVP-89 导入冲突检测 / hash 策略预览

版本：`0.127.0-mvp89`

## 目标

在 RJ 与音乐只读识别后，新增统一冲突检测预览层。

MVP89 识别：

- 同 RJ / 同编号。
- 同音乐专辑。
- 目标目录已存在。
- 同文件名。
- 同大小疑似重复。
- hash 策略占位。

## 新增服务

`src/services/importConflictDetectionPreviewService.ts`

核心导出：

- `importConflictDetectionPreviewService`
- `buildImportConflictPreview()`
- `ImportConflictDetectionInput`
- `ImportConflictExistingCollectionPreview`
- `Mvp89ImportConflictDetectionResult`
- `Mvp89ImportConflictDetectionModel`

## 输入合同

MVP89 只消费：

- `ImportTaskContract`
- 本地集合快照 `ImportConflictExistingCollectionPreview[]`

集合快照只能包含 token / 相对路径 / 展示字段，不包含真实绝对路径。

## hash 策略

MVP89 不计算真实 hash。

只允许：

- 读取 `ImportFileContract.checksum` 合同字段。
- 定义未来 hash 队列策略。
- 说明真实 hash 必须在 Electron main / 受控 worker 中执行。

后续真实 hash 策略：

1. 先筛同大小候选。
2. 再进入 hash 队列。
3. hash 计算不在 Renderer 中执行。
4. hash 命中也不自动删除文件。

## 安全边界

本轮不执行任何真实导入操作。

尤其禁止：

- `fs.copyFile`
- `fs.rename`
- `fs.rm`
- `fs.unlink`
- `fs.writeFile`
- 真实 hash 读取
- SQLite 写入
- 下载 Provider
- mpv

## UI 锚点

导入器页面：

- `mvp89-import-conflict-detection-preview`
- `mvp89-conflict-rule-cards`
- `mvp89-conflict-summary`
- `mvp89-conflict-report-preview`
- `mvp89-hash-strategy-preview`
- `mvp89-conflict-guardrails`

诊断页：

- `mvp89-import-conflict-detection-diagnostics`
- `mvp89-conflict-rule-cards`
- `mvp89-conflict-report-preview`
- `mvp89-hash-strategy-preview`
- `mvp89-conflict-guardrails`


补充 verifier marker：不复制文件 / 不移动文件 / 不计算真实 hash。
