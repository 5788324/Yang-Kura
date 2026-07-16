# PROJECT_STATE

## 当前状态

```text
当前稳定版本：0.168.0-beta.1
发布 tag：v0.168.0-beta.1
发布标题：Yang-Kura 0.168.0 Beta 1
代码事实来源：GitHub main
main 基线：1a2950c6a5c0558c016818bfd810df4e6ffbaead
已完成主线：U02～U33
当前阶段：Beta 1 已完成，准备 Beta 2 架构、代码质量与 UI 整备
Beta 2 目标版本：0.169.0-beta.2
大型功能：继续冻结到 Beta 2 发布后
```

Beta 1 发布目标提交为 `47f3cfc0e6fbf4dd4616add1ef8675160f90d04d`。发布后的治理提交不会改变该 tag 和已发布资产。固定资产名称、大小和 SHA-256 见 `release/u33-publication-state.json`。

## AI 自主管理规则

> 用户不承担测试、排错、构建、Git 操作或验收组织，只接收最终成果并决定产品方向。

默认分工：

1. ChatGPT 负责需求拆解、项目规划、架构、代码、自动测试、Windows CI、Electron UI 自动化、截图审查、回归、Git、PR、文档、合并、tag、Release 和最终交付。
2. 能通过代码、临时样本、GitHub Actions、Electron/CDP 或其他自动化完成的验证，必须由 ChatGPT 自己闭环。
3. 只有确实依赖用户本机、真实硬件、物理设备、受限账号或无法自动化的系统集成时，才交给 Codex 执行实机步骤。
4. Codex 默认只测试，不修改源码。
5. 不要求用户运行命令、制作样本、截图、判断 PASS/FAIL 或整理报告。

详细规则见 `AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`。

## 已完成主线

### U02～U08：产品真实性和基础可访问性

- 干净首次启动；
- 不注入演示媒体、收藏、历史或歌单；
- 中文界面；
- 键盘焦点；
- Dialog、Escape、焦点进入和返回；
- 移除假播放、假字幕和假书签。

### U09～U26：结构、质量和日常 UI

- 播放器生命周期和歌词时间线；
- 依赖门禁；
- 侧栏导航和主题合同；
- PlayerBar 纯逻辑、临时 UI、主展示、辅助控制和进度轨道渐进拆分；
- 下载规划、诊断、检修、回归和工程状态退出日常层；
- AI 维护边界建立。

长期 UI 规则继续有效：

> 日常层只展示用户实际会使用的功能；诊断、回归、工程状态、测试入口、命令行说明、MVP/版本收口信息和检修工具统一进入 AI 维护或隐藏兼容层，不得长期污染主界面。

### U27：Windows GUI 验收

历史结果为 NO-GO，发现资源库状态断裂和 Demo 诊断问题。两项均在 U28 关闭。

### U28：资源库授权与真实 Index 闭环

- 原生目录授权；
- 当前窗口 token；
- 设置、Index、首页、资源库、PlayerBar 和诊断统一；
- 合法空 Index、损坏 JSON、多编码、媒体协议和重启边界通过 Electron E2E。

### U29：播放器和字幕全流程

- HTMLAudio / mpv 续播起点一致；
- Seek、队列、完成策略、重启恢复和 token 对账；
- LRC、SRT、VTT、ASS、双语和无字幕验收。

### U30：日常 UI、主题、窗口、DPI 和键盘

- 三档窗口 / DPI；
- 三主题矩阵；
- PlayerBar、侧栏、Escape、焦点返回、reduced-motion 和 focus-visible。

### U31：导入器事务与数据安全

- copy-only 和 move-only；
- 默认不覆盖目标；
- copy 失败清理本轮新文件；
- move 失败逆向恢复本轮已移动文件；
- OperationLog 记录事务和回滚结果；
- 不保存绝对路径。

### U32：发布候选 UI 与 Windows 发布物

- 日常侧栏收口；
- 首页、资源库、歌单、导入器和设置对齐；
- portable 和 NSIS；
- 中文 / 空格路径；
- 安装、重复安装、卸载；
- 用户数据保留；
- mpv 不可用时 HTMLAudio fallback；
- 包内用户数据泄漏检查；
- SHA-256、截图和报告。

### U33：Beta 1 发布

