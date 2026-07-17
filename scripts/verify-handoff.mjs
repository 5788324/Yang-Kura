import fs from 'node:fs';

const required = [
  'README.md',
  'PROJECT_STATE.md',
  'PROJECT_ROADMAP.md',
  'AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md',
  'AI_HANDOFF/WORKLOG.md',
  'docs/architecture/U39_ARCHITECTURE_GUARDRAILS.md',
  'scripts/verify-u39f-architecture-guardrails.mjs',
  'scripts/test-u39f-architecture-guardrails.mjs',
  '.github/workflows/architecture-guardrails.yml',
  '.github/workflows/branch-validation.yml',
  'release/beta2-publication-state.json',
  'MVP130_EXPERIMENTAL_DO_NOT_MERGE.md',
];

const tokens = [
  ['README.md', 'U39-F 增量架构防回退门禁'],
  ['README.md', '当前仓库已有 1 个历史相对导入环'],
  ['PROJECT_STATE.md', '核心版本：0.169.0-beta.2'],
  ['PROJECT_STATE.md', 'U39-F：增量架构防回退门禁完成'],
  ['PROJECT_STATE.md', '当前任务：综合收尾与剩余问题重新核对'],
  ['PROJECT_STATE.md', 'Release ID：`355486824`'],
  ['PROJECT_ROADMAP.md', 'U39-F：增量架构防回退门禁完成'],
  ['PROJECT_ROADMAP.md', '当前任务：综合收尾与剩余问题重新核对'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '版本：0.169.0-beta.2'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', 'U39-F：增量架构防回退门禁完成'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '当前存在 1 个历史相对导入环'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', 'Release ID 355486824'],
  ['AI_HANDOFF/WORKLOG.md', '### U39-F — 增量架构防回退门禁'],
  ['AI_HANDOFF/WORKLOG.md', '当前报告记录 1 个历史相对导入环'],
  ['docs/architecture/U39_ARCHITECTURE_GUARDRAILS.md', '# U39-F 增量架构防回退门禁'],
  ['docs/architecture/U39_ARCHITECTURE_GUARDRAILS.md', '只阻断新增问题'],
  ['scripts/verify-u39f-architecture-guardrails.mjs', 'no-new-explicit-any'],
  ['scripts/verify-u39f-architecture-guardrails.mjs', 'no-new-relative-import-cycle'],
  ['scripts/test-u39f-architecture-guardrails.mjs', 'negative integration test PASS'],
  ['.github/workflows/architecture-guardrails.yml', 'Verify injected violations are rejected'],
  ['release/beta2-publication-state.json', '"status": "published"'],
  ['release/beta2-publication-state.json', '"releaseId": 355486824'],
];

const staleTokens = [
  '核心版本：0.167.0-mvp129',
  '当前任务：U28',
  '当前主线：U33 Beta 发布',
  '当前任务：发布 0.169.0 Beta 2 个人日用版',
  '当前任务：U38-B 播放器 Controller 与 Backend 边界',
  '当前任务：U38-C Subtitle loader 与字幕状态',
  '当前任务：U39 审计剩余 Major/Minor 问题继续按优先级修复',
];

const activeDocs = required.slice(0, 5);
const temporaryFiles = [
  '.github/workflows/u39e-empty-state-sync.yml',
  '.github/workflows/u38a-branch-orchestrator.yml',
  '.github/workflows/beta2-version-sync.yml',
  'scripts/apply-u38a-refactor.py',
  'docs/U38A_TRIGGER.md',
];

const failures = [];
for (const file of required) {
  if (!fs.existsSync(file)) failures.push(`missing ${file}`);
}
for (const [file, token] of tokens) {
  if (!fs.existsSync(file) || !fs.readFileSync(file, 'utf8').includes(token)) {
    failures.push(`${file} missing token ${token}`);
  }
}
for (const file of activeDocs) {
  const source = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  for (const token of staleTokens) {
    if (source.includes(token)) failures.push(`${file} retains stale token ${token}`);
  }
}
for (const file of temporaryFiles) {
  if (fs.existsSync(file)) failures.push(`temporary file remains: ${file}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('[verify-handoff] U39-F architecture guardrails handoff PASS');
