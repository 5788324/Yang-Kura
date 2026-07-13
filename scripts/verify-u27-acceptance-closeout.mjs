import assert from 'node:assert/strict';
import fs from 'node:fs';

const state = fs.readFileSync('PROJECT_STATE.md', 'utf8');
const roadmap = fs.readFileSync('PROJECT_ROADMAP.md', 'utf8');
const result = fs.readFileSync('docs/U27_WINDOWS_GUI_ACCEPTANCE_RESULT.md', 'utf8');
const u28Task = fs.readFileSync('docs/U28_NATIVE_LIBRARY_WORKFLOW_TASK.md', 'utf8');

for (const marker of [
  'CONDITIONAL GO',
  '449C19A8659D8316DAA5E8AED3C4439822A5C20346B5BA0A728C5B9E3D78C922',
  '0 high / critical；1 moderate',
  'MIN-001',
  '原生目录选择器',
  'NOT TESTED',
  '用户原配置已恢复',
]) {
  assert.ok(result.includes(marker), `U27 result missing acceptance fact: ${marker}`);
}

for (const marker of [
  'U27 已完成',
  'CONDITIONAL GO',
  'U28',
  '原生目录',
  'MVP130',
  '冻结',
]) {
  assert.ok(`${state}\n${roadmap}`.includes(marker), `project progress missing U27/U28 fact: ${marker}`);
}

for (const marker of [
  '人工交接点',
  'asmr-library',
  'music-library',
  'copy-only',
  'move-only',
  'LRC',
  'SRT',
  'VTT',
  'ASS',
  '重启恢复',
  '不主动修复',
]) {
  assert.ok(u28Task.includes(marker), `U28 task missing native workflow contract: ${marker}`);
}

for (const forbidden of [
  'npm audit fix',
  '使用用户真实大库做写入',
  '脚本直接注入绝对路径来替代 GUI 授权',
]) {
  const index = u28Task.indexOf(forbidden);
  assert.ok(index >= 0, `U28 task must explicitly address safety boundary: ${forbidden}`);
}

console.log('U27 acceptance closeout and U28 native workflow verifier PASS');
