#!/usr/bin/env node
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const [releaseJsonPath, assetDirectory, expectedTarget, mode] = process.argv.slice(2);
const plan = JSON.parse(fs.readFileSync('release/u33-release-plan.json', 'utf8'));
const workflow = fs.readFileSync('.github/workflows/u33-beta-release.yml', 'utf8').replace(/\r\n/g, '\n');
const publicationStatePath = 'release/u33-publication-state.json';
const publicationState = fs.existsSync(publicationStatePath)
  ? JSON.parse(fs.readFileSync(publicationStatePath, 'utf8'))
  : null;
const remoteOnly = mode === '--remote-only';

assert.equal(plan.version, '0.168.0-beta.1');
assert.equal(plan.tag, 'v0.168.0-beta.1');
assert.equal(plan.title, 'Yang-Kura 0.168.0 Beta 1');
assert.equal(plan.prerelease, true);
assert.equal(plan.draft, false);
assert.deepEqual(plan.assets, [
  'Yang Kura-0.168.0-beta.1-portable-x64.exe',
  'Yang Kura-0.168.0-beta.1-setup-x64.exe',
  'SHA256SUMS.txt',
]);

if (publicationState) {
  assert.equal(publicationState.schemaVersion, 1, 'published release state schema mismatch');
  assert.equal(publicationState.status, 'published', 'published release state status mismatch');
  assert.equal(publicationState.tag, plan.tag, 'published release state tag mismatch');
  assert.equal(publicationState.title, plan.title, 'published release state title mismatch');
  assert.equal(Boolean(publicationState.prerelease), true, 'published release state must remain prerelease');
  assert.equal(Boolean(publicationState.draft), false, 'published release state must not be draft');
  assert.match(publicationState.targetCommitish ?? '', /^[a-f0-9]{40}$/i, 'published release state target missing');
  assert.equal(publicationState.assets?.length, plan.assets.length, 'published release state asset count mismatch');
  assert.deepEqual(publicationState.assets.map((asset) => asset.localName), plan.assets, 'published release state local asset names mismatch');
  for (const asset of publicationState.assets) {
    assert.ok(asset.publishedName, `published release state asset name missing: ${asset.localName}`);
    assert.ok(Number(asset.sizeBytes) > 0, `published release state asset size missing: ${asset.localName}`);
    assert.match(asset.sha256 ?? '', /^[a-f0-9]{64}$/i, `published release state SHA-256 missing: ${asset.localName}`);
  }
}

for (const marker of [
  "github.event_name == 'push' && github.ref == 'refs/heads/main'",
  'permissions:\n      contents: write',
  'sha256sum -c SHA256SUMS.txt',
  'gh release create "$RELEASE_TAG"',
  '--target "$GITHUB_SHA"',
  '--title "$RELEASE_TITLE"',
  '--notes-file docs/RELEASE_NOTES_0.168.0-beta.1.md',
  '--prerelease',
  'gh api "repos/$GITHUB_REPOSITORY/releases/tags/$RELEASE_TAG"',
  'node scripts/verify-u33-published-release.mjs publish/release.json publish "$GITHUB_SHA"',
]) assert.ok(workflow.includes(marker), `published release workflow missing: ${marker}`);

if (!releaseJsonPath && !assetDirectory && !expectedTarget) {
  console.log('U33 published release static contract PASS');
  process.exit(0);
}

assert.ok(releaseJsonPath && assetDirectory && expectedTarget, 'usage: verify-u33-published-release <release.json> <asset-dir> <expected-target> [--remote-only]');
const release = JSON.parse(fs.readFileSync(releaseJsonPath, 'utf8'));
const effectiveExpectedTarget = publicationState?.targetCommitish ?? expectedTarget;
const hashFile = (filePath) => {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
};
const publishedCandidates = (localName) => [...new Set([
  localName,
  localName.replaceAll(' ', '.'),
])];

assert.equal(release.tag_name, plan.tag, 'published release tag mismatch');
assert.equal(release.name, plan.title, 'published release title mismatch');
assert.equal(Boolean(release.prerelease), true, 'published release must be prerelease');
assert.equal(Boolean(release.draft), false, 'published release must not be draft');
assert.equal(release.target_commitish, effectiveExpectedTarget, 'published release target commit mismatch');
assert.ok(release.published_at, 'published release timestamp missing');
assert.ok(release.html_url, 'published release URL missing');

