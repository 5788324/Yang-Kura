import fs from 'node:fs';

const required = [
  'README.md',
  'PROJECT_STATE.md',
  'PROJECT_ROADMAP.md',
  'AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md',
  'AI_HANDOFF/WORKLOG.md',
  'docs/U39_FINAL_ACCEPTANCE.md',
  'docs/architecture/U39_ARCHITECTURE_GUARDRAILS.md',
  'scripts/verify-u39-final-acceptance.mjs',
  'scripts/verify-u39f-architecture-guardrails.mjs',
  'scripts/test-u39f-architecture-guardrails.mjs',
  '.github/workflows/u39-final-acceptance.yml',
  '.github/workflows/architecture-guardrails.yml',
  'release/beta2-publication-state.json',
];

const tokens = [
  ['README.md', 'U39-G：同一候选提交重跑'],
  ['README.md', '不再预排 U39 轮次'],
  ['PROJECT_STATE.md', 'U39-G：最终 Windows 回归与打包验收完成'],
  ['PROJECT_STATE.md', '当前任务：按需日常维护'],
  ['PROJECT_ROADMAP.md', 'U39-G：最终综合验收完成'],
  ['PROJECT_ROADMAP.md', '当前任务：按需日常维护'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', 'U39-G：最终综合验收完成'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '不再存在预排的下一轮 U39'],
  ['AI_HANDOFF/WORKLOG.md', '### U39-G — 最终综合验收'],
  ['docs/U39_FINAL_ACCEPTANCE.md', '# U39-G 最终综合验收'],
  ['docs/U39_FINAL_ACCEPTANCE.md', '不再存在预排的“下一轮 U39”任务'],
  ['scripts/verify-u39-final-acceptance.mjs', 'U39 final acceptance manifest PASS'],
  ['.github/workflows/u39-final-acceptance.yml', 'Windows full regression and packaged delivery'],
  ['release/beta2-publication-state.json', '"releaseId": 355486824'],
];

const staleTokens = [
  '当前阶段：U39-F 增量架构防回退门禁完成；准备综合收尾',
  '当前任务：综合收尾与剩余问题重新核对',
  '当前任务：U39 审计剩余问题继续按优先级修复',
  '当前任务：发布 0.169.0 Beta 2 个人日用版',
];

const activeDocs = required.slice(0, 5);
const temporaryFiles = [
  '.github/workflows/u39g-closeout-sync.yml',
  'scripts/apply-u39g-closeout.mjs',
  '.github/workflows/u39e-empty-state-sync.yml',
  '.github/workflows/u38a-branch-orchestrator.yml',
  'scripts/apply-u38a-refactor.py',
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
for (const file of temporaryFiles) if (fs.existsSync(file)) failures.push(`temporary file remains: ${file}`);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('[verify-handoff] U39-G final acceptance handoff PASS');
