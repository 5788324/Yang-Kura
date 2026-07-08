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
    console.error(`[MVP90 VERIFY FAIL] ${message}`);
    process.exit(1);
  }
}

const pkg = readJson('package.json');
const lock = readJson('package-lock.json');

assert(['0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95'].includes(pkg.version), `package.json version must be 0.128.0-mvp90 or compatible MVP-91, got ${pkg.version}`);
assert(['0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95'].includes(lock.version), `package-lock version must be 0.128.0-mvp90 or compatible MVP-91, got ${lock.version}`);
assert(['0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95'].includes(lock.packages?.['']?.version), 'package-lock root package version must be 0.128.0-mvp90 or compatible MVP-91');
assert(pkg.scripts?.['verify:mvp90-target-path-planning'] === 'node scripts/verify-mvp90-target-path-planning.mjs', 'package.json must expose MVP90 verifier script');
assert(pkg.scripts?.['verify:all']?.includes('verify:mvp90-target-path-planning'), 'verify:all must include MVP90 verifier');

const service = read('src/services/importTargetPathPlanningPreviewService.ts');
const importerPage = read('src/components/ImporterPage.tsx');
const diagnosticsPage = read('src/components/DiagnosticsPage.tsx');
const serviceIndex = read('src/services/index.ts');

[
  'importTargetPathPlanningPreviewService',
  'buildImportTargetPathPreview',
  'sanitizePathSegment',
  'sanitizeFileName',
  'Mvp90ImportTargetPathPlanningModel',
  'ImportTargetPathPlanningResult',
  'overwrite: false',
  'MVP90 不执行 copy、move、delete、rename',
  'Renderer 不接收 absolutePath 或 file://',
].forEach((token) => assert(service.includes(token), `service missing token: ${token}`));

[
  'importTargetPathPlanningPreviewService',
  'mvp90-target-path-planning-preview',
  'mvp90-target-path-rule-cards',
  'mvp90-target-path-summary',
  'mvp90-target-path-plan-preview',
  'mvp90-sanitized-path-examples',
  'mvp90-path-warning-preview',
  'mvp90-target-path-guardrails',
  '只生成计划 · 不执行文件操作',
  'overwrite: false',
].forEach((token) => assert(importerPage.includes(token), `ImporterPage missing token: ${token}`));

[
  'importTargetPathPlanningPreviewService',
  'mvp90-target-path-planning-diagnostics',
  'mvp90-target-path-rule-cards',
  'mvp90-target-path-plan-preview',
  'mvp90-sanitized-path-examples',
  'mvp90-target-path-guardrails',
  'no copy move delete rename',
].forEach((token) => assert(diagnosticsPage.includes(token), `DiagnosticsPage missing token: ${token}`));

[
  'export {importTargetPathPlanningPreviewService',
  'buildImportTargetPathPreview',
  'sanitizeFileName',
  'Mvp90ImportTargetPathPlanningModel',
].forEach((token) => assert(serviceIndex.includes(token), `services/index missing token: ${token}`));

const forbiddenImplementationTokens = [
  'fs.copyFile(',
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
  assert(!service.includes(token), `MVP90 service must not implement file operation token: ${token}`);
}

['README.md', 'PROJECT_STATE.md', 'NEXT_CHAT_HANDOFF.md', 'RUN_ME_FIRST.md', 'docs/CURRENT_ROADMAP_MVP90.md', 'docs/TARGET_PATH_PLANNING_MVP90.md', 'HANDOFF_MVP89_TO_MVP90.md'].forEach((file) => {
  const text = read(file);
  assert(text.includes('MVP-90'), `${file} missing MVP-90`);
  assert(text.includes('目标路径规划'), `${file} missing target path planning summary`);
  assert(text.includes('0.128.0-mvp90'), `${file} missing version`);
  assert(text.includes('不复制') || text.includes('不执行 copy'), `${file} missing no-copy boundary`);
});

console.log('[MVP90 VERIFY PASS] Target path planning preview is wired and guarded.');
