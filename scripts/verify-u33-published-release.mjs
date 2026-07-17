#!/usr/bin/env node
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const [releaseJsonPath, assetDirectory, expectedTarget, mode] = process.argv.slice(2);
const plan = JSON.parse(fs.readFileSync('release/u33-release-plan.json', 'utf8'));
const publication = JSON.parse(fs.readFileSync('release/beta2-publication-state.json', 'utf8'));
const workflow = fs.readFileSync('.github/workflows/u33-beta-release.yml', 'utf8').replace(/\r\n/g, '\n');
const remoteOnly = mode === '--remote-only';

assert.equal(plan.tag, `v${plan.version}`);
assert.equal(plan.prerelease, true);
assert.equal(plan.draft, false);
assert.deepEqual(plan.assets, [
  `Yang Kura-${plan.version}-portable-x64.exe`,
  `Yang Kura-${plan.version}-setup-x64.exe`,
  'SHA256SUMS.txt',
]);
assert.equal(publication.status, 'published');
assert.equal(publication.version, plan.version);
assert.equal(publication.tag, plan.tag);
assert.equal(publication.title, plan.title);
assert.equal(publication.releaseId, 355486824);
assert.equal(publication.targetCommitish, '14bc78a81c827882efc232c6c6c12f0d8ed04542');

for (const marker of [
  'name: Beta 2 Published Release Audit',
  'workflow_dispatch:',
  'permissions:\n  contents: read',
  'gh api "repos/$GITHUB_REPOSITORY/releases/tags/v0.169.0-beta.2"',
  'gh release download v0.169.0-beta.2',
  'node scripts/verify-u33-published-release.mjs',
  '--remote-only',
]) assert.ok(workflow.includes(marker), `published release audit missing: ${marker}`);
assert.ok(!workflow.includes('contents: write'), 'published release audit must remain read-only');
assert.ok(!workflow.includes('gh release create'), 'published release audit must not recreate releases');
assert.ok(!workflow.includes('pull_request:'), 'published release audit must not run on pull requests');
assert.ok(!workflow.includes('push:'), 'published release audit must not run on push');

if (!releaseJsonPath && !assetDirectory && !expectedTarget) {
  console.log('Beta 2 published release static audit contract PASS');
  process.exit(0);
}

assert.ok(releaseJsonPath && assetDirectory && expectedTarget, 'usage: verify-u33-published-release <release.json> <asset-dir> <expected-target> [--remote-only]');
const release = JSON.parse(fs.readFileSync(releaseJsonPath, 'utf8'));
const hashFile = (filePath) => crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
const publishedCandidates = (localName) => [...new Set([localName, localName.replaceAll(' ', '.')])];

assert.equal(release.id, publication.releaseId, 'published release ID mismatch');
assert.equal(release.tag_name, plan.tag, 'published release tag mismatch');
assert.equal(release.name, plan.title, 'published release title mismatch');
assert.equal(Boolean(release.prerelease), true, 'published release must be prerelease');
assert.equal(Boolean(release.draft), false, 'published release must not be draft');
assert.equal(release.target_commitish, expectedTarget, 'published release target commit mismatch');
assert.equal(release.target_commitish, publication.targetCommitish, 'publication state target mismatch');
assert.equal(release.published_at, publication.publishedAt, 'publication timestamp mismatch');
assert.ok(release.html_url, 'published release URL missing');

const assetMap = new Map((release.assets ?? []).map((asset) => [asset.name, asset]));
const matchedAssets = new Map();
for (const localName of plan.assets) {
  const matches = publishedCandidates(localName).filter((candidate) => assetMap.has(candidate));
  assert.equal(matches.length, 1, `published release asset names mismatch: ${localName} -> ${matches.join(', ') || 'missing'}`);
  matchedAssets.set(localName, assetMap.get(matches[0]));
}
assert.deepEqual(
  [...assetMap.keys()].sort(),
  [...matchedAssets.values()].map((asset) => asset.name).sort(),
  'published release asset names mismatch: unexpected assets',
);

for (const localName of plan.assets) {
  const remote = matchedAssets.get(localName);
  const frozen = publication.assets.find((asset) => asset.localName === localName);
  assert.ok(remote, `remote release asset missing: ${localName}`);
  assert.ok(frozen, `frozen publication asset missing: ${localName}`);
  assert.ok(remote.browser_download_url, `release asset download URL missing: ${remote.name}`);
  assert.equal(remote.name, frozen.publishedName, `frozen asset name mismatch: ${localName}`);
  assert.equal(remote.size, frozen.sizeBytes, `frozen asset size mismatch: ${localName}`);
  assert.equal(remote.digest, `sha256:${frozen.sha256}`, `frozen asset digest mismatch: ${localName}`);
  if (!remoteOnly) {
    const localPath = path.join(assetDirectory, localName);
    assert.ok(fs.existsSync(localPath), `local published asset missing: ${localName}`);
    assert.equal(remote.size, fs.statSync(localPath).size, `release asset size mismatch: ${localName}`);
  }
}

const checksumRemote = matchedAssets.get('SHA256SUMS.txt');
const checksumCandidates = [
  path.join(assetDirectory, 'SHA256SUMS.txt'),
  path.join(assetDirectory, checksumRemote.name),
];
const checksumPath = checksumCandidates.find((file) => fs.existsSync(file));
assert.ok(checksumPath, 'downloaded SHA256SUMS.txt missing');
const checksumLines = fs.readFileSync(checksumPath, 'utf8').trim().split(/\r?\n/).filter(Boolean);
const expectedChecksums = new Map(checksumLines.map((line) => {
  const match = line.match(/^([a-f0-9]{64}) \*(.+)$/i);
  assert.ok(match, `invalid SHA256SUMS line: ${line}`);
  return [match[2], match[1].toLowerCase()];
}));

for (const localName of plan.assets.filter((name) => name.endsWith('.exe'))) {
  const remote = matchedAssets.get(localName);
  const frozen = publication.assets.find((asset) => asset.localName === localName);
  const expectedHash = expectedChecksums.get(localName) ?? expectedChecksums.get(remote.name);
  assert.ok(expectedHash, `SHA256SUMS missing executable: ${localName}`);
  assert.equal(expectedHash, frozen.sha256, `frozen SHA-256 mismatch: ${localName}`);
  if (remoteOnly) {
    assert.equal(remote.digest, `sha256:${expectedHash}`, `remote SHA-256 mismatch: ${remote.name}`);
  } else {
    assert.equal(expectedHash, hashFile(path.join(assetDirectory, localName)), `local SHA-256 mismatch: ${localName}`);
  }
}

const report = {
  status: 'pass',
  verificationMode: remoteOnly ? 'remote-only' : 'local-bundle',
  releaseId: release.id,
  tag: release.tag_name,
  title: release.name,
  targetCommitish: release.target_commitish,
  publishedAt: release.published_at,
  url: release.html_url,
  assets: plan.assets.map((localName) => {
    const remote = matchedAssets.get(localName);
    const frozen = publication.assets.find((asset) => asset.localName === localName);
    return {
      localName,
      publishedName: remote.name,
      sizeBytes: remote.size,
      sha256: frozen.sha256,
      downloadUrl: remote.browser_download_url,
    };
  }),
};
fs.writeFileSync(path.join(assetDirectory, 'published-release-report.json'), JSON.stringify(report, null, 2), 'utf8');
console.log(`Beta 2 published release audit PASS: ${release.tag_name} (target ${expectedTarget})`);
