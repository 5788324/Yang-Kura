# Yang-Kura 工作日志

> 仅记录当前 Beta 2 主线的有效交付。代码与合并事实以 GitHub `main` 和对应 PR 为准。

## 2026-07-16

### U34 — 联合审计与交付规则

- PR：#56
- 合并提交：`96885e2f5da6d24891e9e8e041ef681f13446f1c`
- 完成架构审计、依赖图、重构待办和关键行为冻结清单。
- 将“低风险任务一次全局搜索、批量修改、一个 PR、一次最终门禁”写入长期执行规则。
- 建立文档轻量 CI，避免普通文档修改重复触发 portable、NSIS 和历史发布验证。

### U35-A — 共享合同与 Design System 基础

- PR：#57
- 合并提交：`a8d931985ea804b17582693bce82ffe7a62b26a0`
- 建立唯一 `IPC_CHANNELS` 注册表、`IpcResult<T>`、`IpcError` 与错误分类。
- 建立暮夜琥珀、雾光象牙语义 Token。
- 新增 AppShell、Button、Surface、Feedback、Dialog、Drawer、MediaCard、TrackRow。
- 修复 U32 PowerShell 非 fail-fast 导致的 TypeScript 假阳性。

### U35-B — 正式主题与生产 AppShell

- PR：#58
- 合并提交：`5937903c932bdabb0fbb0115b4312fb14a57d79e`
- 两套 Beta 2 正式主题投入生产运行。
- Renderer 入口接入 ThemeRuntimeBridge 与 AppShell production bridge。
- TopBar、Sidebar、内容区、PlayerBar、队列抽屉和续播提示接入语义 Token。
- 历史主题设置与正式主题双向兼容。
- TypeScript、Electron E2E、UI/可访问性、导入事务、稳定回归、portable/NSIS 全部通过。

### U36-A — 导航与 Preload IPC 统一

- 分支：`agent/u36-shell-router-ipc`
- 建立 `src/app/navigation.ts`，统一日常导航和维护路由元数据。
- Sidebar 改为消费统一导航注册表，不再维护第二套页面清单。
- Preload 请求类型拆分到 `electron/preload/contracts.ts`。
- `electron/preload.ts` 所有 invoke/on/removeListener 改用 `IPC_CHANNELS`。
- 保持 `window.yangKura` API、路径 token、安全边界和产品业务行为不变。
- 项目状态与当前交接已推进到 U36-B。

## 当前结论

```text
U34：完成
U35-A：完成
U35-B：完成
U36-A：完成
当前任务：U36-B
目标版本：0.169.0-beta.2
大型功能：继续冻结
```
