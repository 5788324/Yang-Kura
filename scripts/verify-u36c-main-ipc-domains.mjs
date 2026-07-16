#!/usr/bin/env node
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const failures = [];
const required = [
  'electron/ipc/registerInvokeHandler.ts',
  'electron/ipc/domains/library.ts',
  'electron/ipc/domains/media.ts',
  'electron/ipc/domains/player.ts',
  'electron/ipc/domains/metadata.ts',
  'electron/ipc/domains/importer.ts',
  'docs/architecture/U36C_MAIN_IPC_DOMAINS.md',
  'PROJECT_STATE.md',
  'AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md',
  'AI_HANDOFF/WORKLOG.md',
];
for (const file of required) if (!fs.existsSync(file)) failures.push('missing U36-C file: ' + file);
if (failures.length === 0) {
  const main = read('electron/main.ts');
  const contracts = read('electron/ipc/contracts.ts');
  const registrar = read('electron/ipc/registerInvokeHandler.ts');
  const state = read('PROJECT_STATE.md');
  const handoff = read('AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md');
  const worklog = read('AI_HANDOFF/WORKLOG.md');
  for (const marker of [
    "import { IPC_CHANNELS } from './ipc/contracts.js';",
    "import { registerLibraryHandler } from './ipc/domains/library.js';",
    "import { registerMediaHandler } from './ipc/domains/media.js';",
    "import { registerPlayerHandler } from './ipc/domains/player.js';",
    "import { registerMetadataHandler } from './ipc/domains/metadata.js';",
    "import { registerImporterHandler } from './ipc/domains/importer.js';",
    'mainWindow.webContents.send(IPC_CHANNELS.player.mpvEvent, event);',
  ]) if (!main.includes(marker)) failures.push('Main domain boundary missing: ' + marker);
  if (/ipcMain\.(?:handle|removeHandler)\s*\(/.test(main)) failures.push('electron/main.ts still owns ipcMain registration');
  if (/['"]yang-kura:[^'"]+['"]/.test(main)) failures.push('electron/main.ts contains a raw IPC channel literal');
  if (!registrar.includes('ipcMain.removeHandler(channel);') || !registrar.includes('ipcMain.handle(channel, handler);')) failures.push('shared invoke registrar does not replace handlers safely');
  for (const domain of ['library', 'media', 'player', 'metadata', 'importer']) {
    const source = read('electron/ipc/domains/' + domain + '.ts');
    if (!source.includes('IPC_CHANNELS.' + domain + '[channel]')) failures.push(domain + ' domain does not own canonical channel lookup');
    if (!source.includes('registerInvokeHandler')) failures.push(domain + ' domain does not use shared registrar');
  }
  const contractChannelCount = (contracts.match(/'yang-kura:/g) || []).length;
  if (contractChannelCount !== 36) failures.push('canonical channel count changed unexpectedly: ' + contractChannelCount);
  for (const [label, source, markers] of [
    ['PROJECT_STATE.md', state, ['U36-C：Main IPC 分域注册完成', '当前阶段：U37']],
    ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', handoff, ['U36-C：完成', '当前任务：U37']],
    ['AI_HANDOFF/WORKLOG.md', worklog, ['### U36-C', '当前任务：U37']],
  ]) for (const marker of markers) if (!source.includes(marker)) failures.push(label + ' missing progress marker: ' + marker);
}
if (failures.length) {
  console.error(failures.join('
'));
  process.exit(1);
}
console.log('U36-C Main IPC domain registration PASS');
