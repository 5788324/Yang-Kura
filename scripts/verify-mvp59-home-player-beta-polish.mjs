import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const packageJson = JSON.parse(read('package.json'));
const packageLock = JSON.parse(read('package-lock.json'));

const requiredFiles = [
  'src/services/homePlayerBetaPolishService.ts',
  'src/components/Dashboard.tsx',
  'src/components/PlayerBar.tsx',
  'src/components/LyricsPanel.tsx',
  'src/components/DiagnosticsPage.tsx',
  'src/services/index.ts',
  'docs/CURRENT_ROADMAP_MVP59.md',
  'docs/HOME_PLAYER_BETA_POLISH_MVP59.md',
  'scripts/verify-mvp59-home-player-beta-polish.mjs',
  'HANDOFF_MVP58_TO_MVP59.md',
  'PACKAGE_MANIFEST_MVP59_HANDOFF.txt',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing MVP-59 file: ${file}`);
}

if (!['0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(packageJson.version)) {
  throw new Error(`Expected version 0.97.0-mvp59 or compatible MVP-60, got ${packageJson.version}`);
}
if (!['0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(packageLock.version) || !['0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(packageLock.packages?.['']?.version)) {
  throw new Error('package-lock root version must be 0.97.0-mvp59 or compatible MVP-60');
}
if (!packageJson.scripts?.['verify:mvp59-home-player-beta-polish']) {
  throw new Error('Missing verify:mvp59-home-player-beta-polish script');
}
if (!packageJson.scripts?.['verify:all']?.includes('verify:mvp59-home-player-beta-polish')) {
  throw new Error('verify:all must include MVP-59 verifier');
}

const service = read('src/services/homePlayerBetaPolishService.ts');
for (const token of [
  'homePlayerBetaPolishService',
  'getDashboardModel',
  'getPlayerBarModel',
  'getLyricsPanelModel',
  'getDiagnosticsModel',
  '首页与播放器最终 Beta 视觉小修',
  '不向 Renderer 暴露 absolutePath 或 file://',
]) {
  if (!service.includes(token)) throw new Error(`homePlayerBetaPolishService missing token: ${token}`);
}
for (const forbidden of ['fs.unlink', 'fs.rename', 'fs.rm', 'child_process', 'sqlite3', 'better-sqlite3']) {
  if (service.includes(forbidden)) throw new Error(`MVP-59 service should not introduce forbidden token: ${forbidden}`);
}

const dashboard = read('src/components/Dashboard.tsx');
for (const token of [
  'homePlayerBetaPolishService',
  'mvp59-home-beta-polish',
  'mvp59HomeBeta.chips',
  'Beta 首页收口',
]) {
  if (!dashboard.includes(token)) throw new Error(`Dashboard missing MVP-59 token: ${token}`);
}

const playerBar = read('src/components/PlayerBar.tsx');
for (const token of [
  'homePlayerBetaPolishService',
  'mvp59-player-compact-strip',
  'mvp59-player-empty-hint',
  'mvp59-player-beta-chips',
  'mvp59PlayerBeta.compactLine',
]) {
  if (!playerBar.includes(token)) throw new Error(`PlayerBar missing MVP-59 token: ${token}`);
}

const lyrics = read('src/components/LyricsPanel.tsx');
for (const token of [
  'homePlayerBetaPolishService',
  'mvp59-lyrics-copy-polish',
  'mvp59LyricsBeta.focusLine',
  'mvp59LyricsBeta.emptyDescription',
]) {
  if (!lyrics.includes(token)) throw new Error(`LyricsPanel missing MVP-59 token: ${token}`);
}

const diagnostics = read('src/components/DiagnosticsPage.tsx');
for (const token of [
  'homePlayerBetaPolishService',
  'mvp59-home-player-beta-polish',
  'mvp59HomePlayerBeta.summary',
  '首页与播放器最终 Beta 视觉小修',
]) {
  if (!diagnostics.includes(token)) throw new Error(`DiagnosticsPage missing MVP-59 token: ${token}`);
}

const serviceIndex = read('src/services/index.ts');
for (const token of ['homePlayerBetaPolishService', 'HomePlayerBetaDashboardModel', 'HomePlayerBetaDiagnosticsModel']) {
  if (!serviceIndex.includes(token)) throw new Error(`services/index.ts missing MVP-59 export token: ${token}`);
}

const docs = read('docs/HOME_PLAYER_BETA_POLISH_MVP59.md');
for (const token of [
  '首页与播放器最终 Beta 视觉小修',
  'mvp59-home-beta-polish',
  'mvp59-player-compact-strip',
  'mvp59-player-empty-hint',
  'mvp59-lyrics-copy-polish',
  'mvp59-home-player-beta-polish',
  '不删除 / 移动 / 重命名',
  'absolutePath',
  'file://',
]) {
  if (!docs.includes(token)) throw new Error(`MVP-59 docs missing token: ${token}`);
}

for (const file of ['README.md','PROJECT_STATE.md','NEXT_CHAT_HANDOFF.md','RUN_ME_FIRST.md','docs/PROJECT_STATE.md','docs/NEXT_CHAT_HANDOFF.md','docs/RUN_ME_FIRST.md','00_NEW_CHAT_START_HERE.md','NEW_CHAT_PROMPT.md','NEW_CHAT_PROMPT_FULL.md','CODEX_MINIMAL_PROMPTS.md']) {
  const content = read(file);
  if (!content.includes('0.97.0-mvp59') && !content.includes('0.98.0-mvp60') && !content.includes('0.99.0-mvp61') && !content.includes('0.100.0-mvp62') && !content.includes('0.101.0-mvp63') && !content.includes('0.102.0-mvp64') && !content.includes('0.103.0-mvp65')) throw new Error(`${file} missing 0.97.0-mvp59`);
  if (!content.includes('MVP-59') && !content.includes('MVP-60') && !content.includes('MVP-61')) throw new Error(`${file} missing MVP-59/MVP-60`);
}

console.log('MVP-59 home/player beta polish verification passed.');
