#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const plan = JSON.parse(read('release/beta3-release-plan.json'));
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const notes = read(plan.releaseNotesPath);
const workflow = read('.github/workflows/beta3-personal-release.yml');
const fastLane = read('docs/GIT_FAST_LANE_V2.md');
const codex = read('docs/CODEX_BETA3_RELEASE_ACCEPTANCE.md');
const beta2 = JSON.parse(read('release/beta2-publication-state.json'));

assert.equal(plan.version, '0.170.0-beta.3');
assert.equal(plan.previousVersion, '0.169.0-beta.2');
assert.equal(plan.tag, `v${plan.version}`);
assert.equal(plan.title, 'Yang-Kura 0.170.0 Beta 3 · 正式日用候选');
assert.equal(pkg.version, plan.version);
assert.equal(lock.version, plan.version);
assert.equal(lock.packages?.['']?.version, plan.version);
assert.deepEqual(plan.assets, [
  `Yang Kura-${plan.version}-portable-x64.exe`,
  `Yang Kura-${plan.version}-setup-x64.exe`,
  'SHA256SUMS.txt',
]);
assert.equal(beta2.status, 'published');
assert.equal(beta2.version, '0.169.0-beta.2');
for (const marker of ['Windows x64', 'U40-D2', 'U40-D3', '未进行商业代码签名', '不包含自动更新', 'mpv']) {
  assert.ok(notes.includes(marker), `release notes missing: ${marker}`);
}
for (const marker of ['name: Personal Beta 3 Release', 'npm run test:u28:electron-e2e', 'npm run test:u29:electron-e2e', 'npm run test:u31:importer-transactions', 'test-u32-release-candidate-packaging.mjs', 'gh release create']) {
  assert.ok(workflow.includes(marker), `workflow missing: ${marker}`);
}
assert.ok(fastLane.includes('一个任务只使用一个分支、一个 PR'));
assert.ok(codex.includes('D:\\CloudMusic\\VipSongsDownload'));
assert.ok(codex.includes('%TEMP%\\YangKura-Beta3-Acceptance'));
console.log('Beta 3 release contract PASS');
