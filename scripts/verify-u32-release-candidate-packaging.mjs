#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const builder = fs.readFileSync('electron-builder.config.cjs', 'utf8');
const workflow = fs.readFileSync('.github/workflows/u32-release-candidate.yml', 'utf8');
const runtime = fs.readFileSync('scripts/test-u32-release-candidate-packaging.mjs', 'utf8');
const readiness = fs.readFileSync('scripts/test-u32-packaged-page-readiness.mjs', 'utf8');
const state = fs.readFileSync('PROJECT_STATE.md', 'utf8');
const roadmap = fs.readFileSync('PROJECT_ROADMAP.md', 'utf8');
const evidence = fs.readFileSync('docs/U32_RELEASE_CANDIDATE_PACKAGING.md', 'utf8');

const failures = [];
const requireMarkers = (label, text, markers) => {
  for (const marker of markers) {
    if (!text.includes(marker)) failures.push(`${label} missing: ${marker}`);
  }
};

if (pkg.version !== '0.168.0-beta.1') failures.push(`current package version must remain Beta 1 until Beta 2 implementation starts: ${pkg.version}`);

requireMarkers('electron-builder', builder, [
  "target: 'portable'",
  "target: 'nsis'",
  'asar: true',
  'oneClick: false',
  'perMachine: false',
  'allowToChangeInstallationDirectory: true',
  'deleteAppDataOnUninstall: false',
  "output: 'release'",
]);

requireMarkers('U32 workflow', workflow, [
  'name: U32 Release Candidate Packaging',
  'runs-on: windows-latest',
  'contents: read',
  'npm ci --ignore-scripts --no-audit --no-fund',
  'npm audit --audit-level=high',
  'npm rebuild electron',
  'npm run patch:electron-builder',
  'electron-builder/cli.js --win portable nsis',
  'node scripts/test-u32-release-candidate-packaging.mjs',
  'node scripts/test-u32-packaged-page-readiness.mjs',
  'Require complete packaged home content',
  'u32-release-candidate-windows',
  'release/*.exe',
  'artifacts/u32-release-candidate',
]);

requireMarkers('packaged acceptance', runtime, [
  'portable-chinese-space-path',
  'nsis-first-install',
  'nsis-repeat-install-upgrade',
  '中文 空格 portable',
  '中文 空格 安装目录',
  'u32-user-data-preservation.json',
  'deleteAppDataOnUninstall=false',
  'getMpvInstallationStatus()',
  'getMpvPlaybackStatus()',
  'fallbackAvailable',
  'Stop-Process',
  'SHA256SUMS.txt',
  'library-index\\.json',
  'app.asar',
  "assert.equal(process.platform, 'win32'",
  'report.json',
  'checkpoint(',
]);

requireMarkers('packaged page readiness', readiness, [
  'portable-complete-home',
  'nsis-complete-home',
  '正在打开页面',
  '开始建立你的本地媒体库',
  'page-readiness-report.json',
  'complete home content',
  '中文 空格',
  'Stop-Process',
]);

requireMarkers('PROJECT_STATE', state, [
  '核心版本：0.168.0-beta.1',
  'Beta 1：已发布并完成远端资产回读',
  '当前主线：Beta 2 联合整备',
  '目标版本：0.169.0-beta.2',
  'MVP130',
  '用户不承担测试',
]);

requireMarkers('PROJECT_ROADMAP', roadmap, [
  '### U27～U32：真实 Windows 闭环',
  'U32 完成发布候选 UI、portable、NSIS、安装/卸载、数据保留和 SHA-256',
  '### U33：Beta 1 发布',
  '当前主线：Beta 2 联合整备',
  'MVP130',
]);

requireMarkers('U32 historical evidence', evidence, [
  '# U32 Windows 发布候选打包与系统集成验收',
  '结论：AUTOMATED GO',
  '核心版本：0.167.0-mvp129（U32 不改版本号）',
  'Branch Validation：29388203409 — PASS',
  'U32 Release Candidate Packaging：29388203405 — PASS',
  'GitHub runner 临时目录',
  'HTMLAudio fallback',
  '静默卸载',
  'SHA256SUMS.txt',
  '真实 mpv、声卡和驱动',
  'U32 可以关闭，项目下一任务为 U33',
]);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

assert.ok(true);
console.log('U32 release-candidate packaging historical verifier PASS');
