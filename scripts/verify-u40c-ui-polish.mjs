#!/usr/bin/env node
import fs from 'node:fs';

const failures = [];
const read = (file) => {
  if (!fs.existsSync(file)) {
    failures.push(`missing ${file}`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
};

const main = read('src/main.tsx');
const css = read('src/styles/u40c-ui-polish.css');

const requiredMainTokens = [
  "import './styles/u40c-ui-polish.css';",
];

const requiredCssTokens = [
  '#mvp126-diagnostics-two-stage-loader',
  '#u28-diagnostics-index-status',
  '.u37d-collection-grid',
  '.u37d-folder-list',
  '#full-lyrics-panel',
  '#lyrics-close-btn + div',
  '#u39b-settings-maintenance-entry',
  '[data-settings-tab]',
  '@media (max-width: 1120px)',
  '@media (prefers-reduced-motion: reduce)',
  'var(--yk-success)',
  'var(--yk-accent)',
  'var(--yk-surface-2)',
  'var(--yk-text-1)',
];

for (const token of requiredMainTokens) {
  if (!main.includes(token)) failures.push(`src/main.tsx missing token: ${token}`);
}
for (const token of requiredCssTokens) {
  if (!css.includes(token)) failures.push(`u40c stylesheet missing token: ${token}`);
}

const forbiddenCssTokens = [
  'display: none !important; /* hide the page */',
  'pointer-events: none !important; /* disable interaction */',
];
for (const token of forbiddenCssTokens) {
  if (css.includes(token)) failures.push(`u40c stylesheet contains forbidden blanket override: ${token}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('[verify-u40c] UI polish hooks and semantic-token coverage PASS');
