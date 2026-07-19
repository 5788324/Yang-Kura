#!/usr/bin/env node
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const [releasePath, assetDir, expectedTarget] = process.argv.slice(2);
assert.ok(releasePath && assetDir && expectedTarget, 'usage: verify-beta3-published-release <release.json> <asset-dir> <expected-target>');
const plan = JSON.parse(fs.readFileSync('release/beta3-release-plan.json', 'utf8'));
const release = JSON.parse(fs.readFileSync(releasePath, 'utf8'));
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const candidates = (name) => [...new Set([name, name.replaceAll(' ', '.')])];

assert.equal(release.tag_name, plan.tag);
assert.equal(release.name, plan.title);
assert.equal(release.target_commitish, expectedTarget);
assert.equal(Boolean(release.prerelease), true);
assert.equal(Boolean(release.draft), false);
const remoteMap = new Map((release.assets ?? []).map((asset) => [asset.name, asset]));
const checksumPath = path.join(assetDir, 'SHA256SUMS.txt');
const checksums = new Map(fs.readFileSync(checksumPath, 'utf8').trim().split(/\r?\n/).map((line) => {
  const match = line.match(/^([a-f0-9]{64}) \*(.+)$/i);
  assert.ok(match, `invalid checksum line: ${line}`);
  return [match[2], match[1].toLowerCase()];
}));
const assets = [];
for (const localName of plan.assets) {
  const remoteName = candidates(localName).find((name) => remoteMap.has(name));
  assert.ok(remoteName, `remote asset missing: ${localName}`);
  const remote = remoteMap.get(remoteName);
  const localPath = path.join(assetDir, localName);
  assert.ok(fs.existsSync(localPath), `local asset missing: ${localName}`);
  assert.equal(remote.size, fs.statSync(localPath).size, `asset size mismatch: ${localName}`);
  let sha256 = null;
  if (localName.endsWith('.exe')) {
    sha256 = checksums.get(localName) ?? checksums.get(remoteName);
    assert.ok(sha256, `checksum missing: ${localName}`);
    assert.equal(hash(localPath), sha256, `local checksum mismatch: ${localName}`);
    assert.equal(remote.digest, `sha256:${sha256}`, `remote digest mismatch: ${remoteName}`);
  }
  assets.push({ localName, publishedName: remoteName, sizeBytes: remote.size, sha256, downloadUrl: remote.browser_download_url });
}
const report = {
  status: 'published', schemaVersion: 1, version: plan.version, tag: plan.tag, title: plan.title,
  releaseId: release.id, targetCommitish: release.target_commitish, publishedAt: release.published_at,
  prerelease: true, draft: false, url: release.html_url, assets,
};
fs.writeFileSync(path.join(assetDir, 'published-release-report.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(assetDir, 'beta3-publication-state.json'), JSON.stringify(report, null, 2));
console.log(`Beta 3 published release PASS: ${plan.tag}`);
