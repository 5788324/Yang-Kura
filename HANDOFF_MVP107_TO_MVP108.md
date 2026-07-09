# HANDOFF_MVP107_TO_MVP108

## 版本

`0.146.0-mvp108`

## 本轮完成

MVP108 完成导入器最终回归清单与暂停开发审查。

新增：

```text
src/services/importerFinalRegressionChecklistService.ts
docs/CURRENT_ROADMAP_MVP108.md
docs/IMPORTER_FINAL_REGRESSION_CHECKLIST_MVP108.md
scripts/verify-mvp108-importer-final-regression-checklist.mjs
```

接入：

```text
ImporterPage
DiagnosticsPage
services/index.ts
package.json verify scripts
```

## 当前结论

```text
copy-only 已闭环
move-only 小样本执行链路已闭环
导入器日常 UI 已收口
MVP108 后暂停新增导入器功能
先人工审查和小样本回归
```

## 仍未做

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

## 下一步

暂停开发，审查当前导入器阶段。

人工检查重点：

```text
copy-only 小样本导入
move-only 小样本导入
导入器主页面是否不再繁琐
打包版启动 / 播放 / 字幕 / 外部打开是否仍正常
```