- 版本更新到 `0.168.0-beta.1`；
- `v0.168.0-beta.1` prerelease；
- portable、setup 和 `SHA256SUMS.txt`；
- 发布目标、资产名、大小和 digest 回读；
- electron-builder 隐式发布关闭；
- 发布失败可观测和恢复路径；
- 发布后固定 target 和资产 manifest；
- 历史版本 verifier 兼容性修复。

## 当前主线：Beta 2 整备

Beta 2 不是大型功能版本。它统一处理：

1. 代码结构、依赖边界、IPC、类型、状态、错误、测试和文档治理；
2. 设计系统、深浅主题、App Shell、页面布局、三种播放器、动画和真实功能入口的 UI 重写。

执行路线：

```text
U34 联合审计和不可破坏行为
→ U35 设计系统、基础组件和 App Shell
→ U36 契约、状态和 IPC 边界
→ U37 首页、音声库、详情和音乐库
→ U38 PlayerBar、经典、黑胶、歌词和队列
→ U39 导入器、设置、AI 维护和复杂二级流程
→ U40 清理、质量、兼容和 Beta 2 发布
```

详细计划：

- `docs/PROJECT_PROGRESS.md`；
- `docs/BETA2_MASTER_PLAN.md`；
- `docs/ARCHITECTURE_QUALITY_PLAN.md`；
- `docs/DESIGN.md`。

## 当前任务状态

| 范围 | 状态 |
|---|---|
| Beta 1 功能和发布 | 完成 |
| 发布资产冻结校验 | 完成 |
| Beta 2 规划和设计规则 | 当前文档 PR |
| U34 代码库联合审计 | 待开始 |
| 新 App Shell | 待开始 |
| 核心页面迁移 | 待开始 |
| 三种播放器 UI | 原型完成，正式实现待开始 |
| 深色暮夜琥珀 | 原型完成，正式实现待开始 |
| 浅色雾光象牙 | 原型完成，正式实现待开始 |
| Beta 2 发布 | 待开始 |

## Beta 2 冻结项

Beta 2 完成前禁止启动或合入：

- MVP130 正式下载器；
- SQLite 全面迁移；
- OpenList / WebDAV；
- 云同步；
- Player Core v2；
- 新播放器内核；
- 转录 Worker 正式接入；
- 新大型 Provider；
- 插件市场或通用插件平台；
- 移动端和 Web 端。

允许修复上述模块相关的 P0/P1 回归，但不得扩展范围。

## Beta 2 完成定义

目标版本：`0.169.0-beta.2`。

必须满足：

- 新 App Shell 和核心页面替换旧 UI；
- 暮夜琥珀和雾光象牙为完整主题，不是换色；
- 经典、黑胶、歌词三种播放器完成；
- 现有真实功能入口无重大缺口；
- 依赖边界、IPC、错误、Result、状态和 TypeScript 规则落地；
- 关键 Domain / Application 测试和 Electron E2E 通过；
- 50,000 曲目性能不明显退化；
- Beta 1 用户数据升级到 Beta 2 可读；
- portable、NSIS、安装、升级、卸载、fallback 和 SHA-256 全绿；
- 无 P0/P1 已知问题。

Beta 2 发布后建议进行 2～4 周真实使用观察；无重大问题后，再决定进入 RC / 1.0 或启动下载器、SQLite、转录等大功能。

## 自动验证

每个 PR 至少执行：

```text
npm ci --ignore-scripts --no-audit --no-fund
npm audit --audit-level=high
TypeScript 与 Electron 构建
U28/U29/U30 Electron E2E
U31 importer transaction matrix
U32 visual audit
当前稳定 verifier
npm run verify:stable
最终生产构建
```

Beta 2 逐步增加：

- architecture import boundary；
- IPC runtime schema；
- no-new-any；
- visual regression；
- deep / light theme matrix；
- three player modes；
- Beta 1 → Beta 2 data migration；
- Windows install / upgrade / uninstall。

## 安全边界

- Renderer 不接收或持久化 absolutePath、file:// 和临时媒体 URL；
- 不自动覆盖、删除、移动或清理真实媒体文件；
- move-only 必须二次确认并使用事务；
- Index 写入必须备份、复核和读回；
- Provider 不自动覆盖本地元数据；
- 诊断、MVP、verifier、IPC 和 Git 信息只进入 AI 维护层；
- 下载器实验代码不进入 Beta 2 主线。
