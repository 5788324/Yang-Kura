import fs from 'node:fs';
import path from 'node:path';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const failures = [];

if (pkg.scripts?.['verify:all'] !== 'npm run verify:stable') failures.push('verify:all must alias verify:stable');
if (pkg.scripts?.clean !== 'node scripts/clean-build-output.mjs') failures.push('clean must be cross-platform');
for (const key of Object.keys(pkg.scripts ?? {})) {
  const match = /^verify:mvp(\d+)/.exec(key);
  if (match && Number(match[1]) <= 111) failures.push(`legacy package script remains active: ${key}`);
}
for (const name of fs.readdirSync('.')) {
  if (/^(HANDOFF_MVP|PACKAGE_MANIFEST_MVP|CODEX_MVP)/.test(name)) failures.push(`historical file remains at root: ${name}`);
}
for (const name of fs.readdirSync('scripts')) {
  const match = /^verify-mvp(\d+)/.exec(name);
  if (match && Number(match[1]) <= 111) failures.push(`legacy verifier remains active: ${name}`);
}

const archiveRoot = path.join('archive', 'legacy-mvp-history');
if (!fs.existsSync(archiveRoot)) failures.push('legacy archive missing');
const archiveCount = fs.existsSync(archiveRoot)
  ? fs.readdirSync(path.join(archiveRoot, 'root')).length + fs.readdirSync(path.join(archiveRoot, 'docs')).length + fs.readdirSync(path.join(archiveRoot, 'scripts')).length
  : 0;
if (archiveCount < 300) failures.push(`legacy archive unexpectedly small: ${archiveCount}`);

const state = fs.readFileSync('PROJECT_STATE.md', 'utf8');
const readme = fs.readFileSync('README.md', 'utf8');
const roadmap = fs.readFileSync('PROJECT_ROADMAP.md', 'utf8');
const publication = JSON.parse(fs.readFileSync('release/beta2-publication-state.json', 'utf8'));
const u32Evidence = fs.readFileSync('docs/U32_RELEASE_CANDIDATE_PACKAGING.md', 'utf8');
if (!state.includes('0.167.0-mvp129')) failures.push('PROJECT_STATE.md does not retain the MVP129 historical anchor');
if (!u32Evidence.includes('核心版本：0.167.0-mvp129')) failures.push('U32 evidence does not retain the MVP129 baseline');
if (!readme.includes('0.169.0-beta.2') || !readme.includes('Beta 2 个人日用版已发布')) failures.push('README.md does not identify the published Beta 2 release');
if (!roadmap.includes('U38-A：播放器 Queue/History/Persistence 分离完成') || !roadmap.includes('当前任务：U38-B 播放器 Controller 与 Backend 边界')) failures.push('PROJECT_ROADMAP.md does not identify the current U38 route');
if (publication.status !== 'published' || publication.releaseId !== 355486824) failures.push('Beta 2 publication state is incomplete');

for (const file of ['NEXT_CHAT_HANDOFF.md', '00_NEW_CHAT_START_HERE.md']) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes('0.169.0-beta.2')) failures.push(`${file} does not identify the current version`);
  if (!source.includes('U38-A') || !source.includes('U38-B')) failures.push(`${file} does not identify the current player maintenance route`);
}
const runFirst = fs.readFileSync('RUN_ME_FIRST.md', 'utf8');
if (!runFirst.includes('`package.json` 版本与 `PROJECT_STATE.md` 当前核心版本一致')) failures.push('RUN_ME_FIRST.md does not use the dynamic version contract');
if (!runFirst.includes('U38-A 播放器 Queue/History/Persistence 分离已完成')) failures.push('RUN_ME_FIRST.md does not identify U38-A completion');
if (!runFirst.includes('当前主线是 U38-B 播放器 Controller 与 Backend 边界')) failures.push('RUN_ME_FIRST.md does not identify the U38-B route');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`MVP129 stabilization round5 verifier PASS (archived ${archiveCount} legacy files)`);
