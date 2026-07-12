# Yang-Kura MVP128 路线

当前版本：`0.166.0-mvp128`

## 本轮目标

把 MVP127 的失效索引清理预览升级为受控写入：

1. 用户先执行只读健康检查并生成移除预览。
2. Renderer 只提交源 index SHA-256、预览时间和固定确认文本。
3. Electron main 使用内存中的预览操作，不信任 Renderer 提交操作列表。
4. 写入前重新读取 `library-index.json` 并核对 SHA-256。
5. 源 index 变化时立即停止。
6. 同目录创建独占备份。
7. 仅移除索引记录或解除引用，不删除媒体文件。
8. 写入后重新读取、校验结构和 SHA-256。
9. 校验失败时尝试恢复原 index。
10. 成功后重新读取 index 并刷新音声库、音乐库和首页。

## 继续保持

- Local JSON Index 优先，SQLite 后置。
- 不删除、移动、重命名或覆盖真实媒体文件。
- Renderer 不接收 absolutePath 或 file://。
- 不改变导入器、Provider、mpv 和扫描执行边界。
