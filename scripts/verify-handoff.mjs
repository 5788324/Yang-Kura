import fs from 'node:fs';

const required = [
  '00_NEW_CHAT_START_HERE.md',
  'NEW_CHAT_PROMPT.md',
  'NEW_CHAT_PROMPT_FULL.md',
  'NEXT_CHAT_HANDOFF.md',
  'RUN_ME_FIRST.md',
  'README.md',
  'PROJECT_STATE.md',
  'PROJECT_ROADMAP.md',
  'MVP130_EXPERIMENTAL_DO_NOT_MERGE.md',
  'AI_HANDOFF/00_READ_THIS_FIRST.md',
  'AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md',
  'AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md',
  'AI_HANDOFF/WORKLOG.md',
  'docs/NEXT_CHAT_HANDOFF.md',
  'docs/RUN_ME_FIRST.md',
  'docs/PROJECT_STATE.md',
  'docs/DESIGN.md',
  'docs/architecture/ARCHITECTURE_AUDIT.md',
  'docs/architecture/DEPENDENCY_MAP.md',
  'docs/architecture/REFACTOR_BACKLOG.md',
  'docs/architecture/U37_EXECUTION_PLAN.md',
  'docs/architecture/U38_PLAYER_SESSION_BOUNDARIES.md',
  'docs/architecture/U38_PLAYER_BACKEND_BOUNDARY.md',
  'docs/U29_PLAYER_RELIABILITY_ACCEPTANCE.md',
  'docs/U30_UI_FAST_TRACK_ACCEPTANCE.md',
  'docs/U31_IMPORTER_TRANSACTION_ACCEPTANCE.md',
  'docs/U32_RELEASE_CANDIDATE_PACKAGING.md',
  'docs/RELEASE_NOTES_0.169.0-beta.2.md',
  'release/beta2-publication-state.json',
  'scripts/verify-u38a-player-session-boundaries.mjs',
  'scripts/verify-u38b-player-backend-boundary.mjs',
  'archive/legacy-mvp-history/README.md',
];

