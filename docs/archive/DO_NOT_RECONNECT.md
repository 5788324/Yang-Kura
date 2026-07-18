# 禁止重新接回生产路由

以下历史入口不得重新接回生产路由：

- `src/components/SettingsPage.tsx`
- `src/components/DiagnosticsPage.tsx`

需要恢复其中任何能力时，必须迁移到当前领域组件并通过 U40-D 门禁，而不是重新导入旧页面。
