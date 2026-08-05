#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const navigation = read('src/app/navigation.ts');
const router = read('src/app/AppRouter.tsx');
const settings = read('src/components/SettingsPageDaily.tsx');
const stable = read('scripts/run-stable-regression.mjs');
const runtimeTest = read('scripts/test-u41e-rc-final-acceptance.mjs');
const subtitleLayoutTest = read('scripts/test-u41e-lyrics-subtitle-layout.mjs');
const workflow = read('.github/workflows/u32-release-candidate.yml');
const gitRules = read('docs/GIT_FAST_LANE_V2.md');
const releaseNotes = read('docs/RELEASE_NOTES_1.0.0-rc.1.md');
const acceptance = read('docs/U41E_RC_FINAL_ACCEPTANCE.md');

assert.equal(pkg.version, '1.0.0-rc.1');
assert.equal(lock.version, '1.0.0-rc.1');
assert.equal(lock.packages?.['']?.version, '1.0.0-rc.1');
assert.equal(pkg.scripts?.['test:u41e:rc-final'], 'node scripts/test-u41e-rc-final-acceptance.mjs');
assert.equal(pkg.scripts?.['test:u41e:lyrics-subtitle-layout'], 'node scripts/test-u41e-lyrics-subtitle-layout.mjs');
assert.equal(pkg.scripts?.['verify:u41e-rc-final-acceptance'], 'node scripts/verify-u41e-rc-final-acceptance.mjs');
assert.match(settings, /APP_VERSION/);
assert.doesNotMatch(settings, /0\.170\.0-beta\.3|0\.169\.0-beta\.2/);
assert.doesNotMatch(navigation, /downloader/);
assert.doesNotMatch(router, /DownloaderPage|currentPage === ['"]downloader['"]/);
assert.match(runtimeTest, /width: 800, height: 700/);
assert.match(runtimeTest, /current-only/);
assert.match(runtimeTest, /当前版本：1\.0\.0-rc\.1/);
assert.match(runtimeTest, /undersized/);
assert.match(runtimeTest, /offscreen/);
assert.match(subtitleLayoutTest, /歌词模式/);
assert.match(subtitleLayoutTest, /mvp78-lyrics-reading-width/);
assert.match(subtitleLayoutTest, /gapToBottomControls/);
assert.match(subtitleLayoutTest, /elementFromPoint/);
assert.match(subtitleLayoutTest, /first|middle|last/);
assert.match(subtitleLayoutTest, /width: 800, height: 700/);
assert.match(stable, /verify:u41e-rc-final-acceptance/);

for (const token of [
  'npm run verify:u41e-rc-final-acceptance',
  'npm run test:u41e:rc-final',
  'npm run test:u41e:lyrics-subtitle-layout',
  'node scripts/test-u40b-full-product-journey.mjs',
  'node scripts/test-u32-release-candidate-packaging.mjs',
  'node scripts/test-u32-packaged-page-readiness.mjs',
  'npm audit --audit-level=moderate',
]) assert.ok(workflow.includes(token), `RC workflow missing ${token}`);

for (const token of [
  '禁止通过 GitHub Contents API',
  '禁止为多文件任务手工创建大量 Git blob、tree、commit 对象',
  '最多重试一次',
]) assert.ok(gitRules.includes(token), `Git v2.3 rules missing ${token}`);
assert.match(releaseNotes, /1\.0\.0-rc\.1/);
assert.match(acceptance, /U41-E/);
assert.match(acceptance, /800×700/);

console.log('[U41-E RC final acceptance verifier] PASS');
console.log('version=1.0.0-rc.1; final UI/keyboard/narrow-window/lyrics-subtitle-layout/package gates wired; Git v2.3 included');
