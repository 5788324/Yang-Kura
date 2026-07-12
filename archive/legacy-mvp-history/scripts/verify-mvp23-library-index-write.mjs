import fs from 'node:fs';

const requiredFiles = [
  'electron/main.ts',
  'electron/preload.ts',
  'src/types/electron-api.d.ts',
  'src/services/electronLibraryIndexWriteMvp23Service.ts',
  'src/services/index.ts',
  'src/components/SettingsPage.tsx',
  'src/components/DiagnosticsPage.tsx',
  'docs/ELECTRON_LIBRARY_INDEX_WRITE_MVP23.md',
  'docs/CURRENT_ROADMAP_MVP23.md',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`[MVP-23] Missing required file: ${file}`);
}

const read = (file) => fs.readFileSync(file, 'utf8');
const main = read('electron/main.ts');
const preload = read('electron/preload.ts');
const api = read('src/types/electron-api.d.ts');
const settings = read('src/components/SettingsPage.tsx');
const diagnostics = read('src/components/DiagnosticsPage.tsx');
const service = read('src/services/electronLibraryIndexWriteMvp23Service.ts');
const doc = read('docs/ELECTRON_LIBRARY_INDEX_WRITE_MVP23.md');
const roadmap = read('docs/CURRENT_ROADMAP_MVP23.md');
const pkg = JSON.parse(read('package.json'));

const mustContain = [
  [main, "ipcMain.handle('yang-kura:index:write-confirmed-request'", 'main registers confirmed write IPC'],
  [main, 'writeLibraryIndex', 'main has writeLibraryIndex implementation'],
  [main, "status: 'mvp23-library-index-write-complete'", 'main returns MVP-23 success status'],
  [main, 'library-index.json', 'main writes the expected index filename'],
  [main, 'library-index.backup-', 'main creates relative backup filename'],
  [main, 'fs.writeFile', 'main writes index file only after confirmed request'],
  [main, 'fs.readFile', 'main reads back for validation'],
  [main, 'sha256', 'main returns checksum'],
  [main, 'absolutePathsReturned: false', 'main result forbids absolute paths'],
  [main, 'fileUrlReturned: false', 'main result forbids file URLs'],
  [preload, 'requestWriteLibraryIndex', 'preload exposes narrow confirmed write method'],
  [preload, 'yang-kura:index:write-confirmed-request', 'preload invokes confirmed write channel'],
  [api, 'YangKuraWriteLibraryIndexResult', 'renderer type declares write result'],
  [api, "status: 'mvp23-library-index-write-complete'", 'type declares success status'],
  [api, 'absolutePath?: never', 'renderer result forbids absolutePath'],
  [api, 'fileUrl?: never', 'renderer result forbids fileUrl'],
  [settings, 'handleWriteLibraryIndex', 'Settings adds write handler'],
  [settings, 'yang_kura_last_index_write_result', 'Settings persists write result'],
  [settings, '确认写入 index', 'Settings exposes confirmed write button'],
  [diagnostics, 'library-index.json 真实写入结果', 'Diagnostics renders write result'],
  [service, 'MVP-23 Confirmed library-index.json 写入', 'service title exists'],
  [doc, 'MVP-23 Confirmed library-index.json 写入', 'doc exists'],
  [roadmap, 'MVP-23', 'roadmap mentions MVP-23'],
];

for (const [content, needle, reason] of mustContain) {
  if (!content.includes(needle)) throw new Error(`[MVP-23] Expected ${reason}: ${needle}`);
}

for (const forbidden of ['fs.rm', 'fs.unlink', 'fs.rename', 'child_process']) {
  if (main.includes(forbidden)) throw new Error(`[MVP-23] Forbidden API or URL in electron/main.ts: ${forbidden}`);
}

const compatibleStage = /mvp(2[3-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9]|10[0-9])/.test(pkg.version) || pkg.version.includes('mvp28.1') || pkg.version.includes('mvp28.2') || pkg.version.includes('mvp29.1');
if (!compatibleStage) throw new Error('[MVP-23] package version must include mvp23 or a later mvp24 package');
if (!pkg.scripts?.['verify:mvp23-library-index-write']) throw new Error('[MVP-23] package script is missing');
if (!pkg.scripts?.['verify:all']?.includes('verify:mvp23-library-index-write')) throw new Error('[MVP-23] verify:all must include MVP-23 verifier');

console.log('[MVP-23] confirmed library-index write verification passed.');
