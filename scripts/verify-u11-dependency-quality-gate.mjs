import fs from 'node:fs';

const workflow = fs.readFileSync('.github/workflows/branch-validation.yml', 'utf8');
const projectState = fs.readFileSync('PROJECT_STATE.md', 'utf8');
const failures = [];

for (const marker of [
  'Audit high and critical dependency risk',
  'npm audit --audit-level=high',
  'npm ci --ignore-scripts --no-audit --no-fund',
  'npm run verify:stable',
  'npm run build',
  'focused-verifier-results.tsv',
  'actions/upload-artifact@v4',
]) {
  if (!workflow.includes(marker)) failures.push(`missing branch quality gate: ${marker}`);
}

for (const marker of [
  'U10（已完成）',
  'U11（已完成）',
  'high / critical 依赖风险',
  '逐 verifier TSV 报告',
]) {
  if (!projectState.includes(marker)) failures.push(`missing U11 progress fact: ${marker}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('U11 dependency quality gate verifier PASS');
