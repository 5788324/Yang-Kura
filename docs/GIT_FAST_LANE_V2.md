# Yang-Kura Git Fast Lane v2.2（试运行）

> 文件名保留 `GIT_FAST_LANE_V2.md` 以兼容现有文档入口。本版在 v2.1 的“集中修改、统一推送”基础上，试运行源码快照和按本次推送增量判定 CI。

## 目标

减少 Git/GitHub 往返、逐文件提交、重复 CI 和无效发布级验证。用户不参与 Git、构建、测试、排错或发布；ChatGPT 负责完整交付，Codex 与 DeepSeek 可作为真实 Windows/GUI/声卡/文件系统执行端。

## 标准流程

```text
确认任务范围
→ 锁定目标仓库、分支和 HEAD
→ 优先直接拉取源码一次
→ 若当前环境无法解析 GitHub，下载固定 HEAD 的 source snapshot Artifact
→ 在单一工作区完成分析、开发、批量修改、自动测试和文档更新
→ 审查完整 diff
→ 整理 1～2 个逻辑提交
→ 统一推送一次
→ 按本次推送的增量范围运行一次必要 CI
→ 需要实机时输出 Codex 或 DeepSeek 提示词
→ 用户转发，执行端按固定 branch/SHA 验收
→ ChatGPT 根据报告决定修复、合并或发布
```

## v2.2 试运行内容

### 1. Source snapshot

当前执行环境若无法正常 `git clone`：

1. GitHub Actions checkout 精确 PR HEAD；
2. 使用 `git archive` 生成纯源码 ZIP；
3. 在 Artifact 中同时保存 `HEAD.txt`；
4. ChatGPT 下一轮下载并核对 HEAD；
5. 解压到单一工作区后完成批量开发和本地验证；
6. 最终仍使用单一 Git tree/commit 更新远端分支。

source snapshot 不包含 `.git`、`node_modules`、构建输出、测试 Artifact、真实媒体或用户数据，只是固定提交的干净源码快照。

### 2. Current-push incremental CI

PR 已积累历史改动时，不再默认使用 `base/main → HEAD` 的全部差异决定每一次 CI 范围。对 `synchronize` 事件优先使用：

```text
github.event.before → 当前 PR head SHA
```

仅本次推送实际触及的功能链决定是否启动重型 Windows 验证。首次创建 PR、手动运行或无法获得有效 before SHA 时，才回退到 PR base。

### 3. 诊断工具先自检

诊断、验收和迁移脚本进入真实 Electron/Windows CI 前必须先完成：

```text
Node 语法检查
→ 内嵌表达式解析
→ 无 Electron 模拟运行
→ 输出文件和关键字段断言
→ TypeScript / Renderer / Electron build
→ 真实专项 E2E
```

不得再用完整 Windows CI 代替变量名、作用域、模板表达式和基本输出路径检查。

## 固定条件

如果 source snapshot 和增量 CI 试运行满足以下条件，则升级为项目默认工作流：

- 快照 SHA 与 PR HEAD 一致；
- 解压后可完成完整源码搜索、批量修改和本地 diff 审查；
- 诊断类推送不再重复运行 U29、U40-D、完整 Branch Validation 和 Beta 3 打包；
- 目标专项仍能获得完整证据；
- 不增加用户手工操作；
- 不降低正式发布的 L3 验收范围。

若出现 SHA 不一致、快照缺文件、重型 CI 被错误跳过或正式发布证据缺失，则停止试运行并恢复 v2.1 的保守范围。

## 硬性限制

- 一个任务只使用一个分支、一个 PR。
- 默认只同步一次；只有远端发生实际变化或合并冲突时才重新同步。
- 候选稳定前禁止逐文件远程提交、边修改边推送或反复刷新远端状态。
- 多文件任务必须在本地或等价单一工作区批量修改，并通过单次 tree/commit 或本地 Git 统一提交。
- 通常一个提交；确有“产品代码 + 最终文档/发布元数据”两个逻辑阶段时最多两个提交。
- 通常一次推送；真实 CI 失败最多追加一次修复推送。
- 简单且属于同一功能链、风险等级相近、共享验证方式的任务可以合并处理。
- 不相关功能、不同数据风险、不同发布等级的任务不得为了减少提交而强行合并。
- 禁止一次性补丁工作流、临时自动提交工作流和仅为绕过本地验证而创建的 CI。
- CI 只检查候选启动、最终结果和合并/发布结果，不高频验证中间状态。
- 文档必须在同一候选稳定后、同一次最终推送前同步，不在项目结束后补写。
- 历史发布审计、U39 综合验收和全产品人工验收不绑定普通维护 PR。

