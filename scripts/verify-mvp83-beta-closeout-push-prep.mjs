import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const fail = (message) => {
  console.error(`[MVP-83] ${message}`);
  process.exit(1);
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));

assert(['0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96'].includes(pkg.version), `package.json version must be 0.121.0-mvp83 or compatible MVP-84, got ${pkg.version}`);
assert(['0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96'].includes(lock.version), `package-lock version must be 0.121.0-mvp83 or compatible MVP-84, got ${lock.version}`);
assert(['0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96'].includes(lock.packages?.['']?.version), 'package-lock root package version must be 0.121.0-mvp83 or compatible MVP-84');
assert(pkg.scripts?.['verify:mvp83-beta-closeout-push-prep'] === 'node scripts/verify-mvp83-beta-closeout-push-prep.mjs', 'package.json must expose MVP83 verifier script');
assert(pkg.scripts?.['verify:all']?.includes('verify:mvp83-beta-closeout-push-prep'), 'verify:all must include MVP83 verifier');

const requiredFiles = [
  'src/services/betaCloseoutPushPrepService.ts',
  'docs/CURRENT_ROADMAP_MVP83.md',
  'docs/BETA_CLOSEOUT_PUSH_PREP_MVP83.md',
  'docs/GITHUB_PUSH_PREP_MVP83.md',
  'HANDOFF_MVP82_TO_MVP83.md',
  'PACKAGE_MANIFEST_MVP83_HANDOFF.txt',
];
for (const file of requiredFiles) assert(exists(file), `missing required file: ${file}`);

const service = read('src/services/betaCloseoutPushPrepService.ts');
for (const token of [
  '0.121.0-mvp83',
  '公司网络',
  'GitHub 推送',
  'GitHub main 暂时不是最新开发基线',
  'npm run verify:all',
  'mvp83-beta-closeout-push-prep',
  '不接 SQLite',
  'absolutePath / file://',
]) {
  assert(service.includes(token), `MVP83 service missing token: ${token}`);
}

const diagnostics = read('src/components/DiagnosticsPage.tsx');
for (const token of [
  'betaCloseoutPushPrepService',
  'mvp83-beta-closeout-push-prep',
  'mvp83-push-readiness-cards',
  'mvp83-github-push-prep-commands',
  'mvp83-validation-commands',
  'mvp83-safety-boundaries',
]) {
  assert(diagnostics.includes(token), `DiagnosticsPage missing token: ${token}`);
}

const serviceIndex = read('src/services/index.ts');
assert(serviceIndex.includes('betaCloseoutPushPrepService'), 'services index must export MVP83 service');

for (const file of requiredFiles) {
  const content = read(file);
  for (const token of ['0.121.0-mvp83', 'MVP-83']) {
    assert(content.includes(token), `${file} missing ${token}`);
  }
}

for (const file of ['README.md', 'PROJECT_STATE.md', 'NEXT_CHAT_HANDOFF.md', 'RUN_ME_FIRST.md', 'docs/PROJECT_STATE.md', 'docs/NEXT_CHAT_HANDOFF.md', 'docs/RUN_ME_FIRST.md', '00_NEW_CHAT_START_HERE.md', 'NEW_CHAT_PROMPT.md', 'NEW_CHAT_PROMPT_FULL.md', 'CODEX_MINIMAL_PROMPTS.md']) {
  const content = read(file);
  assert(content.includes('0.121.0-mvp83'), `${file} must mention 0.121.0-mvp83`);
  assert(content.includes('MVP-83'), `${file} must mention MVP-83`);
  assert(content.includes('GitHub') || content.includes('推送'), `${file} must mention GitHub or push prep`);
}

for (const token of ['better-sqlite3', 'ASMR.one fetch', 'DLsite fetch', 'mpv backend', 'fs.unlink', 'fs.rename', 'fs.rm(']) {
  assert(!service.includes(token), `MVP83 service introduced forbidden token: ${token}`);
}

console.log('MVP-83 beta closeout push prep verification passed.');
