# PROJECT_ROADMAP

> **文档定位：Yang-Kura 长期路线入口。**  
> 代码事实以 GitHub `main` 为准；当前状态见 `PROJECT_STATE.md`；Beta 2 详细执行见 `docs/BETA2_MASTER_PLAN.md`。

## 1. 当前基线

```text
稳定版本：0.168.0-beta.1
发布 tag：v0.168.0-beta.1
已完成：U02～U33
当前主线：U34～U40 Beta 2 架构、质量与 UI 整备
Beta 2 目标：0.169.0-beta.2
```

Beta 1 的 tag、发布目标和资产已冻结，不随后续 main 提交变化。

## 2. 当前路线

```text
U34 代码库与 UI 联合审计
→ U35 Design Token、基础组件、深浅主题和 App Shell
→ U36 契约、状态、错误和 IPC 边界
→ U37 首页、音声库、RJ 详情和音乐库迁移
→ U38 PlayerBar、经典、黑胶、歌词和队列
→ U39 导入器、设置、AI 维护和复杂二级流程
→ U40 清理、质量、兼容和 Beta 2 发布
→ 2～4 周真实使用观察
→ 决定 RC / 1.0 或下一条大功能主线
```

Beta 2 预计 12～18 个开发轮次。每轮必须范围单一、可回退、自动测试通过并删除被替代旧路径。

## 3. 战略原则

Beta 2 不是：

- 全项目推倒重写；
- 单纯视觉换皮；
- 继续堆叠大功能；
- 长期维护两套完整 UI。

Beta 2 是：

- 行为冻结；
- 先审计再迁移；
- 设计系统与模块边界同步建立；
- 按页面和功能域渐进迁移；
- 每迁移一处，删除对应旧路径；
- 用 CI 阻止架构、类型和视觉退化。

## 4. Beta 2 完成条件

- 新 App Shell 和核心页面替换旧 UI；
- 完成暮夜琥珀和雾光象牙两个完整主题；
- 完成经典、黑胶、歌词三种播放器；
- 现有真实功能入口、空状态、错误和恢复流程无重大缺口；
- renderer、preload、main、application、domain、infrastructure 边界落地；
- IPC、Result、错误和状态事实来源统一；
- 关键模块测试、Electron E2E、视觉回归和无障碍通过；
- 50,000 曲目性能不明显退化；
- Beta 1 用户数据升级和回滚路径通过；
- portable、NSIS、安装、升级、卸载、fallback 和 SHA-256 全绿；
- 无 P0/P1 已知问题。

Beta 2 可以作为第一版真正适合长期日用的公开 Beta。完成后仍建议观察 2～4 周，再宣布 RC 或稳定 1.0。

## 5. 冻结项

Beta 2 发布前禁止启动或合入：

- 正式下载器和 MVP130 扩展；
- SQLite 全面迁移；
- OpenList / WebDAV / 云同步；
- Player Core v2 或新播放内核；
- 转录 Worker 正式集成；
- 新大型 Provider；
- 插件系统；
- 移动端和 Web 端。

允许修复这些区域的 P0/P1 回归，但不得扩大范围。

## 6. Beta 2 后候选方向

观察期完成后重新排序，不自动启动：

1. 下载器与任务数据层；
2. SQLite 渐进迁移；
3. 字幕转录 Worker；
4. 元数据中心；
5. 云端 / WebDAV Adapter；
6. Player Core v2；
7. 插件能力。

排序依据：真实使用收益、风险、维护成本、现有架构准备度和自动化测试能力。

## 7. 权威文档

- `PROJECT_STATE.md`：当前事实；
- `docs/PROJECT_PROGRESS.md`：任务进度和后续安排；
- `docs/BETA2_MASTER_PLAN.md`：Beta 2 分阶段执行；
- `docs/ARCHITECTURE_QUALITY_PLAN.md`：架构与代码质量规则；
- `docs/DESIGN.md`：UI 设计和验收规则；
- `AI_HANDOFF/BETA2_PROJECT_HANDOFF.md`：新对话交接；
- `AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`：固定分工。

历史 U/MVP 和 Release 文档仅作为证据，不再作为当前任务入口。
