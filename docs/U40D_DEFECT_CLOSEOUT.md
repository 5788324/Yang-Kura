# U40-D 缺陷修复与 Issue #66 收口

## 缺陷映射

| 编号 | 修复 |
|---|---|
| U40-B01 | 资源库读取改为单一协调器；15 秒超时、明确错误、可重试、迟到成功自动收敛。 |
| U40-B02 | 设置、顶栏、首页、音声库和音乐库使用同一 `LibrarySessionSnapshot` 读取状态。 |
| U40-B03 | 自动验收 profile 明确标记；日常 profile 启动前清理旧测试队列、历史、歌单、缓存和作品；真实库载入后移除不存在的旧队列与历史。 |
| U40-M01 | 旧版资源记录在读取时按 RJ 目录或实际作品/专辑目录重新分组；空集合不进入日常页面。 |
| U40-M02 | 生产路由改用轻量日常设置；历史工程设置和完整历史诊断退出运行时。 |
| U40-O01 | mpv 缺失继续作为环境 Observation；基础播放仍可使用。 |

## Issue #66 收口

- `SettingsPage.tsx` 保留为历史兼容源码，但已退出生产路由；运行时使用 `SettingsPageDaily.tsx`。
- `DiagnosticsPage.tsx` 已退出维护页运行时；维护页只加载当前真实状态和按需性能检查。
- 新增严格、独立的读取协调、旧测试清理和集合规范化服务，避免继续向 `App.tsx`、`SettingsPage.tsx` 或 `electron/main.ts` 堆叠逻辑。
- 播放队列和历史使用当前资源库作为有效性边界。
- U40-D verifier 要求仓库不存在相对导入循环，并生成循环报告。
- 历史兼容代码不再作为日常功能入口；后续只在删除兼容依赖时做物理归档，不再保留开放治理任务。

## 验收边界

自动验收使用隔离临时目录和 profile。真实库 `E:\arsm`、`D:\CloudMusic\VipSongsDownload` 由 Codex 按 `docs/CODEX_REAL_MACHINE_FULL_ACCEPTANCE.md` 只读验收；导入与写入只在临时副本执行。
