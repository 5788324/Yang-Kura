import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const fail = (message) => {
  console.error(`[MVP-88] ${message}`);
  process.exit(1);
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));

assert(['0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96'].includes(pkg.version), `package.json version must be 0.126.0-mvp88 or compatible MVP89, got ${pkg.version}`);
assert(['0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96'].includes(lock.version), `package-lock version must be 0.126.0-mvp88 or compatible MVP89, got ${lock.version}`);
assert(['0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96'].includes(lock.packages?.['']?.version), 'package-lock root package version must be 0.126.0-mvp88 or compatible MVP89');
assert(pkg.scripts?.['verify:mvp88-music-import-readonly-detection'] === 'node scripts/verify-mvp88-music-import-readonly-detection.mjs', 'package.json must expose MVP88 verifier script');
assert(pkg.scripts?.['verify:all']?.includes('verify:mvp88-music-import-readonly-detection'), 'verify:all must include MVP88 verifier');

const requiredFiles = [
  'src/services/musicImportReadOnlyDetectionService.ts',
  'docs/CURRENT_ROADMAP_MVP88.md',
  'docs/MUSIC_IMPORT_READONLY_DETECTION_MVP88.md',
  'HANDOFF_MVP87_TO_MVP88.md',
  'PACKAGE_MANIFEST_MVP88_HANDOFF.txt',
];
for (const file of requiredFiles) assert(exists(file), `missing required file: ${file}`);

const service = read('src/services/musicImportReadOnlyDetectionService.ts');
for (const token of [
  '0.126.0-mvp88',
  'Mvp88MusicImportReadonlyDetectionModel',
  'MusicImportReadonlyDetectionResult',
  'inferArtistAlbumFromFolder',
  'classifyMusicImportRelativePath',
  'isProtectedMusicDownload',
  'buildMusicImportReadonlyPreview',
  'sourceRootToken',
  'sourceDisplayName',
  'relativePaths',
  'music-album',
  'music-singles',
  'mixed',
  'music-tags',
  'ncm',
  'qmc',
  'mflac',
  'ImportTaskContract',
  'MetadataSourceContract',
  'targetRelativeDirectory',
  'overwrite: false',
  'absolutePath',
  'file://',
  'ID3',
  'FLAC',
  'DRM',
  'MVP91',
  'MVP92',
]) {
  assert(service.includes(token), `MVP88 service missing token: ${token}`);
}

const importerPage = read('src/components/ImporterPage.tsx');
for (const token of [
  'musicImportReadOnlyDetectionService',
  'mvp88-music-import-readonly-detection',
  'mvp88-music-import-category-counts',
  'mvp88-music-shape-detection',
  'mvp88-music-detected-import-task',
  'mvp88-music-readonly-file-classification',
  'mvp88-music-metadata-preview',
  'mvp88-music-protected-format-warning',
  'mvp88-music-readonly-guardrails',
]) {
  assert(importerPage.includes(token), `ImporterPage missing token: ${token}`);
}

const diagnostics = read('src/components/DiagnosticsPage.tsx');
for (const token of [
  'musicImportReadOnlyDetectionService',
  'mvp88-music-import-readonly-detection-diagnostics',
  'mvp88-music-detection-rule-cards',
  'mvp88-music-import-category-counts',
  'mvp88-music-readonly-import-task',
  'mvp88-music-readonly-guardrails',
]) {
  assert(diagnostics.includes(token), `DiagnosticsPage missing token: ${token}`);
}

const serviceIndex = read('src/services/index.ts');
for (const token of ['musicImportReadOnlyDetectionService', 'inferArtistAlbumFromFolder', 'MusicImportReadonlyDetectionResult']) {
  assert(serviceIndex.includes(token), `services index missing token: ${token}`);
}

for (const file of requiredFiles) {
  const content = read(file);
  for (const token of ['0.126.0-mvp88', 'MVP-88', '音乐']) {
    assert(content.includes(token), `${file} missing ${token}`);
  }
}

for (const file of ['README.md', 'PROJECT_STATE.md', 'NEXT_CHAT_HANDOFF.md', 'RUN_ME_FIRST.md', 'docs/PROJECT_STATE.md', 'docs/NEXT_CHAT_HANDOFF.md', 'docs/RUN_ME_FIRST.md', '00_NEW_CHAT_START_HERE.md', 'NEW_CHAT_PROMPT.md', 'NEW_CHAT_PROMPT_FULL.md', 'CODEX_MINIMAL_PROMPTS.md']) {
  const content = read(file);
  assert(content.includes('0.126.0-mvp88'), `${file} must mention 0.126.0-mvp88`);
  assert(content.includes('MVP-88'), `${file} must mention MVP-88`);
  assert(content.includes('音乐专辑 / 单曲只读识别') || content.includes('mvp88-music-import-readonly-detection') || content.includes('inferArtistAlbumFromFolder'), `${file} must mention MVP88 music readonly detection`);
}

for (const token of ['fs.unlink(', 'fs.rename(', 'fs.rm(', 'fs.copyFile(', 'better-sqlite3', 'ipcMain.handle("yang-kura:import', 'child_process.spawn', 'fetch(']) {
  assert(!service.includes(token), `MVP88 service introduced implementation-like forbidden token: ${token}`);
  assert(!importerPage.includes(token), `ImporterPage introduced implementation-like forbidden token: ${token}`);
}

console.log('MVP-88 music import readonly detection verification passed.');
