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
    console.error(`[MVP91 VERIFY FAIL] ${message}`);
    process.exit(1);
  }
}

const pkg = readJson('package.json');
const lock = readJson('package-lock.json');

assert(['0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95'].includes(pkg.version), `package.json version must be 0.129.0-mvp91, got ${pkg.version}`);
assert(['0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95'].includes(lock.version), `package-lock version must be 0.129.0-mvp91, got ${lock.version}`);
assert(['0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95'].includes(lock.packages?.['']?.version), 'package-lock root package version must be 0.129.0-mvp91');
assert(pkg.scripts?.['verify:mvp91-copy-execution-readiness'] === 'node scripts/verify-mvp91-copy-execution-readiness.mjs', 'package.json must expose MVP91 verifier script');
assert(pkg.scripts?.['verify:all']?.includes('verify:mvp91-copy-execution-readiness'), 'verify:all must include MVP91 verifier');

const service = read('src/services/importCopyExecutionReadinessService.ts');
const importerPage = read('src/components/ImporterPage.tsx');
const diagnosticsPage = read('src/components/DiagnosticsPage.tsx');
const serviceIndex = read('src/services/index.ts');

[
  'importCopyExecutionReadinessService',
  'buildImportCopyExecutionReadinessPreview',
  'Mvp91ImportCopyExecutionReadinessModel',
  'ImportCopyPreflightCheck',
  'ImportCopyConfirmationPreview',
  'ImportOperationLogPreviewEntry',
  'failureList',
  'skippedList',
  'disabled-preview-only',
  'copy-only',
  'MVP91 不执行 fs.copyFile',
  'Renderer 不接收 absolutePath 或 file://',
].forEach((token) => assert(service.includes(token), `service missing token: ${token}`));

[
  'importCopyExecutionReadinessService',
  'mvp91-copy-execution-readiness',
  'mvp91-copy-readiness-cards',
  'mvp91-copy-preflight-checks',
  'mvp91-confirmation-model',
  'mvp91-file-execution-plan',
  'mvp91-operation-log-preview',
  'mvp91-failure-skip-preview',
  'mvp91-copy-execution-guardrails',
  'mvp91-disabled-copy-execute-button',
  'disabled-preview-only',
].forEach((token) => assert(importerPage.includes(token), `ImporterPage missing token: ${token}`));

[
  'importCopyExecutionReadinessService',
  'mvp91-copy-execution-readiness-diagnostics',
  'mvp91-copy-readiness-cards',
  'mvp91-copy-preflight-checks',
  'mvp91-confirmation-model',
  'mvp91-operation-log-preview',
  'mvp91-failure-skip-preview',
  'mvp91-copy-execution-guardrails',
  'no fs.copyFile',
].forEach((token) => assert(diagnosticsPage.includes(token), `DiagnosticsPage missing token: ${token}`));

[
  'export {importCopyExecutionReadinessService',
  'buildImportCopyExecutionReadinessPreview',
  'ImportCopyPreflightCheck',
  'Mvp91ImportCopyExecutionReadinessModel',
].forEach((token) => assert(serviceIndex.includes(token), `services/index missing token: ${token}`));

const forbiddenImplementationTokens = [
  'fs.copyFile(',
  'fs.copyFileSync(',
  'fs.rename(',
  'fs.rm(',
  'fs.unlink(',
  'fs.writeFile(',
  'shell.trashItem(',
  'child_process',
  'execFile(',
  'spawn(',
];
for (const token of forbiddenImplementationTokens) {
  assert(!service.includes(token), `MVP91 service must not implement file operation token: ${token}`);
}

['README.md', 'PROJECT_STATE.md', 'NEXT_CHAT_HANDOFF.md', 'RUN_ME_FIRST.md', 'docs/CURRENT_ROADMAP_MVP91.md', 'docs/COPY_EXECUTION_READINESS_MVP91.md', 'HANDOFF_MVP90_TO_MVP91.md'].forEach((file) => {
  const text = read(file);
  assert(text.includes('MVP-91'), `${file} missing MVP-91`);
  assert(text.includes('copy only') || text.includes('copy-only'), `${file} missing copy-only summary`);
  assert(text.includes('0.129.0-mvp91'), `${file} missing version`);
  assert(text.includes('不复制') || text.includes('不执行 copy'), `${file} missing no-copy boundary`);
  assert(text.includes('OperationLog'), `${file} missing OperationLog boundary`);
});

console.log('[MVP91 VERIFY PASS] Copy execution readiness contract is wired and guarded.');
