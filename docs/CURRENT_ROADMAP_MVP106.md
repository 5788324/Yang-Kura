# CURRENT_ROADMAP_MVP106

版本：`0.144.0-mvp106`

本轮：`MVP106 move-only closeout` / `mvp106-move-only-closeout-v1`。

## 当前结论

MVP106 收口 MVP103-MVP105 的 move-only 导入链路：

```text
MVP103 move-only strategy
→ MVP104 move-only execution readiness
→ MVP105 small-sample move-only executor
→ MVP106 move-only closeout
```

导入器现在阶段性具备两条主线：

```text
copy-only：MVP95-MVP102 已闭环
move-only：MVP103-MVP106 已闭环到小样本 executor
```

## MVP106 边界

本轮不新增真实文件操作：

```text
不新增真实 move
不再次写 library-index.json
不接 SQLite
不接下载器
不接元数据 Provider
不接 mpv
不返回 absolutePath
不返回 file://
Codex 非必要不安排
```

MVP105 的真实 move-only executor 保留限制：

```text
小样本
最多 20 个文件
CONFIRM_MOVE_IMPORT
overwrite=false
失败停止
OperationLog 必填
不清理空源目录
```

## 下一轮

`MVP107 importer daily UI cleanup`。

目标：把 MVP86-MVP106 在导入器页面堆积的工程说明、合同、verifier、IPC、规则卡片折叠到诊断页 / AI 维护区。

用户本人不会维护工程说明；这些内容保留主要是方便 AI 接手和排错。
