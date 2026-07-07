# CURRENT ROADMAP MVP87

当前最新版本：`0.125.0-mvp87`。

## 主题

MVP-87：RJ 专辑导入只读识别。

## 范围

- 在导入器 UI 壳基础上加入 RJ 专辑只读识别。
- 输入只使用 `sourceRootToken`、`sourceDisplayName`、`relativePaths`。
- 从文件夹名 / 相对路径提取 RJ 号，并标准化为 `RJ` + 8 位数字。
- 分类 audio / video / image / subtitle / text / archive / other。
- 生成 ImportTask preview、MetadataSource、ConflictReport、TargetPlan。

## 禁止

- 不读取真实目录。
- 不复制文件。
- 不移动文件。
- 不删除文件。
- 不重命名文件。
- 不写 `library-index.json`。
- 不接 SQLite。
- 不向 Renderer 暴露 `absolutePath` 或 `file://`。
