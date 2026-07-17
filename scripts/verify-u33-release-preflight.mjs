#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactDir = path.join(root, 'artifacts', 'u33-release-preflight');
const plan = JSON.parse(fs.readFileSync(path.join(root, 'release', 'u33-release-plan.json'), 'utf8'));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
const notes = fs.readFileSync(path.join(root, plan.releaseNotesPath), 'utf8');
const normalizeLines = (text) => text.replace(/\r\n/g, '\n');
const preflightWorkflow = normalizeLines(fs.readFileSync('.github/workflows/u33-release-preflight.yml', 'utf8'));
const releaseWorkflow = normalizeLines(fs.readFileSync('.github/workflows/u33-beta-release.yml', 'utf8'));
const tagsPath = path.join(artifactDir, 'tags-pages.json');
const releasesPath = path.join(artifactDir, 'releases-pages.json');

const parseVersion = (value) => {
  const match = String(value).match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/);
  assert.ok(match, `invalid semantic version: ${value}`);
  return { core: match.slice(1, 4).map(Number), prerelease: match[4] ?? '' };
};
const compareVersion = (left, right) => {
  for (let index = 0; index < 3; index += 1) {
    if (left.core[index] !== right.core[index]) return left.core[index] - right.core[index];
  }
  if (left.prerelease === right.prerelease) return 0;
  if (!left.prerelease) return 1;
  if (!right.prerelease) return -1;
  return left.prerelease.localeCompare(right.prerelease, undefined, { numeric: true });
};

assert.equal(plan.schemaVersion, 1, 'release plan schema mismatch');
assert.equal(plan.channel, 'beta');
assert.equal(plan.prerelease, true);
assert.equal(plan.draft, false);
assert.equal(plan.tag, `v${plan.version}`);
assert.ok(compareVersion(parseVersion(plan.version), parseVersion(plan.previousVersion)) > 0, 'target version must advance');
assert.equal(pkg.version, plan.version, `package version mismatch: ${pkg.version}`);
assert.equal(lock.version, plan.version, `package-lock top version mismatch: ${lock.version}`);
assert.equal(lock.packages?.['']?.version, plan.version, `package-lock root version mismatch: ${lock.packages?.['']?.version}`);
assert.ok(notes.includes(`# ${plan.title}`), 'release notes title mismatch');
assert.deepEqual(plan.assets, [
  `Yang Kura-${plan.version}-portable-x64.exe`,
  `Yang Kura-${plan.version}-setup-x64.exe`,
  'SHA256SUMS.txt',
]);

for (const marker of [
  'permissions:',
  'contents: read',
  'gh api --paginate --slurp',
  'node scripts/verify-u33-release-preflight.mjs',
]) assert.ok(preflightWorkflow.includes(marker), `preflight workflow missing: ${marker}`);
assert.ok(!preflightWorkflow.includes('contents: write'), 'preflight workflow must remain read-only');

for (const marker of [
  "github.event_name == 'push' && github.ref == 'refs/heads/main'",
  'permissions:\n      contents: write',
  'gh release create "$RELEASE_TAG"',
  '--target "$GITHUB_SHA"',
  '--notes-file "$RELEASE_NOTES"',
  '--prerelease',
]) assert.ok(releaseWorkflow.includes(marker), `release workflow missing: ${marker}`);

if (!fs.existsSync(tagsPath) || !fs.existsSync(releasesPath)) {
  console.log(`Personal Beta release preflight static contract PASS: ${plan.tag}`);
  process.exit(0);
}

const tagsPages = JSON.parse(fs.readFileSync(tagsPath, 'utf8'));
const releasesPages = JSON.parse(fs.readFileSync(releasesPath, 'utf8'));
const tags = tagsPages.flatMap((page) => Array.isArray(page) ? page : []);
const releases = releasesPages.flatMap((page) => Array.isArray(page) ? page : []);
const existingTag = tags.find((item) => item?.name === plan.tag) ?? null;
const existingRelease = releases.find((item) => item?.tag_name === plan.tag) ?? null;
const allowExistingTarget = process.env.U33_ALLOW_EXISTING_TARGET === '1';

if (!allowExistingTarget) {
  assert.equal(existingTag, null, `target tag already exists: ${plan.tag}`);
  assert.equal(existingRelease, null, `target release already exists: ${plan.tag}`);
  assert.ok(!releases.some((item) => item?.name === plan.title), `target release title already exists: ${plan.title}`);
} else if (existingRelease) {
  assert.equal(existingRelease.name, plan.title, 'existing release title mismatch');
  assert.equal(Boolean(existingRelease.prerelease), true, 'existing release must remain prerelease');
  assert.equal(Boolean(existingRelease.draft), false, 'existing release must not be draft');
}

const report = {
  status: 'pass',
  plan,
  packageVersion: pkg.version,
  packageLockVersion: lock.version,
  allowExistingTarget,
  existingTagCount: tags.length,
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
    assets: (existingRelease.assets ?? []).map((asset) => ({
      name: asset.name,
      sizeBytes: asset.size,
      digest: asset.digest ?? null,
    })),
  } : null,
  collision: false,
};

fs.mkdirSync(artifactDir, { recursive: true });
fs.writeFileSync(path.join(artifactDir, 'preflight-report.json'), JSON.stringify(report, null, 2), 'utf8');
console.log(`Personal Beta release preflight live PASS: ${plan.tag} ${report.targetAlreadyExists ? 'already exists and matches release contract' : 'is available'}`);
