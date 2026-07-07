# MVP-90 当前路线：目标路径规划预览

版本：`0.128.0-mvp90`

## 本轮目标

MVP90 在 MVP87/RJ 只读识别、MVP88/音乐只读识别、MVP89/冲突检测之后，补上导入器执行前最关键的一层：目标路径规划预览。

```text
ImportTask preview
→ 统一 ASMR / Music 目标目录规则
→ 清理 Windows 非法字符
→ 处理同目标文件名
→ 标记长路径风险
→ 继续禁止真实文件操作
```

## 本轮不做

```text
不打开真实目录
不读取真实文件系统
不复制文件
不移动文件
不删除文件
不重命名文件
不写 library-index.json
不接 SQLite
不接下载 Provider
不接 mpv
不向 Renderer 暴露 absolutePath
不向 Renderer 暴露 file://
```

## 下一轮建议

MVP91：copy only 导入前执行合同 / 二次确认设计。
