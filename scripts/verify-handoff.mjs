#!/usr/bin/env node
import fs from 'node:fs';

const required = [
  'README.md',
  'START_HERE.md',
  'TASKS.md',
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
  ['README.md', 'Kura Desktop 2.0'],
  ['PROJECT_STATE.md', 'K2-R0 在该分支审查并合并后关闭'],
  ['PROJECT_ROADMAP.md', '### K2-R3：增量扫描 + Thumbnail Cache'],
  ['TASKS.md', '## ACTIVE — K2-R1 Desktop 2.0 真实审计'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '## 3. K2-R0 已完成'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', 'K2-R1 Desktop 2.0 真实使用 + 8TB 大库审计'],
  ['AI_HANDOFF/WORKLOG.md', '## 2026-09-23 — K2-R0 输入查找、本机验证隔离与最终收口'],
  ['AI_HANDOFF/WORKLOG.md', '不替代 8TB 真库验收'],
  ['AI_HANDOFF/NEXT_CONVERSATION_PROMPT.md', '当前 ACTIVE：**K2-R1 Desktop 2.0 真实使用 + 8TB 大库审计**'],
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
  'Draft PR: #94',
  'U42 尚未合并',
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
console.log('[verify-handoff] K2-R1 active handoff contract PASS');
