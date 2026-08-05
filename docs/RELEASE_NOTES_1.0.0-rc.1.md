# Yang-Kura 1.0.0-rc.1 发布说明

`1.0.0-rc.1` 是 Yang-Kura 1.0 正式版前的固定 Windows 候选，不是当前公开稳定版本。当前公开版本仍为 `0.170.0-beta.3`，只有候选 SHA 的 Windows 全门禁和实机验收完成后才允许创建 RC 标签或 Release。

## 面向日常使用的能力

- 本地 ASMR/RJ 与音乐资源库；
- Local JSON Index、授权目录与隐私化路径展示；
- HTMLAudio 默认播放与可选 mpv 后端；
- LRC、SRT、VTT、ASS 字幕；
- 队列、歌单、播放历史、收藏与重启恢复；
- 真实四步 Importer，支持冲突预检、copy/move、OperationLog、失败停止、回滚和 Index 备份更新；
- Windows portable 与无管理员权限 NSIS 安装器。

## 1.0 RC 收口

- 冻结 Downloader 已退出生产路由与构建产物；
- 生产入口不可达实现归零，历史代码不参与 TypeScript 或 Vite 构建；
- Electron 固定到 39.8.10，关闭 worker/subframe Node 集成、webview 和新窗口；
- About 页面版本来自单一 package build source；
- 增加 1280、1024、800 三档窗口的全页面、按钮与键盘最终门禁；
- 安装、覆盖安装、卸载、用户数据保留和进程回收纳入同一 RC 工作流；
- Git 工作流固定为 v2.3：多文件源码只通过真实 clone 和原生 Git 发布，失败立即交给 Codex，不再用 GitHub API 拼装提交。

## 仍然冻结

Downloader 实现、SQLite 全量迁移、OpenList/WebDAV、Player Core V2、完整 AI Agent、转录集成、云同步、插件市场和全局架构重写不属于 1.0 RC。

## 发布门禁

1. 固定父 SHA 应用累积源码包；
2. 单一分支、单一提交、一次推送和 Draft PR；
3. GitHub `U41-E Release Candidate Final Acceptance` 全绿；
4. Codex 在固定 SHA 上完成真实 Windows、真实库只读、声音输出和安装器验收；
5. Blocker 和 Major 为 0 后，才允许创建 `v1.0.0-rc.1`。
