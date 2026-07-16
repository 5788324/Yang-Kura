# Yang-Kura 工作日志

> 仅记录当前 Beta 2 主线的有效交付。代码与合并事实以 GitHub `main` 和对应 PR 为准。

## 2026-07-16

### U34 — 联合审计与交付规则

- PR：#56
- 合并提交：`96885e2f5da6d24891e9e8e041ef681f13446f1c`
- 完成架构审计、依赖图、重构待办和关键行为冻结清单。
- 建立低风险任务批量修改、单一 PR、单次最终门禁规则。
- 建立文档轻量 CI。

### U35-A — 共享合同与 Design System 基础

- PR：#57
- 合并提交：`a8d931985ea804b17582693bce82ffe7a62b26a0`
- 建立唯一 `IPC_CHANNELS`、`IpcResult<T>`、`IpcError` 与错误分类。
- 建立暮夜琥珀、雾光象牙语义 Token 和基础 UI primitives。

### U35-B — 正式主题与生产 AppShell

- PR：#58
- 合并提交：`5937903c932bdabb0fbb0115b4312fb14a57d79e`
- 两套 Beta 2 正式主题投入生产运行。
- Renderer 入口接入 ThemeRuntimeBridge 与 AppShell production bridge。
- TopBar、Sidebar、内容区、PlayerBar、队列和续播提示接入语义 Token。
- 完整 Electron、稳定回归和 Windows 打包门禁通过。

### U36-A — 导航与 Preload IPC 统一

- PR：#59
- 合并提交：`b55196f5d4a374125a89b0640f221b8efc333e28`
- 建立 `src/app/navigation.ts` 页面元数据事实源。
- Sidebar 改为消费统一导航注册表。
- Preload 请求类型拆到 `electron/preload/contracts.ts`。
- Preload 所有 IPC 调用改用 `IPC_CHANNELS`。
- 历史 verifier 改为验证真实结构，不向产品代码回填旧锚点。

### U36-B — App Shell、Router 与 Overlay 拆分

- 分支：`agent/u36b-app-shell-router-overlays`
- 新增 `TopBar.tsx`，集中顶部资源库状态。
- 新增 `AppRouter.tsx`，集中页面 lazy loading、日常路由和内部维护路由。
- 新增 `QueueDrawer.tsx`，集中队列摘要、列表、清空和 Escape 关闭行为。
- 新增 `PlayerOverlayHost.tsx`，集中 Lyrics 与断点续播覆盖层。
- `App.tsx` 仅保留顶层状态、业务协调与壳组合。
- 保持 Index、播放、字幕、元数据、导入事务和路径安全行为不变。
- 当前任务：U36-C Main IPC 分域注册。

## 当前结论

```text
U34：完成
U35-A：完成
U35-B：完成
U36-A：完成
U36-B：代码完成，等待本分支最终门禁与合并
当前任务：U36-C
目标版本：0.169.0-beta.2
大型功能：继续冻结
```
