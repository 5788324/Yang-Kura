import fs from 'node:fs';

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const packageJson = JSON.parse(read('package.json'));
const packageLock = JSON.parse(read('package-lock.json'));
const settings = read('src/components/SettingsPage.tsx');
const diagnostics = read('src/components/DiagnosticsPage.tsx');
const service = read('src/services/settingsDiagnosticsDailyFinalizeService.ts');
const servicesIndex = read('src/services/index.ts');
const docs = read('docs/SETTINGS_DIAGNOSTICS_DAILY_FINALIZE_MVP80.md');
const roadmap = read('docs/CURRENT_ROADMAP_MVP80.md');
const handoff = read('HANDOFF_MVP79_TO_MVP80.md');

assert(['0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(packageJson.version), 'package.json version must be 0.118.0-mvp80');
assert(['0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(packageLock.version), 'package-lock version must be 0.118.0-mvp80');
assert(['0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(packageLock.packages?.['']?.version), 'package-lock root package version must be 0.118.0-mvp80');
assert(packageJson.scripts?.['verify:mvp80-settings-diagnostics-daily-finalize'] === 'node scripts/verify-mvp80-settings-diagnostics-daily-finalize.mjs', 'package.json missing MVP80 verifier script');
assert(packageJson.scripts?.['verify:all']?.includes('verify:mvp80-settings-diagnostics-daily-finalize'), 'verify:all must include MVP80 verifier');

for (const token of [
  'settingsDiagnosticsDailyFinalizeService',
  'Mvp80SettingsDiagnosticsDailyFinalizeModel',
  'hiddenEngineeringTerms',
  '不向 Renderer 暴露 absolutePath',
  '不向 Renderer 暴露 file://',
]) {
  assert(service.includes(token), `MVP80 service missing token: ${token}`);
}

for (const token of [
  'settingsDiagnosticsDailyFinalizeService',
  'mvp80-settings-daily-finalize',
  'mvp80-settings-daily-cards',
  'mvp80-settings-hidden-engineering-terms',
  'mvp80-settings-history-folded',
  '日常设置检查',
  '工程信息后置',
  '默认折叠',
]) {
  assert(settings.includes(token), `SettingsPage missing MVP80 token: ${token}`);
}

for (const token of [
  'settingsDiagnosticsDailyFinalizeService',
  'mvp80-diagnostics-daily-finalize',
  'mvp80-diagnostics-daily-cards',
  'mvp80-diagnostics-surface-audit',
  'mvp80-diagnostics-hidden-engineering-terms',
  '日常化最终检查',
  '高级信息已折叠',
]) {
  assert(diagnostics.includes(token), `DiagnosticsPage missing MVP80 token: ${token}`);
}

for (const token of [
  "export { settingsDiagnosticsDailyFinalizeService }",
  'Mvp80SettingsDiagnosticsDailyFinalizeModel',
]) {
  assert(servicesIndex.includes(token), `services/index.ts missing token: ${token}`);
}

// MVP80 should keep engineering details in comments/markers or folded areas, not in primary headings.
for (const forbiddenVisible of [
  '<h3 className="text-xs font-bold text-text-primary">\n                        MVP-20 小样本只读 Dry-run 扫描',
  '<h3 className="text-xs font-bold text-text-primary">\n                        MVP-07 Scanner Contract UI Flow',
  '<h4 className="text-[11px] font-bold text-violet-100">\n                                  MVP-24：读取真实 library-index.json',
]) {
  assert(!settings.includes(forbiddenVisible), `SettingsPage still exposes old engineering heading: ${forbiddenVisible}`);
}

// Do not introduce risky implementation tokens in the new service/verifier scope.
for (const forbidden of ['fs.unlink', 'fs.rm', 'fs.rename', 'better-sqlite3', 'sqlite3', 'child_process']) {
  assert(!service.includes(forbidden), `MVP80 service introduced forbidden token: ${forbidden}`);
}

for (const token of [
  'MVP-80',
  '设置页 / 诊断页最终日常化检查',
  'mvp80-settings-diagnostics-daily-finalize',
  '不改真实扫描 / 写 index / 播放内核链路',
]) {
  assert(docs.includes(token) || roadmap.includes(token) || handoff.includes(token), `MVP80 docs missing token: ${token}`);
}

for (const file of ['README.md', 'PROJECT_STATE.md', 'NEXT_CHAT_HANDOFF.md', 'RUN_ME_FIRST.md']) {
  const content = read(file);
  assert(content.includes('0.118.0-mvp80'), `${file} missing MVP80 version`);
  assert(content.includes('设置页 / 诊断页最终日常化检查'), `${file} missing MVP80 summary`);
}

console.log('MVP-80 settings/diagnostics daily finalization verification passed.');
