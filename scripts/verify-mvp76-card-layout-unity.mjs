import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`[MVP-76 FAIL] ${message}`);
  process.exit(1);
};
const requireIncludes = (file, token) => {
  const text = read(file);
  if (!text.includes(token)) fail(`${file} missing token: ${token}`);
};

const requiredFiles = [
  'src/services/libraryCardLayoutPolishService.ts',
  'src/components/AsmrLibrary.tsx',
  'src/components/MusicLibrary.tsx',
  'src/components/DiagnosticsPage.tsx',
  'src/services/index.ts',
  'docs/CURRENT_ROADMAP_MVP76.md',
  'docs/LIBRARY_CARD_LAYOUT_UNITY_MVP76.md',
  'scripts/verify-mvp76-card-layout-unity.mjs',
  'HANDOFF_MVP75_TO_MVP76.md',
  'PACKAGE_MANIFEST_MVP76_HANDOFF.txt',
];

for (const file of requiredFiles) {
  if (!exists(file)) fail(`missing MVP-76 file: ${file}`);
}

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const compatibleVersions = ['0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'];
if (!compatibleVersions.includes(pkg.version)) fail(`package version expected 0.114.0-mvp76 or compatible MVP-77, got ${pkg.version}`);
if (!compatibleVersions.includes(lock.version) || !compatibleVersions.includes(lock.packages?.['']?.version)) {
  fail('package-lock root version must be 0.114.0-mvp76 or compatible MVP-77');
}
if (!pkg.scripts?.['verify:mvp76-card-layout-unity']) fail('missing verify:mvp76-card-layout-unity script');
if (!pkg.scripts?.['verify:all']?.includes('verify:mvp76-card-layout-unity')) fail('verify:all must include MVP-76 verifier');

for (const token of [
  'libraryCardLayoutPolishService',
  'Mvp76AsmrCardLayoutModel',
  'Mvp76MusicCardLayoutModel',
  'Mvp76DiagnosticsLayoutModel',
  'mvp76-card-layout-unity',
  'aspect-square',
  'line-clamp',
  'min-w-0',
  'flex-wrap',
  '不接 SQLite',
  '不删除、移动、重命名真实媒体文件',
  'absolutePath',
  'file://',
]) {
  requireIncludes('src/services/libraryCardLayoutPolishService.ts', token);
}

for (const token of [
  'libraryCardLayoutPolishService',
  'mvp76CardLayout',
  'mvp76-asmr-card-layout-unity',
  'mvp76-card-layout-unity',
  'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4',
  'aspect-square',
  'line-clamp-2',
  'min-w-0',
  'flex-wrap',
]) {
  requireIncludes('src/components/AsmrLibrary.tsx', token);
}

for (const token of [
  'libraryCardLayoutPolishService',
  'mvp76CardLayout',
  'mvp76-music-track-layout-unity',
  'mvp76-music-card-layout-unity',
  'mvp76-card-layout-unity',
  'flex-col sm:flex-row',
  'w-full sm:w-auto',
  'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4',
  'line-clamp-2',
  'min-h-[32px]',
]) {
  requireIncludes('src/components/MusicLibrary.tsx', token);
}

for (const token of [
  'libraryCardLayoutPolishService',
  'mvp76CardLayoutDiagnostics',
  'mvp76-card-layout-unity',
  'mvp76-card-layout-checks',
  'mvp76-card-layout-guardrails',
]) {
  requireIncludes('src/components/DiagnosticsPage.tsx', token);
}

for (const token of [
  'libraryCardLayoutPolishService',
  'Mvp76AsmrCardLayoutModel',
  'Mvp76MusicCardLayoutModel',
  'Mvp76DiagnosticsLayoutModel',
]) {
  requireIncludes('src/services/index.ts', token);
}

for (const file of ['docs/CURRENT_ROADMAP_MVP76.md', 'docs/LIBRARY_CARD_LAYOUT_UNITY_MVP76.md', 'HANDOFF_MVP75_TO_MVP76.md', 'PACKAGE_MANIFEST_MVP76_HANDOFF.txt']) {
  for (const token of ['0.114.0-mvp76', 'MVP-76', '卡片', '布局', '音声库', '音乐库', '不接 SQLite', '不删除 / 移动 / 重命名', 'absolutePath', 'file://']) {
    requireIncludes(file, token);
  }
}

for (const file of ['README.md', 'PROJECT_STATE.md', 'NEXT_CHAT_HANDOFF.md', 'RUN_ME_FIRST.md', 'docs/PROJECT_STATE.md', 'docs/NEXT_CHAT_HANDOFF.md', 'docs/RUN_ME_FIRST.md', '00_NEW_CHAT_START_HERE.md', 'NEW_CHAT_PROMPT.md', 'NEW_CHAT_PROMPT_FULL.md', 'CODEX_MINIMAL_PROMPTS.md']) {
  requireIncludes(file, 'MVP-76');
}

for (const forbidden of ['fs.unlink', 'fs.rename', 'fs.rm', 'child_process', 'better-sqlite3', 'mpv backend']) {
  if (read('src/services/libraryCardLayoutPolishService.ts').includes(forbidden)) {
    fail(`MVP-76 service should not introduce forbidden token: ${forbidden}`);
  }
}

console.log('MVP-76 library card layout unity verification passed.');
