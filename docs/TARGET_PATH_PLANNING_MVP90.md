# MVP-90：目标路径规划预览

版本：`0.128.0-mvp90`

## 目标

本轮新增 `importTargetPathPlanningPreviewService`，用于把已有的 `ImportTask` preview 转成可展示的目标路径计划。

它只做 preview，不执行真实 copy / move / delete / rename。

## 新增服务

```text
src/services/importTargetPathPlanningPreviewService.ts
```

导出：

```text
importTargetPathPlanningPreviewService
buildImportTargetPathPreview
sanitizePathSegment
sanitizeFileName
```

## 目标路径规则

| 类型 | 目标路径 |
|---|---|
| RJ / ASMR | `ASMR/RJ号 - 标题/` |
| 音乐专辑 | `Music/Artist - Album/` |
| 单曲集合 | `Music/Singles/集合名/` |
| 混合目录 | `ImportInbox/Mixed/集合名/` |
| 未知 | `ImportInbox/Unknown/集合名/` |

## 清理规则

```text
1. Windows 非法字符替换为全角下划线。
2. 控制字符清理。
3. 尾随点和空格清理。
4. Windows 保留设备名追加安全后缀。
5. 重名目标文件追加序号。
6. 长路径只警告，不自动截断。
```

## UI 锚点

导入器页：

```text
mvp90-target-path-planning-preview
mvp90-target-path-rule-cards
mvp90-target-path-summary
mvp90-target-path-plan-preview
mvp90-sanitized-path-examples
mvp90-path-warning-preview
mvp90-target-path-guardrails
```

诊断页：

```text
mvp90-target-path-planning-diagnostics
mvp90-target-path-rule-cards
mvp90-target-path-plan-preview
mvp90-sanitized-path-examples
mvp90-target-path-guardrails
```

## 安全边界

```text
MVP90 不打开真实目录。
MVP90 不读取真实文件系统。
MVP90 不复制、不移动、不删除、不重命名真实媒体文件。
MVP90 不写 library-index.json。
MVP90 不接 SQLite。
MVP90 不接下载 Provider。
MVP90 不接 mpv。
Renderer 不接收 absolutePath 或 file://。
overwrite 继续固定 false。
```
