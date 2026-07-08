import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const fail = (message) => {
  console.error(`[MVP-82] ${message}`);
  process.exit(1);
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

const packageJson = JSON.parse(read('package.json'));
assert(['0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96'].includes(packageJson.version), `package.json version must be 0.120.0-mvp82 or compatible MVP-83, got ${packageJson.version}`);

const requiredFiles = [
  'src/services/uiBugSweepService.ts',
  'docs/UI_BUG_SWEEP_MVP82.md',
  'docs/CURRENT_ROADMAP_MVP82.md',
  'docs/DEEPSEEK_REVIEW_RESULT_MVP81.md',
  'HANDOFF_MVP81_TO_MVP82.md',
  'PACKAGE_MANIFEST_MVP82_HANDOFF.txt',
];
for (const file of requiredFiles) assert(exists(file), `missing required file: ${file}`);

const srcFiles = [];
function collect(dir) {
  for (const item of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = path.join(dir, item.name);
    if (item.isDirectory()) collect(rel);
    else if (/\.(ts|tsx|css)$/.test(item.name)) srcFiles.push(rel);
  }
}
collect('src');

const forbiddenUtilities = [
  'zinc-850',
  'zinc-750',
  'sky-450',
  'py-0.2',
  'scale-102',
  'scale-103',
  'scale-104',
  'scale-97',
  'scale-98',
  'bg-white/2',
];
for (const file of srcFiles) {
  const content = read(file);
  for (const token of forbiddenUtilities) {
    assert(!content.includes(token), `forbidden Tailwind utility token remains in ${file}: ${token}`);
  }
}

const indexCss = read('src/index.css');
assert(indexCss.includes('--animate-scale-up'), 'index.css must define animate-scale-up theme token');
assert(indexCss.includes('@keyframes scaleUp'), 'index.css must define scaleUp keyframes');
assert(indexCss.includes('--animate-bounce-subtle'), 'index.css must keep animate-bounce-subtle');

const dashboard = read('src/components/Dashboard.tsx');
assert(dashboard.includes("return '--:--';"), 'Dashboard formatDuration must guard invalid duration');
const asmrLibrary = read('src/components/AsmrLibrary.tsx');
assert(asmrLibrary.includes("return '未统计';"), 'AsmrLibrary formatTotalDuration must guard invalid duration');
assert(asmrLibrary.includes('group-hover:scale-105'), 'AsmrLibrary cover hover scale must use valid scale-105');
const musicLibrary = read('src/components/MusicLibrary.tsx');
assert(musicLibrary.includes('group-hover:scale-105'), 'MusicLibrary album hover scale must use valid scale-105');
const lyricsPanel = read('src/components/LyricsPanel.tsx');
assert(lyricsPanel.includes('const progressPercent = totalDuration > 0 ? clamp((currentDisplayProgress / totalDuration) * 100, 0, 100) : 0;'), 'LyricsPanel progressPercent must remain clamped');
assert(lyricsPanel.includes("return '--:--';"), 'LyricsPanel formatTime must guard invalid duration');

const diagnostics = read('src/components/DiagnosticsPage.tsx');
assert(diagnostics.includes('mvp82-ui-bug-sweep'), 'DiagnosticsPage must expose MVP82 marker');
assert(diagnostics.includes('mvp82-ui-bug-sweep-fixes'), 'DiagnosticsPage must expose MVP82 fixes marker');

const packageText = JSON.stringify(packageJson);
assert(packageText.includes('mvp82UiBugSweep'), 'package.json must record mvp82UiBugSweep note');

const forbiddenScope = ['better-sqlite3', 'sqlite3', 'ASMR.one fetch', 'DLsite fetch', 'mpv backend', 'fs.unlink', 'fs.rename', 'fs.rm('];
for (const token of forbiddenScope) {
  assert(!packageText.includes(token), `package.json must not add forbidden scope token: ${token}`);
}

console.log('MVP-82 UI bug sweep verification passed.');
