#!/usr/bin/env node
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const failures = [];
const requiredFiles = [
  'src/features/library/MusicLibraryPage.tsx',
  'src/styles/music-library.css',
  'src/styles/music-library-track-row.css',
  'src/app/AppRouter.tsx',
  'src/main.tsx',
  'scripts/test-u32-ui-audit.mjs',
  'PROJECT_STATE.md',
  'PROJECT_ROADMAP.md',
  'AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md',
  'AI_HANDOFF/WORKLOG.md',
  'docs/architecture/U37_EXECUTION_PLAN.md',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) failures.push(`missing U37-D file: ${file}`);
}
if (fs.existsSync('src/components/MusicLibrary.tsx')) failures.push('legacy MusicLibrary.tsx remains after production migration');

function requireIncludes(label, source, markers) {
  for (const marker of markers) {
    if (!source.includes(marker)) failures.push(`${label} missing: ${marker}`);
  }
}

if (failures.length === 0) {
  const page = read('src/features/library/MusicLibraryPage.tsx');
  const styles = read('src/styles/music-library.css');
  const trackRowStyles = read('src/styles/music-library-track-row.css');
  const router = read('src/app/AppRouter.tsx');
  const main = read('src/main.tsx');
  const audit = read('scripts/test-u32-ui-audit.mjs');
  const state = read('PROJECT_STATE.md');
  const roadmap = read('PROJECT_ROADMAP.md');
  const handoff = read('AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md');
  const worklog = read('AI_HANDOFF/WORKLOG.md');
  const plan = read('docs/architecture/U37_EXECUTION_PLAN.md');

  requireIncludes('MusicLibraryPage', page, [
    'data-u37d-music-library=',
    "['tracks', '歌曲', ListMusic]",
    "['albums', '专辑', Disc3]",
    "['artists', '艺术家', UserRound]",
    "['folders', '文件夹', Folder]",
    '<MediaCard',
    '<TrackRow',
    '批量加入队列',
    '全选当前结果',
    '仅看收藏',
    'requestOpenExternalFile',
    'requestOpenInFileManager',
    '<MusicMetadataManagementPanel',
    'libraryPerformanceService.getRenderWindowModel',
  ]);

  for (const marker of [
    'data-u37d-detail={detail.kind}',
    "setDetail({ kind: 'album'",
    "setDetail({ kind: 'artist'",
    "setDetail({ kind: 'folder'",
    '播放全部',
    '全部加入队列',
  ]) {
    if (!page.includes(marker)) failures.push(`MusicLibraryPage detail contract missing: ${marker}`);
  }

  if (/absolutePath\s*[:=]/.test(page)) failures.push('MusicLibraryPage must not expose absolute path fields');
  if (/(?:src|href|url)\s*=\s*["']file:\/\//i.test(page) || /["']file:\/\/[^"']+["']/.test(page)) {
    failures.push('MusicLibraryPage must not embed file URLs');
  }
  if (/mvp\d+/i.test(page)) failures.push('MusicLibraryPage must not add historical MVP anchors');

  requireIncludes('AppRouter', router, [
    "const MusicLibrary = lazy(() => import('../features/library/MusicLibraryPage'));",
    '<MusicLibrary',
  ]);
  if (router.includes("import('../components/MusicLibrary')")) failures.push('AppRouter still routes to the legacy music library');

  requireIncludes('renderer entry', main, [
    "import './styles/music-library.css';",
    "import './styles/music-library-track-row.css';",
  ]);
  requireIncludes('music-library.css', styles, [
    '.u37d-music-library {',
    '.u37d-toolbar {',
    '.u37d-collection-grid {',
    '.u37d-detail-hero {',
    '.u37d-track-list {',
    '@media (max-width: 620px)',
    '@media (prefers-reduced-motion: reduce)',
  ]);
  requireIncludes('music-library-track-row.css', trackRowStyles, [
    '.u37d-track-list .yk-track-row__copy {',
    'display: grid;',
    '.u37d-track-list .yk-track-row__subtitle {',
    'margin-top: 0;',
  ]);
  if (/#[0-9a-f]{3,8}/i.test(styles + trackRowStyles)) failures.push('U37-D styles must use semantic tokens instead of hard-coded colors');

  requireIncludes('U32 Electron audit', audit, [
    '[data-u37d-music-library=\\"tracks\\"]',
    'U37-D music track list renders seeded tracks',
    'music batch queue state',
    '[data-u37d-detail=\\"album\\"]',
    '[data-u37d-detail=\\"artist\\"]',
    '[data-u37d-detail=\\"folder\\"]',
    'favorite-only track filter',
    'narrow music library',
  ]);

  requireIncludes('PROJECT_STATE.md', state, [
    'U37-D：音乐库与详情 UI 完成',
    '当前任务：发布 0.169.0 Beta 2 个人日用版',
  ]);
  requireIncludes('PROJECT_ROADMAP.md', roadmap, [
    'U37-D：完成',
    '当前任务：发布 0.169.0 Beta 2 个人日用版',
  ]);
  requireIncludes('CURRENT_PROJECT_HANDOFF.md', handoff, [
    'U37-D：完成',
    '当前任务：发布 0.169.0 Beta 2 个人日用版',
  ]);
  requireIncludes('WORKLOG.md', worklog, [
    '### U37-D — 音乐库与详情 UI',
    '当前任务：发布 0.169.0 Beta 2 个人日用版',
  ]);
  requireIncludes('U37 execution plan', plan, [
    '### U37-D：音乐库、专辑与艺术家详情 — 已完成',
    'U37 状态：全部完成',
  ]);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('U37-D production music library and collection details PASS');
