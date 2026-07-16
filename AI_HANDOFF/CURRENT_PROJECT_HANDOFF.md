# Yang-Kura 当前项目交接

> 当前权威交接已经切换到 [`BETA2_PROJECT_HANDOFF.md`](BETA2_PROJECT_HANDOFF.md)。

## 当前事实

```text
稳定版本：0.168.0-beta.1
发布 tag：v0.168.0-beta.1
Beta 1 主线：U02～U33 已完成
当前阶段：Beta 2 架构、代码质量与 UI 整备
Beta 2 目标：0.169.0-beta.2
```

GitHub `main` 是唯一代码事实来源。Beta 1 发布目标和资产已冻结在 `release/u33-publication-state.json`，不得再执行或重复解释旧 U33 发布计划。

## 新接手顺序

1. `README.md`；
2. `PROJECT_STATE.md`；
3. `docs/PROJECT_PROGRESS.md`；
4. `docs/BETA2_MASTER_PLAN.md`；
5. `docs/ARCHITECTURE_QUALITY_PLAN.md`；
6. `docs/DESIGN.md`；
7. `AI_HANDOFF/BETA2_PROJECT_HANDOFF.md`；
8. `AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`；
9. GitHub 最新 branch、PR、Actions、tag 和 Release。

## 当前任务

规划文档合入后进入 U34：代码库与 UI 联合审计。

U34 不修改产品行为，只建立：

- 模块和依赖图；
- 大文件、复杂度、重复和循环依赖清单；
- IPC、类型、状态和错误边界审计；
- 构建、测试、性能、包体和大库基线；
- Beta 1 不可破坏行为；
- 首批迁移模块和回退计划。

## 当前冻结

Beta 2 发布并完成真实使用观察前，不启动正式下载器、SQLite 全面迁移、OpenList/WebDAV、Player Core v2、新播放内核、转录 Worker、插件系统或其他大型功能。

详细协作、架构、设计和验收规则以新交接及其引用文档为准。
