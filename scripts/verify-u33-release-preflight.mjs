#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactDir = path.join(root, 'artifacts', 'u33-release-preflight');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
const plan = JSON.parse(read('release/u33-release-plan.json'));
const publication = JSON.parse(read('release/beta2-publication-state.json'));
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const notes = read(plan.releaseNotesPath);
const preflightWorkflow = read('.github/workflows/u33-release-preflight.yml');
const releaseWorkflow = read('.github/workflows/u33-beta-release.yml');
const tagsPath = path.join(artifactDir, 'tags-pages.json');
const releasesPath = path.join(artifactDir, 'releases-pages.json');

assert.equal(plan.schemaVersion, 1);
assert.equal(plan.channel, 'beta');
assert.equal(plan.version, '0.169.0-beta.2');
assert.equal(plan.previousVersion, '0.168.0-beta.1');
assert.equal(plan.tag, 'v0.169.0-beta.2');
assert.equal(plan.title, 'Yang-Kura 0.169.0 Beta 2 · 个人日用版');
assert.equal(plan.prerelease, true);
assert.equal(plan.draft, false);
assert.equal(pkg.version, plan.version);
assert.equal(lock.version, plan.version);
assert.equal(lock.packages?.['']?.version, plan.version);
assert.ok(notes.includes(`# ${plan.title}`));
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
assert.equal(publication.assets?.length, 3);

for (const marker of [
  'name: Beta 2 Publication Record Audit',
  'workflow_dispatch:',
  'permissions:\n  contents: read',
  "U33_ALLOW_EXISTING_TARGET: '1'",
  'node scripts/verify-u33-release-preflight.mjs',
]) assert.ok(preflightWorkflow.includes(marker), `publication record workflow missing: ${marker}`);
assert.ok(!preflightWorkflow.includes('contents: write'), 'publication record audit must remain read-only');
assert.ok(!preflightWorkflow.includes('pull_request:'), 'published record audit must not run on pull requests');
assert.ok(!preflightWorkflow.includes('push:'), 'published record audit must not run on push');

for (const marker of [
  'name: Beta 2 Published Release Audit',
  'workflow_dispatch:',
  'permissions:\n  contents: read',
  'gh release download v0.169.0-beta.2',
  'node scripts/verify-u33-published-release.mjs',
]) assert.ok(releaseWorkflow.includes(marker), `published release audit missing: ${marker}`);
assert.ok(!releaseWorkflow.includes('contents: write'), 'published release audit must remain read-only');
assert.ok(!releaseWorkflow.includes('gh release create'), 'published release audit must not recreate releases');
assert.ok(!releaseWorkflow.includes('pull_request:'), 'published release audit must not run on pull requests');
assert.ok(!releaseWorkflow.includes('push:'), 'published release audit must not run on push');

if (!fs.existsSync(tagsPath) || !fs.existsSync(releasesPath)) {
  console.log('Beta 2 frozen publication static contract PASS');
  process.exit(0);
}

const tagsPages = JSON.parse(fs.readFileSync(tagsPath, 'utf8'));
const releasesPages = JSON.parse(fs.readFileSync(releasesPath, 'utf8'));
const tags = tagsPages.flatMap((page) => Array.isArray(page) ? page : []);
const releases = releasesPages.flatMap((page) => Array.isArray(page) ? page : []);
const existingTag = tags.find((item) => item?.name === plan.tag);
const existingRelease = releases.find((item) => item?.tag_name === plan.tag);
assert.ok(existingTag, `published tag missing: ${plan.tag}`);
assert.ok(existingRelease, `published release missing: ${plan.tag}`);
assert.equal(existingRelease.id, publication.releaseId);
assert.equal(existingRelease.name, publication.title);
assert.equal(existingRelease.target_commitish, publication.targetCommitish);
assert.equal(Boolean(existingRelease.prerelease), true);
assert.equal(Boolean(existingRelease.draft), false);
assert.equal(existingRelease.published_at, publication.publishedAt);
assert.equal((existingRelease.assets ?? []).length, publication.assets.length);

const report = {
  status: 'pass',
  mode: 'published-record-audit',
  version: plan.version,
  tag: plan.tag,
  releaseId: existingRelease.id,
  targetCommitish: existingRelease.target_commitish,
  publishedAt: existingRelease.published_at,
  assets: (existingRelease.assets ?? []).map((asset) => ({
    name: asset.name,
    sizeBytes: asset.size,
    digest: asset.digest ?? null,
  })),
};
fs.mkdirSync(artifactDir, { recursive: true });
fs.writeFileSync(path.join(artifactDir, 'preflight-report.json'), JSON.stringify(report, null, 2), 'utf8');
console.log(`Beta 2 frozen publication live audit PASS: ${plan.tag}`);
