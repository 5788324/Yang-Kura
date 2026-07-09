# CURRENT_ROADMAP_MVP107

版本：`0.145.0-mvp107`

本轮：`MVP107 importer daily UI cleanup` / `mvp107-importer-daily-ui-cleanup-v1`。

## 当前结论

MVP107 不继续扩展导入器真实能力，而是收口用户日常界面。

导入器主链路已经阶段性完成：

```text
copy-only：MVP95-MVP102 已闭环
move-only：MVP103-MVP106 已闭环到小样本 executor
```

MVP107 的目标是：

```text
把 MVP86-MVP106 堆积在导入器主页面的工程说明、合同、verifier、IPC、规则卡片
折叠到 AI 维护区 / 诊断页。

导入器主页面只保留：
选择来源、导入预览、冲突提示、目标位置、复制/移动方式、结果摘要。
```

用户本人不会看，也不会维护这些工程说明；保留它们主要是方便 AI 接手、排错和继续开发。

## MVP107 边界

```text
不改 copy-only executor
不改 move-only executor
不再次写 library-index.json
不接 SQLite
不接下载器
不接元数据 Provider
不接 mpv
不返回 absolutePath
不返回 file://
Codex 非必要不安排
```

## 下一轮

建议做：`MVP108 importer final regression checklist`。

目标：对导入器 copy-only + move-only + UI cleanup 做最终回归清单，不急着进入下载器 / SQLite / 元数据 / mpv。
