#!/usr/bin/env node
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const failures = [];
const required = [
  'src/features/library/LibraryPageState.tsx',
  'src/features/library/LibraryRouteBoundary.tsx',
  'src/app/AppRouter.tsx',
  'src/styles/design-components.css',
  'docs/architecture/U37_EXECUTION_PLAN.md',
  'PROJECT_STATE.md',
  'AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md',
  'AI_HANDOFF/WORKLOG.md',
];

for (const file of required) {
  if (!fs.existsSync(file)) failures.push(`missing U37-A file: ${file}`);
}

if (failures.length === 0) {
  const pageState = read('src/features/library/LibraryPageState.tsx');
  const routeBoundary = read('src/features/library/LibraryRouteBoundary.tsx');
  const router = read('src/app/AppRouter.tsx');
  const styles = read('src/styles/design-components.css');
  const plan = read('docs/architecture/U37_EXECUTION_PLAN.md');
  const state = read('PROJECT_STATE.md');
  const handoff = read('AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md');
  const worklog = read('AI_HANDOFF/WORKLOG.md');

  for (const marker of [
    "export type LibraryPageKind = 'dashboard' | 'asmr' | 'music'",
    "const delegatedState = itemCount > 0 ? 'ready'",
    "connected ? 'empty' : 'disconnected'",
    'preserveContentWhenEmpty',
    'onOpenSettings',
    '绝对路径不会暴露给 Renderer',
  ]) if (!pageState.includes(marker)) failures.push(`LibraryPageState missing: ${marker}`);

  for (const marker of [
    'getDerivedStateFromError',
    'componentDidCatch',
    'componentDidUpdate',
    '重试页面',
    '播放器、队列和其他页面继续保持可用',
  ]) if (!routeBoundary.includes(marker)) failures.push(`LibraryRouteBoundary missing: ${marker}`);

  for (const marker of [
    "import LibraryPageState, { type LibraryPageKind } from '../features/library/LibraryPageState';",
    "import LibraryRouteBoundary from '../features/library/LibraryRouteBoundary';",
    "renderLibraryPage(\n        'dashboard'",
    "renderLibraryPage(\n        'asmr'",
    "renderLibraryPage(\n        'music'",
    'preserveContentWhenEmpty',
    'data-u37a-library-page="missing-selection"',
    '返回音声库',
  ]) if (!router.includes(marker)) failures.push(`AppRouter missing U37-A boundary: ${marker}`);

  if (router.includes('window.location.reload')) failures.push('U37-A recovery must not reload the whole application');
  if (!styles.includes('.yk-library-page-state') || !styles.includes('.yk-library-page-state__surface')) {
    failures.push('U37-A semantic page-state styles missing');
  }

  for (const marker of ['### U37-A', '### U37-B', '### U37-C', '### U37-D', 'U37 完成条件']) {
    if (!plan.includes(marker)) failures.push(`U37 execution plan missing: ${marker}`);
  }

  for (const [file, source, markers] of [
    ['PROJECT_STATE.md', state, ['U37-A：资源库页面状态与错误恢复完成', '当前阶段：U37-B']],
    ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', handoff, ['U37-A：完成', '当前任务：U37-B']],
    ['AI_HANDOFF/WORKLOG.md', worklog, ['### U37-A', '当前任务：U37-B']],
  ]) {
    for (const marker of markers) if (!source.includes(marker)) failures.push(`${file} missing progress marker: ${marker}`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('U37-A library page state and recovery boundaries PASS');
