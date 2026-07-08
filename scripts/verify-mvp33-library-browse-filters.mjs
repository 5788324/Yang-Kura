import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

const pkg = JSON.parse(read('package.json'));
const app = read('src/App.tsx');
const asmr = read('src/components/AsmrLibrary.tsx');
const service = read('src/services/libraryBrowseService.ts');

assert(['0.71.0-mvp33', '0.72.0-mvp34', '0.73.0-mvp35', '0.74.0-mvp36', '0.75.0-mvp37', '0.76.0-mvp38', '0.77.0-mvp39', '0.78.0-mvp40', '0.79.0-mvp41', '0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95'].includes(pkg.version), 'package.json version must be 0.71.0-mvp33');
assert(pkg.scripts?.['verify:mvp33-library-browse-filters'] === 'node scripts/verify-mvp33-library-browse-filters.mjs', 'package.json must expose MVP-33 verifier');
assert((pkg.scripts?.['verify:all'] || '').includes('verify:mvp33-library-browse-filters'), 'verify:all must include MVP-33 verifier');

assert(exists('src/services/libraryBrowseService.ts'), 'libraryBrowseService must exist');
assert(service.includes('WorkSubtitleFilter'), 'browse service must define subtitle filters');
assert(service.includes('WorkPlaybackFilter'), 'browse service must define playback filters');
assert(service.includes('WorkSourceFilter'), 'browse service must define source filters');
assert(service.includes('playbackHistoryService.load'), 'browse service must read playback history');
assert(service.includes('subtitleRelativePaths'), 'browse service must use real subtitle-relative paths');
assert(!service.includes('absolutePath'), 'browse service must not handle absolute paths');
assert(!service.includes('file://'), 'browse service must not handle file URLs');

assert(asmr.includes('sourceFilter'), 'ASMR library must expose source filter');
assert(asmr.includes('subtitleFilter'), 'ASMR library must expose subtitle filter');
assert(asmr.includes('playbackFilter'), 'ASMR library must expose playback filter');
assert(asmr.includes('真实 index 资源') || asmr.includes('本地资源'), 'ASMR library must expose local/real-index source label');
assert(asmr.includes('有字幕'), 'ASMR library must expose subtitle filter label');
assert(asmr.includes('听过 / 未听完'), 'ASMR library must expose playback progress label');
assert(asmr.includes('libraryBrowseService.matchesSourceFilter'), 'ASMR library must filter by source');
assert(asmr.includes('libraryBrowseService.matchesSubtitleFilter'), 'ASMR library must filter by subtitle state');
assert(asmr.includes('libraryBrowseService.matchesPlaybackFilter'), 'ASMR library must filter by playback state');
assert(asmr.includes('libraryBrowseService.getLastPlayedSortValue'), 'ASMR library must sort by real playback history');
assert(asmr.includes('从当前列表移除'), 'dangerous physical delete wording must be removed from ASMR context menu');
assert(!asmr.includes('物理移除此作品'), 'ASMR context menu must not claim physical removal');
assert(!asmr.includes('重新抓取 ASMR.one 元数据'), 'ASMR context menu must not imply real ASMR.one metadata fetch');
assert(asmr.includes('全部社团') && asmr.includes('全部声优') && asmr.includes('全部标签'), 'quick filter modal titles must be Chinese');

assert(app.includes('MVP-33 / 本地播放 / JSON Index') || app.includes('MVP-34 / 播放器体验 / JSON Index') || (app.includes('MVP-35 / 队列持久化 / JSON Index') || (app.includes('MVP-36 / 歌单持久化 / JSON Index') || app.includes('MVP-37 / 本地封面 / JSON Index') || app.includes('本地封面 / 资源库体验') || app.includes('日常播放 / 媒体库体验') || app.includes('详情导航 / 媒体库体验'))), 'app header must show MVP-33 or later state');
assert(exists('docs/CURRENT_ROADMAP_MVP33.md'), 'MVP-33 roadmap doc must exist');
assert(exists('docs/LIBRARY_BROWSE_FILTERS_MVP33.md'), 'MVP-33 browse filters doc must exist');

if (failures.length) {
  console.error('MVP-33 library browse/filter verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('MVP-33 library browse/filter verification PASS');
