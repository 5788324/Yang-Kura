#!/usr/bin/env node
import fs from 'node:fs';

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  fs.writeFileSync(file, content, 'utf8');
}

function replaceOnce(source, from, to, file) {
  if (source.includes(to)) return source;
  if (!source.includes(from)) throw new Error(`${file}: missing anchor: ${from}`);
  return source.replace(from, to);
}

function update(file, transforms) {
  let source = read(file);
  for (const [from, to] of transforms) source = replaceOnce(source, from, to, file);
  write(file, source);
}

update('README.md', [
  ['> 当前阶段：U39-F 增量架构防回退门禁完成；准备综合收尾', '> 当前阶段：U39-G 最终综合验收完成；进入按需日常维护'],
  ['- U39-F：新增增量架构门禁，禁止新显式 `any`、Renderer 裸 IPC、实现层跨层导入和新相对导入循环。', '- U39-F：新增增量架构门禁，禁止新显式 `any`、Renderer 裸 IPC、实现层跨层导入和新相对导入循环。\n- U39-G：同一候选提交重跑 U28～U32、U39-A～F、stable regression、portable、NSIS、安装卸载和用户数据保留验收。'],
  ['U39-F 使用 PR base/head 比较。当前仓库已有 1 个历史相对导入环，作为基线保留；后续只在触碰对应链路时清理。解析器自测和临时 Git 仓库负向测试已覆盖四类违规。', 'U39-F 使用 PR base/head 比较。当前仓库已有 1 个历史相对导入环，作为基线保留；后续只在触碰对应链路时清理。解析器自测和临时 Git 仓库负向测试已覆盖四类违规。\n\nU39-G 收口不代表技术债清零。后续不再预排 U39 轮次，只由真实 Bug、明确体验问题、用户需求或触链技术债启动。'],
  ['- UI/播放器使用 focused validation；架构增量使用 `Architecture Guardrails`。', '- UI/播放器使用 focused validation；架构增量使用 `Architecture Guardrails`。\n- U39 阶段最终证据由 `U39 Final Acceptance` 在同一 Windows 候选提交生成。'],
  ['- `docs/architecture/U39_ARCHITECTURE_GUARDRAILS.md`', '- `docs/U39_FINAL_ACCEPTANCE.md`\n- `docs/architecture/U39_ARCHITECTURE_GUARDRAILS.md`'],
]);

update('PROJECT_STATE.md', [
  ['U39-F：增量架构防回退门禁完成\n当前任务：综合收尾与剩余问题重新核对', 'U39-F：增量架构防回退门禁完成\nU39-G：最终 Windows 回归与打包验收完成\n当前任务：按需日常维护，仅由真实问题或明确需求触发'],
  ['- U39-F：增量架构门禁禁止新增显式 `any`、Renderer 裸 IPC、实现层跨层导入和相对导入循环。', '- U39-F：增量架构门禁禁止新增显式 `any`、Renderer 裸 IPC、实现层跨层导入和相对导入循环。\n- U39-G：完整 Windows 回归、U39-A～F、stable regression、portable、NSIS、安装卸载和数据保留在同一候选提交通过。'],
  ['| 当前重点 | 综合验收、真实使用反馈和触链技术债 |', '| 当前重点 | 真实使用反馈、明确小功能和触链技术债 |'],
  ['## 快速开发模式', '## U39-G 最终验收\n\n- 工作流：`.github/workflows/u39-final-acceptance.yml`。\n- 清单：`scripts/verify-u39-final-acceptance.mjs`。\n- 说明：`docs/U39_FINAL_ACCEPTANCE.md`。\n- 结果：U39 预排治理轮次结束；Issue #66 继续作为长期渐进治理清单。\n\n## 快速开发模式'],
]);

