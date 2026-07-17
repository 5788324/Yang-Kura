#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const plan = JSON.parse(read('release/u33-release-plan.json'));
const publication = JSON.parse(read('release/beta2-publication-state.json'));
const notes = read(plan.releaseNotesPath);
const readme = read('README.md');
const state = read('PROJECT_STATE.md');
const roadmap = read('PROJECT_ROADMAP.md');
const handoff = read('AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md');
const preflightWorkflow = read('.github/workflows/u33-release-preflight.yml');
const releaseWorkflow = read('.github/workflows/u33-beta-release.yml');
const failures = [];

const requireMarkers = (label, source, markers) => {
  for (const marker of markers) if (!source.includes(marker)) failures.push(`${label} missing: ${marker}`);
};

const version = '0.169.0-beta.2';
const tag = `v${version}`;
const title = 'Yang-Kura 0.169.0 Beta 2 · 个人日用版';
const target = '14bc78a81c827882efc232c6c6c12f0d8ed04542';

assert.equal(pkg.version, version);
assert.equal(lock.version, version);
assert.equal(lock.packages?.['']?.version, version);
assert.equal(pkg.u33BetaRelease, `${version} / ${tag} / ${title}`);
assert.equal(plan.version, version);
assert.equal(plan.previousVersion, '0.168.0-beta.1');
assert.equal(plan.tag, tag);
assert.equal(plan.title, title);
assert.equal(plan.prerelease, true);
assert.equal(plan.draft, false);
assert.equal(plan.releaseNotesPath, 'docs/RELEASE_NOTES_0.169.0-beta.2.md');
assert.deepEqual(plan.assets, [
  `Yang Kura-${version}-portable-x64.exe`,
  `Yang Kura-${version}-setup-x64.exe`,
  'SHA256SUMS.txt',
]);

assert.equal(publication.schemaVersion, 1);
assert.equal(publication.status, 'published');
assert.equal(publication.version, version);
assert.equal(publication.tag, tag);
assert.equal(publication.title, title);
assert.equal(publication.releaseId, 355486824);
assert.equal(publication.targetCommitish, target);
assert.equal(publication.publishedAt, '2026-07-17T05:21:02Z');
assert.equal(publication.prerelease, true);
assert.equal(publication.draft, false);
assert.equal(publication.assets?.length, 3);
for (const asset of publication.assets) {
  assert.ok(asset.publishedName);
  assert.ok(asset.sizeBytes > 0);
  assert.match(asset.sha256, /^[a-f0-9]{64}$/);
  assert.ok(asset.downloadUrl);
}

requireMarkers('Release Notes', notes, [
  `# ${title}`, 'Windows x64', '正式媒体库界面', '自动验收', '已知限制',
  '未进行商业代码签名', '不包含自动更新',
]);
requireMarkers('README', readme, [
  '> 当前版本：`0.169.0-beta.2`', 'Beta 2 个人日用版',
  'Release ID：`355486824`', 'release/beta2-publication-state.json',
  'U38-A 已完成 Queue、History 与 Persistence 分离',
  'U38-B 已完成 Controller 与 Backend 分离',
]);
requireMarkers('PROJECT_STATE', state, [
  'Beta 2：个人日用版已发布并完成远端资产回读',
  'U38-A：播放器 Queue/History/Persistence 分离完成',
  'U38-B：播放器 Controller/Backend 分离完成',
  '当前任务：U38-C Subtitle loader 与字幕状态',
]);
requireMarkers('PROJECT_ROADMAP', roadmap, [
  'Beta 2：个人日用版已发布并完成远端资产校验',
  '### Beta 2 个人日用版发布 — 已完成',
  'U38-A：播放器 Queue/History/Persistence 分离完成',
  'U38-B：播放器 Controller/Backend 分离完成',
]);
requireMarkers('CURRENT_PROJECT_HANDOFF', handoff, [
  'Beta 2：个人日用版已发布并完成远端资产校验',
  'Release ID：355486824',
  'U38-A：完成',
  'U38-B：完成',
  '当前任务：U38-C Subtitle loader 与字幕状态',
]);

requireMarkers('publication record audit workflow', preflightWorkflow, [
  'name: Beta 2 Publication Record Audit',
  'workflow_dispatch:',
  'permissions:\n  contents: read',
  "U33_ALLOW_EXISTING_TARGET: '1'",
  'node scripts/verify-u33-release-preflight.mjs',
]);
if (preflightWorkflow.includes('contents: write') || preflightWorkflow.includes('pull_request:') || preflightWorkflow.includes('push:')) {
  failures.push('publication record audit must be manual and read-only');
}

requireMarkers('published release audit workflow', releaseWorkflow, [
  'name: Beta 2 Published Release Audit',
  'workflow_dispatch:',
  'permissions:\n  contents: read',
  'gh release download v0.169.0-beta.2',
  'node scripts/verify-u33-published-release.mjs',
  '--remote-only',
]);
if (releaseWorkflow.includes('contents: write') || releaseWorkflow.includes('gh release create') || releaseWorkflow.includes('pull_request:') || releaseWorkflow.includes('push:')) {
  failures.push('published release audit must be manual, read-only and non-publishing');
}

for (const temporary of [
  '.github/workflows/beta2-version-sync.yml',
  '.github/workflows/beta2-release-prep.yml',
  '.github/workflows/beta2-concurrency-sync.yml',
  '.github/workflows/beta2-publication-capture.yml',
]) if (fs.existsSync(temporary)) failures.push(`temporary Beta 2 workflow remains: ${temporary}`);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('Personal Beta 2 published release capability verifier PASS');
