#!/usr/bin/env node
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const failures = [];

const requiredFiles = [
  'src/app/navigation.ts',
  'src/components/Sidebar.tsx',
  'electron/ipc/contracts.ts',
  'electron/preload/contracts.ts',
  'electron/preload.ts',
  'docs/architecture/U36A_SHELL_ROUTER_IPC.md',
  'AI_HANDOFF/WORKLOG.md',
  'PROJECT_STATE.md',
  'AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) failures.push(`missing U36-A file: ${file}`);
}

if (failures.length === 0) {
  const navigation = read('src/app/navigation.ts');
  const sidebar = read('src/components/Sidebar.tsx');
  const preload = read('electron/preload.ts');
  const preloadContracts = read('electron/preload/contracts.ts');
  const ipcContracts = read('electron/ipc/contracts.ts');
  const projectState = read('PROJECT_STATE.md');
  const handoff = read('AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md');
  const worklog = read('AI_HANDOFF/WORKLOG.md');

  for (const route of [
    'dashboard',
    'asmr-lib',
    'music-lib',
    'playlists',
    'importer',
    'settings',
    'downloader',
    'diagnostics',
  ]) {
    if (!navigation.includes(`${route}:`) && !navigation.includes(`'${route}':`)) {
      failures.push(`navigation registry missing route: ${route}`);
    }
  }

  for (const marker of [
    'APP_ROUTE_REGISTRY',
    'DAILY_NAVIGATION_ROUTES',
    'MAINTENANCE_ROUTES',
    'visibleInSidebar',
    'searchable',
  ]) {
    if (!navigation.includes(marker)) failures.push(`navigation contract missing marker: ${marker}`);
  }

  if (!sidebar.includes("import { DAILY_NAVIGATION_ROUTES } from '../app/navigation';")) {
    failures.push('Sidebar must consume the canonical navigation registry');
  }
  if (sidebar.includes('DAILY_NAV_ITEMS')) {
    failures.push('Sidebar must not keep a second daily navigation array');
  }

  if (!preload.includes("import { IPC_CHANNELS, type IpcChannel } from './ipc/contracts.js';")) {
    failures.push('Preload must import the canonical IPC registry with a NodeNext specifier');
  }
  if (!preload.includes("from './preload/contracts.js';")) {
    failures.push('Preload must import extracted request contracts with a NodeNext specifier');
  }
  if (!preloadContracts.includes("from '../ipc/contracts.js';")) {
    failures.push('Preload request contracts must use a NodeNext IPC contract specifier');
  }
  if (/ipcRenderer\.(?:invoke|on|removeListener)\(\s*['"]yang-kura:/m.test(preload)) {
    failures.push('Preload contains a raw IPC channel string');
  }
  if (/\btype\s+(?:ScannerDryRunRequest|WriteLibraryIndexRequest|MpvPlaybackStartRequest)\b/.test(preload)) {
    failures.push('Preload still owns request type declarations');
  }

  for (const marker of [
    'IPC_CHANNELS.library.selectRoot',
    'IPC_CHANNELS.media.resolveTrackUrl',
    'IPC_CHANNELS.player.mpvStart',
    'IPC_CHANNELS.metadata.asmrSingleRjPreview',
    'IPC_CHANNELS.importer.copyPreflight',
    'IPC_CHANNELS.importer.moveExecute',
  ]) {
    if (!preload.includes(marker)) failures.push(`Preload missing canonical channel reference: ${marker}`);
  }

  for (const marker of [
    'export type SelectLibraryRootRequest',
    'export type MpvPlaybackEvent',
    'export type ImportLibraryIndexPatchWriteRequest',
    'export type ImportMoveOnlyExecuteRequest',
  ]) {
    if (!preloadContracts.includes(marker)) failures.push(`preload contract missing marker: ${marker}`);
  }

  if (!ipcContracts.includes('export const IPC_CHANNELS')) {
    failures.push('canonical IPC registry is missing');
  }

  for (const [file, source, markers] of [
    ['PROJECT_STATE.md', projectState, ['U36-A：导航注册表与 Preload IPC 统一完成']],
    ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', handoff, ['U36-A：完成']],
    ['AI_HANDOFF/WORKLOG.md', worklog, ['U35-B', 'U36-A']],
  ]) {
    for (const marker of markers) {
      if (!source.includes(marker)) failures.push(`${file} missing historical progress marker: ${marker}`);
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('U36-A navigation and preload IPC boundary PASS');
