import fs from 'node:fs';
import path from 'node:path';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const failures = [];
const read = (file) => fs.readFileSync(file, 'utf8');

if (pkg.scripts?.['verify:all'] !== 'npm run verify:stable') failures.push('verify:all alias changed');
if (pkg.scripts?.clean !== 'node scripts/clean-build-output.mjs') failures.push('clean command changed');

const archiveRoot = path.join('archive', 'legacy-mvp-history');
const archiveCount = fs.existsSync(archiveRoot)
  ? fs.readdirSync(path.join(archiveRoot, 'root')).length + fs.readdirSync(path.join(archiveRoot, 'docs')).length + fs.readdirSync(path.join(archiveRoot, 'scripts')).length
  : 0;
if (archiveCount < 300) failures.push(`legacy archive unexpectedly small: ${archiveCount}`);

const state = read('PROJECT_STATE.md');
const readme = read('README.md');
const roadmap = read('PROJECT_ROADMAP.md');
const runFirst = read('RUN_ME_FIRST.md');
const publication = JSON.parse(read('release/beta2-publication-state.json'));

if (!state.includes('0.167.0-mvp129')) failures.push('historical anchor missing');
if (!readme.includes('0.169.0-beta.2') || !readme.includes('Beta 2 个人日用版')) failures.push('Beta 2 README state missing');
if (!roadmap.includes('U38-B：播放器 Controller/Backend 分离完成') || !roadmap.includes('当前任务：U38-C Subtitle loader 与字幕状态')) failures.push('current U38 route missing');
if (publication.status !== 'published' || publication.releaseId !== 355486824) failures.push('publication record incomplete');
if (!runFirst.includes('`package.json` 版本与 `PROJECT_STATE.md` 当前核心版本一致')) failures.push('dynamic version contract missing');
if (!runFirst.includes('U38-A Queue/History/Persistence 与 U38-B Controller/Backend 分离已完成')) failures.push('U38 completion state missing');
if (!runFirst.includes('当前主线是 U38-C Subtitle loader 与字幕状态')) failures.push('U38-C route missing');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`MVP129 stabilization round5 verifier PASS (archived ${archiveCount} legacy files)`);
