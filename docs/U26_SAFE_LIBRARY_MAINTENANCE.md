# U26 安全版资源库 AI 维护收口

## 背景

第一次 U26 草稿尝试用外层容器包裹大段 `SettingsPage.tsx` JSX，跨越了原有条件渲染边界，导致 TypeScript/JSX 标签错误。该草稿 PR 已关闭且未合入，`main` 未受影响。

## 安全实现

本轮从干净 `main` 重做，不移动任何既有资源库检修 JSX，只增加：

1. `showLibraryMaintenance`，默认 `false`；
2. “AI 维护 · 资源库检修”开关卡；
3. `mvp127-library-index-health-management` 的动态 `hidden`；
4. `mvp39-advanced-library-tools` 的动态 `hidden`；
5. `mvp54-settings-regression-path` 的固定隐藏兼容标记。

## 默认可见

- 选择音声库和音乐库目录；
- 上次资源库摘要；
- 读取已有记录；
- 一键扫描并应用；
- 音声库、音乐库路径管理。

## AI 维护

用户主动展开后才显示：

- 缺失文件与失效记录检查；
- 受控索引清理、确认和结果；
- 索引备份、恢复和保留策略预览；
- 维护历史；
- 扫描预览、写入预览和高级资源库工具。

## 风险边界

- 不创建跨越现有条件块的新父容器；
- 不移动 `mvp127 / mvp128 / mvp129 / mvp39`；
- 不修改任何 handler、Electron IPC、Local JSON Index、备份、恢复、清理或扫描逻辑；
- 不修改播放器、导入器、下载器、诊断页、主题和持久化。

## 验证

- SettingsPage TypeScript 内存转译；
- U26 可见性与按钮语义专项 verifier；
- 全部 U02～U26 verifier；
- 完整稳定回归、Electron 编译、mpv、Importer、50,000 曲目基准、Index 维护和生产构建；
- 合并前复核 PR 最终差异，确保无临时脚本或 workflow。
