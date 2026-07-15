#!/usr/bin/env node
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const [releaseJsonPath, assetDirectory, expectedTarget] = process.argv.slice(2);
assert.ok(releaseJsonPath && assetDirectory && expectedTarget, 'usage: verify-u33-published-release <release.json> <asset-dir> <expected-target>');

const plan = JSON.parse(fs.readFileSync('release/u33-release-plan.json', 'utf8'));
const release = JSON.parse(fs.readFileSync(releaseJsonPath, 'utf8'));
const hashFile = (filePath) => {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
};

assert.equal(release.tag_name, plan.tag, 'published release tag mismatch');
assert.equal(release.name, plan.title, 'published release title mismatch');
assert.equal(Boolean(release.prerelease), true, 'published release must be prerelease');
assert.equal(Boolean(release.draft), false, 'published release must not be draft');
assert.equal(release.target_commitish, expectedTarget, 'published release target commit mismatch');
assert.ok(release.published_at, 'published release timestamp missing');
assert.ok(release.html_url, 'published release URL missing');

const assetMap = new Map((release.assets ?? []).map((asset) => [asset.name, asset]));
assert.deepEqual([...assetMap.keys()].sort(), [...plan.assets].sort(), 'published release asset names mismatch');

for (const assetName of plan.assets) {
  const localPath = path.join(assetDirectory, assetName);
  assert.ok(fs.existsSync(localPath), `local published asset missing: ${assetName}`);
  const remote = assetMap.get(assetName);
  assert.ok(remote, `remote release asset missing: ${assetName}`);
  assert.equal(remote.size, fs.statSync(localPath).size, `release asset size mismatch: ${assetName}`);
  assert.ok(remote.browser_download_url, `release asset download URL missing: ${assetName}`);
}

const checksumPath = path.join(assetDirectory, 'SHA256SUMS.txt');
const checksumLines = fs.readFileSync(checksumPath, 'utf8').trim().split(/\r?\n/).filter(Boolean);
const expectedChecksums = new Map(checksumLines.map((line) => {
  const match = line.match(/^([a-f0-9]{64}) \*(.+)$/i);
  assert.ok(match, `invalid SHA256SUMS line: ${line}`);
  return [match[2], match[1].toLowerCase()];
}));

for (const assetName of plan.assets.filter((name) => name.endsWith('.exe'))) {
  assert.equal(expectedChecksums.get(assetName), hashFile(path.join(assetDirectory, assetName)), `local SHA-256 mismatch: ${assetName}`);
}

const report = {
  status: 'pass',
  tag: release.tag_name,
  title: release.name,
  targetCommitish: release.target_commitish,
  publishedAt: release.published_at,
  url: release.html_url,
  assets: plan.assets.map((name) => ({
    name,
    sizeBytes: fs.statSync(path.join(assetDirectory, name)).size,
    sha256: name.endsWith('.exe') ? hashFile(path.join(assetDirectory, name)) : null,
    downloadUrl: assetMap.get(name)?.browser_download_url ?? null,
  })),
};

fs.writeFileSync(path.join(assetDirectory, 'published-release-report.json'), JSON.stringify(report, null, 2), 'utf8');
console.log(`U33 published release verifier PASS: ${release.tag_name}`);
