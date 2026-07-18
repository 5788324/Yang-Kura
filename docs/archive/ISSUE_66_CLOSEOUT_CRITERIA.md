# Issue #66 关闭条件

U40-D 满足以下条件后关闭 Issue #66：

- 旧设置页退出生产路由；
- 旧完整诊断页退出运行时；
- 新增领域逻辑不进入 `App.tsx`、旧 `SettingsPage.tsx`、`DiagnosticsPage.tsx` 或 `electron/main.ts`；
- 新增代码无显式 `any`；
- 相对导入循环为 0；
- 旧测试 profile 不污染日常 profile；
- 资源库读取状态跨页面收敛；
- 旧版错误集合可在读取时修复；
- 核心文档、工作日志、交接和实机测试文档同步；
- Windows 定向验收与 Branch Validation 通过。
