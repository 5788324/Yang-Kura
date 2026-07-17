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

function requireIncludes(label, source, markers) {
  for (const marker of markers) {
    if (!source.includes(marker)) failures.push(`${label} missing: ${marker}`);
  }
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

  requireIncludes('LibraryPageState', pageState, [
    "export type LibraryPageKind = 'dashboard' | 'asmr' | 'music'",
    'preserveContentWhenEmpty',
    'delegatedState',
    'data-u37a-library-page',
    'onOpenSettings',
    'PAGE_COPY',
    '绝对路径不会暴露给 Renderer',
  ]);
  if (!/itemCount\s*>\s*0\s*\|\|\s*preserveContentWhenEmpty/.test(pageState)) {
    failures.push('LibraryPageState must preserve established page-owned empty states during incremental migration');
  }
  if (!/connected\s*\?\s*['"]empty['"]\s*:\s*['"]disconnected['"]/.test(pageState)) {
    failures.push('LibraryPageState must classify empty and disconnected states');
  }

  requireIncludes('LibraryRouteBoundary', routeBoundary, [
    'getDerivedStateFromError',
    'componentDidCatch',
    'componentDidUpdate',
    'this.setState({ error: null })',
    '重试页面',
    '播放器、队列和其他页面继续保持可用',
  ]);

  requireIncludes('AppRouter', router, [
    "from '../features/library/LibraryPageState'",
    "from '../features/library/LibraryRouteBoundary'",
    'preserveContentWhenEmpty',
    'data-u37a-library-page="missing-selection"',
    '返回音声库',
  ]);
  for (const kind of ['dashboard', 'asmr', 'music']) {
    const pattern = new RegExp(`renderLibraryPage\\(\\s*['"]${kind}['"]`);
    if (!pattern.test(router)) failures.push(`AppRouter missing ${kind} page boundary`);
  }
  if (router.includes('window.location.reload')) failures.push('U37-A recovery must not reload the whole application');

  requireIncludes('design-components.css', styles, [
    '.yk-library-page {',
    '.yk-library-page-state {',
    '.yk-library-page-state__surface {',
    '.yk-library-page-state__icon {',
  ]);

  requireIncludes('U37 execution plan', plan, [
    '### U37-A：',
    '### U37-B：',
    '### U37-C：',
    '### U37-D：',
    '## U37 完成条件',
  ]);
  requireIncludes('PROJECT_STATE.md', state, [
    'U37-A：资源库页面状态与错误恢复完成',
    'U37-B：首页与音声库列表 UI 完成',
  ]);
  requireIncludes('AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', handoff, [
    'U37-A：完成',
    'U37-B：完成',
  ]);
  requireIncludes('AI_HANDOFF/WORKLOG.md', worklog, [
    '### U37-A',
    '### U37-B',
  ]);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('U37-A library page state and recovery boundaries PASS');
