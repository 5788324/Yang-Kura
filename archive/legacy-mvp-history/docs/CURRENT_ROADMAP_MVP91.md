# CURRENT ROADMAP MVP-91

版本：`0.129.0-mvp91`

## 本轮目标

MVP-91 固定为 **copy only 导入前执行合同 / 二次确认设计**。

本轮只做：

```text
ImportTask / TargetPathPlan
→ copy only 预检
→ 二次确认模型
→ OperationLog 预览
→ 失败列表 / 跳过列表
→ 执行按钮继续禁用
```

## 不做

```text
不复制文件
不移动文件
不删除文件
不重命名文件
不写 library-index.json
不接 SQLite
不接下载 Provider
不接 mpv
不读取真实目录
不向 Renderer 暴露 absolutePath
不向 Renderer 暴露 file://
```

## 下一轮

MVP-92 才能考虑 copy only 的最小真实样本。但在真实 copy 前，建议让 Codex 做本机关键验收。
