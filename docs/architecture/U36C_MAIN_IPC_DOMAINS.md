# U36-C Main IPC 分域注册

## 结论

U36-C 完成 Electron Main 注册层分域。业务实现、文件事务、Index 写入、mpv 后端、Provider 和返回模型保持不变。

## 新边界

- `electron/ipc/registerInvokeHandler.ts`：唯一低层 `ipcMain.removeHandler/handle` 所有者。
- `electron/ipc/domains/library.ts`：目录授权、扫描、Index 与维护注册。
- `electron/ipc/domains/media.ts`：媒体 URL、字幕、外部打开与文件管理器注册。
- `electron/ipc/domains/player.ts`：mpv 播放与设置注册。
- `electron/ipc/domains/metadata.ts`：ASMR 元数据 Provider 注册。
- `electron/ipc/domains/importer.ts`：copy-only、move-only 与 Index patch 注册。

## 不可破坏行为

- Renderer 只接收 root token 与相对路径，不接收 absolute path 或 `file://`。
- copy-only、move-only、Index patch、备份恢复和受控清理事务逻辑不变。
- mpv 自动 fallback、Seek、状态事件和退出清理不变。
- `window.yangKura` 与 Preload API 不变。

## 自动门禁

`scripts/verify-u36c-main-ipc-domains.mjs` 要求：

1. `electron/main.ts` 不再调用 `ipcMain.handle/removeHandler`。
2. Main 不得出现裸 `yang-kura:*` channel 字符串。
3. 五个领域模块必须从 `IPC_CHANNELS` 解析 channel。
4. 共享 registrar 在注册前移除旧 handler，兼容窗口重建和测试重复初始化。

## 下一阶段

进入 U37：首页、资源库和详情页面级 UI 迁移；Main 业务实现继续按被页面触碰的纵向切片渐进拆分，不进行一次性重写。
