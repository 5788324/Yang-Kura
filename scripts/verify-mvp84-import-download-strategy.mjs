import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const fail = (message) => {
  console.error(`[MVP-84] ${message}`);
  process.exit(1);
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));

assert(['0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95'].includes(pkg.version), `package.json version must be 0.122.0-mvp84 or compatible MVP-85, got ${pkg.version}`);
assert(['0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95'].includes(lock.version), `package-lock version must be 0.122.0-mvp84 or compatible MVP-85, got ${lock.version}`);
assert(['0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95'].includes(lock.packages?.['']?.version), 'package-lock root package version must be 0.122.0-mvp84 or compatible MVP-85');
assert(pkg.scripts?.['verify:mvp84-import-download-strategy'] === 'node scripts/verify-mvp84-import-download-strategy.mjs', 'package.json must expose MVP84 verifier script');
assert(pkg.scripts?.['verify:all']?.includes('verify:mvp84-import-download-strategy'), 'verify:all must include MVP84 verifier');

const requiredFiles = [
  'src/services/importDownloadEcosystemStrategyService.ts',
  'docs/CURRENT_ROADMAP_MVP84.md',
  'docs/IMPORT_DOWNLOAD_ECOSYSTEM_STRATEGY_MVP84.md',
  'docs/GIT_PUSH_ATTEMPT_MVP84.md',
  'docs/PROJECT_MASTER_PLAN_MVP84.md',
  'HANDOFF_MVP83_TO_MVP84.md',
  'PACKAGE_MANIFEST_MVP84_HANDOFF.txt',
];
for (const file of requiredFiles) assert(exists(file), `missing required file: ${file}`);

const service = read('src/services/importDownloadEcosystemStrategyService.ts');
for (const token of [
  '0.122.0-mvp84',
  '导入器优先',
  '下载生态',
  'ImportTask',
  'DownloadTask',
  'MetadataSource',
  'copy only',
  'mpv 子进程',
  'HTMLAudio',
  'absolutePath',
  'file://',
  'GitHub main 仍不是最新基线',
]) {
  assert(service.includes(token), `MVP84 service missing token: ${token}`);
}

const diagnostics = read('src/components/DiagnosticsPage.tsx');
for (const token of [
  'importDownloadEcosystemStrategyService',
  'mvp84-import-download-strategy',
  'mvp84-strategy-cards',
  'mvp84-importer-flow',
  'mvp84-roadmap-phases',
  'mvp84-git-push-attempt',
  'mvp84-safety-boundaries',
]) {
  assert(diagnostics.includes(token), `DiagnosticsPage missing token: ${token}`);
}

const serviceIndex = read('src/services/index.ts');
assert(serviceIndex.includes('importDownloadEcosystemStrategyService'), 'services index must export MVP84 service');

for (const file of requiredFiles) {
  const content = read(file);
  for (const token of ['0.122.0-mvp84', 'MVP-84']) {
    assert(content.includes(token), `${file} missing ${token}`);
  }
}

for (const file of ['README.md', 'PROJECT_STATE.md', 'NEXT_CHAT_HANDOFF.md', 'RUN_ME_FIRST.md', 'docs/PROJECT_STATE.md', 'docs/NEXT_CHAT_HANDOFF.md', 'docs/RUN_ME_FIRST.md', '00_NEW_CHAT_START_HERE.md', 'NEW_CHAT_PROMPT.md', 'NEW_CHAT_PROMPT_FULL.md', 'CODEX_MINIMAL_PROMPTS.md']) {
  const content = read(file);
  assert(content.includes('0.122.0-mvp84'), `${file} must mention 0.122.0-mvp84`);
  assert(content.includes('MVP-84'), `${file} must mention MVP-84`);
  assert(content.includes('导入器') || content.includes('下载生态'), `${file} must mention importer or download ecosystem`);
}

const strategyDoc = read('docs/IMPORT_DOWNLOAD_ECOSYSTEM_STRATEGY_MVP84.md');
for (const token of ['DRM', '加密格式', '不做解密器', 'copy only', 'userOverride', 'mpv 子进程']) {
  assert(strategyDoc.includes(token), `strategy doc missing token: ${token}`);
}

for (const token of ['fs.unlink(', 'fs.rename(', 'fs.rm(', 'better-sqlite3', 'ipcMain.handle("yang-kura:download', 'child_process.spawn']) {
  assert(!service.includes(token), `MVP84 service introduced implementation-like forbidden token: ${token}`);
}

console.log('MVP-84 import/download ecosystem strategy verification passed.');
