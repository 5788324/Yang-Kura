#!/usr/bin/env node
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const failures = [];
const requiredFiles = [
  'src/features/library/RjDetailPage.tsx',
  'src/features/library/RjMetadataDialog.tsx',
  'src/styles/rj-detail.css',
  'src/app/AppRouter.tsx',
  'src/main.tsx',
  'scripts/test-u32-ui-audit.mjs',
  'PROJECT_STATE.md',
  'AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md',
  'AI_HANDOFF/WORKLOG.md',
  'docs/architecture/U37_EXECUTION_PLAN.md',
];
for (const file of requiredFiles) if (!fs.existsSync(file)) failures.push(`missing U37-C file: ${file}`);

function requireIncludes(label, source, markers) {
  for (const marker of markers) if (!source.includes(marker)) failures.push(`${label} missing: ${marker}`);
}

if (failures.length === 0) {
  const detail = read('src/features/library/RjDetailPage.tsx');
  const metadata = read('src/features/library/RjMetadataDialog.tsx');
  const styles = read('src/styles/rj-detail.css');
  const router = read('src/app/AppRouter.tsx');
  const main = read('src/main.tsx');
  const u32 = read('scripts/test-u32-ui-audit.mjs');
  const state = read('PROJECT_STATE.md');
  const handoff = read('AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md');
  const worklog = read('AI_HANDOFF/WORKLOG.md');
  const plan = read('docs/architecture/U37_EXECUTION_PLAN.md');

  requireIncludes('RjDetailPage', detail, [
    'data-u37c-rj-detail="ready"', '<TrackRow', '播放全部', '加入队列', '作品信息与个人记录',
    '个人听音记录', '资源健康与字幕', 'subtitleRelativePaths', 'requestOpenExternalFile',
    'requestOpenInFileManager', '<RjMetadataDialog',
  ]);
  requireIncludes('RjMetadataDialog', metadata, [
    'data-u37c-metadata-editor="ready"', '<AsmrMetadataProviderPreview',
    'onApplyToDraft={applyProviderCandidate}', "kind: 'provider'", "kind: 'manual'", '还原', '保存修改', '不会重命名文件',
  ]);

  for (const [file, source] of [['RjDetailPage', detail], ['RjMetadataDialog', metadata]]) {
    if (/absolutePath\s*[:=]/.test(source)) failures.push(`${file} must not expose absolute path fields`);
    if (/(?:src|href|url)\s*=\s*["']file:\/\//i.test(source) || /["']file:\/\/[^"']+["']/.test(source)) failures.push(`${file} must not embed file URLs`);
    if (source.includes('mvp43-asmr-detail-navigation') || source.includes('mvp56-asmr-detail-summary')) failures.push(`${file} must not retain legacy detail UI anchors`);
  }

  requireIncludes('AppRouter', router, ["const RjDetailPage = lazy(() => import('../features/library/RjDetailPage'));", '<RjDetailPage']);
  if (router.includes("const AsmrDetail = lazy(() => import('../components/AsmrDetail'))")) failures.push('AppRouter still routes production RJ details to the legacy component');

  requireIncludes('renderer entry', main, ["import './styles/rj-detail.css';"]);
  requireIncludes('rj-detail.css', styles, [
    '.u37c-rj-detail {', '.u37c-rj-hero {', '.u37c-rj-track-list', '.u37c-rj-details {', '.u37c-metadata-dialog', '@media (prefers-reduced-motion: reduce)',
  ]);
  if (/#[0-9a-f]{3,8}/i.test(styles)) failures.push('U37-C styles must use semantic tokens instead of hard-coded colors');

  requireIncludes('U32 Electron audit', u32, [
    '[data-u37c-rj-detail=\\"ready\\"]', 'RJ detail uses shared TrackRow entries', 'RJ personal status persistence',
    '[data-u37c-metadata-editor=\\"ready\\"]', 'provider preview remains available',
  ]);

  requireIncludes('PROJECT_STATE.md', state, ['U37-C：RJ 详情 UI 完成', '当前任务：U37-D 音乐库与详情 UI']);
  requireIncludes('CURRENT_PROJECT_HANDOFF.md', handoff, ['U37-C：完成', '当前任务：U37-D 音乐库与详情 UI']);
  requireIncludes('WORKLOG.md', worklog, ['### U37-C', '当前任务：U37-D 音乐库与详情 UI']);
  requireIncludes('U37 execution plan', plan, ['### U37-C：RJ 详情 — 已完成', '### U37-D：音乐库、专辑与艺术家详情 — 当前任务']);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('U37-C production RJ detail PASS');
