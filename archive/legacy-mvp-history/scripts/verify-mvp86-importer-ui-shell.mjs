import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const fail = (message) => {
  console.error(`[MVP-86] ${message}`);
  process.exit(1);
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));

assert(['0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(pkg.version), `package.json version must be 0.124.0-mvp86 or compatible MVP-87, got ${pkg.version}`);
assert(['0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(lock.version), `package-lock version must be 0.124.0-mvp86 or compatible MVP-87, got ${lock.version}`);
assert(['0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(lock.packages?.['']?.version), 'package-lock root package version must be 0.124.0-mvp86 or compatible MVP-87');
assert(pkg.scripts?.['verify:mvp86-importer-ui-shell'] === 'node scripts/verify-mvp86-importer-ui-shell.mjs', 'package.json must expose MVP86 verifier script');
assert(pkg.scripts?.['verify:all']?.includes('verify:mvp86-importer-ui-shell'), 'verify:all must include MVP86 verifier');

const requiredFiles = [
  'src/services/importerPreviewShellService.ts',
  'src/components/ImporterPage.tsx',
  'docs/CURRENT_ROADMAP_MVP86.md',
  'docs/IMPORTER_UI_SHELL_MVP86.md',
  'HANDOFF_MVP85_TO_MVP86.md',
  'PACKAGE_MANIFEST_MVP86_HANDOFF.txt',
];
for (const file of requiredFiles) assert(exists(file), `missing required file: ${file}`);

const service = read('src/services/importerPreviewShellService.ts');
for (const token of [
  '0.124.0-mvp86',
  'Mvp86ImporterUiShellModel',
  'Mvp86ImporterMockTask',
  'ImportTaskContract',
  'MetadataSourceContract',
  'sourceRootToken',
  'targetRootToken',
  'overwrite: false',
  'copy only',
  'absolutePath',
  'file://',
]) {
  assert(service.includes(token), `MVP86 service missing token: ${token}`);
}

const importerPage = read('src/components/ImporterPage.tsx');
for (const token of [
  'importerPreviewShellService',
  'mvp86-importer-ui-shell',
  'mvp86-import-source-options',
  'mvp86-import-preview-steps',
  'mvp86-import-preview-task',
  'mvp86-import-file-list',
  'mvp86-import-metadata-preview',
  'mvp86-import-conflict-preview',
  'mvp86-import-target-plan-preview',
  'mvp86-importer-guardrails',
  'mvp86-importer-disabled-execute-button',
  'disabled',
]) {
  assert(importerPage.includes(token), `ImporterPage missing token: ${token}`);
}

const app = read('src/App.tsx');
for (const token of ['ImporterPage', "currentPage === 'importer'", "from './components/ImporterPage'"]) {
  assert(app.includes(token), `App.tsx missing token: ${token}`);
}

const sidebar = read('src/components/Sidebar.tsx');
for (const token of ['importer', '导入器', 'ArchiveRestore']) {
  assert(sidebar.includes(token), `Sidebar missing token: ${token}`);
}

const types = read('src/types.ts');
assert(types.includes("'importer'"), 'PageType must include importer route');

const diagnostics = read('src/components/DiagnosticsPage.tsx');
for (const token of [
  'importerPreviewShellService',
  'mvp86-importer-ui-shell-diagnostics',
  'mvp86-importer-source-options',
  'mvp86-importer-preview-steps',
  'mvp86-import-preview-task',
  'mvp86-import-target-plan-preview',
  'mvp86-importer-guardrails',
]) {
  assert(diagnostics.includes(token), `DiagnosticsPage missing token: ${token}`);
}

const serviceIndex = read('src/services/index.ts');
for (const token of ['importerPreviewShellService', 'Mvp86ImporterUiShellModel', 'Mvp86ImporterMockTask']) {
  assert(serviceIndex.includes(token), `services index missing token: ${token}`);
}

for (const file of requiredFiles) {
  const content = read(file);
  for (const token of ['0.124.0-mvp86', 'MVP-86']) {
    assert(content.includes(token), `${file} missing ${token}`);
  }
}

for (const file of ['README.md', 'PROJECT_STATE.md', 'NEXT_CHAT_HANDOFF.md', 'RUN_ME_FIRST.md', 'docs/PROJECT_STATE.md', 'docs/NEXT_CHAT_HANDOFF.md', 'docs/RUN_ME_FIRST.md', '00_NEW_CHAT_START_HERE.md', 'NEW_CHAT_PROMPT.md', 'NEW_CHAT_PROMPT_FULL.md', 'CODEX_MINIMAL_PROMPTS.md']) {
  const content = read(file);
  assert(content.includes('0.124.0-mvp86'), `${file} must mention 0.124.0-mvp86`);
  assert(content.includes('MVP-86'), `${file} must mention MVP-86`);
  assert(content.includes('导入器 UI 壳') || content.includes('ImporterPage') || content.includes('mvp86-importer-ui-shell'), `${file} must mention MVP86 importer UI shell`);
}

for (const token of ['fs.unlink(', 'fs.rename(', 'fs.rm(', 'fs.copyFile(', 'ipcMain.handle("yang-kura:import', 'child_process.spawn', 'fetch(']) {
  assert(!service.includes(token), `MVP86 service introduced forbidden implementation token: ${token}`);
  assert(!importerPage.includes(token), `ImporterPage introduced forbidden implementation token: ${token}`);
}

console.log('MVP-86 importer UI shell verification passed.');
