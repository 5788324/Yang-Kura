#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const plan = JSON.parse(fs.readFileSync('release/beta3-release-plan.json', 'utf8'));
const dir = path.join('artifacts', 'beta3-preflight');
const tagsPath = path.join(dir, 'tags-pages.json');
const releasesPath = path.join(dir, 'releases-pages.json');
assert.ok(fs.existsSync(tagsPath) && fs.existsSync(releasesPath), 'live tag/release query evidence missing');
const tags = JSON.parse(fs.readFileSync(tagsPath, 'utf8')).flatMap((page) => Array.isArray(page) ? page : []);
const releases = JSON.parse(fs.readFileSync(releasesPath, 'utf8')).flatMap((page) => Array.isArray(page) ? page : []);
const tag = tags.find((item) => item?.name === plan.tag);
const release = releases.find((item) => item?.tag_name === plan.tag);
const allow = process.env.BETA3_ALLOW_EXISTING_TARGET === '1';
if (!allow) {
  assert.equal(tag, undefined, `target tag already exists: ${plan.tag}`);
  assert.equal(release, undefined, `target release already exists: ${plan.tag}`);
} else if (tag || release) {
  assert.ok(tag && release, 'existing target must contain both tag and release');
  assert.equal(release.name, plan.title);
  assert.equal(Boolean(release.prerelease), true);
  assert.equal(Boolean(release.draft), false);
}
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'preflight-report.json'), JSON.stringify({
  status: 'pass',
  tag: plan.tag,
  existingTargetAllowed: allow,
  tagExists: Boolean(tag),
  releaseExists: Boolean(release),
}, null, 2));
console.log(`Beta 3 preflight PASS: ${plan.tag}`);
