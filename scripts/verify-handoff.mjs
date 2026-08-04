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
  'docs/U41D_LEGACY_CLEANUP.md',
  'docs/U41E_RC_FINAL_ACCEPTANCE.md',
  'docs/RELEASE_NOTES_1.0.0-rc.1.md',
  'docs/U41_EXECUTION_PLAN.md',
  'scripts/verify-u41d-legacy-cleanup.mjs',
  'scripts/verify-u41e-rc-final-acceptance.mjs',
  'scripts/test-u41e-rc-final-acceptance.mjs',
  '.github/workflows/u32-release-candidate.yml',
  'archive/u41d-legacy-code/MANIFEST.json',
  'archive/u41d-workflows/MANIFEST.md',
  'archive/u41d-verifiers/MANIFEST.md',
];

const tokens = [
  ['README.md', '当前本地候选：`1.0.0-rc.1`'],
  ['README.md', 'Git Fast Lane v2.3'],
  ['PROJECT_STATE.md', 'U41-D + Git Fast Lane v2.3 + U41-E'],
  ['PROJECT_STATE.md', '远端候选分支/PR：不存在可靠证据'],
  ['PROJECT_ROADMAP.md', 'U41-E 1.0 RC 最终验收'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', 'release/u41e-rc1-candidate'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', 'NOT CONFIRMED / DO NOT CLAIM'],
  ['AI_HANDOFF/WORKLOG.md', '## 2026-07-20 — U41-E RC 候选与 Git v2.3 累积包'],
  ['AI_HANDOFF/NEXT_CONVERSATION_PROMPT.md', 'release: prepare Yang-Kura 1.0.0-rc.1'],
  ['docs/GIT_FAST_LANE_V2.md', '禁止通过 GitHub Contents API'],
  ['docs/GIT_FAST_LANE_V2.md', '禁止为多文件任务手工创建大量 Git blob、tree、commit 对象'],
  ['docs/U41D_LEGACY_CLEANUP.md', 'INCLUDED IN U41-E CUMULATIVE WINDOWS VERIFY'],
  ['docs/U41E_RC_FINAL_ACCEPTANCE.md', 'candidate version: 1.0.0-rc.1'],
  ['docs/U41E_RC_FINAL_ACCEPTANCE.md', '800×700'],
  ['docs/RELEASE_NOTES_1.0.0-rc.1.md', 'Git 工作流固定为 v2.3'],
  ['docs/U41_EXECUTION_PLAN.md', 'LOCAL IMPLEMENTED / WINDOWS VERIFY'],
  ['.github/workflows/u32-release-candidate.yml', 'name: U41-E Release Candidate Final Acceptance'],
  ['archive/u41d-legacy-code/MANIFEST.json', '"fileCount": 94'],
];

const staleTokens = [
  '当前候选：U41-D 冻结功能与历史代码清理',
  '当前任务：U41-D 本地候选',
  'U41-D：当前合并门禁',
  'branch: chore/u41d-legacy-cleanup',
  'commit: chore: archive frozen surfaces and legacy gates',
  'PR #93',
  '597a332c06e0110182213bedbbd1605c92c98989',
  'U41-D 分支：已建立',
  'U41-D PR：已建立',
];

const activeDocs = [
  'README.md',
  'PROJECT_STATE.md',
  'PROJECT_ROADMAP.md',
  'AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md',
  'AI_HANDOFF/NEXT_CONVERSATION_PROMPT.md',
  'docs/U41_EXECUTION_PLAN.md',
  'docs/U41E_RC_FINAL_ACCEPTANCE.md',
];

const forbiddenTemporaryFiles = [
  'scripts/test-u41e-renderer-layout.mjs',
  '.github/workflows/u41e-release-candidate.yml',
  '.github/workflows/u39g-closeout-sync.yml',
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
console.log('[verify-handoff] U41-D + Git v2.3 + U41-E cumulative RC candidate PASS');
