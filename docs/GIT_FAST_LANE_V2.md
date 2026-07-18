# Yang-Kura Git Fast Lane v2

## 目标

减少 Git/GitHub 往返、重复 CI 和无效发布级验证。本规则是当前项目级默认工作方式，优先于历史流程和旧验证脚本的惯性做法。

## 标准流程

锁定最新 main → 一次性读取相关文件 → 单一工作区批量修改 → 同一候选定向验证 → 1～2 个逻辑提交 → 一次推送 → 一个 PR → 一次最终 CI → 合并 → 发布任务远端资产核对。

## 硬性限制

- 一个任务只使用一个分支、一个 PR。
- 通常只允许一次推送；真实 CI 失败时最多追加一次修复推送。
- 通常一个提交；跨越规则准备与产品发布时最多两个提交。
- 禁止创建一次性补丁工作流或临时自动提交工作流。
- 多文件任务必须使用批量 tree/commit 或等价单次提交方式。
- CI 只检查启动、最终结果和合并/发布结果，不高频轮询中间步骤。
- 文档在代码稳定后一次性同步到 PROJECT_STATE、WORKLOG 和当前交接。
- 历史发布审计、U39 综合验收和 U40-B 全产品验收默认手动，不绑定普通维护 PR。

## 风险等级

| 等级 | 范围 | 默认验证 |
|---|---|---|
| L0 | 纯文档 | 文档、链接和交接检查 |
| L1 | UI、文案、普通 Renderer 状态 | TypeScript、Renderer build、一个相关验证 |
| L2 | 播放器、资源库、Index、导入事务 | TypeScript、Renderer/Electron build、对应专项 E2E、Architecture Guardrails |
| L3 | Electron Main、依赖、安装器、用户数据格式、正式发布 | Windows 完整构建、portable/NSIS、安装升级卸载、数据保留、进程回收、资产校验 |

## Codex 边界

Codex 只处理自动化无法替代的真实 Windows 目录、物理声卡或扬声器、真实显示器/DPI、第三方程序和安装器差异。开始前必须 fetch 最新 origin，并确认 branch = main、HEAD = origin/main = 任务指定提交；不符时只能报告 BASELINE_INVALID。

## 发布任务例外

正式 Release 属于 L3，可执行一次完整链，但仍遵守：PR 候选只构建和验证，只有合入 main 后发布；同一提交产生 portable、NSIS 和校验文件；远端 Release、资产名称、大小和 SHA-256 回读一致后才宣称发布完成；纯文档同步不得再次触发打包。
