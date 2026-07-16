# Yang-Kura Beta 2 项目交接

## 1. 读取顺序

新对话或新代理按以下顺序读取：

1. `README.md`；
2. `PROJECT_STATE.md`；
3. `docs/PROJECT_PROGRESS.md`；
4. `docs/BETA2_MASTER_PLAN.md`；
5. `docs/ARCHITECTURE_QUALITY_PLAN.md`；
6. `docs/DESIGN.md`；
7. `AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`；
8. 当前分支、PR、CI 和最新提交。

GitHub `main` 是代码事实来源。不得依据旧压缩包、旧 MVP 报告或旧 U33 文案判断当前任务。

## 2. 当前事实

```text
稳定版本：0.168.0-beta.1
发布 tag：v0.168.0-beta.1
main 基线：1a2950c6a5c0558c016818bfd810df4e6ffbaead
Beta 1 主线：U02～U33 已完成
当前阶段：Beta 2 架构、代码质量与 UI 整备
Beta 2 目标：0.169.0-beta.2
```

Beta 1 发布目标提交、资产名、大小和 SHA-256 已冻结在 `release/u33-publication-state.json`。后续 main 提交不得改变历史 Release target 或资产。

## 3. 当前产品能力

- Windows Electron 本地应用；
- ASMR / RJ 音声库和普通音乐库；
- Local JSON Index；
- 本地扫描、Index 备份、写入、读取、清理和恢复；
- HTMLAudio + mpv + fallback；
- LRC / SRT / VTT / ASS；
- 歌单、队列、历史、续播和完成策略；
- copy-only 和受控 move-only 导入；
- 元数据覆盖、备份恢复和 DLsite 单 RJ Provider；
- 缺失文件和资源库维护；
- portable、NSIS、安装、卸载和用户数据保留；
- 50,000 曲目性能基准；
- Beta 1 GitHub prerelease 和远端资产校验。

## 4. 当前战略决策

下一阶段不增加大型功能。Beta 2 同时处理：

1. 架构、模块边界、IPC、类型、状态、错误、测试和文档；
2. Design Token、完整深浅主题、App Shell、核心页面、动画和三种播放器 UI。

不是代码和 UI 二选一。执行方式是：

```text
审计
→ 设计系统和 Shell
→ 契约和状态边界
→ 分页面迁移真实业务
→ 播放器
→ 复杂流程
→ 清理和发布
```

禁止全量推倒重写，也禁止制作脱离真实功能的第二套漂亮 Demo。

## 5. Beta 2 任务

```text
U34：代码库与 UI 联合审计
U35：Design Token、基础组件、深浅主题和 App Shell
U36：统一契约、状态、错误和 IPC 边界
U37：首页、音声库、RJ 详情、音乐库
U38：PlayerBar、经典、黑胶、歌词和队列
U39：导入器、设置、AI 维护和二级流程
U40：旧 UI 清理、质量门禁、兼容和 Beta 2 发布
```

预计 12～18 个开发轮次。每轮必须范围单一、可回退、测试通过，并删除被替代旧路径。

## 6. 大功能冻结

Beta 2 完成前禁止启动或合入：

- 正式下载器和 MVP130 扩展；
- SQLite 全面迁移；
- OpenList / WebDAV / 云同步；
- Player Core v2 或新播放内核；
- 转录 Worker 正式集成；
- 新大型 Provider；
- 插件系统；
- 移动端和 Web 端。

Beta 2 发布并完成真实使用观察后再重新规划。

## 7. UI 硬规则

- `docs/DESIGN.md` 是最高设计基线；
- 主题必须改变材质和层级，不是只换 accent；
- 首发主题：暮夜琥珀、雾光象牙；
- 一级导航固定：首页、音声库、音乐库、歌单、导入资源、设置；
- 工程信息进入 AI 维护；
- 不使用泛滥渐变、蓝紫霓虹、全局玻璃和卡片矩阵；
- 动画解释状态变化，遵守 reduced-motion；
- 三种播放器共享同一播放状态；
- 所有真实功能必须有可理解的入口、空状态、错误状态和恢复动作；
- 设计原型不是正式源码，业务事实以 GitHub main 为准。

交互原型：`https://8e1dec769448007b68.v2.appdeploy.ai/`。

## 8. 架构硬规则

- domain 不依赖 React、Electron、Node 或 DOM；
- renderer 不读写文件系统；
- renderer 不接收 absolutePath 或 file://；
- IPC 集中注册并运行时校验；
- 页面不实现文件事务、Index patch、Provider 解析或 mpv 控制；
- 同一状态只有一个 owner；
- 不新增 `any`、裸 IPC、浮动 Promise 或无说明 disable；
- 历史 verifier 不能通过固定文案和版本阻碍当前演进；
- 不长期保留新旧两套 UI；
- 每个迁移 PR 必须删除旧路径并可单独 revert。

## 9. 协作规则

- ChatGPT：规划、架构、开发、测试、Git、PR、文档、发布和验收；
- Codex：仅执行无法自动化的 Windows 实机检查，不修改源码；
- 用户：确认产品方向和视觉，不承担测试、排错、Git 和维护；
- Lovable / Stitch / AppDeploy：设计探索，不直接管理正式业务代码。

## 10. 下一步

当前文档 PR 合入后直接进入 U34，不继续扩张规划文档。

U34 只做审计：

- 量化大文件、复杂度、重复、循环依赖和弱类型；
- 绘制模块和 IPC 依赖图；
- 固定构建、测试、性能和包体基线；
- 建立不可破坏行为；
- 排出首批迁移模块；
- 不修改产品行为。
