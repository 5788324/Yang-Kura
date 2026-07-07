# MVP-75 — Diagnostics History Fold + PlayerBar Progress Stability

版本：`0.113.0-mvp75`

## 1. 诊断页收口

新增 `src/services/diagnosticsHistoryFoldService.ts`，把诊断页历史维护信息组织为阶段组：

- 资源库扫描 / 索引
- Electron / IPC / 打包
- 播放 / 字幕 / 队列
- 日常 UI 收口
- Beta / 交接 / 历史验证

新增 UI marker：

- `mvp75-diagnostics-history-folded`
- `mvp75-diagnostics-default-summary`
- `mvp75-diagnostics-phase-groups`
- `mvp75-diagnostics-maintenance-markers`

诊断页仍保留旧 verifier marker，不删除历史验证入口，只是默认折叠。

## 2. 播放器进度条核对与修复

MVP-74 播放栏的进度动画条存在隐性问题：

- `progressPercent` 未 clamp，异常 progress 可能导致宽度小于 0 或超过 100%。
- `progress / duration` 异常时可能得到 `NaN`。
- 拖拽 range 时 `onMouseUp` 可能读取旧的 `dragValue`。
- 时长无效或宽度为 0 时仍可能计算 seek。

MVP-75 修复：

- 增加 `getSafeDuration`。
- 增加 `clamp`。
- `currentDisplayProgress` 和 `progressPercent` 均限制在合法范围。
- 使用 `pendingSeekValueRef` 保存最新拖拽值。
- 无有效时长时禁用 range seek。
- 新增 marker：`mvp75-playerbar-progress-stability`。

## 3. 不改范围

本轮不修改真实扫描、写入 `library-index.json`、本地音频播放内核、字幕读取链路、外部打开链路。

## 4. Safety tokens

不接 SQLite；不删除 / 移动 / 重命名真实媒体文件；不向 Renderer 暴露 absolutePath；不向 Renderer 暴露 file://。
