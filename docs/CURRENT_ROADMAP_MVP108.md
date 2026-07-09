# CURRENT_ROADMAP_MVP108

版本：`0.146.0-mvp108`

本轮：`MVP108 importer final regression checklist` / `mvp108-importer-final-regression-checklist-v1`。

## 当前结论

导入器主线阶段性收尾：

```text
copy-only：MVP95-MVP102 已闭环
move-only：MVP103-MVP106 已闭环到小样本真实 executor
导入器日常 UI：MVP107 已把工程说明折叠到 AI 维护区
```

MVP108 不继续加新功能，而是建立最终回归清单，并在收尾后暂停开发，先审查真实链路。

## MVP108 目标

```text
1. 给 copy-only 导入列出回归检查项
2. 给 move-only 小样本导入列出回归检查项
3. 给导入器 UI 简化列出检查项
4. 给路径 / file:// / absolutePath 边界列出检查项
5. 记录当前审查结论
6. 明确暂停开发范围
```

## MVP108 边界

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
不安排 Codex
```

## 暂停开发范围

MVP108 后暂停新增导入器功能。

暂时不进入：

```text
下载器
元数据 Provider
mpv 后端
SQLite
大批量 move-only
自动清理源目录
自动合并目录
```

先做人工审查和必要小样本回归。如果小样本或打包版出现问题，再决定是否安排 Codex 做最小实机验收。

## 审查结论

```text
导入器主线已经可以暂停新增功能。
copy-only 是日常推荐路线。
move-only 已可小样本使用，但仍不建议放开大批量。
导入器 UI 已从工程面板转向日常入口。
工程维护信息继续保留在 AI 维护区 / 诊断页。
```

## 下一步

不是继续开发下一大功能，而是：

```text
人工审查
小样本回归
确认打包版表现
决定下一大方向：下载器 / 元数据 / mpv / SQLite
```