update('PROJECT_ROADMAP.md', [
  ['U39-F：增量架构防回退门禁完成\n当前任务：综合收尾与剩余问题重新核对', 'U39-F：增量架构防回退门禁完成\nU39-G：最终综合验收完成\n当前任务：按需日常维护'],
  ['- U39-F：禁止 PR 新增显式 `any`、Renderer 裸 IPC、实现层跨层导入和相对导入循环。', '- U39-F：禁止 PR 新增显式 `any`、Renderer 裸 IPC、实现层跨层导入和相对导入循环。\n- U39-G：同一候选提交完成完整 Windows 回归、portable/NSIS 和安装交付验收。'],
  ['## 4. 当前主线：综合收尾', '## 4. 当前主线：按需日常维护'],
  ['1. 重新核对审计、Issue #66 和最新 `main`，排除已解决项；\n2. 只修复仍可复现的真实 Bug 或高收益日常问题；\n3. 核对核心文档、focused gate、Architecture Guardrails 和 Windows 回归边界；\n4. 给出后续日常维护清单，不为关闭任务进行大规模搬迁。', '1. 修复真实使用中发现的 Bug；\n2. 处理明确的字幕、播放、搜索、日常 UI 或性能问题；\n3. 实现用户主动提出的小型功能；\n4. 修改相关链路时顺带处理局部技术债。\n\n不再预排 U39 轮次，也不为关闭清单进行大规模搬迁。'],
  ['## 5. 风险分级验证', '## 5. U39-G 最终验收\n\n`U39 Final Acceptance` 在同一 Windows 候选提交执行 U28～U32、U39-A～F、stable regression、portable、NSIS、安装卸载、用户数据保留和页面完整性。验收说明见 `docs/U39_FINAL_ACCEPTANCE.md`。\n\n## 6. 风险分级验证'],
  ['## 6. 技术债治理', '## 7. 技术债治理'],
  ['## 7. 快速交付规则', '## 8. 快速交付规则'],
  ['## 8. 长期冻结', '## 9. 长期冻结'],
  ['## 9. 自主管理', '## 10. 自主管理'],
]);

update('AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', [
  ['U39-F：增量架构防回退门禁完成\n当前任务：综合收尾与剩余问题重新核对', 'U39-F：增量架构防回退门禁完成\nU39-G：最终综合验收完成\n当前任务：按需日常维护'],
  ['- TypeScript / Electron 架构增量：`Architecture Guardrails`。', '- TypeScript / Electron 架构增量：`Architecture Guardrails`。\n- U39 阶段综合复核：`U39 Final Acceptance`。'],
  ['## 协作', '## 后续启动条件\n\n不再存在预排的下一轮 U39。只有真实 Bug、明确体验问题、用户提出的小型功能、依赖/Windows 兼容变化或触链技术债才启动新任务。Issue #66 保持开放。\n\n## 协作'],
]);

update('AI_HANDOFF/WORKLOG.md', [
  ['### U39-F — 增量架构防回退门禁', '### U39-F — 增量架构防回退门禁'],
  ['- 未修改产品运行时、播放器、资源库、Index、导入器或安装器。\n\n## 当前结论', '- 未修改产品运行时、播放器、资源库、Index、导入器或安装器。\n\n### U39-G — 最终综合验收\n\n- PR：#84。\n- 新增 `scripts/verify-u39-final-acceptance.mjs` 与 `.github/workflows/u39-final-acceptance.yml`。\n- 同一候选提交执行 U28～U32、U39-A～F、stable regression、portable、NSIS、安装卸载、用户数据保留和页面完整性。\n- U39 预排治理轮次收口；Issue #66 继续作为长期触链治理清单。\n\n## 当前结论'],
  ['U39-F：增量架构防回退门禁完成\n当前版本：0.169.0-beta.2', 'U39-F：增量架构防回退门禁完成\nU39-G：最终综合验收完成\n当前版本：0.169.0-beta.2'],
  ['当前任务：综合收尾与剩余问题重新核对', '当前任务：按需日常维护'],
]);

