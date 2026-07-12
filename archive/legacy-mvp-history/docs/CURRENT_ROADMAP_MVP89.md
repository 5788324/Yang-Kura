# CURRENT_ROADMAP_MVP89

版本：`0.127.0-mvp89`

## 本轮主题

MVP-89：导入冲突检测 / hash 策略预览。

## 当前阶段

导入器已经完成：

- MVP86：导入器 UI 壳。
- MVP87：RJ 专辑只读识别。
- MVP88：音乐专辑 / 单曲只读识别。
- MVP89：统一冲突检测预览。

## 本轮边界

本轮只做模型、服务、UI 预览、诊断展示、文档和 verifier。

不做：

- 不读取真实文件系统。
- 不计算真实 hash。
- 不复制文件。
- 不移动文件。
- 不删除文件。
- 不重命名文件。
- 不写 `library-index.json`。
- 不接 SQLite。
- 不接下载 Provider。
- 不接 mpv。
- 不向 Renderer 暴露 `absolutePath` 或 `file://`。

## 下一轮建议

MVP-90：目标路径规划预览。

重点：

- 继续只做 preview。
- 统一 ASMR / Music 目标路径规则。
- 定义重名目录、非法字符、过长路径、同目标文件名的处理策略。
- 不执行真实文件操作。
