import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`[MVP-79 FAIL] ${message}`);
  process.exit(1);
};
const requireIncludes = (file, token) => {
  const text = read(file);
  if (!text.includes(token)) fail(`${file} missing token: ${token}`);
};

const requiredFiles = [
  'src/services/playerUiBugfixService.ts',
  'src/components/PlayerBar.tsx',
  'src/components/LyricsPanel.tsx',
  'src/components/DiagnosticsPage.tsx',
  'src/index.css',
  'docs/CURRENT_ROADMAP_MVP79.md',
  'docs/PLAYER_UI_BUGFIX_MVP79.md',
  'scripts/verify-mvp79-player-ui-bugfix.mjs',
  'HANDOFF_MVP78_TO_MVP79.md',
  'PACKAGE_MANIFEST_MVP79_HANDOFF.txt',
];

for (const file of requiredFiles) {
  if (!exists(file)) fail(`missing MVP-79 file: ${file}`);
}

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
if (!['0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93'].includes(pkg.version)) fail(`package version expected 0.117.0-mvp79 or compatible MVP-80, got ${pkg.version}`);
if (!['0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93'].includes(lock.version) || !['0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93'].includes(lock.packages?.['']?.version)) {
  fail('package-lock root version must be 0.117.0-mvp79 or compatible MVP-80');
}
if (!pkg.scripts?.['verify:mvp79-player-ui-bugfix']) fail('missing verify:mvp79-player-ui-bugfix script');
if (!pkg.scripts?.['verify:all']?.includes('verify:mvp79-player-ui-bugfix')) fail('verify:all must include MVP-79 verifier');

const srcFiles = fs.readdirSync(path.join(root, 'src'), { recursive: true })
  .filter((file) => /\.(tsx|ts|css)$/.test(file))
  .map((file) => `src/${file}`);
const forbiddenUtilityTokens = [
  'zinc-850',
  'zinc-750',
  'sky-450',
  'py-0.2',
  'scale-102',
  'scale-103',
  'scale-97',
  'scale-98',
];
for (const file of srcFiles) {
  const text = read(file);
  for (const token of forbiddenUtilityTokens) {
    if (text.includes(token)) fail(`${file} still contains invalid Tailwind token: ${token}`);
  }
}

for (const token of [
  '--animate-bounce-subtle',
  '@keyframes bounceSubtle',
  'translate: 0 -3px',
]) {
  requireIncludes('src/index.css', token);
}

for (const token of [
  'playerUiBugfixService',
  'mvp79-player-ui-bugfix',
  'parseLrcFractionalSeconds',
  'visibleVolumePercent',
  '更多播放操作将在后续版本开放',
  'data-mvp79-player-ui-bugfix="true"',
]) {
  requireIncludes('src/components/PlayerBar.tsx', token);
}
if (read('src/components/PlayerBar.tsx').includes('Toggle full lyrics panel on general bar clicks')) {
  fail('PlayerBar should not keep general root click lyrics toggle');
}
if (read('src/components/PlayerBar.tsx').includes("parseFloat('0.' + match[3])")) {
  fail('PlayerBar must use strict fractional second parsing');
}

for (const token of [
  'playerUiBugfixService',
  'mvp79-lyrics-panel-ui-bugfix',
  'parseLrcFractionalSeconds',
  'sleepClockText',
  'formatSleepClockText',
  'window.setInterval',
  'currentTrack.coverUrl ? { backgroundImage',
]) {
  requireIncludes('src/components/LyricsPanel.tsx', token);
}
if (read('src/components/LyricsPanel.tsx').includes("parseFloat('0.' + match[3])")) {
  fail('LyricsPanel must use strict fractional second parsing');
}
if (read('src/components/LyricsPanel.tsx').includes('scale-102')) {
  fail('LyricsPanel must not use invalid scale-102 class');
}

for (const token of [
  'playerUiBugfixService',
  'mvp79-player-ui-bugfix-diagnostics',
  'mvp79-tailwind-class-normalization',
  'mvp79-player-ui-bugfix-guardrails',
  'mvp79-player-ui-bugfix-marker',
]) {
  requireIncludes('src/components/DiagnosticsPage.tsx', token);
}

for (const token of [
  'PlayerUiBugfixModel',
  'mvp79PlayerUiBugfix',
  '0.117.0-mvp79',
  '不向 Renderer 暴露 absolutePath 或 file://',
]) {
  requireIncludes('src/services/playerUiBugfixService.ts', token);
}

for (const file of ['docs/CURRENT_ROADMAP_MVP79.md', 'docs/PLAYER_UI_BUGFIX_MVP79.md', 'HANDOFF_MVP78_TO_MVP79.md', 'PACKAGE_MANIFEST_MVP79_HANDOFF.txt']) {
  for (const token of ['0.117.0-mvp79', 'MVP-79', '播放器', 'Tailwind', 'More', 'LRC', '不接 SQLite', '不删除 / 移动 / 重命名', 'absolutePath', 'file://']) {
    requireIncludes(file, token);
  }
}

for (const file of ['README.md', 'PROJECT_STATE.md', 'NEXT_CHAT_HANDOFF.md', 'RUN_ME_FIRST.md', 'docs/PROJECT_STATE.md', 'docs/NEXT_CHAT_HANDOFF.md', 'docs/RUN_ME_FIRST.md', '00_NEW_CHAT_START_HERE.md', 'NEW_CHAT_PROMPT.md', 'NEW_CHAT_PROMPT_FULL.md', 'CODEX_MINIMAL_PROMPTS.md']) {
  requireIncludes(file, '0.117.0-mvp79');
  requireIncludes(file, 'MVP-79');
  requireIncludes(file, '播放器 UI bugfix');
}

for (const forbidden of ['better-sqlite3', 'mpv backend', 'ASMR.one metadata fetch', 'DLsite metadata fetch', 'fs.unlink', 'fs.rename', 'fs.rm']) {
  if (read('src/services/playerUiBugfixService.ts').includes(forbidden)) {
    fail(`MVP-79 service should not introduce forbidden token: ${forbidden}`);
  }
}

console.log('MVP-79 player UI bugfix verification passed.');
