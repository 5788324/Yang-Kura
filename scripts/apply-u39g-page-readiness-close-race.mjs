#!/usr/bin/env node
import fs from 'node:fs';

function replaceOnce(file, from, to) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(to)) return;
  if (!source.includes(from)) throw new Error(`${file}: missing patch anchor`);
  fs.writeFileSync(file, source.replace(from, to), 'utf8');
}

replaceOnce(
  'scripts/test-u32-packaged-page-readiness.mjs',
  `  close() {\n    try { this.socket?.close(); } catch {}\n  }`,
  `  close() {\n    const error = new Error('CDP client closed');\n    for (const pending of this.pending.values()) pending.reject(error);\n    this.pending.clear();\n    try { this.socket?.close(); } catch {}\n  }`,
);

replaceOnce(
  'scripts/test-u32-packaged-page-readiness.mjs',
  `async function waitForNoNewProcesses(baseline, timeout = 15_000) {`,
  `async function waitForChildExit(child, timeout = 8_000) {\n  if (child.exitCode !== null || child.signalCode !== null) return true;\n  return Promise.race([\n    new Promise((resolve) => child.once('exit', () => resolve(true))),\n    delay(timeout).then(() => false),\n  ]);\n}\n\nasync function waitForNoNewProcesses(baseline, timeout = 15_000) {`,
);

replaceOnce(
  'scripts/test-u32-packaged-page-readiness.mjs',
  `    report.captures.push({ label, fileName, bodyTextLength: bodyText.length, page: 'u37b-production-home' });\n    await cdp.evaluate('window.close(); true');\n  } finally {\n    cdp?.close();\n    await delay(1000);\n    if (child.exitCode === null) child.kill();`,
  `    report.captures.push({ label, fileName, bodyTextLength: bodyText.length, page: 'u37b-production-home' });\n    const closeRequest = cdp.evaluate('window.close(); true').catch(() => undefined);\n    await Promise.race([closeRequest, waitForChildExit(child, 2_000), delay(1_000)]);\n  } finally {\n    cdp?.close();\n    const exited = await waitForChildExit(child);\n    if (!exited && child.exitCode === null) child.kill();`,
);

replaceOnce(
  'scripts/verify-u39-final-acceptance.mjs',
  `  'scripts/test-u32-release-candidate-packaging.mjs',\n  '.github/workflows/u39-final-acceptance.yml',`,
  `  'scripts/test-u32-release-candidate-packaging.mjs',\n  'scripts/test-u32-packaged-page-readiness.mjs',\n  '.github/workflows/u39-final-acceptance.yml',`,
);

replaceOnce(
  'scripts/verify-u39-final-acceptance.mjs',
  `  'scripts/test-u32-release-candidate-packaging.mjs',\n];`,
  `  'scripts/test-u32-release-candidate-packaging.mjs',\n  'scripts/test-u32-packaged-page-readiness.mjs',\n];`,
);

console.log('U39-G packaged page close-race patch PASS');
