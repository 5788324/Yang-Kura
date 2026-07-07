# Codex copy only 验收任务书 MVP-92

版本：`0.130.0-mvp92`

## 任务定位

Codex 只做本机关键验收，不做长文档，不自由发挥重构。

## 验收步骤

1. 确认仓库版本为 `0.130.0-mvp92`。
2. 确认存在 `src/services/copyOnlySampleReadinessService.ts`。
3. 运行：

```bash
npm ci --ignore-scripts
npm run lint
npm run build:electron
npm run verify:mvp92-copy-sample-readiness
npm run verify:all
npm run build
npm audit --audit-level=high
```

4. 手工确认导入器页存在：
   - `mvp92-copy-sample-readiness`
   - `mvp92-minimal-sample-requirements`
   - `mvp92-codex-validation-steps`
   - `mvp92-copy-only-ipc-contract`
   - `mvp92-main-side-copy-contract`
   - `mvp92-disabled-real-copy-button`

5. 手工确认诊断页存在：
   - `mvp92-copy-sample-readiness-diagnostics`

## 禁止事项

- 不实现真实 copy。
- 不把正式资源库作为测试目录。
- 不修改扫描 / 播放 / index 写入链路。
- 不接 SQLite。
- 不移动 / 删除 / 重命名文件。

## PASS 标准

所有命令通过，UI 锚点存在，执行按钮仍禁用，未出现真实文件操作实现。
