#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const main = read('electron/main.ts');
const topBar = read('src/app/TopBar.tsx');
const maintenance = read('src/components/SettingsMaintenanceEntry.tsx');
const setup = read('scripts/setup-electron-desktop.mjs');
const stable = read('scripts/run-stable-regression.mjs');
const workflow = read('.github/workflows/u41c-runtime-patch.yml');
const attributes = read('.gitattributes');

const electronRange = pkg.devDependencies?.electron;
assert.equal(electronRange, '^39.8.10');
assert.equal(pkg.optionalDependencies?.electron, '^39.8.10');
assert.equal(pkg.scripts?.['electron:install'], 'npm install electron@^39.8.10 --save-dev');
assert.equal(pkg.scripts?.['verify:u41c-runtime-patch'], 'node scripts/verify-u41c-runtime-patch.mjs');
assert.equal(lock.packages?.['']?.devDependencies?.electron, '^39.8.10');
assert.equal(lock.packages?.['']?.optionalDependencies?.electron, '^39.8.10');
assert.equal(lock.packages?.['node_modules/electron']?.version, '39.8.10');
assert.match(setup, /electron@\^39\.8\.10/);

for (const token of [
  'nodeIntegrationInWorker: false',
  'nodeIntegrationInSubFrames: false',
  'webviewTag: false',
  "setWindowOpenHandler(() => ({ action: 'deny' }))",
  "scheme: 'yang-kura-media'",
  'supportFetchAPI: true',
  'corsEnabled: true',
  "request.headers.get('range')",
  "'Content-Type': mediaMimeType(resolved.extension)",
]) assert.ok(main.includes(token), `electron/main.ts missing ${token}`);

for (const token of ['role="status"', 'aria-live="polite"', 'aria-atomic="true"', 'data-u30-runtime-status']) {
  assert.ok(topBar.includes(token), `TopBar missing ${token}`);
}
assert.match(maintenance, /资源状态与性能检查按需打开/);
assert.match(maintenance, /历史工程诊断已经归档，不再作为运行时功能/);
assert.doesNotMatch(maintenance, /完整历史诊断|完整诊断按需展开/);

assert.match(attributes, /tests\/fixtures\/mpv\/\*\.mjs text eol=lf/);
for (const file of ['tests/fixtures/mpv/fake-mpv.mjs', 'tests/fixtures/mpv/fake-mpv-stability.mjs']) {
  const bytes = fs.readFileSync(file);
  assert.equal(bytes.subarray(0, 20).toString('utf8'), '#!/usr/bin/env node\n', `${file} must keep an LF shebang`);
  assert.equal(bytes.includes(Buffer.from('\r\n')), false, `${file} must not contain CRLF`);
}

for (const token of [
  'npm audit --audit-level=moderate',
  'npm run verify:u41c-runtime-patch',
  'npm run test:u28:electron-e2e',
  'npm run test:u29:electron-e2e',
  'npm run desktop:dist',
  'node scripts/test-u32-release-candidate-packaging.mjs',
  'node scripts/test-u32-packaged-page-readiness.mjs',
]) assert.ok(workflow.includes(token), `U41-C workflow missing ${token}`);
assert.match(stable, /verify:u41c-runtime-patch/);

console.log('[U41-C runtime patch] PASS');
console.log('electron=39.8.10; protocol/window hardening=current; mpv fixtures=LF; live status/copy=truthful');
