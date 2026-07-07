import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const checks = [];
const assert = (condition, message) => {
  if (!condition) {
    console.error(`[MVP-27 FAIL] ${message}`);
    process.exitCode = 1;
  } else {
    checks.push(message);
  }
};

const requiredFiles = [
  'electron/main.ts',
  'electron/preload.ts',
  'src/types/electron-api.d.ts',
  'src/types/electron-runtime-shim.d.ts',
  'src/types.ts',
  'src/services/libraryIndexAdapter.ts',
  'src/components/AsmrDetail.tsx',
  'src/components/MusicLibrary.tsx',
  'src/services/electronExternalOpenMvp27Service.ts',
  'docs/ELECTRON_EXTERNAL_OPEN_MVP27.md',
  'docs/CURRENT_ROADMAP_MVP27.md',
];

for (const file of requiredFiles) {
  assert(fs.existsSync(file), `Required file exists: ${file}`);
}

const main = read('electron/main.ts');
const preload = read('electron/preload.ts');
const api = read('src/types/electron-api.d.ts');
const shim = read('src/types/electron-runtime-shim.d.ts');
const types = read('src/types.ts');
const adapter = read('src/services/libraryIndexAdapter.ts');
const asmrDetail = read('src/components/AsmrDetail.tsx');
const musicLibrary = read('src/components/MusicLibrary.tsx');
const service = read('src/services/electronExternalOpenMvp27Service.ts');
const docs = read('docs/ELECTRON_EXTERNAL_OPEN_MVP27.md');
const pkg = read('package.json');

assert(main.includes("import { app, BrowserWindow, dialog, ipcMain, net, protocol, shell } from 'electron'"), 'Electron main imports shell explicitly.');
assert(main.includes("ipcMain.handle('yang-kura:external:open-file'"), 'Electron main registers external open IPC.');
assert(main.includes("ipcMain.handle('yang-kura:external:open-in-file-manager'"), 'Electron main registers file-manager IPC.');
assert(main.includes('resolveSafeExternalPath'), 'Electron main validates root token + relativePath before external open.');
assert(main.includes('BLOCKED_EXTERNAL_OPEN_EXTENSIONS'), 'Electron main blocks executable/script extensions.');
assert(main.includes('shell.openPath'), 'Electron main opens files through system default app.');
assert(main.includes('shell.showItemInFolder'), 'Electron main can reveal files in system file manager.');
assert(main.includes('absolutePathReturned: false'), 'Main replies do not expose absolutePath.');
assert(main.includes('fileUrlReturned: false'), 'Main replies do not expose file://.');
assert(preload.includes('requestOpenExternalFile'), 'Preload exposes requestOpenExternalFile.');
assert(preload.includes('requestOpenInFileManager'), 'Preload exposes requestOpenInFileManager.');
assert(api.includes('YangKuraOpenExternalFileRequest'), 'Renderer API type includes external open request.');
assert(api.includes('YangKuraOpenInFileManagerRequest'), 'Renderer API type includes file-manager request.');
assert(shim.includes('export const shell'), 'Electron runtime shim declares shell.');
assert(types.includes('mediaKind?: LibraryTrackKind'), 'AudioTrack carries mediaKind for video/image handling.');
assert(types.includes('externalOpenSourceKind?:'), 'AudioTrack carries external open marker.');
assert(adapter.includes('externalOpenSourceKind: hasTokenizedLocalSource'), 'Adapter maps real index tracks to external-open-capable tracks.');
assert(adapter.includes('playbackSourceKind: hasTokenizedLocalSource && isPlayableAudio'), 'Adapter keeps HTMLAudio limited to audio tracks.');
assert(asmrDetail.includes('requestOpenExternalFile'), 'ASMR detail can open tokenized files externally.');
assert(asmrDetail.includes('requestOpenInFileManager'), 'ASMR detail can reveal tokenized files.');
assert(musicLibrary.includes('requestOpenExternalFile'), 'Music library can open tokenized files externally.');
assert(musicLibrary.includes('requestOpenInFileManager'), 'Music library can reveal tokenized files.');
assert(service.includes('MVP-27'), 'MVP-27 service exists.');
assert(docs.includes('不内置视频播放器'), 'MVP-27 docs declare no built-in video player.');
assert(pkg.includes('0.65.0-mvp27') || pkg.includes('0.66.0-mvp28') || pkg.includes('0.67.0-mvp29') || pkg.includes('0.67.1-mvp29.1') || (pkg.includes('0.68.0-mvp30') || pkg.includes('0.69.0-mvp31') || pkg.includes('0.70.0-mvp32') || pkg.includes('0.71.0-mvp33') || pkg.includes('0.72.0-mvp34') || pkg.includes('0.73.0-mvp35') || pkg.includes('0.74.0-mvp36') || pkg.includes('0.75.0-mvp37') || pkg.includes('0.76.0-mvp38')), 'Package version is advanced to MVP-27.');
assert(pkg.includes('verify:mvp27-external-open'), 'Package includes MVP-27 verifier.');

const forbiddenMainSnippets = ['fs.rm(', 'fs.unlink(', 'fs.rename(', 'fs.copyFile(', 'child_process'];
for (const snippet of forbiddenMainSnippets) {
  assert(!main.includes(snippet), `MVP-27 must not introduce mutation/child-process API: ${snippet}`);
}

if (process.exitCode) process.exit(process.exitCode);
console.log(`[MVP-27 PASS] ${checks.length} checks passed.`);
