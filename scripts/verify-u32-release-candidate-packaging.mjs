#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const pkg = JSON.parse(read('package.json'));
const publication = JSON.parse(read('release/beta2-publication-state.json'));
const builder = read('electron-builder.config.cjs');
const workflow = read('.github/workflows/u32-release-candidate.yml');
const runtime = read('scripts/test-u32-release-candidate-packaging.mjs');
const readiness = read('scripts/test-u32-packaged-page-readiness.mjs');
const state = read('PROJECT_STATE.md');
const roadmap = read('PROJECT_ROADMAP.md');
const evidence = read('docs/U32_RELEASE_CANDIDATE_PACKAGING.md');
const failures = [];

const requireMarkers = (label, source, markers) => {
  for (const marker of markers) if (!source.includes(marker)) failures.push(`${label} missing: ${marker}`);
};

assert.equal(pkg.version, '0.169.0-beta.2');
assert.equal(publication.status, 'published');
assert.equal(publication.tag, 'v0.169.0-beta.2');
assert.equal(publication.releaseId, 355486824);
assert.equal(publication.assets?.length, 3);

requireMarkers('electron-builder', builder, [
  "target: 'portable'", "target: 'nsis'", 'asar: true', 'oneClick: false',
  'perMachine: false', 'deleteAppDataOnUninstall: false',
]);
requireMarkers('U32 workflow', workflow, [
  'name: U32 Release Candidate Packaging', 'runs-on: windows-latest', 'contents: read',
  'npm audit --audit-level=high', 'npm rebuild electron', 'npm run patch:electron-builder',
  'node scripts/test-u32-release-candidate-packaging.mjs',
  'node scripts/test-u32-packaged-page-readiness.mjs',
]);
requireMarkers('packaged acceptance', runtime, [
  'portable-chinese-space-path', 'nsis-first-install', 'nsis-repeat-install-upgrade',
  '中文 空格 portable', '中文 空格 安装目录', 'u32-user-data-preservation.json',
  'deleteAppDataOnUninstall=false', 'fallbackAvailable', 'SHA256SUMS.txt', 'app.asar',
]);
requireMarkers('packaged page readiness', readiness, [
  'portable-complete-home', 'nsis-complete-home', '正在打开页面', 'data-u37b-home',
  '尚未选择资源库', '继续播放', '常用入口', 'page-readiness-report.json',
]);
requireMarkers('PROJECT_STATE', state, [
  '核心版本：0.169.0-beta.2',
  'Beta 2：个人日用版已发布并完成远端资产回读',
  'U37-D：音乐库与详情 UI 完成',
  'U38-A：播放器 Queue/History/Persistence 分离完成',
  '当前任务：U38-B 播放器 Controller 与 Backend 边界',
  'MVP130', '用户不承担测试',
]);
requireMarkers('PROJECT_ROADMAP', roadmap, [
  'portable、NSIS、安装、卸载和用户数据保留',
  'U37-D：完成',
  'U38-A：播放器 Queue/History/Persistence 分离完成',
  '### Beta 2 个人日用版发布 — 已完成',
  '当前任务：U38-B 播放器 Controller 与 Backend 边界',
  'MVP130',
]);
requireMarkers('U32 historical evidence', evidence, [
  '# U32 Windows 发布候选打包与系统集成验收', '结论：AUTOMATED GO',
  '核心版本：0.167.0-mvp129（U32 不改版本号）',
  'Branch Validation：29388203409 — PASS',
  'U32 Release Candidate Packaging：29388203405 — PASS',
  'HTMLAudio fallback', '静默卸载', 'SHA256SUMS.txt',
  'U32 可以关闭，项目下一任务为 U33',
]);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('U32 packaging capability and published Beta 2 evidence PASS');