const assetMap = new Map((release.assets ?? []).map((asset) => [asset.name, asset]));
const matchedAssets = new Map();
if (publicationState) {
  assert.deepEqual(
    [...assetMap.keys()].sort(),
    publicationState.assets.map((asset) => asset.publishedName).sort(),
    'published release asset names mismatch: frozen manifest',
  );
  for (const expectedAsset of publicationState.assets) {
    const remote = assetMap.get(expectedAsset.publishedName);
    assert.ok(remote, `remote release asset missing: ${expectedAsset.publishedName}`);
    assert.equal(remote.size, expectedAsset.sizeBytes, `published release asset size mismatch: ${expectedAsset.publishedName}`);
    assert.equal(remote.digest, `sha256:${expectedAsset.sha256}`, `published release asset SHA-256 mismatch: ${expectedAsset.publishedName}`);
    assert.ok(remote.browser_download_url, `release asset download URL missing: ${expectedAsset.publishedName}`);
    matchedAssets.set(expectedAsset.localName, remote);
  }
} else {
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
    assert.ok(remote, `remote release asset missing: ${localName}`);
    assert.ok(remote.browser_download_url, `release asset download URL missing: ${remote.name}`);
    assert.ok(Number(remote.size) > 0, `release asset size missing: ${remote.name}`);
    if (!remoteOnly) {
      const localPath = path.join(assetDirectory, localName);
      assert.ok(fs.existsSync(localPath), `local published asset missing: ${localName}`);
      assert.equal(remote.size, fs.statSync(localPath).size, `release asset size mismatch: ${localName}`);
    }
  }

  const checksumPath = path.join(assetDirectory, 'SHA256SUMS.txt');
  assert.ok(fs.existsSync(checksumPath), 'local SHA256SUMS.txt missing');
  const checksumLines = fs.readFileSync(checksumPath, 'utf8').trim().split(/\r?\n/).filter(Boolean);
  const expectedChecksums = new Map(checksumLines.map((line) => {
    const match = line.match(/^([a-f0-9]{64}) \*(.+)$/i);
    assert.ok(match, `invalid SHA256SUMS line: ${line}`);
    return [match[2], match[1].toLowerCase()];
  }));

  for (const localName of plan.assets.filter((name) => name.endsWith('.exe'))) {
    const remote = matchedAssets.get(localName);
    const checksumName = remoteOnly ? remote.name : localName;
    const expectedHash = expectedChecksums.get(checksumName);
    assert.ok(expectedHash, `SHA256SUMS missing executable: ${checksumName}`);
    if (remoteOnly) {
      assert.match(remote.digest ?? '', /^sha256:[a-f0-9]{64}$/i, `remote SHA-256 digest missing: ${remote.name}`);
      assert.equal(expectedHash, remote.digest.slice('sha256:'.length).toLowerCase(), `remote SHA-256 mismatch: ${remote.name}`);
    } else {
      assert.equal(expectedHash, hashFile(path.join(assetDirectory, localName)), `local SHA-256 mismatch: ${localName}`);
    }
  }
}

const stateAssetMap = new Map((publicationState?.assets ?? []).map((asset) => [asset.localName, asset]));
const report = {
  status: 'pass',
  verificationMode: publicationState ? 'frozen-publication-manifest' : (remoteOnly ? 'remote-only' : 'local-bundle'),
  requestedTargetCommitish: expectedTarget,
  expectedTargetCommitish: effectiveExpectedTarget,
  publicationStateLocked: Boolean(publicationState),
  tag: release.tag_name,
  title: release.name,
  targetCommitish: release.target_commitish,
  publishedAt: release.published_at,
  url: release.html_url,
  assets: plan.assets.map((localName) => {
    const remote = matchedAssets.get(localName);
    const frozen = stateAssetMap.get(localName);
    return {
      localName,
      publishedName: remote.name,
      sizeBytes: remote.size,
      sha256: frozen?.sha256 ?? (localName.endsWith('.exe')
        ? (remoteOnly ? remote.digest.slice('sha256:'.length) : hashFile(path.join(assetDirectory, localName)))
        : null),
      downloadUrl: remote.browser_download_url,
    };
  }),
};

fs.writeFileSync(path.join(assetDirectory, 'published-release-report.json'), JSON.stringify(report, null, 2), 'utf8');
console.log(`U33 published release live verifier PASS: ${release.tag_name} (${report.verificationMode}; target ${effectiveExpectedTarget})`);
