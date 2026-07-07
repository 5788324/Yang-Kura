# HANDOFF MVP91 → MVP92

版本：`0.130.0-mvp92`

## 本轮主题

MVP-92：copy only 最小真实样本准备 / Codex 本机验收任务书。

## 新增

- `src/services/copyOnlySampleReadinessService.ts`
- `docs/CURRENT_ROADMAP_MVP92.md`
- `docs/COPY_SAMPLE_READINESS_MVP92.md`
- `docs/CODEX_COPY_ONLY_VALIDATION_MVP92.md`
- `scripts/verify-mvp92-copy-sample-readiness.mjs`

## 边界

本轮不执行真实 copy，不读取真实文件系统，不写 index，不接 SQLite，不暴露 absolutePath / file://。

## 下一轮建议

MVP-93：copy-only main-side stub / still disabled。
