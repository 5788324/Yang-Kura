import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const compiled = path.resolve('dist-electron/mpvSettingsStore.js');
if (!fs.existsSync(compiled)) throw new Error('compiled mpvSettingsStore missing; run build:electron first');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-mpv123-'));
const settingsFile = path.join(temp, 'mpv-settings.json');
const testPlatform = process.env.YANG_KURA_TEST_PLATFORM === 'win32' ? 'win32' : process.platform;
const sourceFakeMpv = path.resolve('tests/fixtures/mpv/fake-mpv.mjs');
const fakeMpv = path.join(temp, testPlatform === 'win32' ? 'mpv.exe' : 'mpv');
if (testPlatform === 'win32') {
  // Windows cannot execute a JavaScript file merely renamed to .exe.
  // Copy the current Node PE executable instead; `mpv.exe --version` then
  // exercises the same direct-spawn path with a real Windows executable.
  fs.copyFileSync(process.execPath, fakeMpv);
} else {
  fs.copyFileSync(sourceFakeMpv, fakeMpv);
  fs.chmodSync(fakeMpv, 0o755);
}
const { MpvSettingsStore } = await import(`${pathToFileURL(compiled).href}?mvp123=${Date.now()}`);

const store = new MpvSettingsStore(settingsFile, {});
await store.initialize();
const initial = await store.getInstallationStatus();
if (initial.absolutePathReturned !== false || initial.fileUrlReturned !== false) throw new Error('path safety regression');

const selected = await store.setSelectedExecutable(fakeMpv);
if (!selected.available || selected.source !== 'user-selected') throw new Error('user-selected mpv detection failed');
if (!selected.versionLabel) throw new Error('mpv version label missing');
if (testPlatform !== 'win32' && !selected.versionLabel.includes('Yang-Kura fake fixture')) {
  throw new Error('mpv fixture version label missing');
}
if (testPlatform === 'win32' && !/^v?\d+\./i.test(selected.versionLabel)) {
  throw new Error(`Windows PE fixture returned unexpected version label: ${selected.versionLabel}`);
}
if (!fs.existsSync(settingsFile)) throw new Error('mpv settings file not persisted');

const reloaded = new MpvSettingsStore(settingsFile, {});
await reloaded.initialize();
const reloadedStatus = await reloaded.getInstallationStatus();
if (!reloadedStatus.available || reloadedStatus.source !== 'user-selected') throw new Error('persisted mpv selection not restored');

const cleared = await reloaded.clearSelectedExecutable();
if (cleared.canClearUserSelection || fs.existsSync(settingsFile)) throw new Error('mpv selection clear failed');

fs.rmSync(temp, { recursive: true, force: true });
console.log('MVP123 mpv settings runtime verification PASS');
