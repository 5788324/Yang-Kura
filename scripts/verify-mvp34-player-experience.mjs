import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

const pkg = JSON.parse(read('package.json'));
const types = read('src/types.ts');
const hook = read('src/hooks/useAudioPlayer.ts');
const app = read('src/App.tsx');
const playerBar = read('src/components/PlayerBar.tsx');
const lyricsPanel = read('src/components/LyricsPanel.tsx');
const service = read('src/services/playerExperienceService.ts');

assert(['0.72.0-mvp34', '0.73.0-mvp35', '0.74.0-mvp36', '0.75.0-mvp37', '0.76.0-mvp38', '0.77.0-mvp39', '0.78.0-mvp40', '0.79.0-mvp41', '0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(pkg.version), '0.73.0-mvp35', 'package.json version must be 0.72.0-mvp34 or later compatible MVP-35');
assert(pkg.scripts?.['verify:mvp34-player-experience'] === 'node scripts/verify-mvp34-player-experience.mjs', 'package.json must expose MVP-34 verifier');
assert((pkg.scripts?.['verify:all'] || '').includes('verify:mvp34-player-experience'), 'verify:all must include MVP-34 verifier');

assert(exists('src/services/playerExperienceService.ts'), 'playerExperienceService must exist');
assert(service.includes('PlaybackCompletionMode'), 'player experience service must use playback completion type');
assert(service.includes('stop-after-track'), 'player experience service must include stop-after-track mode');
assert(service.includes('stop-after-work'), 'player experience service must include stop-after-work mode');
assert(service.includes('shouldStopAtTrackEnd'), 'player experience service must define end-of-track policy helper');
assert(!service.includes('absolutePath'), 'player experience service must not handle absolute paths');
assert(!service.includes('file://'), 'player experience service must not handle file URLs');

assert(types.includes('PlaybackCompletionMode'), 'types must define PlaybackCompletionMode');
assert(types.includes('playCompletionMode'), 'PlayerState must include playCompletionMode');

assert(hook.includes('handleToggleCompletionMode'), 'audio hook must expose completion mode toggle');
assert(hook.includes('playerExperienceService.shouldStopAtTrackEnd'), 'audio hook must apply end-of-track policy');
assert(hook.includes("playCompletionMode: 'continue-queue'"), 'audio hook must default to continue-queue');

assert(app.includes('handleToggleCompletionMode'), 'App must pass completion mode toggle into player surfaces');
assert(app.includes('MVP-34 / 播放器体验 / JSON Index') || (app.includes('MVP-35 / 队列持久化 / JSON Index') || (app.includes('MVP-36 / 歌单持久化 / JSON Index') || app.includes('MVP-37 / 本地封面 / JSON Index') || app.includes('本地封面 / 资源库体验') || app.includes('日常播放 / 媒体库体验') || app.includes('详情导航 / 媒体库体验'))), 'App header must show MVP-34 or later state');

assert(playerBar.includes('playerExperienceService.getSummary'), 'PlayerBar must use player experience summary');
assert(playerBar.includes('toggleCompletionMode'), 'PlayerBar must expose completion mode toggle');
assert(playerBar.includes('播放策略') || playerBar.includes('列表续播') || playerBar.includes('播完当前轨停止'), 'PlayerBar must show user-facing play strategy');
assert(playerBar.includes('跳转预览'), 'PlayerBar seek tooltip should be Chinese');
assert(!playerBar.includes('Seek Preview'), 'PlayerBar must not show English seek preview copy');
assert(!playerBar.includes('DESKTOP LYRICS SYNCING'), 'PlayerBar must not show English desktop-lyrics copy');
assert(!playerBar.includes('VIP'), 'PlayerBar must not show fake VIP badge');
assert(!playerBar.includes('10W+'), 'PlayerBar must not show fake like-count residue');

assert(lyricsPanel.includes('toggleCompletionMode'), 'LyricsPanel must expose completion mode toggle');
assert(lyricsPanel.includes('playerExperienceService.getSummary'), 'LyricsPanel must use player experience summary');
assert(lyricsPanel.includes('睡眠定时器'), 'LyricsPanel must keep sleep timer entry');
assert(lyricsPanel.includes('睡前低亮度屏保'), 'LyricsPanel must keep bedtime dim mode entry');
assert(!lyricsPanel.includes('DESKTOP LYRICS SYNCING'), 'LyricsPanel must not show English desktop lyrics copy');
assert(!lyricsPanel.includes('无损 Hi-Res FLAC | Stereo | 24bit'), 'LyricsPanel must not claim fixed Hi-Res FLAC capability');

assert(exists('docs/CURRENT_ROADMAP_MVP34.md'), 'MVP-34 roadmap doc must exist');
assert(exists('docs/PLAYER_EXPERIENCE_MVP34.md'), 'MVP-34 player experience doc must exist');

if (failures.length) {
  console.error('MVP-34 player experience verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('MVP-34 player experience verification PASS');
