import assert from 'node:assert/strict';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const checks = [
  ['electron/rootAuthorizationStore.ts', 'export class RootAuthorizationStore'],
  ['electron/rootAuthorizationStore.ts', "path.join(absolutePath, 'library-index.json')"],
  ['electron/rootAuthorizationStore.ts', 'mode: 0o600'],
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
  if (!fs.existsSync(file) || !fs.readFileSync(file, 'utf8').includes(token)) {
    failures.push(`${file} missing ${token}`);
  }
}

for (const file of ['src/components/SettingsPage.tsx', 'src/services/librarySessionService.ts']) {
  const source = fs.readFileSync(file, 'utf8');
  if (/absolutePath\s*:/.test(source)) failures.push(`${file} must not persist absolutePath in Renderer`);
}

if (fs.readFileSync('scripts/test-u28-electron-e2e.mjs', 'utf8').includes('restart-reauthorize-reread')) {
  failures.push('U28 still treats restart reauthorization as the expected behavior');
}

if (!fs.existsSync('dist-electron/rootAuthorizationStore.js')) {
  failures.push('dist-electron/rootAuthorizationStore.js missing; run build:electron before this verifier');
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

const { RootAuthorizationStore } = await import('../dist-electron/rootAuthorizationStore.js');
const tempRoot = await fsp.mkdtemp(path.join(os.tmpdir(), 'yang-kura-u39c-auth-'));

try {
  const libraryA = path.join(tempRoot, 'library-a');
  const libraryB = path.join(tempRoot, 'library-b');
  const stateFile = path.join(tempRoot, 'profile', 'root-authorizations.json');
  await fsp.mkdir(libraryA, { recursive: true });
  await fsp.mkdir(libraryB, { recursive: true });

  const legacyToken = 'yk-root-legacy-token-0001';
  const legacyIndex = {
    schemaVersion: 1,
    roots: [{
      id: 'root-a',
      rootPath: `rootPathToken:${legacyToken}`,
      libraryType: 'asmr',
    }],
    collections: [],
    tracks: [],
    covers: [],
    subtitles: [],
    warnings: [],
  };
  await fsp.writeFile(path.join(libraryA, 'library-index.json'), `\uFEFF${JSON.stringify(legacyIndex)}`, 'utf8');

  const firstStore = new RootAuthorizationStore(stateFile);
  assert.deepEqual(await firstStore.initialize(), [], 'fresh store must start empty');
  const adopted = await firstStore.authorize({
    absolutePath: libraryA,
    displayName: 'Library A',
    libraryType: 'asmr',
    createToken: () => 'yk-root-generated-token-0001',
  });
  assert.equal(adopted.rootPathToken, legacyToken, 'existing Index token must be adopted on first reselection');

  const persisted = JSON.parse(await fsp.readFile(stateFile, 'utf8'));
  assert.equal(persisted.schemaVersion, 1);
  assert.equal(persisted.records.length, 1);
  assert.equal(persisted.records[0].rootPathToken, legacyToken);
  assert.equal(path.resolve(persisted.records[0].absolutePath), path.resolve(libraryA));

  const restartedStore = new RootAuthorizationStore(stateFile);
  const restored = await restartedStore.initialize();
  assert.equal(restored.length, 1, 'restart must restore one authorization');
  assert.equal(restored[0].rootPathToken, legacyToken, 'restart must restore the same token');

  const selectedAgain = await restartedStore.authorize({
    absolutePath: libraryA,
    displayName: 'Library A renamed',
    libraryType: 'asmr',
    createToken: () => 'yk-root-generated-token-0002',
  });
  assert.equal(selectedAgain.rootPathToken, legacyToken, 'same directory must keep a stable token');
  assert.equal(selectedAgain.displayName, 'Library A renamed');

  await fsp.writeFile(path.join(libraryB, 'library-index.json'), JSON.stringify({
    ...legacyIndex,
    roots: [{ ...legacyIndex.roots[0], id: 'root-b' }],
  }), 'utf8');
  const conflict = await restartedStore.authorize({
    absolutePath: libraryB,
    displayName: 'Library B',
    libraryType: 'asmr',
    createToken: () => 'yk-root-generated-token-conflict-safe',
  });
  assert.equal(conflict.rootPathToken, 'yk-root-generated-token-conflict-safe', 'token collision must not bind two paths');
  assert.notEqual(conflict.rootPathToken, legacyToken);

  const finalRecords = restartedStore.list();
  assert.equal(finalRecords.length, 2);
  assert.equal(new Set(finalRecords.map((record) => record.rootPathToken)).size, 2);
} finally {
  await fsp.rm(tempRoot, { recursive: true, force: true });
}

console.log('[verify-u39c-root-authorization-persistence] PASS');
