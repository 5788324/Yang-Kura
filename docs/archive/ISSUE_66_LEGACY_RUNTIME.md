# Issue #66 历史运行时归档

以下文件不再进入生产路由，但暂时保留供历史 verifier 和旧提交追溯：

- `src/components/SettingsPage.tsx`
- `src/components/DiagnosticsPage.tsx`
- 旧 MVP 合同、运行探针和阶段性展示服务
- `package.json` 中历史 MVP 兼容元数据

生产运行时替代：

- 设置：`src/components/SettingsPageDaily.tsx`
- 维护：`src/components/DiagnosticsPageShell.tsx`
- 读取会话：`src/services/libraryReadCoordinatorService.ts`
- 资源层级修复：`src/services/libraryIndexNormalizationService.ts`
- 自动化污染清理：`src/services/automationProfileCleanupService.ts`

这些历史文件不得重新接回日常页面。删除它们需要单独确认所有历史 verifier 和发布追溯均已不再依赖。
