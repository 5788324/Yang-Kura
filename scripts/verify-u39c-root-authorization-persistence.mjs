import fs from 'node:fs';

const checks = [
  ['electron/rootAuthorizationStore.ts', 'export class RootAuthorizationStore'],
  ['electron/rootAuthorizationStore.ts', "path.join(absolutePath, 'library-index.json')"],
  ['electron/rootAuthorizationStore.ts', "mode: 0o600"],
  ['electron/main.ts', "import { RootAuthorizationStore } from './rootAuthorizationStore.js';"],
  ['electron/main.ts', "new RootAuthorizationStore(path.join(stableUserDataPath, 'root-authorizations.json'))"],
  ['electron/main.ts', 'await rootAuthorizationStore.initialize()'],
  ['electron/main.ts', 'await rootAuthorizationStore.authorize({'],
  ['src/components/SettingsPage.tsx', 'yang_kura_persisted_authorized_roots_v1'],
  ['src/services/librarySessionService.ts', 'PERSISTED_ROOT_SESSION_KEY'],
  ['scripts/test-u28-electron-e2e.mjs', 'restart-persisted-authorization-reread'],
  ['scripts/test-u28-electron-e2e.mjs', 'restart-persisted-authorization-playback'],
];

const failures = [];
for (const [file, token] of checks) {
  if (!fs.existsSync(file) || !fs.readFileSync(file, 'utf8').includes(token)) failures.push(file + ' missing ' + token);
}
const rendererFiles = ['src/components/SettingsPage.tsx', 'src/services/librarySessionService.ts'];
for (const file of rendererFiles) {
  const source = fs.readFileSync(file, 'utf8');
  if (/absolutePaths*:/.test(source)) failures.push(file + ' must not persist absolutePath in Renderer');
}
if (fs.readFileSync('scripts/test-u28-electron-e2e.mjs', 'utf8').includes('restart-reauthorize-reread')) {
  failures.push('U28 still treats restart reauthorization as the expected behavior');
}
if (failures.length) {
  console.error(failures.join('
'));
  process.exit(1);
}
console.log('[verify-u39c-root-authorization-persistence] PASS');
