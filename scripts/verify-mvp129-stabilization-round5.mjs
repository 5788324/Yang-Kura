import fs from 'node:fs';
import path from 'node:path';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const failures = [];
const forbiddenDependencies = ['@google/genai', 'dotenv', 'express', 'motion', '@types/express', 'autoprefixer', 'esbuild'];
for (const name of forbiddenDependencies) {
  if (pkg.dependencies?.[name] || pkg.devDependencies?.[name]) failures.push(`unused dependency still present: ${name}`);
}
if (pkg.dependencies?.vite) failures.push('vite must not be duplicated in dependencies');
if (pkg.scripts?.['verify:all'] !== 'npm run verify:stable') failures.push('verify:all must alias verify:stable');
if (pkg.scripts?.clean !== 'node scripts/clean-build-output.mjs') failures.push('clean must be cross-platform');
if (fs.readFileSync('scripts/desktop-smoke-check.mjs', 'utf8').includes('verify:all 为历史快照链')) failures.push('desktop smoke contains stale verify:all guidance');
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

const projectState = fs.readFileSync('PROJECT_STATE.md', 'utf8');
const readme = fs.readFileSync('README.md', 'utf8');
const roadmap = fs.readFileSync('PROJECT_ROADMAP.md', 'utf8');
const u32Evidence = fs.readFileSync('docs/U32_RELEASE_CANDIDATE_PACKAGING.md', 'utf8');
if (!projectState.includes('0.167.0-mvp129')) failures.push('PROJECT_STATE.md does not retain the MVP129 historical baseline anchor');
if (!u32Evidence.includes('核心版本：0.167.0-mvp129')) failures.push('U32 evidence does not retain the MVP129 release-candidate baseline');
if (!readme.includes('0.169.0-beta.2') || !readme.includes('U37 媒体库正式页面完成') || !readme.includes('个人日用版')) failures.push('README.md does not identify the Beta 2 personal-use release route');
if (!roadmap.includes('Beta 1：已发布并完成远端资产校验') || !roadmap.includes('U37-D：完成') || !roadmap.includes('当前任务：发布 0.169.0 Beta 2 个人日用版')) failures.push('PROJECT_ROADMAP.md does not preserve Beta 1 history and the current Beta 2 release route');

for (const file of ['NEXT_CHAT_HANDOFF.md', '00_NEW_CHAT_START_HERE.md']) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes('0.169.0-beta.2')) failures.push(`${file} does not identify the current Beta 2 version`);
  if (source.includes('核心版本：0.167.0-mvp129')) failures.push(`${file} still presents MVP129 as the current version`);
}
const runFirst = fs.readFileSync('RUN_ME_FIRST.md', 'utf8');
const hasDynamicVersionContract = runFirst.includes('package.json 版本与 PROJECT_STATE.md 当前核心版本一致')
  || runFirst.includes('`package.json` 版本与 `PROJECT_STATE.md` 当前核心版本一致');
if (!hasDynamicVersionContract) failures.push('RUN_ME_FIRST.md does not use the dynamic project-state version contract');
if (runFirst.includes('核心版本：0.167.0-mvp129')) failures.push('RUN_ME_FIRST.md still presents MVP129 as the current version');
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`MVP129 stabilization round5 verifier PASS (archived ${archiveCount} legacy files)`);
