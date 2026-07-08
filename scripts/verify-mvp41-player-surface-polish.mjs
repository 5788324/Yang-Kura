import fs from 'node:fs';

const requiredFiles = [
  'src/services/playerSurfaceExperienceService.ts',
  'src/components/LyricsPanel.tsx',
  'src/components/PlayerBar.tsx',
  'docs/CURRENT_ROADMAP_MVP41.md',
  'docs/PLAYER_SURFACE_POLISH_MVP41.md',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing MVP-41 file: ${file}`);
  }
}

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!['0.79.0-mvp41', '0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95'].includes(packageJson.version)) {
  throw new Error(`Expected version 0.79.0-mvp41 or later compatible MVP-42, got ${packageJson.version}`);
}
if (!packageJson.scripts?.['verify:mvp41-player-surface-polish']) {
  throw new Error('Missing verify:mvp41-player-surface-polish script');
}
if (!packageJson.scripts?.['verify:all']?.includes('verify:mvp41-player-surface-polish')) {
  throw new Error('verify:all does not include MVP-41 verifier');
}

const service = fs.readFileSync('src/services/playerSurfaceExperienceService.ts', 'utf8');
for (const token of ['getSummary', 'modeDescription', 'sourceHint', 'lyricHint', 'footerStatus', 'getChips', 'getStats']) {
  if (!service.includes(token)) {
    throw new Error(`playerSurfaceExperienceService missing ${token}`);
  }
}
for (const forbidden of ['absolutePath', 'file://', 'fs.unlink', 'fs.rename', 'fs.rm', 'child_process', 'ASMR.one', 'DLsite']) {
  if (service.includes(forbidden)) {
    throw new Error(`MVP-41 service should not introduce forbidden token: ${forbidden}`);
  }
}

const lyrics = fs.readFileSync('src/components/LyricsPanel.tsx', 'utf8');
for (const token of ['mvp41-player-surface-chips', 'mvp41-player-surface-stats', 'playerSurfaceExperienceService', 'playerSurfaceSummary.footerStatus']) {
  if (!lyrics.includes(token)) {
    throw new Error(`LyricsPanel missing MVP-41 token: ${token}`);
  }
}
for (const stale of ['ASMR Direct Audio 24bit', '本音频暂时无歌词字幕数据', '感官标记']) {
  if (lyrics.includes(stale)) {
    throw new Error(`LyricsPanel still contains stale player copy: ${stale}`);
  }
}

const playerBar = fs.readFileSync('src/components/PlayerBar.tsx', 'utf8');
if (!playerBar.includes('歌词浮窗同步')) {
  throw new Error('PlayerBar should use 歌词浮窗同步 copy');
}
for (const stale of ['桌面歌词同步', '桌面悬浮歌词开关', 'DESKTOP LYRICS']) {
  if (playerBar.includes(stale)) {
    throw new Error(`PlayerBar still contains stale floating-lyrics copy: ${stale}`);
  }
}

console.log('MVP-41 player surface polish verification passed.');
