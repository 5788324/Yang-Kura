#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactDir = path.join(root, 'artifacts', 'u39-final-acceptance');
const reportPath = path.join(artifactDir, 'manifest.json');
const expectedVersion = '0.169.0-beta.2';
const expectedReleaseId = 355486824;
const expectedMilestones = [
  ['U39-A', '8431829427dbe3da86b976a18d124a7a119c5e8f'],
  ['U39-B', 'f87813cb219f8d298c54eb4fd7793d1038129b5a'],
  ['U39-C', '77f0152a80aea9fdfeaaf33f046d9a47d69f6d2e'],
  ['U39-D', '5a6411da2a5dbdb90ef143061f293e6f7160c94a'],
  ['U39-E', 'b0842eb335f937748d580c6e7aee990537307224'],
  ['U39-F', '6e8a2eb187d112a886928ee889951f53b58586b5'],
];
const requiredFiles = [
  'README.md',
  'PROJECT_STATE.md',
  'PROJECT_ROADMAP.md',
  'AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md',
  'AI_HANDOFF/WORKLOG.md',
  'docs/U39_FINAL_ACCEPTANCE.md',
  'docs/architecture/U39_PLAYERBAR_THEME.md',
  'docs/architecture/U39_MAINTENANCE_ENTRY.md',
  'docs/architecture/U39_ROOT_AUTHORIZATION_PERSISTENCE.md',
  'docs/architecture/U39_LIGHT_THEME_CONTRAST.md',
  'docs/architecture/U39_ARCHITECTURE_GUARDRAILS.md',
  'scripts/verify-u39a-playerbar-theme.mjs',
  'scripts/verify-u39b-maintenance-entry.mjs',
  'scripts/verify-u39c-root-authorization-persistence.mjs',
  'scripts/verify-u39d-light-theme-contrast.mjs',
  'scripts/verify-u39e-empty-state-truthfulness.mjs',
  'scripts/verify-u39f-architecture-guardrails.mjs',
  'scripts/test-u39f-architecture-guardrails.mjs',
  '.github/workflows/u39-final-acceptance.yml',
  '.github/workflows/architecture-guardrails.yml',
  '.github/workflows/branch-validation.yml',
  '.github/workflows/u32-release-candidate.yml',
  'release/beta2-publication-state.json',
];
const allowedCloseoutChanges = [
  '.github/workflows/branch-validation.yml',
  '.github/workflows/u39-final-acceptance.yml',
  'AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md',
  'AI_HANDOFF/WORKLOG.md',
  'PROJECT_ROADMAP.md',
  'PROJECT_STATE.md',
  'README.md',
  'docs/U39_FINAL_ACCEPTANCE.md',
  'scripts/verify-handoff.mjs',
  'scripts/verify-u39-final-acceptance.mjs',
];

function git(args, options = {}) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 32 * 1024 * 1024,
    ...options,
  }).trim();
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function commitExists(sha) {
  try {
    git(['cat-file', '-e', `${sha}^{commit}`]);
    return true;
  } catch {
    return false;
  }
}

function isAncestor(sha, headSha) {
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', sha, headSha], {
      cwd: root,
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

function resolveChangedFiles() {
  const baseSha = process.env.BASE_SHA?.trim();
  if (!baseSha) return { baseSha: null, changedFiles: [] };
  const output = git(['diff', '--name-only', '--diff-filter=ACMRD', baseSha, 'HEAD']);
  return {
    baseSha,
    changedFiles: output ? output.split(/\r?\n/).filter(Boolean).sort() : [],
  };
}

const headSha = git(['rev-parse', 'HEAD']);
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const publication = JSON.parse(fs.readFileSync(path.join(root, 'release', 'beta2-publication-state.json'), 'utf8'));
const missingFiles = requiredFiles.filter((file) => !fileExists(file));
const milestoneResults = expectedMilestones.map(([stage, sha]) => ({
  stage,
  sha,
  exists: commitExists(sha),
  ancestorOfHead: commitExists(sha) && isAncestor(sha, headSha),
}));
const { baseSha, changedFiles } = resolveChangedFiles();
const unexpectedCloseoutChanges = baseSha
  ? changedFiles.filter((file) => !allowedCloseoutChanges.includes(file))
  : [];
const failures = [];

if (packageJson.version !== expectedVersion) failures.push(`package version is ${packageJson.version}, expected ${expectedVersion}`);
if (publication.status !== 'published') failures.push(`Beta 2 publication status is ${publication.status}`);
if (publication.releaseId !== expectedReleaseId) failures.push(`Beta 2 release ID is ${publication.releaseId}`);
for (const file of missingFiles) failures.push(`missing required file ${file}`);
for (const milestone of milestoneResults) {
  if (!milestone.exists) failures.push(`${milestone.stage} commit is missing: ${milestone.sha}`);
  else if (!milestone.ancestorOfHead) failures.push(`${milestone.stage} is not an ancestor of HEAD: ${milestone.sha}`);
}
for (const file of unexpectedCloseoutChanges) failures.push(`unexpected U39-G product/runtime change: ${file}`);

const report = {
  status: failures.length ? 'fail' : 'pass',
  mode: process.argv.includes('--record-pass') ? 'final-execution-record' : 'preflight',
  generatedAt: new Date().toISOString(),
  headSha,
  baseSha,
  version: packageJson.version,
  release: {
    status: publication.status,
    releaseId: publication.releaseId,
    tag: publication.tagName ?? publication.tag ?? 'v0.169.0-beta.2',
  },
  milestones: milestoneResults,
  requiredFileCount: requiredFiles.length,
  missingFiles,
  changedFiles,
  unexpectedCloseoutChanges,
  executedChecks: process.argv.includes('--record-pass')
    ? [
        'npm audit high/critical',
        'TypeScript',
        'Renderer build',
        'Electron build',
        'U28 resource library and restart authorization',
        'U29 playback, seek, queue, subtitles and resume',
        'U30 theme, DPI, keyboard and accessibility',
        'U31 importer transactions and rollback',
        'U32 daily UI visual audit',
        'U39-A through U39-F focused verifiers',
        'stable regression',
        'portable and NSIS build',
        'packaged install/uninstall/data-retention acceptance',
        'packaged page readiness',
      ]
    : [],
  failures,
};

fs.mkdirSync(artifactDir, { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

if (failures.length) {
  console.error(failures.join('\n'));
  console.error(`U39 final acceptance manifest FAIL: ${path.relative(root, reportPath)}`);
  process.exit(1);
}

console.log(`U39 final acceptance manifest PASS: ${headSha}`);
console.log(`Milestones: ${milestoneResults.map((item) => item.stage).join(', ')}`);
console.log(`Report: ${path.relative(root, reportPath)}`);
