#!/usr/bin/env node
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const failures = [];

const requiredFiles = [
  'src/app/AppShell.tsx',
  'src/app/ThemeRuntimeBridge.tsx',
  'src/app/themeRuntime.ts',
  'src/styles/production-shell.css',
  'src/main.tsx',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) failures.push(`missing U35-B production-shell file: ${file}`);
}

if (failures.length === 0) {
  const mainEntry = read('src/main.tsx');
  const appShell = read('src/app/AppShell.tsx');
  const themeBridge = read('src/app/ThemeRuntimeBridge.tsx');
  const themeRuntime = read('src/app/themeRuntime.ts');
  const shellCss = read('src/styles/production-shell.css');

  for (const marker of [
    "import {AppShell} from './app/AppShell';",
    "import {ThemeRuntimeBridge} from './app/ThemeRuntimeBridge';",
    "import './styles/production-shell.css';",
    '<ThemeRuntimeBridge>',
    '<AppShell bridge>',
  ]) {
    if (!mainEntry.includes(marker)) failures.push(`renderer entry missing production-shell marker: ${marker}`);
  }

  for (const marker of [
    'bridge?: boolean',
    'data-yk-app-shell="beta2-production-bridge"',
    'yk-app-shell--bridge',
  ]) {
    if (!appShell.includes(marker)) failures.push(`AppShell missing bridge marker: ${marker}`);
  }

  for (const marker of [
    "export type Beta2ThemeId = 'dusk-amber' | 'mist-ivory'",
    "BETA2_THEME_STORAGE_KEY",
    "dark: 'dusk-amber'",
    "'ocean-drops': 'mist-ivory'",
    'persistLegacyThemeCompatibility',
    'applyBeta2Theme',
  ]) {
    if (!themeRuntime.includes(marker)) failures.push(`theme runtime missing marker: ${marker}`);
  }

  for (const marker of [
    'createPortal',
    'MutationObserver',
    "attributeFilter: ['class', 'data-u30-theme']",
    'id="beta2-theme-toggle"',
    '暮夜琥珀',
    '雾光象牙',
  ]) {
    if (!themeBridge.includes(marker)) failures.push(`theme bridge missing marker: ${marker}`);
  }

  for (const marker of [
    '.yk-app-shell--bridge',
    '#windows-app-bar',
    '#app-sidebar',
    '#u29-queue-drawer',
    '#legacy-resume-toast',
    '#app-player-bar',
    '.yk-theme-toggle',
    '@media (prefers-reduced-motion: reduce)',
  ]) {
    if (!shellCss.includes(marker)) failures.push(`production shell CSS missing marker: ${marker}`);
  }

  const forbiddenPaletteUtility = /(?:bg|text|border)-(?:red|rose|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|zinc|slate|gray)-\d+/;
  if (forbiddenPaletteUtility.test(shellCss)) {
    failures.push('production shell CSS must use semantic tokens instead of palette utilities');
  }

  if (/#[0-9a-f]{3,8}/i.test(shellCss)) {
    failures.push('production shell CSS must not contain hard-coded colors');
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('U35-B production AppShell and canonical theme runtime PASS');
