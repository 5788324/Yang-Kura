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

assert.equal(pkg.version, '0.167.0-mvp129', 'U32 must not perform the U33 version bump');

for (const marker of [
  "target: 'portable'",
  "target: 'nsis'",
  'asar: true',
  'oneClick: false',
  'perMachine: false',
  'allowToChangeInstallationDirectory: true',
  'deleteAppDataOnUninstall: false',
  "output: 'release'",
]) {
  assert.ok(builder.includes(marker), `electron-builder release contract missing: ${marker}`);
}

for (const marker of [
  'name: U32 Release Candidate Packaging',
  'runs-on: windows-latest',
  'permissions:\n  contents: read',
  'npm ci --ignore-scripts --no-audit --no-fund',
  'npm audit --audit-level=high',
  'npm rebuild electron',
  'npm run patch:electron-builder',
  'electron-builder/cli.js --win portable nsis',
  'node scripts/test-u32-release-candidate-packaging.mjs',
  'u32-release-candidate-windows',
  'release/*.exe',
  'artifacts/u32-release-candidate',
]) {
  assert.ok(workflow.includes(marker), `U32 packaging workflow missing: ${marker}`);
}

for (const marker of [
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
  'taskkill.exe',
  'SHA256SUMS.txt',
  'library-index\\.json',
  'app.asar',
  "assert.equal(process.platform, 'win32'",
]) {
  assert.ok(runtime.includes(marker), `packaged runtime acceptance missing: ${marker}`);
}

for (const marker of [
  'U32 Windows portable / NSIS 打包与系统集成验收',
  'U32-A 发布候选 UI 整理：完成',
  'U32-B portable / NSIS / 安装升级卸载验收：当前',
  'MVP130 下载器继续冻结',
  '用户不承担测试',
]) {
  assert.ok(state.includes(marker), `PROJECT_STATE missing current U32 fact: ${marker}`);
}

for (const marker of [
  'U32-B Windows 发布候选打包验收',
  'portable + NSIS build',
  'repeat install / uninstall',
  'user data preservation',
  'SHA-256 manifest',
  'U33 才允许正式调整版本号',
  'MVP130 正式下载器',
]) {
  assert.ok(roadmap.includes(marker), `PROJECT_ROADMAP missing current release gate: ${marker}`);
}

for (const marker of [
  '所有安装、用户数据和媒体状态测试都使用 GitHub runner 临时目录',
  '不读取或修改真实 `E:\\arsm`',
  '打包版明确报告不可用，同时保留 HTMLAudio fallback',
  '静默卸载',
  '`SHA256SUMS.txt`',
  '真实 mpv、声卡和驱动',
]) {
  assert.ok(plan.includes(marker), `U32 packaging plan missing: ${marker}`);
}

console.log('U32 release-candidate packaging verifier PASS');