const tokens = [
  ['00_NEW_CHAT_START_HERE.md', '当前主线：U38-C Subtitle loader 与字幕状态'],
  ['NEW_CHAT_PROMPT.md', '当前路线是 U38-C Subtitle loader 与字幕状态'],
  ['NEW_CHAT_PROMPT_FULL.md', 'U38-B 播放器 Controller/Backend 分离已完成'],
  ['NEW_CHAT_PROMPT_FULL.md', '当前阶段：U38-C Subtitle loader 与字幕状态'],
  ['NEXT_CHAT_HANDOFF.md', 'U38-B：播放器 Controller/Backend 分离完成'],
  ['NEXT_CHAT_HANDOFF.md', '当前任务：U38-C Subtitle loader 与字幕状态'],
  ['RUN_ME_FIRST.md', 'git pull --ff-only origin main'],
  ['RUN_ME_FIRST.md', 'npm run verify:stable'],
  ['RUN_ME_FIRST.md', '当前主线是 U38-C Subtitle loader 与字幕状态'],
  ['README.md', 'U38-B 已完成 Controller 与 Backend 分离'],
  ['README.md', '当前任务为 U38-C Subtitle loader 与字幕状态'],
  ['AI_HANDOFF/00_READ_THIS_FIRST.md', '当前阶段：U38-C Subtitle loader 与字幕状态'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '当前版本：0.169.0-beta.2'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', 'U38-A：完成'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', 'U38-B：完成'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '当前任务：U38-C Subtitle loader 与字幕状态'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', 'Release ID：355486824'],
  ['AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md', '用户只接收最终成果'],
  ['AI_HANDOFF/WORKLOG.md', '### U38-B — 播放器 Controller 与 Backend 边界'],
  ['AI_HANDOFF/WORKLOG.md', 'PR：#75'],
  ['PROJECT_STATE.md', '核心版本：0.169.0-beta.2'],
  ['PROJECT_STATE.md', 'U38-B：播放器 Controller/Backend 分离完成'],
  ['PROJECT_STATE.md', '当前任务：U38-C Subtitle loader 与字幕状态'],
  ['PROJECT_STATE.md', 'Release ID：`355486824`'],
  ['PROJECT_ROADMAP.md', '版本：0.169.0-beta.2'],
  ['PROJECT_ROADMAP.md', 'U38-B：播放器 Controller/Backend 分离完成'],
  ['PROJECT_ROADMAP.md', '当前任务：U38-C Subtitle loader 与字幕状态'],
  ['docs/NEXT_CHAT_HANDOFF.md', '当前主线：U38-C Subtitle loader 与字幕状态'],
  ['docs/RUN_ME_FIRST.md', '当前主线是 U38-C Subtitle loader 与字幕状态'],
  ['docs/PROJECT_STATE.md', '当前任务：U38-C Subtitle loader 与字幕状态'],
  ['docs/architecture/U38_PLAYER_SESSION_BOUNDARIES.md', '# U38-A 播放器会话边界'],
  ['docs/architecture/U38_PLAYER_BACKEND_BOUNDARY.md', '# U38-B 播放器 Controller 与 Backend 边界'],
  ['docs/architecture/U38_PLAYER_BACKEND_BOUNDARY.md', 'Controller 不得直接创建 `Audio`'],
  ['docs/architecture/REFACTOR_BACKLOG.md', 'PLY-001 Controller/Backend：U38-B 已完成'],
  ['docs/architecture/REFACTOR_BACKLOG.md', 'U38-C Subtitle loader'],
  ['docs/DESIGN.md', '暮夜琥珀'],
  ['docs/DESIGN.md', '雾光象牙'],
  ['docs/architecture/ARCHITECTURE_AUDIT.md', '结论：GO'],
  ['docs/architecture/U37_EXECUTION_PLAN.md', 'U37 状态：全部完成'],
  ['docs/U29_PLAYER_RELIABILITY_ACCEPTANCE.md', 'AUTOMATED GO'],
  ['docs/U30_UI_FAST_TRACK_ACCEPTANCE.md', 'AUTOMATED GO'],
  ['docs/U31_IMPORTER_TRANSACTION_ACCEPTANCE.md', 'AUTOMATED GO'],
  ['docs/U32_RELEASE_CANDIDATE_PACKAGING.md', 'AUTOMATED GO'],
  ['release/beta2-publication-state.json', '"status": "published"'],
  ['release/beta2-publication-state.json', '"releaseId": 355486824'],
  ['MVP130_EXPERIMENTAL_DO_NOT_MERGE.md', '824c914f844b1ac57391df8ebb5c1f30c8b40903145b3a66e6a13e95e5413efe'],
];

const activeHandoffFiles = [
  '00_NEW_CHAT_START_HERE.md',
  'NEW_CHAT_PROMPT.md',
  'NEW_CHAT_PROMPT_FULL.md',
  'NEXT_CHAT_HANDOFF.md',
  'RUN_ME_FIRST.md',
  'README.md',
  'AI_HANDOFF/00_READ_THIS_FIRST.md',
  'AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md',
  'AI_HANDOFF/WORKLOG.md',
  'PROJECT_STATE.md',
  'PROJECT_ROADMAP.md',
  'docs/NEXT_CHAT_HANDOFF.md',
  'docs/RUN_ME_FIRST.md',
  'docs/PROJECT_STATE.md',
];

const forbiddenActiveTokens = [
  '核心版本：0.167.0-mvp129',
  '当前主线：U28',
  '当前任务：U28',
  '当前主线：U33 Beta 发布',
  '当前任务：发布 0.169.0 Beta 2 个人日用版',
  'Beta 2：个人日用版发布候选',
  '当前主线：长期日用维护与 Issue #66 技术债治理',
  '当前任务：长期日用维护与 Issue #66 技术债治理',
  '当前主线：U38-B 播放器 Controller 与 Backend 边界',
  '当前路线是 U38-B 播放器 Controller 与 Backend 边界',
  '当前阶段：U38-B 播放器 Controller 与 Backend 边界',
  '当前主线是 U38-B 播放器 Controller 与 Backend 边界',
  '当前任务：U38-B 播放器 Controller 与 Backend 边界',
];

const failures = [];
for (const file of required) if (!fs.existsSync(file)) failures.push(`missing ${file}`);
for (const [file, token] of tokens) {
  if (!fs.existsSync(file) || !fs.readFileSync(file, 'utf8').includes(token)) {
    failures.push(`${file} missing token ${token}`);
  }
}
for (const file of activeHandoffFiles) {
  if (!fs.existsSync(file)) continue;
  const source = fs.readFileSync(file, 'utf8');
  for (const token of forbiddenActiveTokens) {
    if (source.includes(token)) failures.push(`${file} retains stale handoff token ${token}`);
  }
}
for (const temporary of [
  '.github/workflows/beta2-version-sync.yml',
  '.github/workflows/beta2-release-prep.yml',
  '.github/workflows/beta2-concurrency-sync.yml',
  '.github/workflows/beta2-publication-capture.yml',
  '.github/workflows/player-session-boundary-sync.yml',
  '.github/workflows/u38a-branch-orchestrator.yml',
  'scripts/apply-u38a-refactor.py',
  'docs/U38A_TRIGGER.md',
]) {
  if (fs.existsSync(temporary)) failures.push(`temporary workflow or refactor file remains: ${temporary}`);
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('[verify-handoff] U38-B complete and U38-C handoff PASS');
