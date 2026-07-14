import fs from 'node:fs';

const settings = fs.readFileSync('src/components/SettingsPage.tsx', 'utf8');
const app = fs.readFileSync('src/App.tsx', 'utf8');
const shell = fs.readFileSync('src/components/DiagnosticsPageShell.tsx', 'utf8');

const checks = [
  ['session-only root authorization', settings.includes("yang_kura_u28_authorized_roots_v1") && settings.includes('sessionStorage.setItem')],
  ['settings token fallback', settings.includes('getU28RootSessionEntry(libraryType)?.rootPathToken')],
  ['root selection is recorded', settings.includes('writeU28RootSession(result)')],
  ['stale ASMR state is replaced', app.includes('asmrBase = mapped.rjWorks') && !app.includes('if (mapped.rjWorks.length > 0) asmrBase')],
  ['stale music state is replaced', app.includes('musicBase = mapped.musicAlbums')],
  ['real index refresh replaces both libraries', app.includes('setRjWorks(metadataOverrideService.applyAsmrOverrides(mapped.rjWorks))') && app.includes('setMusicAlbums(metadataOverrideService.applyMusicAlbumOverrides(mapped.musicAlbums))')],
  ['demo scanner removed from active handler', !app.includes('Demo 扫描演示：不会读取真实磁盘')],
  ['diagnostics names real state', shell.includes('刷新真实资源状态') && shell.includes('不再使用 Demo 扫描冒充真实状态')],
  ['privacy boundary retained', settings.includes('真实路径不会展示') && !settings.includes('absolutePath: result')],
];

const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log((ok ? 'PASS' : 'FAIL') + '	' + name);
if (failed.length) process.exit(1);
console.log('U28 library reconciliation verifier passed.');
