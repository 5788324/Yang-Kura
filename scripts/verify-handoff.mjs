import fs from 'node:fs';

const required = [
  'README.md',
  'PROJECT_STATE.md',
  'PROJECT_ROADMAP.md',
  'MVP130_EXPERIMENTAL_DO_NOT_MERGE.md',
  'AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md',
  'AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md',
  'AI_HANDOFF/WORKLOG.md',
  'docs/DESIGN.md',
  'docs/architecture/ARCHITECTURE_AUDIT.md',
  'docs/architecture/DEPENDENCY_MAP.md',
  'docs/architecture/REFACTOR_BACKLOG.md',
  'docs/architecture/U38_PLAYER_SESSION_BOUNDARIES.md',
  'docs/architecture/U38_PLAYER_BACKEND_BOUNDARY.md',
  'docs/architecture/U38_PLAYER_SUBTITLE_BOUNDARY.md',
  'docs/architecture/U39_PLAYERBAR_THEME.md',
  'docs/architecture/U39_MAINTENANCE_ENTRY.md',
  'docs/U29_PLAYER_RELIABILITY_ACCEPTANCE.md',
  'docs/U30_UI_FAST_TRACK_ACCEPTANCE.md',
  'docs/U31_IMPORTER_TRANSACTION_ACCEPTANCE.md',
  'docs/U32_RELEASE_CANDIDATE_PACKAGING.md',
  'docs/RELEASE_NOTES_0.169.0-beta.2.md',
  'release/beta2-publication-state.json',
  'scripts/verify-u38a-player-session-boundaries.mjs',
  'scripts/verify-u38b-player-backend-boundary.mjs',
  'scripts/verify-u38c-player-subtitles.mjs',
  'scripts/verify-u39a-playerbar-theme.mjs',
  'scripts/verify-u39b-maintenance-entry.mjs',
  '.github/workflows/player-fast-validation.yml',
  '.github/workflows/ui-fast-validation.yml',
  'archive/legacy-mvp-history/README.md',
];

const tokens = [
  ['README.md', 'U38-C：`usePlayerSubtitles.ts`'],
  ['README.md', 'U39-A 播放器底栏主题一致性'],
  ['README.md', 'U39-B 设置与 AI 维护入口'],
  ['README.md', 'UI Fast Validation'],
  ['PROJECT_STATE.md', '核心版本：0.169.0-beta.2'],
  ['PROJECT_STATE.md', 'U38-A～U38-C：播放器结构治理完成'],
  ['PROJECT_STATE.md', 'U39-A：播放器底栏语义主题一致性完成'],
  ['PROJECT_STATE.md', 'U39-B：设置与 AI 维护入口边界完成'],
  ['PROJECT_STATE.md', '当前任务：日常体验与真实 Bug 优先'],
  ['PROJECT_STATE.md', 'Release ID：`355486824`'],
  ['PROJECT_ROADMAP.md', 'U39-B：设置与 AI 维护入口边界完成'],
  ['PROJECT_ROADMAP.md', '当前任务：真实 Bug、字幕体验与日常 UI 优先'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '当前版本：0.169.0-beta.2'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', 'U39-B：设置与 AI 维护入口边界完成'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', 'UI Fast Validation'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', 'Release ID：355486824'],
  ['AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md', '用户只接收最终成果'],
  ['AI_HANDOFF/WORKLOG.md', '### U38-C — 播放器字幕加载与状态边界'],
  ['AI_HANDOFF/WORKLOG.md', '### U39-A — 播放器底栏语义主题一致性'],
  ['AI_HANDOFF/WORKLOG.md', '### U39-B — 设置与 AI 维护入口边界'],
  ['docs/architecture/U38_PLAYER_SESSION_BOUNDARIES.md', '# U38-A 播放器会话边界'],
  ['docs/architecture/U38_PLAYER_BACKEND_BOUNDARY.md', '# U38-B 播放器 Controller 与 Backend 边界'],
  ['docs/architecture/U38_PLAYER_SUBTITLE_BOUNDARY.md', '# U38-C 播放器字幕加载与状态边界'],
  ['docs/architecture/U38_PLAYER_SUBTITLE_BOUNDARY.md', '过期结果丢弃'],
  ['docs/architecture/U39_PLAYERBAR_THEME.md', '# U39-A 播放器底栏语义主题一致性'],
  ['docs/architecture/U39_MAINTENANCE_ENTRY.md', '# U39-B 设置与 AI 维护入口边界'],
  ['docs/architecture/U39_MAINTENANCE_ENTRY.md', '完整历史诊断按需加载'],
  ['docs/DESIGN.md', '暮夜琥珀'],
  ['docs/DESIGN.md', '雾光象牙'],
  ['docs/architecture/ARCHITECTURE_AUDIT.md', '结论：GO'],
  ['docs/U29_PLAYER_RELIABILITY_ACCEPTANCE.md', 'AUTOMATED GO'],
  ['docs/U30_UI_FAST_TRACK_ACCEPTANCE.md', 'AUTOMATED GO'],
  ['docs/U31_IMPORTER_TRANSACTION_ACCEPTANCE.md', 'AUTOMATED GO'],
  ['docs/U32_RELEASE_CANDIDATE_PACKAGING.md', 'AUTOMATED GO'],
  ['release/beta2-publication-state.json', '"status": "published"'],
  ['release/beta2-publication-state.json', '"releaseId": 355486824'],
  ['MVP130_EXPERIMENTAL_DO_NOT_MERGE.md', '824c914f844b1ac57391df8ebb5c1f30c8b40903145b3a66e6a13e95e5413efe'],
];

const activeHandoffFiles = [
  'README.md',
  'PROJECT_STATE.md',
  'PROJECT_ROADMAP.md',
  'AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md',
  'AI_HANDOFF/WORKLOG.md',
];

const forbiddenActiveTokens = [
  '核心版本：0.167.0-mvp129',
  '当前主线：U28',
  '当前任务：U28',
  '当前主线：U33 Beta 发布',
  '当前任务：发布 0.169.0 Beta 2 个人日用版',
  'Beta 2：个人日用版发布候选',
  '当前主线：U38-B 播放器 Controller 与 Backend 边界',
  '当前任务：U38-B 播放器 Controller 与 Backend 边界',
  '当前主线：U38-C Subtitle loader 与字幕状态',
  '当前任务：U38-C Subtitle loader 与字幕状态',
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
console.log('[verify-handoff] U39-B maintenance entry handoff PASS');
