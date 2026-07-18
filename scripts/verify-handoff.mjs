#!/usr/bin/env node
import fs from 'node:fs';

const required = [
  'README.md',
  'PROJECT_STATE.md',
  'PROJECT_ROADMAP.md',
  'AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md',
  'AI_HANDOFF/WORKLOG.md',
  'docs/GIT_FAST_LANE_V2.md',
  'docs/CODEX_BETA3_RELEASE_ACCEPTANCE.md',
  'docs/RELEASE_NOTES_0.170.0-beta.3.md',
  'release/beta3-release-plan.json',
  'release/beta2-publication-state.json',
  '.github/workflows/beta3-personal-release.yml',
];

const tokens = [
  ['README.md', '当前阶段：Beta 3 正式日用发布收口'],
  ['README.md', 'Git Fast Lane v2'],
  ['PROJECT_STATE.md', '当前任务：Beta 3 正式日用发布收口'],
  ['PROJECT_STATE.md', 'Git Fast Lane v2：项目级默认规则已生效'],
  ['PROJECT_ROADMAP.md', '0.170.0-beta.3'],
  ['PROJECT_ROADMAP.md', 'Beta 3 正式日用发布收口'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', 'Git Fast Lane v2：已生效'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '当前任务：Beta 3 正式日用发布收口'],
  ['AI_HANDOFF/WORKLOG.md', '### Git Fast Lane v2'],
  ['AI_HANDOFF/WORKLOG.md', '### Beta 3 正式日用发布收口 — 进行中'],
  ['docs/GIT_FAST_LANE_V2.md', '一个任务只使用一个分支、一个 PR'],
  ['docs/CODEX_BETA3_RELEASE_ACCEPTANCE.md', 'D:\\CloudMusic\\VipSongsDownload'],
  ['docs/CODEX_BETA3_RELEASE_ACCEPTANCE.md', '%TEMP%\\YangKura-Beta3-Acceptance'],
  ['docs/RELEASE_NOTES_0.170.0-beta.3.md', '# Yang-Kura 0.170.0 Beta 3 · 正式日用候选'],
  ['release/beta3-release-plan.json', '"version": "0.170.0-beta.3"'],
  ['release/beta2-publication-state.json', '"releaseId": 355486824'],
  ['.github/workflows/beta3-personal-release.yml', 'name: Personal Beta 3 Release'],
];

const staleTokens = [
  '当前任务：按需日常维护',
  '当前任务：综合收尾与剩余问题重新核对',
  '当前任务：发布 0.169.0 Beta 2 个人日用版',
];
const activeDocs = required.slice(0, 5);
const forbiddenTemporaryFiles = [
  '.github/workflows/u39g-closeout-sync.yml',
  '.github/workflows/u40d3-persist-fix.yml',
  '.github/workflows/apply-u40d3-html-audio-fix.yml',
  'scripts/apply-u39g-closeout.mjs',
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
for (const file of forbiddenTemporaryFiles) {
  if (fs.existsSync(file)) failures.push(`temporary file remains: ${file}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('[verify-handoff] Beta 3 and Git Fast Lane v2 handoff PASS');
