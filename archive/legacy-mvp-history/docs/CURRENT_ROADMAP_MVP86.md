# CURRENT_ROADMAP_MVP86

Version: `0.124.0-mvp86`

## Current round

MVP-86：导入器 UI 壳 / 预览页。

## Goal

把 MVP-85 冻结的 `ImportTask / MetadataSource / TargetPlan / ConflictReport` 模型放进用户可见界面，形成后续导入器真实能力的入口。

## Scope

- 新增 `ImporterPage`。
- 侧边栏新增“导入器”。
- 新增 mock `ImportTask` 预览。
- 新增来源类型卡片：RJ 专辑、音乐专辑、单曲/混合目录。
- 新增目标路径计划、元数据候选、冲突报告、安全边界展示。
- 诊断页新增 MVP-86 区块。

## Explicitly out of scope

- 不读取真实导入目录。
- 不复制文件。
- 不移动文件。
- 不删除文件。
- 不重命名文件。
- 不写 `library-index.json`。
- 不接 SQLite。
- 不接下载 Provider。
- 不接 mpv。
- Renderer 不接收 `absolutePath` 或 `file://`。

## Next

MVP-87：RJ 专辑导入只读识别。
