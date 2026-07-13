import assert from 'node:assert/strict';
import fs from 'node:fs';

const state = fs.readFileSync('PROJECT_STATE.md', 'utf8');
const roadmap = fs.readFileSync('PROJECT_ROADMAP.md', 'utf8');
const result = fs.readFileSync('docs/U27_WINDOWS_GUI_ACCEPTANCE_RESULT.md', 'utf8');
const u28Task = fs.readFileSync('docs/U28_NATIVE_LIBRARY_WORKFLOW_TASK.md', 'utf8');

for (const marker of [
  'NO-GO',
  'CONDITIONAL GO',
  '真实音声库补测',
  '唯一有效的最终结论',
  'MAJ-001',
  'MAJ-002',
  '449C19A8659D8316DAA5E8AED3C4439822A5C20346B5BA0A728C5B9E3D78C922',
  '0 high / critical；1 moderate',
  'MIN-001',
  'E:\\arsm',
  '用户原配置已恢复',
]) {
  assert.ok(result.includes(marker), `U27 result missing corrected acceptance fact: ${marker}`);
}

for (const marker of [
  'U27 已完成',
  '最终结论 NO-GO',
  'U28',
  'MAJ-001',
  'MAJ-002',
  '真实 Index',
  'MVP130',
  '冻结',
]) {
  assert.ok(`${state}\n${roadmap}`.includes(marker), `project progress missing U27 no-go/U28 repair fact: ${marker}`);
}

for (const marker of [
  '根因定位要求',
  'Windows 原生目录授权',
  'root snapshot',
  '读取已有 Index',
  '一键扫描并应用',
  '单一资源快照',
  '真实诊断',
  '暂时禁用',
  'E:\\arsm',
  '不再引用 Demo 扫描作为真实状态',
  'MAJ-001 关闭',
  'MAJ-002 关闭',
]) {
  assert.ok(u28Task.includes(marker), `U28 repair task missing closure contract: ${marker}`);
}

for (const safetyBoundary of [
  '不对真实库执行清理、move、覆盖',
  '禁止使用脚本、配置文件、开发者工具或手工修改 Store 绕过原生目录授权',
  '禁止运行 `npm audit fix`',
  'MVP130 下载器继续冻结',
]) {
  assert.ok(u28Task.includes(safetyBoundary), `U28 repair task missing safety boundary: ${safetyBoundary}`);
}

assert.ok(!state.includes('结论 CONDITIONAL GO'), 'PROJECT_STATE must not retain CONDITIONAL GO as the final status');
assert.ok(!roadmap.includes('实机结果：CONDITIONAL GO'), 'PROJECT_ROADMAP must not retain the superseded final result');
assert.ok(result.indexOf('NO-GO') < result.indexOf('CONDITIONAL GO') || result.includes('唯一有效的最终结论是 `NO-GO`'));

console.log('U27 NO-GO correction and U28 library-closure repair verifier PASS');
