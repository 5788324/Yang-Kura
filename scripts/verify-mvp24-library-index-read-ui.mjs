import fs from 'node:fs';

const requiredFiles = [
  'electron/main.ts',
  'electron/preload.ts',
  'src/types/electron-api.d.ts',
  'src/services/libraryIndexAdapter.ts',
  'src/services/electronLibraryIndexReadMvp24Service.ts',
  'src/services/index.ts',
  'src/App.tsx',
  'src/components/SettingsPage.tsx',
  'src/components/DiagnosticsPage.tsx',
  'docs/ELECTRON_LIBRARY_INDEX_READ_MVP24.md',
  'docs/CURRENT_ROADMAP_MVP24.md',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`[MVP-24] Missing required file: ${file}`);
}

const read = (file) => fs.readFileSync(file, 'utf8');
const main = read('electron/main.ts');
const preload = read('electron/preload.ts');
const api = read('src/types/electron-api.d.ts');
const adapter = read('src/services/libraryIndexAdapter.ts');
const app = read('src/App.tsx');
const settings = read('src/components/SettingsPage.tsx');
const diagnostics = read('src/components/DiagnosticsPage.tsx');
const service = read('src/services/electronLibraryIndexReadMvp24Service.ts');
const doc = read('docs/ELECTRON_LIBRARY_INDEX_READ_MVP24.md');
const pkg = JSON.parse(read('package.json'));

const mustContain = [
  [main, "ipcMain.handle('yang-kura:index:read-current-request'", 'main registers read-current-index IPC'],
  [main, 'readLibraryIndex', 'main implements readLibraryIndex'],
  [main, "status: 'mvp24-library-index-read-complete'", 'main returns MVP-24 read success status'],
  [main, 'library-index.json', 'main reads expected index filename'],
  [main, 'absolutePathsReturned: false', 'main forbids absolute paths'],
  [main, 'fileUrlReturned: false', 'main forbids file URLs'],
  [preload, 'requestReadLibraryIndex', 'preload exposes read method'],
  [preload, 'yang-kura:index:read-current-request', 'preload invokes read channel'],
  [api, 'YangKuraReadLibraryIndexResult', 'renderer type declares read result'],
  [api, "status: 'mvp24-library-index-read-complete'", 'type declares read success status'],
  [adapter, 'fromLocalJsonIndexToAppData', 'adapter maps LocalJsonIndex to UI data'],
  [adapter, 'RJWork', 'adapter maps RJWork'],
  [adapter, 'MusicAlbum', 'adapter maps MusicAlbum'],
  [app, 'yang_kura_last_read_library_index_result', 'App reads stored index result'],
  [app, 'fromLocalJsonIndexToAppData', 'App applies adapter output'],
  [app, 'yang-kura-library-index-loaded', 'App listens for index loaded event'],
  [settings, 'handleReadLibraryIndex', 'Settings exposes read handler'],
  [settings, '读取并应用 index', 'Settings has user-facing read button'],
  [diagnostics, 'library-index.json 读取与页面应用结果', 'Diagnostics renders read result'],
  [service, 'mvp24-library-index-read-ui-data-source', 'MVP-24 service status exists'],
  [doc, 'MVP-24', 'MVP-24 doc exists'],
];

for (const [content, needle, reason] of mustContain) {
  if (!content.includes(needle)) throw new Error(`[MVP-24] Expected ${reason}: ${needle}`);
}

for (const forbidden of ['fs.rm', 'fs.unlink', 'fs.rename', 'child_process']) {
  if (main.includes(forbidden)) throw new Error(`[MVP-24] Forbidden API in electron/main.ts: ${forbidden}`);
}

const compatibleStage = /mvp(2[4-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9])/.test(pkg.version) || pkg.version.includes('mvp28.1') || pkg.version.includes('mvp28.2') || pkg.version.includes('mvp29.1');
if (!compatibleStage) throw new Error('[MVP-24] package version must include mvp24');
if (!pkg.scripts?.['verify:mvp24-library-index-read-ui']) throw new Error('[MVP-24] package script is missing');
if (!pkg.scripts?.['verify:all']?.includes('verify:mvp24-library-index-read-ui')) throw new Error('[MVP-24] verify:all must include MVP-24 verifier');

console.log('[MVP-24] library-index read and UI mapping verification passed.');
