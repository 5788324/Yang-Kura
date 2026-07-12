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
    console.error(`[MVP92 VERIFY FAIL] ${message}`);
    process.exit(1);
  }
}

const pkg = readJson('package.json');
const lock = readJson('package-lock.json');

assert(['0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(pkg.version), `package.json version must be MVP92-compatible, got ${pkg.version}`);
assert(['0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(lock.version), `package-lock version must be MVP92-compatible, got ${lock.version}`);
assert(['0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(lock.packages?.['']?.version), 'package-lock root package version must be MVP92-compatible');
assert(pkg.scripts?.['verify:mvp92-copy-sample-readiness'] === 'node scripts/verify-mvp92-copy-sample-readiness.mjs', 'package.json must expose MVP92 verifier script');
assert(pkg.scripts?.['verify:all']?.includes('verify:mvp92-copy-sample-readiness'), 'verify:all must include MVP92 verifier');

const service = read('src/services/copyOnlySampleReadinessService.ts');
const importerPage = read('src/components/ImporterPage.tsx');
const diagnosticsPage = read('src/components/DiagnosticsPage.tsx');
const serviceIndex = read('src/services/index.ts');

[
  'copyOnlySampleReadinessService',
  'buildCopyOnlySampleReadinessPreview',
  'Mvp92CopyOnlySampleReadinessModel',
  'Mvp92CodexValidationStep',
  'minimalSampleRequirements',
  'codexValidationSteps',
  'ipcContracts',
  'mainSideCopyContracts',
  '0.130.0-mvp92',
  'Codex 本机验收任务书',
  'yang-kura:import:copy-only:preflight',
  'yang-kura:import:copy-only:execute',
  'MVP92 不实现真实 copy only 执行器',
  'Renderer 仍不接收 absolutePath 或 file://',
].forEach((token) => assert(service.includes(token), `service missing token: ${token}`));

[
  'copyOnlySampleReadinessService',
  'mvp92-copy-sample-readiness',
  'mvp92-copy-sample-cards',
  'mvp92-minimal-sample-requirements',
  'mvp92-codex-validation-steps',
  'mvp92-copy-only-ipc-contract',
  'mvp92-main-side-copy-contract',
  'mvp92-sample-gates-preview',
  'mvp92-copy-sample-guardrails',
  'mvp92-disabled-real-copy-button',
  'Codex 本机验收任务书',
].forEach((token) => assert(importerPage.includes(token), `ImporterPage missing token: ${token}`));

[
  'copyOnlySampleReadinessService',
  'mvp92-copy-sample-readiness-diagnostics',
  'mvp92-copy-sample-cards',
  'mvp92-minimal-sample-requirements',
  'mvp92-codex-validation-steps',
  'mvp92-copy-only-ipc-contract',
  'mvp92-main-side-copy-contract',
  'mvp92-copy-sample-guardrails',
  'no real copy',
].forEach((token) => assert(diagnosticsPage.includes(token), `DiagnosticsPage missing token: ${token}`));

[
  'export {copyOnlySampleReadinessService',
  'buildCopyOnlySampleReadinessPreview',
  'Mvp92CopyOnlySampleReadinessModel',
  'Mvp92CodexValidationStep',
].forEach((token) => assert(serviceIndex.includes(token), `services/index missing token: ${token}`));

const forbiddenImplementationTokens = [
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
for (const token of forbiddenImplementationTokens) {
  assert(!service.includes(token), `MVP92 service must not implement file operation token: ${token}`);
}

[
  'README.md',
  'PROJECT_STATE.md',
  'NEXT_CHAT_HANDOFF.md',
  'RUN_ME_FIRST.md',
  'docs/CURRENT_ROADMAP_MVP92.md',
  'docs/COPY_SAMPLE_READINESS_MVP92.md',
  'docs/CODEX_COPY_ONLY_VALIDATION_MVP92.md',
  'HANDOFF_MVP91_TO_MVP92.md',
].forEach((file) => {
  const text = read(file);
  assert(text.includes('MVP-92'), `${file} missing MVP-92`);
  assert(text.includes('0.130.0-mvp92') || text.includes('0.131.0-mvp93', '0.132.0-mvp94'), `${file} missing version`);
  assert(text.includes('Codex'), `${file} missing Codex validation note`);
  assert(text.includes('copy only') || text.includes('copy-only'), `${file} missing copy-only summary`);
  assert(text.includes('不执行') || text.includes('不实现真实 copy'), `${file} missing no-execution boundary`);
});

console.log('[MVP92 VERIFY PASS] Copy-only sample readiness and Codex validation taskbook are wired and guarded.');
