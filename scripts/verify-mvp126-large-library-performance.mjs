import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!['0.164.0-mvp126', '0.165.0-mvp127', '0.166.0-mvp128', '0.167.0-mvp129'].includes(pkg.version)) throw new Error(`unexpected version: ${pkg.version}`);
if (!fs.readFileSync('scripts/run-stable-regression.mjs', 'utf8').includes('verify:mvp126-large-library-performance')) throw new Error('verify:stable missing MVP126');
if (pkg.scripts?.['test:library:performance'] !== 'node scripts/benchmark-mvp126-large-library.mjs') throw new Error('performance benchmark script missing');

const checks = [
  ['src/services/libraryPerformanceService.ts', ['LARGE_LIBRARY_RENDER_LIMITS', 'buildAsmrSearchIndex', 'buildMusicSearchIndex', 'sliceRenderWindow', 'absolutePath', 'file://']],
  ['src/components/AsmrLibrary.tsx', ['useDeferredValue', 'mvp126-asmr-render-window', 'visibleWorks', 'libraryPerformanceService']],
  ['src/components/MusicLibrary.tsx', ['useDeferredValue', 'mvp126-music-render-window', 'visibleTracks', 'artistGroups', 'libraryPerformanceService']],
  ['src/components/DiagnosticsPageShell.tsx', ['mvp126-diagnostics-two-stage-loader', '打开完整诊断', 'LibraryPerformanceDiagnosticsPanel']],
  ['src/App.tsx', ["import AppRouter from './app/AppRouter';", '<AppRouter']],
  ['src/app/AppRouter.tsx', [
    "const AsmrLibrary = lazy(() => import('../components/AsmrLibrary'));",
    "const MusicLibrary = lazy(() => import('../components/MusicLibrary'));",
    "const DiagnosticsPageShell = lazy(() => import('../components/DiagnosticsPageShell'));",
  ]],
  ['vite.config.ts', ['manualChunks', 'react-vendor', 'icons-vendor']],
  ['scripts/benchmark-mvp126-large-library.mjs', ['ASMR_WORKS = 4000', 'MUSIC_ALBUMS = 1500', 'real library access: NO']],
];

for (const [file, tokens] of checks) {
  const text = fs.readFileSync(file, 'utf8');
  for (const token of tokens) if (!text.includes(token)) throw new Error(`${file} missing ${token}`);
}

const service = fs.readFileSync('src/services/libraryPerformanceService.ts', 'utf8');
if (/from ['"]node:fs['"]|from ['"]fs['"]|readFile\s*\(|readdir\s*\(|absolutePath\s*:/.test(service)) throw new Error('performance service must not access real files or paths');

const output = execFileSync(process.execPath, ['scripts/benchmark-mvp126-large-library.mjs'], { encoding: 'utf8' });
if (!output.includes('PASS') || !output.includes('50000 tracks') || !output.includes('real library access: NO')) throw new Error('benchmark output incomplete');
console.log(output.trim());
console.log('MVP126 large-library performance verifier PASS');
