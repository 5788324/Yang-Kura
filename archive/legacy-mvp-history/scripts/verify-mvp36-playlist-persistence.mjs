import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

const pkg = JSON.parse(read('package.json'));
const app = read('src/App.tsx');
const playlistPage = read('src/components/PlaylistPage.tsx');
const playerBar = read('src/components/PlayerBar.tsx');
const service = read('src/services/playlistPersistenceService.ts');
const servicesIndex = read('src/services/index.ts');
const types = read('src/types.ts');

assert(['0.74.0-mvp36', '0.75.0-mvp37', '0.76.0-mvp38', '0.77.0-mvp39', '0.78.0-mvp40', '0.79.0-mvp41', '0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(pkg.version), 'package.json version must be 0.74.0-mvp36');
assert(pkg.scripts?.['verify:mvp36-playlist-persistence'] === 'node scripts/verify-mvp36-playlist-persistence.mjs', 'package.json must expose MVP-36 verifier');
assert((pkg.scripts?.['verify:all'] || '').includes('verify:mvp36-playlist-persistence'), 'verify:all must include MVP-36 verifier');

assert(exists('src/services/playlistPersistenceService.ts'), 'playlistPersistenceService must exist');
assert(service.includes('yang_kura_user_playlists_v1'), 'playlist service must use stable MVP-36 storage key');
assert(service.includes('sanitizePlaylistTrack'), 'playlist service must sanitize tracks before storage');
assert(service.includes('mediaUrl: undefined'), 'playlist service must remove mediaUrl from persisted tracks');
assert(service.includes('saveFromMergedPlaylists'), 'playlist service must persist user playlists from merged app playlists');
assert(service.includes('hydrateInitialPlaylists'), 'playlist service must hydrate app playlists at startup');
assert(service.includes('loadLegacyUserPlaylists'), 'playlist service must support legacy non-system playlist migration');
assert(!service.includes('absolutePath'), 'playlist service must not persist absolute paths');
assert(!service.includes('file://'), 'playlist service must not persist file URLs');
assert(!service.includes('resolvedMediaUrl'), 'playlist service must not persist resolved media URLs');

assert(types.includes("PlaylistSourceKind = 'system-demo' | 'demo-user' | 'user-local'"), 'types must separate system/demo/user playlist source kinds');
assert(types.includes('sourceKind?: PlaylistSourceKind'), 'Playlist type must include sourceKind');
assert(servicesIndex.includes('playlistPersistenceService'), 'services index must export playlist persistence service');

assert(app.includes('playlistPersistenceService.hydrateInitialPlaylists'), 'App must hydrate playlists through persistence service');
assert(app.includes('playlistPersistenceService.saveFromMergedPlaylists'), 'App must save playlist updates through persistence service');
assert(app.includes('handleCreatePlaylist'), 'App must support creating playlists');
assert(app.includes('handleDeletePlaylist'), 'App must support deleting user playlists');
assert(app.includes('handleRemoveTrackFromPlaylist'), 'App must support removing tracks from user playlists');
assert((app.includes('MVP-36 / 歌单持久化 / JSON Index') || app.includes('MVP-37 / 本地封面 / JSON Index') || app.includes('本地封面 / 资源库体验') || app.includes('日常播放 / 媒体库体验') || app.includes('详情导航 / 媒体库体验')), 'App header must show MVP-36 or later state');

assert(playlistPage.includes('新建歌单'), 'Playlist page must expose Chinese create playlist UI');
assert(playlistPage.includes('保存歌单'), 'Playlist page must expose save playlist action');
assert(playlistPage.includes('不会删除真实文件'), 'Playlist page must explain removing tracks does not delete files');
assert((playlistPage.includes('系统演示') || playlistPage.includes('系统示例')), 'Playlist page must label system demo playlists');
assert((playerBar.includes('系统演示歌单不可修改') || playerBar.includes('系统示例歌单不可修改')), 'Player bar must block edits to system demo playlists');
assert(playerBar.includes('只读'), 'Player bar must mark read-only playlists');

assert(exists('docs/CURRENT_ROADMAP_MVP36.md'), 'MVP-36 roadmap doc must exist');
assert(exists('docs/PLAYLIST_PERSISTENCE_MVP36.md'), 'MVP-36 playlist persistence doc must exist');

if (failures.length) {
  console.error('MVP-36 playlist persistence verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('MVP-36 playlist persistence verification PASS');
