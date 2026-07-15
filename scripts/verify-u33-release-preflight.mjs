#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactDir = path.join(root, 'artifacts', 'u33-release-preflight');
const plan = JSON.parse(fs.readFileSync(path.join(root, 'release', 'u33-release-plan.json'), 'utf8'));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const notes = fs.readFileSync(path.join(root, plan.releaseNotesPath), 'utf8');
const normalizeLines = (text) => text.replace(/\r\n/g, '\n');
const preflightWorkflow = normalizeLines(fs.readFileSync('.github/workflows/u33-release-preflight.yml', 'utf8'));
const releaseWorkflow = normalizeLines(fs.readFileSync('.github/workflows/u33-beta-release.yml', 'utf8'));
const tagsPath = path.join(artifactDir, 'tags-pages.json');
const releasesPath = path.join(artifactDir, 'releases-pages.json');
const publicationStatePath = path.join(root, 'release', 'u33-publication-state.json');
const publicationState = fs.existsSync(publicationStatePath)
  ? JSON.parse(fs.readFileSync(publicationStatePath, 'utf8'))
  : null;
const allowExistingTarget = process.env.U33_ALLOW_EXISTING_TARGET === '1' || Boolean(publicationState);

const parseCore = (value) => {
  const match = String(value).match(/^(\d+)\.(\d+)\.(\d+)(?:-[0-9A-Za-z.-]+)?$/);
  assert.ok(match, `invalid semantic version: ${value}`);
  return match.slice(1).map(Number);
};

const compareCore = (left, right) => {
  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return 0;
};

assert.equal(plan.schemaVersion, 1, 'release plan schema mismatch');
assert.equal(plan.channel, 'beta');
assert.equal(plan.prerelease, true);
assert.equal(plan.draft, false);
assert.equal(plan.version, '0.168.0-beta.1');
assert.equal(plan.tag, `v${plan.version}`);
assert.equal(plan.previousVersion, '0.167.0-mvp129');
assert.ok(compareCore(parseCore(plan.version), parseCore(plan.previousVersion)) > 0, 'target version core must advance');
assert.ok([plan.previousVersion, plan.version].includes(pkg.version), `package version must be previous or target during U33: ${pkg.version}`);
assert.ok(notes.includes('# Yang-Kura 0.168.0 Beta 1'), 'release notes title mismatch');
assert.deepEqual(plan.assets, [
  `Yang Kura-${plan.version}-portable-x64.exe`,
  `Yang Kura-${plan.version}-setup-x64.exe`,
  'SHA256SUMS.txt',
]);

if (publicationState) {
  assert.deepEqual(publicationState, {
    schemaVersion: 1,
    status: 'published',
    tag: plan.tag,
    releaseId: 354560465,
    targetCommitish: '47f3cfc0e6fbf4dd4616add1ef8675160f90d04d',
    title: plan.title,
    prerelease: true,
    draft: false,
    publishedAt: '2026-07-15T16:11:13Z',
    publishedAssetNames: [
      `Yang.Kura-${plan.version}-portable-x64.exe`,
      `Yang.Kura-${plan.version}-setup-x64.exe`,
      'SHA256SUMS.txt',
    ],
  }, 'U33 publication state mismatch');
}

for (const marker of [
  'permissions:',
  'contents: read',
  'gh api --paginate --slurp',
  'node scripts/verify-u33-release-preflight.mjs',
]) assert.ok(preflightWorkflow.includes(marker), `preflight workflow missing: ${marker}`);
assert.ok(!preflightWorkflow.includes('contents: write'), 'preflight workflow must remain read-only');

for (const marker of [
  "github.event_name == 'push' && github.ref == 'refs/heads/main'",
  'contents: write',
  'gh release create "$RELEASE_TAG"',
  '--target "$GITHUB_SHA"',
  '--prerelease',
]) assert.ok(releaseWorkflow.includes(marker), `release workflow missing: ${marker}`);

