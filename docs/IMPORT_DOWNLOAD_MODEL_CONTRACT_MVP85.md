# MVP-85：导入 / 下载 / 元数据模型合同

版本：`0.123.0-mvp85`

## 1. 目标

MVP-85 在 MVP-84 总规划基础上，把下一阶段导入器和下载生态需要的数据模型固定下来。当前只做类型、文档、诊断页展示和 verifier。

## 2. 核心模型

### ImportTask

描述一次导入任务：

```text
来源目录 token
识别类型
文件列表
元数据来源
元数据候选
目标路径计划
冲突报告
操作模式
任务状态
```

状态流：

```text
draft → previewed → confirmed → running → done / failed / cancelled
```

第一阶段只允许 `copy` 作为真实执行方向，`move` 只作为后续模型枚举保留。

### ImportFile

只保存：

```text
relativePath
displayName
kind
sizeBytes
mtimeMs
checksum
selected
warnings
```

不保存 `absolutePath`，不保存 `file://`。

### MetadataSource

元数据分来源保存，不混成一份：

```text
local-folder
local-text
dlsite
asmr-one
music-tags
download-manifest
user-override
unknown
```

合并优先级：

```text
userOverride > localFolder/localText > dlsite > asmrOne > musicTags > downloadManifest
```

注意：

```text
本地文件结构决定实际音轨。
Provider 只提供候选信息。
用户手动覆盖永远最高。
```

### ImportTargetPlan

导入执行前必须先生成目标路径计划：

```text
targetRootToken
targetCollectionType
targetRelativeDirectory
operationMode
plannedFiles
```

`plannedFiles[].overwrite` 必须固定为 `false`，直到后续专门设计覆盖策略。

### ImportConflictReport

导入前必须有冲突报告：

```text
duplicate-code
duplicate-file
target-exists
mixed-content
unsupported-protected-file
unknown
```

有 blocker 时禁止执行。

### DownloadTask

下载器后置，但需要先固定任务模型：

```text
provider
status
title
stagingRootToken
manifest
progressPercent
retryCount
```

本轮不实现任何 Provider，不联网。

### DownloadManifest

下载 Worker 与导入器之间的结果清单：

```text
provider
sourceCode
files
metadataSources
errorLog
createdAt
```

Manifest 使用 staging 相对路径或 token，不使用真实绝对路径。

## 3. 明确不做

MVP-85 不做：

```text
真实导入器 UI
真实复制文件
真实移动文件
真实删除文件
真实下载器
联网 Provider
SQLite
mpv 后端
DRM / 加密格式解密
```

受保护 / 加密文件只标记为 `unsupported-protected-file`，不转换、不解密、不导入为可播放 Track。

## 4. 受保护文件规则

对网易云 / QQ 等来源的受保护或加密格式，本项目只识别并标记为 `unsupported-protected-file`，**不做解密器**，不做 DRM/加密绕过，也不导入为可播放 Track。
