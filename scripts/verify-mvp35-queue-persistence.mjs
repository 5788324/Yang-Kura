import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

const pkg = JSON.parse(read('package.json'));
const hook = read('src/hooks/useAudioPlayer.ts');
const app = read('src/App.tsx');
const service = read('src/services/playerQueuePersistenceService.ts');
const servicesIndex = read('src/services/index.ts');

assert(['0.73.0-mvp35', '0.74.0-mvp36', '0.75.0-mvp37', '0.76.0-mvp38', '0.77.0-mvp39', '0.78.0-mvp40', '0.79.0-mvp41', '0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96'].includes(pkg.version), 'package.json version must be 0.73.0-mvp35 or later compatible MVP-36');
assert(pkg.scripts?.['verify:mvp35-queue-persistence'] === 'node scripts/verify-mvp35-queue-persistence.mjs', 'package.json must expose MVP-35 verifier');
assert((pkg.scripts?.['verify:all'] || '').includes('verify:mvp35-queue-persistence'), 'verify:all must include MVP-35 verifier');

assert(exists('src/services/playerQueuePersistenceService.ts'), 'playerQueuePersistenceService must exist');
assert(service.includes('yang_kura_player_queue_v1'), 'queue persistence service must use stable storage key');
assert(service.includes('PersistedPlayerQueueSnapshot'), 'queue persistence service must define snapshot type');
assert(service.includes('sanitizeTrackForQueue'), 'queue persistence service must sanitize tracks before storage');
assert(service.includes('mediaUrl: undefined'), 'queue persistence service must remove per-track mediaUrl');
assert(service.includes('playCompletionMode'), 'queue persistence service must persist playback completion strategy');
assert(service.includes('currentIndex'), 'queue persistence service must persist current queue index');
assert(service.includes('volume'), 'queue persistence service must persist volume state');
assert(!service.includes('absolutePath'), 'queue persistence service must not store absolute paths');
assert(!service.includes('file://'), 'queue persistence service must not store file URLs');
assert(!service.includes('resolvedMediaUrl'), 'queue persistence service must not store resolved media URLs');

assert(servicesIndex.includes('playerQueuePersistenceService'), 'services index must export queue persistence service');
assert(hook.includes('playerQueuePersistenceService.getInitialPlayerState'), 'audio hook must restore queue state on startup');
assert(hook.includes('playerQueuePersistenceService.saveFromPlayerState'), 'audio hook must save queue state');
assert(hook.includes('playerQueuePersistenceService.clear'), 'audio hook must clear persisted queue when queue is empty');
assert(hook.includes("playbackMode === 'idle'"), 'audio hook must keep restored queue idle until user resumes playback');
assert(hook.includes('getSaveSignature'), 'audio hook must avoid blind queue persistence writes');

assert((app.includes('MVP-35 / 队列持久化 / JSON Index') || (app.includes('MVP-36 / 歌单持久化 / JSON Index') || app.includes('MVP-37 / 本地封面 / JSON Index') || app.includes('本地封面 / 资源库体验') || app.includes('日常播放 / 媒体库体验') || app.includes('详情导航 / 媒体库体验'))), 'App header must show MVP-35 state');
assert(app.includes('handlePlayTrack(track, playerState.queue)'), 'queue drawer track click must preserve the full queue');
assert(app.includes('队列会保存在本机') || app.includes('队列会在本机保存'), 'queue drawer must explain persisted queue behavior');
assert(app.includes('不会保存媒体链接或真实文件路径') || app.includes('不保存真实路径或媒体链接'), 'queue drawer must explain safe persistence boundary');

assert(exists('docs/CURRENT_ROADMAP_MVP35.md'), 'MVP-35 roadmap doc must exist');
assert(exists('docs/QUEUE_PERSISTENCE_MVP35.md'), 'MVP-35 queue persistence doc must exist');

if (failures.length) {
  console.error('MVP-35 queue persistence verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('MVP-35 queue persistence verification PASS');
