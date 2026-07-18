# Electron Main 历史边界

`electron/main.ts` 仍承载历史注册入口。U40-D 没有继续向其中追加资源库读取状态、集合修复或 profile 清理逻辑；这些职责分别进入 Renderer 协调器、集合规范化服务和启动清理服务。后续修改 Main 时必须优先放入 `electron/ipc/domains` 或独立运行时模块。
