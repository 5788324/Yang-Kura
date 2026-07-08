# Handoff MVP93 → MVP94

## 基线

- MVP93：`0.131.0-mvp93`
- MVP94：`0.132.0-mvp94`

## 本轮主题

copy-only preflight 真实化，但仍不执行 copy。

## 新增

- `src/services/copyOnlyPreflightRealCheckService.ts`
- `docs/CURRENT_ROADMAP_MVP94.md`
- `docs/COPY_ONLY_PREFLIGHT_REAL_CHECK_MVP94.md`
- `scripts/verify-mvp94-copy-only-preflight-real-check.mjs`

## 修改

- `electron/main.ts`
- `electron/preload.ts`
- `src/types/electron-api.d.ts`
- `src/components/ImporterPage.tsx`
- `src/components/DiagnosticsPage.tsx`
- `src/services/index.ts`
- `package.json`
- `package-lock.json`
- project handoff docs

## 禁止事项

MVP94 不做真实 copy，不创建目录，不写 OperationLog，不写 library-index.json。

## 下一步

MVP95 如进入真实 copy executor，必须先让 Codex 做本机关键 gate。
