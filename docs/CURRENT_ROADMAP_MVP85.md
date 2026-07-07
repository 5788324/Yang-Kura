# CURRENT ROADMAP — MVP-85

版本：`0.123.0-mvp85`

## 本轮定位

MVP-85 只冻结导入器 / 下载器 / 元数据的第一版数据模型合同：

```text
ImportTask
DownloadTask
DownloadManifest
MetadataSource
ImportTargetPlan
ImportConflictReport
```

本轮不实现真实导入、不联网、不接下载 Provider、不复制 / 移动 / 删除 / 重命名真实媒体文件。

## 基线

```text
0.122.0-mvp84
MVP-84：导入器 / 下载生态 / 项目总规划并入
```

## 后续顺序

```text
MVP86：导入器 UI 壳，只预览
MVP87：RJ 专辑导入识别，只读
MVP88：流行音乐导入识别，只读
MVP89：冲突检测
MVP90：目标路径规划
MVP91：copy only 导入
MVP92：move with operation log 后置
MVP93+：自研下载生态
```

## 安全边界

- 不接 SQLite。
- 不接真实下载器。
- 不接 ASMR.one / DLsite / 网易云 / QQ Provider。
- 不接 mpv。
- 不复制 / 移动 / 删除 / 重命名真实媒体文件。
- 不向 Renderer 暴露 `absolutePath` 或 `file://`。
- 任何未来文件操作必须先有预览、确认、操作日志、失败记录。
