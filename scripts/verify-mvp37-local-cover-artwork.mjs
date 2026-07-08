import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

const pkg = JSON.parse(read('package.json'));
const adapter = read('src/services/libraryIndexAdapter.ts');
const coverService = read('src/services/coverArtworkService.ts');
const coverComponent = read('src/components/CoverArtwork.tsx');
const electronMain = read('electron/main.ts');
const app = read('src/App.tsx');
const asmrLibrary = read('src/components/AsmrLibrary.tsx');
const musicLibrary = read('src/components/MusicLibrary.tsx');
const playlistPage = read('src/components/PlaylistPage.tsx');
const dashboard = read('src/components/Dashboard.tsx');
const playerBar = read('src/components/PlayerBar.tsx');
const lyricsPanel = read('src/components/LyricsPanel.tsx');
const types = read('src/types.ts');
const servicesIndex = read('src/services/index.ts');

assert(['0.75.0-mvp37', '0.76.0-mvp38', '0.77.0-mvp39', '0.78.0-mvp40', '0.79.0-mvp41', '0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96'].includes(pkg.version), 'package.json version must be 0.75.0-mvp37 or later compatible MVP-38');
assert(pkg.scripts?.['verify:mvp37-local-cover-artwork'] === 'node scripts/verify-mvp37-local-cover-artwork.mjs', 'package.json must expose MVP-37 verifier');
assert((pkg.scripts?.['verify:all'] || '').includes('verify:mvp37-local-cover-artwork'), 'verify:all must include MVP-37 verifier');

assert(exists('src/services/coverArtworkService.ts'), 'coverArtworkService must exist');
assert(exists('src/components/CoverArtwork.tsx'), 'CoverArtwork component must exist');
assert(coverService.includes('yang-kura-media://cover/'), 'cover service must use tokenized cover protocol');
assert(coverService.includes('normalizeRelativeCoverPath'), 'cover service must normalize cover relative paths');
assert(coverService.includes('makeFallbackCover'), 'cover service must generate local fallback covers');
assert(coverService.includes('data:image/svg+xml'), 'fallback covers must be generated data SVG URLs');
assert(coverComponent.includes('data-cover-source'), 'CoverArtwork must tag direct/tokenized/fallback source type');
assert(coverComponent.includes('onError'), 'CoverArtwork must fall back when image loading fails');

assert(electronMain.includes('resolveSafeCoverPath'), 'electron main must include safe cover path resolver');
assert(electronMain.includes("url.hostname !== 'track' && url.hostname !== 'cover'"), 'yang-kura-media protocol must accept track and cover hosts only');
assert(electronMain.includes('IMAGE_EXTENSIONS.has(extension)'), 'cover resolver must restrict covers to image extensions');
assert(electronMain.includes('pathToFileURL(resolved.absolutePath)'), 'main may fetch files internally but must not return file URLs to renderer');

assert(adapter.includes('coverArtworkService.resolveCollectionCoverUrl'), 'library index adapter must resolve collection covers through coverArtworkService');
assert(adapter.includes('coverArtworkService.buildTokenizedCoverUrl'), 'library index adapter must map local cover relative paths to tokenized cover URLs');
assert(adapter.includes('coverSourceKind'), 'adapter must propagate cover source metadata to UI models');
assert(adapter.includes('coverRelativePath'), 'adapter must propagate cover relative paths without absolute paths');
assert(types.includes('coverSourceKind?'), 'types must include optional coverSourceKind metadata');
assert(types.includes('coverRelativePath?'), 'types must include optional coverRelativePath metadata');
assert(servicesIndex.includes('coverArtworkService'), 'services index must export cover artwork service');

for (const [name, source] of [
  ['AsmrLibrary', asmrLibrary],
  ['MusicLibrary', musicLibrary],
  ['PlaylistPage', playlistPage],
  ['Dashboard', dashboard],
  ['PlayerBar', playerBar],
  ['LyricsPanel', lyricsPanel],
]) {
  assert(source.includes('CoverArtwork'), `${name} must render major cover surfaces through CoverArtwork`);
}
assert(app.includes('MVP-37 / 本地封面 / JSON Index') || app.includes('本地封面 / 资源库体验') || app.includes('日常播放 / 媒体库体验') || app.includes('详情导航 / 媒体库体验'), 'App header must show MVP-37 or later cover-artwork state');
assert(exists('docs/CURRENT_ROADMAP_MVP37.md'), 'MVP-37 roadmap doc must exist');
assert(exists('docs/LOCAL_COVER_ARTWORK_MVP37.md'), 'MVP-37 cover artwork doc must exist');

if (failures.length) {
  console.error('MVP-37 local cover artwork verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('MVP-37 local cover artwork verification PASS');
