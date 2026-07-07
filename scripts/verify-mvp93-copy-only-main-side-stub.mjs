import fs from 'node:fs';
import path from 'node:path';

function read(file) {
  return fs.readFileSync(path.resolve(file), 'utf8');
}

function readJson(file) {
  return JSON.parse(read(file));
}

function assert(condition, message) {
  if (!condition) {
    console.error(`[MVP93 VERIFY FAIL] ${message}`);
    process.exit(1);
  }
}

const pkg = readJson('package.json');
const lock = readJson('package-lock.json');

assert(pkg.version === '0.131.0-mvp93', `package.json version must be 0.131.0-mvp93, got ${pkg.version}`);
assert(lock.version === '0.131.0-mvp93', `package-lock version must be 0.131.0-mvp93, got ${lock.version}`);
assert(lock.packages?.['']?.version === '0.131.0-mvp93', 'package-lock root package version must be 0.131.0-mvp93');
assert(pkg.scripts?.['verify:mvp93-copy-only-main-side-stub'] === 'node scripts/verify-mvp93-copy-only-main-side-stub.mjs', 'package.json must expose MVP93 verifier script');
assert(pkg.scripts?.['verify:all']?.includes('verify:mvp93-copy-only-main-side-stub'), 'verify:all must include MVP93 verifier');

const service = read('src/services/copyOnlyMainSideStubService.ts');
const importerPage = read('src/components/ImporterPage.tsx');
const diagnosticsPage = read('src/components/DiagnosticsPage.tsx');
const serviceIndex = read('src/services/index.ts');
const main = read('electron/main.ts');
const preload = read('electron/preload.ts');
const electronTypes = read('src/types/electron-api.d.ts');

[
  'copyOnlyMainSideStubService',
  'buildCopyOnlyStubBlockedResult',
  'Mvp93CopyOnlyMainSideStubModel',
  'Mvp93CopyOnlyStubBlockedResult',
  '0.131.0-mvp93',
  'mvp93-copy-only-stub-blocked',
  'copy-only main-side stub',
  'executeAllowed: false',
  'absolutePathReturned: false',
  'fileUrlReturned: false',
  '真实 copy 前必须暂停并交给 Codex',
].forEach((token) => assert(service.includes(token), `service missing token: ${token}`));

[
  'copyOnlyMainSideStubService',
  'mvp93-copy-only-main-side-stub',
  'mvp93-copy-stub-cards',
  'mvp93-copy-stub-channels',
  'mvp93-copy-stub-blocked-result',
  'mvp93-main-side-stub-guards',
  'mvp93-codex-prompt-gate',
  'mvp93-copy-stub-guardrails',
  'mvp93-disabled-copy-stub-execute-button',
].forEach((token) => assert(importerPage.includes(token), `ImporterPage missing token: ${token}`));

[
  'copyOnlyMainSideStubService',
  'mvp93-copy-only-main-side-stub-diagnostics',
  'mvp93-copy-stub-cards',
  'mvp93-copy-stub-channels',
  'mvp93-copy-stub-blocked-result',
  'mvp93-main-side-stub-guards',
  'mvp93-codex-prompt-gate',
  'mvp93-copy-stub-guardrails',
].forEach((token) => assert(diagnosticsPage.includes(token), `DiagnosticsPage missing token: ${token}`));

[
  'export {copyOnlyMainSideStubService',
  'buildCopyOnlyStubBlockedResult',
  'Mvp93CopyOnlyMainSideStubModel',
].forEach((token) => assert(serviceIndex.includes(token), `services/index missing token: ${token}`));

[
  'registerCopyOnlyMainSideStubIpc',
  'yang-kura:import:copy-only:preflight',
  'yang-kura:import:copy-only:confirm',
  'yang-kura:import:copy-only:execute',
  'yang-kura:import:copy-only:cancel',
  'mvp93-copy-only-stub-blocked',
  'executeAllowed: false',
  'absolutePathReturned: false',
  'fileUrlReturned: false',
].forEach((token) => assert(main.includes(token), `electron/main missing token: ${token}`));

[
  'requestImportCopyOnlyPreflight',
  'requestImportCopyOnlyConfirm',
  'requestImportCopyOnlyExecute',
  'requestImportCopyOnlyCancel',
  'yang-kura:import:copy-only:execute',
  'canUseCopyOnlyStub: true',
  'canExecuteCopyOnly: false',
].forEach((token) => assert(preload.includes(token), `electron/preload missing token: ${token}`));

[
  'YangKuraImportCopyOnlyStubRequest',
  'YangKuraImportCopyOnlyStubBlockedResult',
  'mvp93-copy-only-stub-blocked',
  'requestImportCopyOnlyPreflight',
  'requestImportCopyOnlyExecute',
  'canUseCopyOnlyStub: true',
  'canExecuteCopyOnly: false',
  'absolutePath?: never',
  'fileUrl?: never',
].forEach((token) => assert(electronTypes.includes(token), `electron-api types missing token: ${token}`));

const forbiddenServiceTokens = [
  'import fs',
  'from \'fs\'',
  'from "fs"',
  'copyFile(',
  'rename(',
  'rm(',
  'unlink(',
  'mkdir(',
  'writeFile(',
  'shell.trashItem(',
  'execFile(',
  'spawn(',
];
for (const token of forbiddenServiceTokens) {
  assert(!service.includes(token), `MVP93 service must not implement file operation token: ${token}`);
}

[
  'README.md',
  'PROJECT_STATE.md',
  'NEXT_CHAT_HANDOFF.md',
  'RUN_ME_FIRST.md',
  'docs/CURRENT_ROADMAP_MVP93.md',
  'docs/COPY_ONLY_MAIN_SIDE_STUB_MVP93.md',
  'docs/CODEX_COPY_ONLY_GATE_MVP93.md',
  'HANDOFF_MVP92_TO_MVP93.md',
].forEach((file) => {
  const text = read(file);
  assert(text.includes('MVP-93'), `${file} missing MVP-93`);
  assert(text.includes('0.131.0-mvp93'), `${file} missing version`);
  assert(text.includes('copy-only') || text.includes('copy only'), `${file} missing copy-only summary`);
  assert(text.includes('stub') || text.includes('阻断'), `${file} missing stub/blocking summary`);
  assert(text.includes('不执行') || text.includes('不复制'), `${file} missing no-execution boundary`);
});

console.log('[MVP93 VERIFY PASS] Copy-only main-side stub is wired, typed, blocked, and guarded.');
