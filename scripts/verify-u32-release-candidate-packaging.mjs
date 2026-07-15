#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const builder = fs.readFileSync('electron-builder.config.cjs', 'utf8');
const workflow = fs.readFileSync('.github/workflows/u32-release-candidate.yml', 'utf8');
const runtime = fs.readFileSync('scripts/test-u32-release-candidate-packaging.mjs', 'utf8');
const state = fs.readFileSync('PROJECT_STATE.md', 'utf8');
const roadmap = fs.readFileSync('PROJECT_ROADMAP.md', 'utf8');
const plan = fs.readFileSync('docs/U32_RELEASE_CANDIDATE_PACKAGING.md', 'utf8');

const failures = [];
const requireMarkers = (label, text, markers) => {
  for (const marker of markers) {
    if (!text.includes(marker)) failures.push(`${label} missing: ${marker}`);
  }
};

if (pkg.version !== '0.167.0-mvp129') failures.push('U32 must not perform the U33 version bump');

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

requireMarkers('workflow', workflow, [
  'name: U32 Release Candidate Packaging',
  'runs-on: windows-latest',
  'contents: read',
  'npm ci --ignore-scripts --no-audit --no-fund',
  'npm audit --audit-level=high',
  'npm rebuild electron',
  'npm run patch:electron-builder',
  'electron-builder/cli.js --win portable nsis',
  'node scripts/test-u32-release-candidate-packaging.mjs',
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

requireMarkers('PROJECT_STATE', state, [
  '当前任务：U32 Windows portable / NSIS 打包与系统集成验收',
  '### U32-A：发布候选 UI 整理',
  'U32-B portable / NSIS / 安装升级卸载验收：当前',
  'MVP130',
  '用户不承担测试',
]);

requireMarkers('PROJECT_ROADMAP', roadmap, [
  '当前主线：U32 Windows portable / NSIS 打包与系统集成验收',
  '## 5. 当前主线：U32-B Windows 发布候选打包验收',
  'portable + NSIS build',
  'repeat install / uninstall',
  'user data preservation',
  'SHA-256 manifest',
  'U33 才允许正式调整版本号',
  'MVP130 正式下载器',
]);

requireMarkers('U32 plan', plan, [
  '# U32 Windows 发布候选打包与系统集成验收',
  'GitHub runner 临时目录',
  'HTMLAudio fallback',
  '静默卸载',
  'SHA256SUMS.txt',
  '真实 mpv、声卡和驱动',
]);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

assert.ok(true);
console.log('U32 release-candidate packaging verifier PASS');
