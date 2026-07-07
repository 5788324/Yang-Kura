# MVP-92 copy only 最小真实样本准备

版本：`0.130.0-mvp92`

## 核心结论

MVP-92 不是 copy 执行器。它只把下一步真实 copy 所需的前置条件冻结下来：

1. 一次性 source / target sandbox 样本目录。
2. Codex 本机关键验收步骤。
3. copy-only IPC 合同。
4. Electron main-side 安全合同。
5. Renderer 不接收真实路径。

## 最小样本要求

建议样本：

```text
C:/YangKuraSandbox/import-source/RJ01588893 - copy-only-sample/
├─ 01_main.mp3
├─ 02_bonus.flac
├─ cover.jpg
├─ 01_main.zh.lrc
└─ info.txt

C:/YangKuraSandbox/import-target/
```

要求：

- 样本必须是一次性目录。
- 不得使用 `E:/MediaLibrary`、`E:/arsm` 或真实下载目录作为第一轮 copy 样本。
- 运行前后都要记录 source 和 target 文件数量。
- copy only 必须保留源文件。
- 同名目标不得覆盖。

## Codex 介入点

Codex 只在真实 copy 前介入：

```bash
npm ci --ignore-scripts
npm run lint
npm run build:electron
npm run verify:mvp92-copy-sample-readiness
npm run verify:all
npm run build
npm audit --audit-level=high
```

Codex 报告必须包含：样本目录、命令结果、未跟踪文件、是否可进入真实 copy 实现。

## 本轮边界

MVP-92 不执行文件操作，不创建目录，不写日志文件，不写 index，不接 SQLite。