if (!fs.existsSync(tagsPath) || !fs.existsSync(releasesPath)) {
  console.log(`U33 release preflight static contract PASS: ${plan.tag}`);
  process.exit(0);
}

const tagsPages = JSON.parse(fs.readFileSync(tagsPath, 'utf8'));
const releasesPages = JSON.parse(fs.readFileSync(releasesPath, 'utf8'));
const tags = tagsPages.flatMap((page) => Array.isArray(page) ? page : []);
const releases = releasesPages.flatMap((page) => Array.isArray(page) ? page : []);
const tagNames = tags.map((item) => item?.name).filter(Boolean);
const releaseTitles = releases.map((item) => item?.name).filter(Boolean);
const existingRelease = releases.find((item) => item?.tag_name === plan.tag) ?? null;
const existingTag = tags.find((item) => item?.name === plan.tag) ?? null;

if (!allowExistingTarget) {
  assert.equal(existingTag, null, `target tag already exists: ${plan.tag}`);
  assert.equal(existingRelease, null, `target release already exists: ${plan.tag}`);
  assert.ok(!releaseTitles.includes(plan.title), `target release title already exists: ${plan.title}`);
} else if (publicationState) {
  assert.ok(existingTag, `published target tag missing: ${plan.tag}`);
  assert.ok(existingRelease, `published target release missing: ${plan.tag}`);
  assert.equal(existingTag.commit?.sha, publicationState.targetCommitish, 'published tag target mismatch');
  assert.equal(existingRelease.id, publicationState.releaseId, 'published release id mismatch');
  assert.equal(existingRelease.name, publicationState.title, 'existing release title mismatch');
  assert.equal(existingRelease.target_commitish, publicationState.targetCommitish, 'existing release target mismatch');
  assert.equal(Boolean(existingRelease.prerelease), publicationState.prerelease, 'existing release must remain prerelease');
  assert.equal(Boolean(existingRelease.draft), publicationState.draft, 'existing release must not be draft');
  assert.equal(existingRelease.published_at, publicationState.publishedAt, 'existing release published timestamp mismatch');
  assert.deepEqual(
    (existingRelease.assets ?? []).map((asset) => asset.name).sort(),
    [...publicationState.publishedAssetNames].sort(),
    'existing release asset names mismatch',
  );
} else if (existingRelease) {
  assert.equal(existingRelease.name, plan.title, 'existing release title mismatch');
  assert.equal(Boolean(existingRelease.prerelease), true, 'existing release must remain prerelease');
  assert.equal(Boolean(existingRelease.draft), false, 'existing release must not be draft');
}

const report = {
  status: 'pass',
  plan,
  packageVersion: pkg.version,
  allowExistingTarget,
  publicationState,
  existingTagCount: tagNames.length,
  existingReleaseCount: releases.length,
  targetAlreadyExists: Boolean(existingTag || existingRelease),
  targetRelease: existingRelease ? {
    id: existingRelease.id ?? null,
    tag: existingRelease.tag_name ?? null,
    name: existingRelease.name ?? null,
    targetCommitish: existingRelease.target_commitish ?? null,
    prerelease: Boolean(existingRelease.prerelease),
    draft: Boolean(existingRelease.draft),
    publishedAt: existingRelease.published_at ?? null,
    assets: (existingRelease.assets ?? []).map((asset) => asset.name),
  } : null,
  latestTags: tagNames.slice(0, 20),
  latestReleases: releases.slice(0, 20).map((item) => ({
    tag: item?.tag_name ?? null,
    name: item?.name ?? null,
    prerelease: Boolean(item?.prerelease),
    draft: Boolean(item?.draft),
    publishedAt: item?.published_at ?? null,
  })),
  collision: false,
};

fs.mkdirSync(artifactDir, { recursive: true });
fs.writeFileSync(path.join(artifactDir, 'preflight-report.json'), JSON.stringify(report, null, 2), 'utf8');
console.log(`U33 release preflight live PASS: ${plan.tag} ${report.targetAlreadyExists ? 'already exists and matches publication state' : 'is available'}`);
