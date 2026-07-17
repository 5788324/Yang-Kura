#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
const plan = JSON.parse(fs.readFileSync('release/u33-release-plan.json', 'utf8'));
const readme = fs.readFileSync('README.md', 'utf8');
const notes = fs.readFileSync(plan.releaseNotesPath, 'utf8');
const normalizeLines = (text) => text.replace(/\r\n/g, '\n');
const preflightWorkflow = normalizeLines(fs.readFileSync('.github/workflows/u33-release-preflight.yml', 'utf8'));
const releaseWorkflow = normalizeLines(fs.readFileSync('.github/workflows/u33-beta-release.yml', 'utf8'));
const preflightVerifier = fs.readFileSync('scripts/verify-u33-release-preflight.mjs', 'utf8');
const publishedVerifier = fs.readFileSync('scripts/verify-u33-published-release.mjs', 'utf8');
const state = fs.readFileSync('PROJECT_STATE.md', 'utf8');
const roadmap = fs.readFileSync('PROJECT_ROADMAP.md', 'utf8');
const handoff = fs.readFileSync('AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', 'utf8');
const failures = [];

const requireMarkers = (label, text, markers) => {
  for (const marker of markers) if (!text.includes(marker)) failures.push(`${label} missing: ${marker}`);
};

const targetVersion = '0.169.0-beta.2';
const targetTag = `v${targetVersion}`;
const targetTitle = 'Yang-Kura 0.169.0 Beta 2 · 个人日用版';

if (pkg.version !== targetVersion) failures.push(`package.json version mismatch: ${pkg.version}`);
if (lock.version !== targetVersion) failures.push(`package-lock top version mismatch: ${lock.version}`);
if (lock.packages?.['']?.version !== targetVersion) failures.push(`package-lock root package version mismatch: ${lock.packages?.['']?.version}`);
if (pkg.u33BetaRelease !== `${targetVersion} / ${targetTag} / ${targetTitle}`) failures.push('package release marker mismatch');

assert.deepEqual(plan, {
  schemaVersion: 1,
  channel: 'beta',
  previousVersion: '0.168.0-beta.1',
  version: targetVersion,
  tag: targetTag,
  title: targetTitle,
  prerelease: true,
  draft: false,
  targetPlatform: 'Windows x64',
  releaseNotesPath: 'docs/RELEASE_NOTES_0.169.0-beta.2.md',
  assets: [
    `Yang Kura-${targetVersion}-portable-x64.exe`,
    `Yang Kura-${targetVersion}-setup-x64.exe`,
    'SHA256SUMS.txt',
  ],
  frozenUntilPublished: [
    'MVP130 downloader',
    'SQLite full migration',
    'OpenList/WebDAV',
    'Player Core v2',
    'full AI Agent',
    'Arsm_Transcribe integration',
    'cloud sync and plugin marketplace',
    'global architecture rewrite',
  ],
});

requireMarkers('README', readme, [
  '> 当前版本：`0.169.0-beta.2`',
  'Beta 1 已发布',
  '个人日用版发布候选',
  'Issue #65',
  '正式下载器 / MVP130',
]);
requireMarkers('Release Notes', notes, [
  `# ${targetTitle}`,
  'Windows x64',
  '正式媒体库界面',
  'RJ 详情与元数据',
  '播放与媒体可靠性',
  '导入、索引与数据安全',
  '自动验收',
  '已知限制',
  '未进行商业代码签名',
  '不包含自动更新',
  'SHA256SUMS.txt',
]);
for (const forbidden of [
  '真实 mpv、声卡和厂商驱动组合已全部验证',
  '商业发布版',
  '自动更新已完成',
]) if (notes.includes(forbidden)) failures.push(`Release Notes overclaim: ${forbidden}`);

requireMarkers('preflight workflow', preflightWorkflow, [
  'name: Personal Beta Release Preflight',
  'permissions:\n  contents: read',
  'gh api --paginate --slurp',
  'node scripts/verify-u33-release-preflight.mjs',
  'personal-beta-release-preflight',
]);
if (preflightWorkflow.includes('contents: write')) failures.push('preflight workflow must not have contents: write');

requireMarkers('release workflow', releaseWorkflow, [
  'name: Personal Beta Release',
  'pull_request:',
  'push:',
  "github.event_name == 'push' && github.ref == 'refs/heads/main'",
  'permissions:\n  contents: read',
  'Build and validate personal Beta assets',
  'Publish GitHub prerelease after main merge',
  'permissions:\n      contents: write',
  'electron-builder/cli.js --win portable nsis --config electron-builder.config.cjs --publish never',
  'node scripts/test-u32-release-candidate-packaging.mjs',
  'node scripts/test-u32-packaged-page-readiness.mjs',
  'sha256sum -c SHA256SUMS.txt',
  'gh release create "$RELEASE_TAG"',
  '--target "$GITHUB_SHA"',
  '--notes-file "$RELEASE_NOTES"',
  '--prerelease',
  'node scripts/verify-u33-published-release.mjs',
  'personal-beta-published-release-${{ github.sha }}',
]);
const topLevelWriteIndex = releaseWorkflow.indexOf('permissions:\n  contents: write');
if (topLevelWriteIndex >= 0) failures.push('release workflow top-level permissions must remain read-only');
const publishConditionIndex = releaseWorkflow.indexOf("github.event_name == 'push' && github.ref == 'refs/heads/main'");
const publishWriteIndex = releaseWorkflow.indexOf('permissions:\n      contents: write');
if (!(publishConditionIndex >= 0 && publishWriteIndex > publishConditionIndex)) failures.push('contents: write must remain inside main-only publish job');

requireMarkers('preflight verifier', preflightVerifier, [
  'target tag already exists',
  'target release already exists',
  'preflight-report.json',
  'package-lock root version mismatch',
]);
requireMarkers('published verifier', publishedVerifier, [
  'published release tag mismatch',
  'published release target commit mismatch',
  'published release asset names mismatch',
  'release asset size mismatch',
  'local SHA-256 mismatch',
  'published-release-report.json',
]);

for (const [label, text, markers] of [
  ['PROJECT_STATE', state, [
    '核心版本：0.169.0-beta.2',
    'Beta 1：已发布并完成远端资产回读',
    'U37-D：音乐库与详情 UI 完成',
    '当前任务：发布 0.169.0 Beta 2 个人日用版',
    'MVP130',
  ]],
  ['PROJECT_ROADMAP', roadmap, [
    '版本：0.169.0-beta.2',
    'Beta 1：已发布并完成远端资产校验',
    'U37-D：完成',
    '当前任务：发布 0.169.0 Beta 2 个人日用版',
    'MVP130',
  ]],
  ['CURRENT_PROJECT_HANDOFF', handoff, [
    '当前版本：0.169.0-beta.2',
    'Beta 1：已发布并完成远端资产校验',
    'U37-D：完成',
    '当前任务：发布 0.169.0 Beta 2 个人日用版',
    '用户只接收最终成果',
  ]],
]) requireMarkers(label, text, markers);

for (const temporary of ['.github/workflows/beta2-version-sync.yml', '.github/workflows/beta2-release-prep.yml']) {
  if (fs.existsSync(temporary)) failures.push(`temporary Beta 2 preparation workflow remains: ${temporary}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('Personal Beta 2 release capability verifier PASS');
