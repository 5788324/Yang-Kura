#!/usr/bin/env node
const nodeVersion = process.versions.node;
const nodeMajor = Number(nodeVersion.split('.')[0]);
const npmUserAgent = process.env.npm_config_user_agent || '';
const npmMatch = npmUserAgent.match(/npm\/(\d+)\./);
const npmMajor = npmMatch ? Number(npmMatch[1]) : null;
const allowUnsupported = process.env.YANG_KURA_ALLOW_UNSUPPORTED_NODE === '1';
const failures = [];
if (nodeMajor !== 22 && !allowUnsupported) {
  failures.push(`Expected Node 22 LTS for validation, got ${nodeVersion}. Install Node 22 LTS or set YANG_KURA_ALLOW_UNSUPPORTED_NODE=1 for manual smoke testing.`);
}
if (npmMajor !== null && npmMajor !== 10 && !allowUnsupported) {
  failures.push(`Expected npm 10.x for validation, got npm ${npmMajor}.x. Use npm bundled with Node 22 LTS or set YANG_KURA_ALLOW_UNSUPPORTED_NODE=1 for manual smoke testing.`);
}
console.log(`[Yang-Kura] Node ${nodeVersion}`);
if (npmMajor !== null) console.log(`[Yang-Kura] npm major ${npmMajor}`);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('[Yang-Kura] validation environment check passed.');
