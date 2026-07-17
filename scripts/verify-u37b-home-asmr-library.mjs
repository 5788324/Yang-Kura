#!/usr/bin/env node
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const failures = [];
const requiredFiles = [
  'src/features/library/HomeLibraryPage.tsx',
  'src/features/library/AsmrLibraryPage.tsx',
  'src/styles/library-pages.css',
  'src/app/AppRouter.tsx',
  'src/main.tsx',
  'scripts/test-u32-ui-audit.mjs',
  'PROJECT_STATE.md',
  'AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md',
  'AI_HANDOFF/WORKLOG.md',
  'docs/architecture/U37_EXECUTION_PLAN.md',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) failures.push(`missing U37-B file: ${file}`);
}

function requireIncludes(label, source, markers) {
  for (const marker of markers) {
    if (!source.includes(marker)) failures.push(`${label} missing: ${marker}`);
  }
}

if (failures.length === 0) {
  const home = read('src/features/library/HomeLibraryPage.tsx');
  const asmr = read('src/features/library/AsmrLibraryPage.tsx');
  const styles = read('src/styles/library-pages.css');
  const router = read('src/app/AppRouter.tsx');
  const main = read('src/main.tsx');
  const u32 = read('scripts/test-u32-ui-audit.mjs');
  const state = read('PROJECT_STATE.md');
  const handoff = read('AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md');
  const worklog = read('AI_HANDOFF/WORKLOG.md');
  const plan = read('docs/architecture/U37_EXECUTION_PLAN.md');

  requireIncludes('HomeLibraryPage', home, [
    'data-u37b-home="daily"',
    'data-u37b-home="search-results"',
    'id="mvp45-home-recent-listening"',
    '<MediaCard',
    '<TrackRow',
    '尚未选择资源库',
    '等待读取资源库',
    '已连接空资源库',
    '已连接本地资源库',
    '继续播放',
    '最近加入',
    '常用入口',
  ]);

  requireIncludes('AsmrLibraryPage', asmr, [
    'data-u37b-asmr-library={viewMode}',
    'data-u37b-asmr-card={work.id}',
    '<MediaCard',
    '<TrackRow',
    'selectedIds',
    '全选当前结果',
    '批量加入歌单',
    'libraryPerformanceService.buildAsmrSearchIndex',
    'libraryPerformanceService.sliceRenderWindow',
    'id="mvp126-asmr-render-window"',
    '<Dialog',
    '不会删除、移动或重命名磁盘文件',
  ]);

  for (const forbidden of ['mvp53-asmr-visual-unity', 'sr-only', '<span hidden', 'display: none']) {
    if (home.includes(forbidden)) failures.push(`HomeLibraryPage contains forbidden migration anchor: ${forbidden}`);
    if (asmr.includes(forbidden)) failures.push(`AsmrLibraryPage contains forbidden migration anchor: ${forbidden}`);
  }

  requireIncludes('AppRouter', router, [
    "const Dashboard = lazy(() => import('../features/library/HomeLibraryPage'));",
    "const AsmrLibrary = lazy(() => import('../features/library/AsmrLibraryPage'));",
  ]);
  requireIncludes('renderer entry', main, ["import './styles/library-pages.css';"]);
  requireIncludes('library-pages.css', styles, [
    '.u37b-home,',
    '.u37b-asmr-library {',
    '.u37b-selection-bar {',
    '.u37b-media-grid {',
    '.u37b-library-toolbar {',
    '@media (prefers-reduced-motion: reduce)',
  ]);
  if (/#[0-9a-f]{3,8}/i.test(styles)) failures.push('U37-B library styles must use semantic tokens instead of hard-coded colors');

  requireIncludes('U32 visual audit', u32, [
    "[data-u37b-home=\\\"daily\\\"]",
    "[data-u37b-asmr-library=\\\"grid\\\"]",
    '批量加入歌单',
    'bulk playlist persistence',
    '[aria-label="列表浏览"]',
  ]);

  requireIncludes('PROJECT_STATE.md', state, [
    'U37-A：资源库页面状态与错误恢复完成',
    'U37-B：首页与音声库列表 UI 完成',
    '当前阶段：U37-C RJ 详情 UI',
  ]);
  requireIncludes('CURRENT_PROJECT_HANDOFF.md', handoff, [
    'U37-A：完成',
    'U37-B：完成',
    '当前任务：U37-C RJ 详情 UI',
  ]);
  requireIncludes('WORKLOG.md', worklog, [
    '### U37-A',
    '### U37-B',
    '当前任务：U37-C RJ 详情 UI',
  ]);
  requireIncludes('U37 execution plan', plan, [
    '### U37-A：页面状态与错误恢复 — 已完成',
    '### U37-B：首页与音声库列表 — 已完成',
    '### U37-C：RJ 详情 — 当前任务',
  ]);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('U37-B production home and ASMR library PASS');