const handoffVerifier = `import fs from 'node:fs';

const required = [
  'README.md',
  'PROJECT_STATE.md',
  'PROJECT_ROADMAP.md',
  'AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md',
  'AI_HANDOFF/WORKLOG.md',
  'docs/U39_FINAL_ACCEPTANCE.md',
  'docs/architecture/U39_ARCHITECTURE_GUARDRAILS.md',
  'scripts/verify-u39-final-acceptance.mjs',
  'scripts/verify-u39f-architecture-guardrails.mjs',
  'scripts/test-u39f-architecture-guardrails.mjs',
  '.github/workflows/u39-final-acceptance.yml',
  '.github/workflows/architecture-guardrails.yml',
  'release/beta2-publication-state.json',
];

const tokens = [
  ['README.md', 'U39-G：同一候选提交重跑'],
  ['README.md', '不再预排 U39 轮次'],
  ['PROJECT_STATE.md', 'U39-G：最终 Windows 回归与打包验收完成'],
  ['PROJECT_STATE.md', '当前任务：按需日常维护'],
  ['PROJECT_ROADMAP.md', 'U39-G：最终综合验收完成'],
  ['PROJECT_ROADMAP.md', '当前任务：按需日常维护'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', 'U39-G：最终综合验收完成'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '不再存在预排的下一轮 U39'],
  ['AI_HANDOFF/WORKLOG.md', '### U39-G — 最终综合验收'],
  ['docs/U39_FINAL_ACCEPTANCE.md', '# U39-G 最终综合验收'],
  ['docs/U39_FINAL_ACCEPTANCE.md', '不再存在预排的“下一轮 U39”任务'],
  ['scripts/verify-u39-final-acceptance.mjs', 'U39 final acceptance manifest PASS'],
  ['.github/workflows/u39-final-acceptance.yml', 'Windows full regression and packaged delivery'],
  ['release/beta2-publication-state.json', '"releaseId": 355486824'],
];

const staleTokens = [
  '当前阶段：U39-F 增量架构防回退门禁完成；准备综合收尾',
  '当前任务：综合收尾与剩余问题重新核对',
  '当前任务：U39 审计剩余问题继续按优先级修复',
  '当前任务：发布 0.169.0 Beta 2 个人日用版',
];

const activeDocs = required.slice(0, 5);
const temporaryFiles = [
  '.github/workflows/u39g-closeout-sync.yml',
  'scripts/apply-u39g-closeout.mjs',
  '.github/workflows/u39e-empty-state-sync.yml',
  '.github/workflows/u38a-branch-orchestrator.yml',
  'scripts/apply-u38a-refactor.py',
];
const failures = [];

for (const file of required) if (!fs.existsSync(file)) failures.push(\`missing \${file}\`);
for (const [file, token] of tokens) {
  if (!fs.existsSync(file) || !fs.readFileSync(file, 'utf8').includes(token)) failures.push(\`\${file} missing token \${token}\`);
}
for (const file of activeDocs) {
  const source = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  for (const token of staleTokens) if (source.includes(token)) failures.push(\`\${file} retains stale token \${token}\`);
}
for (const file of temporaryFiles) if (fs.existsSync(file)) failures.push(\`temporary file remains: \${file}\`);

if (failures.length) {
  console.error(failures.join('\\n'));
  process.exit(1);
}
console.log('[verify-handoff] U39-G final acceptance handoff PASS');
`;
write('scripts/verify-handoff.mjs', handoffVerifier);

update('.github/workflows/branch-validation.yml', [
  ["      - 'scripts/test-u39f-architecture-guardrails.mjs'\n      - '.github/workflows/architecture-guardrails.yml'", "      - 'scripts/test-u39f-architecture-guardrails.mjs'\n      - 'scripts/verify-u39-final-acceptance.mjs'\n      - '.github/workflows/architecture-guardrails.yml'\n      - '.github/workflows/u39-final-acceptance.yml'"],
  ["            '^scripts/test-u39f-architecture-guardrails\\.mjs$',\n            '^scripts/verify-handoff\\.mjs$',", "            '^scripts/test-u39f-architecture-guardrails\\.mjs$',\n            '^scripts/verify-u39-final-acceptance\\.mjs$',\n            '^scripts/verify-handoff\\.mjs$',"],
  ["^\\.github/workflows/(architecture-guardrails|branch-validation|player-fast-validation|ui-fast-validation|u32-release-candidate)\\.yml$", "^\\.github/workflows/(architecture-guardrails|branch-validation|player-fast-validation|u39-final-acceptance|ui-fast-validation|u32-release-candidate)\\.yml$"],
  ["            '^docs/architecture/U39_ARCHITECTURE_GUARDRAILS\\.md$'", "            '^docs/architecture/U39_ARCHITECTURE_GUARDRAILS\\.md$',\n            '^docs/U39_FINAL_ACCEPTANCE\\.md$'"],
  ['Full regression skipped; targeted UI, player or architecture validation owns the relevant checks.', 'Full regression skipped; the targeted UI, player, architecture or U39 final-acceptance workflow owns the relevant checks.'],
]);

console.log('U39-G closeout document sync PASS');
