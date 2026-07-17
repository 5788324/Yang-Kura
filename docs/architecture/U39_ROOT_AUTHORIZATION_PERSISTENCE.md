# U39-C 资源库授权持久化与重启恢复

## 问题

Electron Main 过去只在内存的 `rootTokenMap` 中保存 `rootPathToken → absolutePath`。Renderer 会持久化 tokenized Index、播放队列和最近播放，但应用重启后 Main 的映射为空，导致同一个旧 token 无法继续解析 Index、媒体 URL、mpv 或字幕。

U39 综合 Windows 审计因此把“真实资源库重启后恢复播放”判定为 Blocker。

## 修复

- 新增 `electron/rootAuthorizationStore.ts`；
- 授权记录保存在 Electron 用户数据目录的 `root-authorizations.json`；
- 文件只在 Main 进程读写，Renderer 只保存 token、显示名、资源库类型和选择时间；
- 启动时先恢复授权记录，再注册媒体协议和创建窗口；
- 用户重新选择既有资源库时，优先复用已保存 token；若没有记录，则从现有 `library-index.json` 的 `rootPathToken:` 字段接管旧 token；
- 同一目录不会不断生成新 token；token 与另一个路径冲突时会生成新 token。

## 升级行为

旧版本从未保存 absolute path，因此升级后的第一次启动无法无提示恢复旧授权。用户只需重新选择原目录一次；U39-C 会从现有 Index 接管旧 token 并持久化。之后重启无需再次选择目录。

## 隐私边界

- absolute path 只保存在本机 Electron 用户数据目录和 Main 内存；
- Renderer、Index 返回值、日志和 UI 不接收 absolute path 或 `file://`；
- 授权文件使用仅当前用户可读写的文件模式请求；
- 本轮不修改媒体文件、Index 内容或导入事务。

## 验证

- TypeScript 与 Renderer/Electron 生产构建；
- U39-C 定向 verifier；
- U28 Electron E2E：重启后无需重选即可读取空 Index，真实 WAV 媒体协议与播放继续可用；
- U29 Electron E2E：播放器、Seek、队列、字幕和续播；
- Windows portable/NSIS 与安装数据保留门禁。
