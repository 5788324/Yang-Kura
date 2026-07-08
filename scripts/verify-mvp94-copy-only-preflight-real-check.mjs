#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => {
  console.error(`[MVP94 verify] ${message}`);
  process.exit(1);
};
const assert = (condition, message) => { if (!condition) fail(message); };

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
assert(['0.132.0-mvp94', '0.133.0-mvp95'].includes(pkg.version), `package version must be 0.132.0-mvp94 or compatible MVP95, got ${pkg.version}`);
assert(['0.132.0-mvp94', '0.133.0-mvp95'].includes(lock.version) || ['0.132.0-mvp94', '0.133.0-mvp95'].includes(lock.packages?.['']?.version), 'package-lock root version must be MVP94-compatible');
assert(pkg.scripts['verify:mvp94-copy-only-preflight-real-check'], 'package.json must expose verify:mvp94-copy-only-preflight-real-check');
assert(pkg.scripts['verify:all'].includes('verify:mvp94-copy-only-preflight-real-check'), 'verify:all must include MVP94 verifier');

const service = read('src/services/copyOnlyPreflightRealCheckService.ts');
[
  '0.132.0-mvp94',
  'MVP-94 copy-only preflight 真实化',
  'mvp94-copy-only-preflight-real-check-complete',
  'executeAllowed: false',
  'copyAllowed: false',
  'copiedCount: 0',
  'createdDirectoryCount: 0',
  'no fs.copyFile',
  'no mkdir',
  'no OperationLog write',
  'sendToCodexNow: false',
].forEach((token) => assert(service.includes(token), `service missing token: ${token}`));

const importer = read('src/components/ImporterPage.tsx');
[
  'mvp94-copy-only-preflight-real-check',
  'mvp94-preflight-cards',
  'mvp94-main-side-preflight-contract',
  'mvp94-preflight-result-preview',
  'mvp94-preflight-file-checks',
  'mvp94-preflight-guardrails',
  'mvp94-codex-gate',
  'mvp94-disabled-real-copy-button',
].forEach((token) => assert(importer.includes(token), `ImporterPage missing token: ${token}`));

const diagnostics = read('src/components/DiagnosticsPage.tsx');
[
  'mvp94-copy-only-preflight-real-check-diagnostics',
  'mvp94-preflight-cards',
  'mvp94-main-side-preflight-contract',
  'mvp94-preflight-result-preview',
  'mvp94-preflight-file-checks',
  'mvp94-preflight-guardrails',
  'mvp94-codex-gate',
].forEach((token) => assert(diagnostics.includes(token), `DiagnosticsPage missing token: ${token}`));

const main = read('electron/main.ts');
[
  'buildMvp94CopyOnlyPreflightResult',
  'resolveSafeCopyPath',
  'mvp94-copy-only-preflight-real-check-complete',
  'mvp94-copy-only-preflight-invalid-request',
  'mvp94-copy-only-preflight-invalid-root-token',
  'mvp94-copy-only-preflight-empty-file-list',
  'targetParentExists',
  'sourceExists',
  'targetExists',
  'executeAllowed: false',
  'copyAllowed: false',
  'createdDirectoryCount: 0',
  'absolutePathReturned: false',
  'fileUrlReturned: false',
].forEach((token) => assert(main.includes(token), `electron/main.ts missing token: ${token}`));
if (pkg.version === '0.132.0-mvp94') {
  assert(!main.includes('fs.copyFile('), 'electron/main.ts must not call fs.copyFile in MVP94');
  assert(!main.includes('fs.cp('), 'electron/main.ts must not call fs.cp in MVP94');
  assert(!main.includes('fs.mkdir('), 'electron/main.ts must not call fs.mkdir in MVP94');
}
assert(!main.includes('fs.rename('), 'electron/main.ts must not call fs.rename in MVP94/MVP95');
assert(!main.includes('fs.rm('), 'electron/main.ts must not call fs.rm in MVP94/MVP95');

const preload = read('electron/preload.ts');
assert(preload.includes('canUseCopyOnlyPreflightRealCheck: true'), 'preload shell status must expose preflight real check capability');
assert(preload.includes('targetRelativePaths?: string[]'), 'preload copy-only request must support targetRelativePaths');

const electronApi = read('src/types/electron-api.d.ts');
[
  'YangKuraImportCopyOnlyPreflightRealCheckResult',
  'YangKuraImportCopyOnlyPreflightFileCheck',
  "status: 'mvp94-copy-only-preflight-real-check-complete'",
  'targetRelativePaths?: string[]',
  'absolutePath?: never',
  'fileUrl?: never',
  'canUseCopyOnlyPreflightRealCheck: true',
].forEach((token) => assert(electronApi.includes(token), `electron-api.d.ts missing token: ${token}`));

const docs = [
  'docs/CURRENT_ROADMAP_MVP94.md',
  'docs/COPY_ONLY_PREFLIGHT_REAL_CHECK_MVP94.md',
  'HANDOFF_MVP93_TO_MVP94.md',
  'PACKAGE_MANIFEST_MVP94_HANDOFF.txt',
  'PROJECT_STATE.md',
  'NEXT_CHAT_HANDOFF.md',
  'README.md',
  'RUN_ME_FIRST.md',
];
docs.forEach((doc) => assert(fs.existsSync(path.join(root, doc)), `missing ${doc}`));
const docText = docs.map((doc) => read(doc)).join('\n');
[
  'MVP-94',
  '0.132.0-mvp94',
  'copy-only preflight',
  '不执行真实 copy',
  '不创建目录',
  '不写 OperationLog',
  'Renderer 不接收 absolutePath',
  'file://',
].forEach((token) => assert(docText.includes(token), `docs missing token: ${token}`));

console.log('[MVP94 verify] PASS copy-only preflight real check remains preflight-only and path-safe.');
