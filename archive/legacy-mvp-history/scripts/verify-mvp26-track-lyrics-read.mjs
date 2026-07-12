import fs from 'node:fs';

const requiredFiles = [
  'electron/main.ts',
  'electron/preload.ts',
  'src/types/electron-api.d.ts',
  'src/hooks/useAudioPlayer.ts',
  'src/services/libraryIndexAdapter.ts',
  'src/services/electronTrackLyricsReadMvp26Service.ts',
  'docs/ELECTRON_TRACK_LYRICS_READ_MVP26.md',
  'docs/CURRENT_ROADMAP_MVP26.md',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing required MVP-26 file: ${file}`);
}

const main = fs.readFileSync('electron/main.ts', 'utf8');
const preload = fs.readFileSync('electron/preload.ts', 'utf8');
const types = fs.readFileSync('src/types/electron-api.d.ts', 'utf8');
const hook = fs.readFileSync('src/hooks/useAudioPlayer.ts', 'utf8');
const adapter = fs.readFileSync('src/services/libraryIndexAdapter.ts', 'utf8');
const pkg = fs.readFileSync('package.json', 'utf8');

const requiredSnippets = [
  [main, "ipcMain.handle('yang-kura:lyrics:read-track-lyrics'"],
  [main, 'parseLrcText'],
  [main, 'parseSrtOrVttText'],
  [main, 'parseAssText'],
  [main, 'absolutePathReturned: false'],
  [main, 'fileUrlReturned: false'],
  [preload, 'requestReadTrackLyrics'],
  [types, 'YangKuraReadTrackLyricsRequest'],
  [types, 'mvp26-track-lyrics-read-complete'],
  [hook, 'requestReadTrackLyrics'],
  [hook, 'lyricsLoadStatus'],
  [adapter, 'subtitleRelativePaths'],
  [pkg, '0.64.0-mvp26', '0.65.0-mvp27', '0.66.0-mvp28', '0.66.1-mvp28.1', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.70.0-mvp32', '0.71.0-mvp33', '0.72.0-mvp34', '0.73.0-mvp35', '0.74.0-mvp36', '0.75.0-mvp37', '0.76.0-mvp38', '0.77.0-mvp39', '0.78.0-mvp40', '0.79.0-mvp41', '0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68'],
  [pkg, 'verify:mvp26-track-lyrics-read'],
];

for (const [content, snippet] of requiredSnippets) {
  if (!content.includes(snippet)) throw new Error(`Missing MVP-26 snippet: ${snippet}`);
}

const forbiddenMainSnippets = [
  'fs.rm(',
  'fs.unlink(',
  'fs.rename(',
  'child_process',
];
for (const snippet of forbiddenMainSnippets) {
  if (main.includes(snippet)) throw new Error(`MVP-26 must not introduce forbidden mutation/execute API: ${snippet}`);
}

console.log('verify:mvp26-track-lyrics-read PASS');
