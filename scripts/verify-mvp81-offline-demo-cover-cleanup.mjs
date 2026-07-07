import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`[MVP-81 FAIL] ${message}`);
  process.exit(1);
};
const requireIncludes = (file, token) => {
  const text = read(file);
  if (!text.includes(token)) fail(`${file} missing token: ${token}`);
};

const requiredFiles = [
  'src/services/offlineDemoCoverCleanupService.ts',
  'src/mockData.ts',
  'src/components/DownloaderPage.tsx',
  'src/components/DiagnosticsPage.tsx',
  'src/App.tsx',
  'src/services/playlistPersistenceService.ts',
  'docs/CURRENT_ROADMAP_MVP81.md',
  'docs/OFFLINE_DEMO_COVER_CLEANUP_MVP81.md',
  'scripts/verify-mvp81-offline-demo-cover-cleanup.mjs',
  'HANDOFF_MVP80_TO_MVP81.md',
  'PACKAGE_MANIFEST_MVP81_HANDOFF.txt',
];

for (const file of requiredFiles) {
  if (!exists(file)) fail(`missing MVP-81 file: ${file}`);
}

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const compatibleVersions = ['0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'];
if (!compatibleVersions.includes(pkg.version)) fail(`package version must be 0.119.0-mvp81 or later compatible MVP-82, got ${pkg.version}`);
if (!compatibleVersions.includes(lock.version) || !compatibleVersions.includes(lock.packages?.['']?.version)) {
  fail('package-lock root version must be 0.119.0-mvp81 or later compatible MVP-82');
}
if (!pkg.scripts?.['verify:mvp81-offline-demo-cover-cleanup']) fail('missing verify:mvp81-offline-demo-cover-cleanup script');
if (!pkg.scripts?.['verify:all']?.includes('verify:mvp81-offline-demo-cover-cleanup')) fail('verify:all must include MVP-81 verifier');

const srcFiles = fs.readdirSync(path.join(root, 'src'), { recursive: true })
  .filter((file) => /\.(tsx|ts|css)$/.test(file))
  .map((file) => `src/${file}`);

for (const file of srcFiles) {
  const text = read(file);
  if (text.includes('images.unsplash.com')) fail(`${file} still contains Unsplash remote image URL`);
}

for (const token of [
  'coverArtworkService.makeFallbackCover',
  'MVP-81: demo covers are generated local SVG data URLs',
]) {
  requireIncludes('src/mockData.ts', token);
}

for (const file of ['src/components/DownloaderPage.tsx', 'src/components/DiagnosticsPage.tsx', 'src/App.tsx', 'src/services/playlistPersistenceService.ts']) {
  requireIncludes(file, 'coverArtworkService.makeFallbackCover');
}

for (const token of [
  'offlineDemoCoverCleanupService',
  'Mvp81OfflineDemoCoverCleanupModel',
  '0.119.0-mvp81',
  '不向 Renderer 暴露 absolutePath',
  '不向 Renderer 暴露 file://',
]) {
  requireIncludes('src/services/offlineDemoCoverCleanupService.ts', token);
}

for (const token of [
  'offlineDemoCoverCleanupService',
  'mvp81-offline-demo-cover-cleanup',
  'mvp81-offline-cover-checks',
  'mvp81-offline-cover-guardrails',
  '离线封面清扫',
]) {
  requireIncludes('src/components/DiagnosticsPage.tsx', token);
}

for (const token of [
  "export { offlineDemoCoverCleanupService }",
  'Mvp81OfflineDemoCoverCleanupModel',
]) {
  requireIncludes('src/services/index.ts', token);
}

for (const file of ['docs/CURRENT_ROADMAP_MVP81.md', 'docs/OFFLINE_DEMO_COVER_CLEANUP_MVP81.md', 'HANDOFF_MVP80_TO_MVP81.md', 'PACKAGE_MANIFEST_MVP81_HANDOFF.txt']) {
  for (const token of ['0.119.0-mvp81', 'MVP-81', '离线', 'Unsplash', '不接 SQLite', 'absolutePath', 'file://']) {
    requireIncludes(file, token);
  }
}

for (const file of ['README.md', 'PROJECT_STATE.md', 'NEXT_CHAT_HANDOFF.md', 'RUN_ME_FIRST.md', 'docs/PROJECT_STATE.md', 'docs/NEXT_CHAT_HANDOFF.md', 'docs/RUN_ME_FIRST.md', '00_NEW_CHAT_START_HERE.md', 'NEW_CHAT_PROMPT.md', 'NEW_CHAT_PROMPT_FULL.md', 'CODEX_MINIMAL_PROMPTS.md']) {
  requireIncludes(file, '0.120.0-mvp82');
  requireIncludes(file, 'MVP-82');
}

const service = read('src/services/offlineDemoCoverCleanupService.ts');
for (const forbidden of ['fetch(', 'axios', 'XMLHttpRequest', 'fs.unlink', 'fs.rename', 'fs.rm', 'better-sqlite3', 'mpv backend']) {
  if (service.includes(forbidden)) fail(`MVP-81 service introduced forbidden token: ${forbidden}`);
}

console.log('MVP-81 offline demo cover cleanup verification passed.');
