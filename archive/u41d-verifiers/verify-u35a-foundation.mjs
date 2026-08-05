#!/usr/bin/env node
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const failures = [];

const requiredFiles = [
  'electron/ipc/contracts.ts',
  'src/shared/ipc/index.ts',
  'src/styles/design-tokens.css',
  'src/styles/design-components.css',
  'src/app/AppShell.tsx',
  'src/shared/ui/Button.tsx',
  'src/shared/ui/Dialog.tsx',
  'src/shared/ui/Drawer.tsx',
  'src/shared/ui/Feedback.tsx',
  'src/shared/ui/MediaCard.tsx',
  'src/shared/ui/Surface.tsx',
  'src/shared/ui/TrackRow.tsx',
  'src/shared/ui/index.ts',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) failures.push(`missing foundation file: ${file}`);
}

const extractChannels = (source) =>
  [...source.matchAll(/['"](yang-kura:[a-z0-9:-]+)['"]/g)].map((match) => match[1]);

if (failures.length === 0) {
  const contractSource = read('electron/ipc/contracts.ts');
  const mainSource = read('electron/main.ts');
  const preloadSource = read('electron/preload.ts');
  const contractChannels = extractChannels(contractSource);
  const runtimeChannels = [...new Set([...extractChannels(mainSource), ...extractChannels(preloadSource)])];
  const contractSet = new Set(contractChannels);

  if (contractChannels.length < 30) {
    failures.push(`IPC registry unexpectedly small: ${contractChannels.length}`);
  }
  if (contractSet.size !== contractChannels.length) {
    failures.push('IPC registry contains duplicate channel values');
  }

  for (const channel of runtimeChannels) {
    if (!contractSet.has(channel)) failures.push(`runtime IPC channel missing from registry: ${channel}`);
  }

  for (const marker of [
    'export type IpcChannel',
    'export type IpcErrorCode',
    'export interface IpcError',
    'export type IpcResult<T>',
    'INVALID_ROOT_TOKEN',
    'PRECONDITION_FAILED',
  ]) {
    if (!contractSource.includes(marker)) failures.push(`IPC contract missing marker: ${marker}`);
  }

  const tokenSource = read('src/styles/design-tokens.css');
  for (const marker of [
    '.theme-dusk-amber',
    '.theme-mist-ivory',
    '--yk-canvas',
    '--yk-surface-1',
    '--yk-text-1',
    '--yk-accent',
    '--yk-focus',
    '--yk-motion-normal',
    '--yk-radius-lg',
    '.yk-button',
    '.yk-dialog',
    '@media (prefers-reduced-motion: reduce)',
  ]) {
    if (!tokenSource.includes(marker)) failures.push(`design token contract missing marker: ${marker}`);
  }

  const componentStyles = read('src/styles/design-components.css');
  for (const marker of [
    '.yk-app-shell',
    '.yk-drawer',
    '.yk-media-card',
    '.yk-track-row',
    '@media (max-width: 720px)',
  ]) {
    if (!componentStyles.includes(marker)) failures.push(`component style contract missing marker: ${marker}`);
  }

  const mainEntry = read('src/main.tsx');
  for (const importMarker of [
    "import './styles/design-tokens.css';",
    "import './styles/design-components.css';",
  ]) {
    if (!mainEntry.includes(importMarker)) failures.push(`renderer entry missing style import: ${importMarker}`);
  }

  const componentSources = requiredFiles
    .filter((file) => file.startsWith('src/shared/ui/') && file.endsWith('.tsx'))
    .map((file) => read(file))
    .join('\n');
  const forbiddenPaletteUtility = /(?:bg|text|border)-(?:red|rose|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|zinc|slate|gray)-\d+/;
  if (forbiddenPaletteUtility.test(componentSources)) {
    failures.push('shared UI primitives must consume semantic tokens instead of palette utilities');
  }
  if (/#[0-9a-f]{3,8}/i.test(componentSources)) {
    failures.push('shared UI primitives must not contain hard-coded colors');
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('U35-A shared IPC contracts and design-system foundation PASS');
