#!/usr/bin/env node
import fs from 'node:fs';

const required = [
  'README.md',
  'PROJECT_STATE.md',
  'PROJECT_ROADMAP.md',
  'AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md',
  'AI_HANDOFF/WORKLOG.md',
  'AI_HANDOFF/NEXT_CONVERSATION_PROMPT.md',
  'docs/GIT_FAST_LANE_V2.md',
  'docs/U41_PRODUCT_AUDIT.md',
  'docs/U41_DEFECT_BACKLOG.md',
  'docs/U41_UI_FUNCTION_BUTTON_MATRIX.md',
  'docs/U41_LEGACY_CLEANUP_INVENTORY.md',
  'docs/U41_CODEX_PUBLIC_PACKAGE_ACCEPTANCE.md',
  'docs/U41_EXECUTION_PLAN.md',
  'docs/U41B_DAILY_USER_ENTRY.md',
  'docs/U41C_RUNTIME_PATCH.md',
  'scripts/audit-u41-product-surface.mjs',
  'scripts/verify-u41b-daily-user-entry.mjs',
  'scripts/verify-u41c-runtime-patch.mjs',
  '.github/workflows/u41b-daily-user-entry.yml',
  '.github/workflows/u41c-runtime-patch.yml',
  'release/beta3-release-plan.json',
  'release/beta2-publication-state.json',
];

const tokens = [
  ['README.md', '本地候选：U41-B + U41-C 日常入口与运行时补丁'],
  ['README.md', 'Importer production chunk 已从约 255 KB 降到约 22 KB'],
  ['PROJECT_STATE.md', 'U41-B + U41-C 累积候选'],
  ['PROJECT_STATE.md', 'Electron 从 39.8.1 升至 39.8.10'],
  ['PROJECT_ROADMAP.md', 'U41-D：生产表面瘦身'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', 'feat/u41bc-daily-runtime-closeout'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '当前 Linux 环境无法下载 Electron binary'],
  ['AI_HANDOFF/WORKLOG.md', '### U41-A 全产品审计'],
  ['AI_HANDOFF/WORKLOG.md', '## 2026-07-19 — U41-B 日常用户入口'],
  ['AI_HANDOFF/WORKLOG.md', '## 2026-07-19 — U41-C 运行时与跨平台门禁'],
  ['AI_HANDOFF/NEXT_CONVERSATION_PROMPT.md', 'feat: connect importer and harden Electron runtime'],
  ['docs/U41_PRODUCT_AUDIT.md', 'U41-C：LOCAL COMPLETE / WINDOWS VERIFY'],
  ['docs/U41_DEFECT_BACKLOG.md', 'Electron 升至 39.8.10'],
  ['docs/U41_UI_FUNCTION_BUTTON_MATRIX.md', '| 设置·播放 | HTMLAudio/mpv | VERIFY |'],
  ['docs/U41B_DAILY_USER_ENTRY.md', 'YANG_KURA_E2E_IMPORT_SOURCE_ROOT'],
  ['docs/U41C_RUNTIME_PATCH.md', 'npm audit --audit-level=moderate'],
  ['docs/U41C_RUNTIME_PATCH.md', 'Windows U28/U29/portable/NSIS：NOT RUN'],
  ['docs/U41_LEGACY_CLEANUP_INVENTORY.md', 'DiagnosticsPage.tsx'],
  ['docs/U41_CODEX_PUBLIC_PACKAGE_ACCEPTANCE.md', 'v0.170.0-beta.3'],
  ['docs/U41_EXECUTION_PLAN.md', 'U41-C：运行时补丁 — LOCAL COMPLETE / WINDOWS VERIFY'],
  ['release/beta3-release-plan.json', '"version": "0.170.0-beta.3"'],
  ['release/beta2-publication-state.json', '"releaseId": 355486824'],
];

const staleTokens = [
  'U41-A：审计基线完成，等待单一审计 PR',
  '当前轮 U41-A',
  '日常 Importer 页面没有真实来源选择、预览、copy/move 执行和 UI 结果闭环',
  'audit/u41-product-surface',
  'branch: feat/u41b-daily-user-entry',
  'commit: feat: connect daily importer and version source',
  'U41-MAJ-003 Electron 补丁 | OPEN / U41-C',
];
const activeDocs = [
  'README.md',
  'PROJECT_STATE.md',
  'PROJECT_ROADMAP.md',
  'AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md',
  'AI_HANDOFF/NEXT_CONVERSATION_PROMPT.md',
];
const forbiddenTemporaryFiles = [
  '.github/workflows/u39g-closeout-sync.yml',
  '.github/workflows/u40d3-persist-fix.yml',
  '.github/workflows/apply-u40d3-html-audio-fix.yml',
  'scripts/apply-u39g-closeout.mjs',
];
const failures = [];

for (const file of required) if (!fs.existsSync(file)) failures.push(`missing ${file}`);
for (const [file, token] of tokens) {
  if (!fs.existsSync(file) || !fs.readFileSync(file, 'utf8').includes(token)) failures.push(`${file} missing token ${token}`);
}
for (const file of activeDocs) {
  const source = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  for (const token of staleTokens) if (source.includes(token)) failures.push(`${file} retains stale token ${token}`);
}
for (const file of forbiddenTemporaryFiles) if (fs.existsSync(file)) failures.push(`temporary file remains: ${file}`);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('[verify-handoff] U41-B importer + U41-C Electron/runtime cumulative candidate PASS');