## 本地工作区规则

- 开始前记录 repository、branch、HEAD、目标 PR 和任务范围。
- 一次性读取所有相关源码、测试、配置和文档，避免边改边找造成重复返工。
- 在修改前先判断生产路由和真实调用链，禁止根据文件名猜测入口。
- 自动测试失败时先保存完整证据，再修改；禁止连续叠加猜测性补丁。
- 提交前执行完整 diff 审查和相关验证，确保没有临时包、日志、构建目录、真实媒体或用户数据进入 Git。

## 风险等级

| 等级 | 范围 | 默认验证 |
|---|---|---|
| L0 | 纯文档 | 文档、链接、版本和交接一致性 |
| L1 | UI、文案、普通 Renderer 状态 | TypeScript、Renderer build、一个相关定向验证 |
| L2 | 播放器、资源库、Index、导入事务 | TypeScript、Renderer/Electron build、对应专项 E2E、Architecture Guardrails |
| L3 | Electron Main、依赖、安装器、用户数据格式、正式发布 | Windows 完整构建、portable/NSIS、安装升级卸载、数据保留、进程回收、资产校验 |

验证等级按本次实际触链选择，不因 PR 历史中存在无关旧改动而重复扩大范围。

## Codex / DeepSeek 实机验收流程

需要真实 Windows、GUI、本地媒体、声卡、第三方程序、安装器或物理显示环境时：

1. ChatGPT 先完成代码、自动化、文档和 Git 候选。
2. ChatGPT 根据任务选择 Codex 或 DeepSeek，输出一份可直接复制的提示词，至少包含：
   - 仓库、branch、精确 SHA；
   - 测试目的和禁止事项；
   - 环境与测试数据边界；
   - 逐项操作步骤；
   - PASS/FAIL/NOT TESTED 判定标准；
   - 必须保存的命令、日志、截图、进程和文件证据；
   - 报告文件名和返回格式。
3. 用户只负责转发提示词，不承担测试操作。
4. 执行端开始前必须 fetch 最新 origin，并确认 `HEAD = origin/<branch> = 指定 SHA`；不一致时只报告 `BASELINE_INVALID`。
5. 默认只执行验收，不自行扩展需求、不自行猜测修复、不提交临时补丁。
6. 只有提示词明确授权“修改并提交”时，Codex 或 DeepSeek 才可以改代码；仍必须遵守指定范围、提交数量和固定分支。
7. ChatGPT 读取报告后决定是否修复；若需要修复，沿用同一分支和 PR，并遵守最多一次真实 CI 修复推送的限制。

## 文档同步规则

每个任务结束前检查并按实际影响同步：

- `README.md`：产品定位、当前版本、主要入口和公开状态；
- `PROJECT_STATE.md`：当前事实、阻断、已完成和待办；
- `PROJECT_ROADMAP.md`：阶段、顺序、验收条件和冻结范围；
- `AI_HANDOFF/WORKLOG.md`：本轮真实完成、失败和决策；
- `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`：精确 branch/SHA、证据和下一步；
- `AI_HANDOFF/NEXT_CONVERSATION_PROMPT.md`：新对话最小启动信息；
- 专项状态/验收文档：只在对应缺陷或发布任务存在时维护。

文档不得把“代码已写”“CI 绿色”表述成“实机通过”或“正式发布”。

## 发布任务

正式 Release 属于 L3：

- PR 候选只在本次推送确实改动发布配置、版本、构建或 Release 合同时启动打包；
- 普通播放器、UI、诊断和文档推送不得重复构建 portable/NSIS；
- 合入 `main` 后才允许发布；
- 同一提交产生 portable、NSIS 和校验文件；
- 远端 Release、目标提交、资产名称、大小和 SHA-256 回读一致后才宣称发布完成；
- 发布后一次性更新状态、路线图、工作日志、交接和 Release Notes；
- 纯文档收口不得再次触发完整打包。

## 例外

只有以下情况允许中途同步或额外推送：

- 远端基线被其他有效提交改变；
- 真实 CI 暴露本地无法复现的问题；
- 必须先推送固定 SHA 才能让 Codex 或 DeepSeek 执行实机验证；
- 紧急恢复已发布版本。

例外必须在 WORKLOG 中记录原因，不得演变为逐文件补丁流程。
