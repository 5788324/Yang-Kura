# CURRENT_ROADMAP_MVP103 `mvp103-move-only-strategy-v1`

当前版本：`0.141.0-mvp103`。

## 本轮完成

MVP103：**move-only strategy**。

copy-only 导入链路已经在 MVP102 收口。MVP103 不继续扩展 copy-only 合同，而是开始导入器最后一段：受控 move-only 导入策略。

本轮只定义：

```text
move-only opt-in
preflight / readiness
二次确认
OperationLog
失败停止
不覆盖
UI 工程区后续折叠
```

## 本轮不做

```text
不执行真实 move
不调用 fs.rename
不调用 fs.rm / fs.unlink
不再次写 library-index.json
不接 SQLite
不接下载器
不接元数据 Provider
不接 mpv
不安排 Codex 实机测试
不返回 absolutePath
不返回 file://
```

## 后续顺序

```text
MVP104：move-only execution readiness，仍不执行 move
MVP105：小样本真实 move-only executor，二次确认 + OperationLog + 不覆盖 + 失败停止
MVP106：move-only closeout
MVP107：importer daily UI cleanup，把工程说明折叠到诊断页 / AI 维护区
```

用户备注：导入器 UI 现在太繁琐，用户本人不会看这些工程说明，也不会维护；保留它们只是方便 AI 维护。因此 UI 清理必须在导入器 copy + move 主链路闭环后执行。
