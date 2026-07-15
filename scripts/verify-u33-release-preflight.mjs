#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactDir = path.join(root, 'artifacts', 'u33-release-preflight');
const plan = JSON.parse(fs.readFileSync(path.join(root, 'release', 'u33-release-plan.json'), 'utf8'));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const tagsPages = JSON.parse(fs.readFileSync(path.join(artifactDir, 'tags-pages.json'), 'utf8'));
const releasesPages = JSON.parse(fs.readFileSync(path.join(artifactDir, 'releases-pages.json'), 'utf8'));
const tags = tagsPages.flatMap((page) => Array.isArray(page) ? page : []);
const releases = releasesPages.flatMap((page) => Array.isArray(page) ? page : []);
const allowExistingTarget = process.env.U33_ALLOW_EXISTING_TARGET === '1';

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
assert.ok(fs.existsSync(path.join(root, plan.releaseNotesPath)), `release notes missing: ${plan.releaseNotesPath}`);
assert.deepEqual(plan.assets, [
  `Yang Kura-${plan.version}-portable-x64.exe`,
  `Yang Kura-${plan.version}-setup-x64.exe`,
  'SHA256SUMS.txt',
]);

const tagNames = tags.map((item) => item?.name).filter(Boolean);
const releaseTags = releases.map((item) => item?.tag_name).filter(Boolean);
const releaseTitles = releases.map((item) => item?.name).filter(Boolean);
const existingRelease = releases.find((item) => item?.tag_name === plan.tag) ?? null;
const existingTag = tags.find((item) => item?.name === plan.tag) ?? null;

if (!allowExistingTarget) {
  assert.equal(existingTag, null, `target tag already exists: ${plan.tag}`);
  assert.equal(existingRelease, null, `target release already exists: ${plan.tag}`);
  assert.ok(!releaseTitles.includes(plan.title), `target release title already exists: ${plan.title}`);
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

fs.writeFileSync(path.join(artifactDir, 'preflight-report.json'), JSON.stringify(report, null, 2), 'utf8');
console.log(`U33 release preflight PASS: ${plan.tag} ${report.targetAlreadyExists ? 'already exists and is compatible' : 'is available'}`);
