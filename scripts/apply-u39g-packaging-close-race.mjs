#!/usr/bin/env node
import fs from 'node:fs';

function replaceOnce(file, from, to) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(to)) return;
  if (!source.includes(from)) throw new Error(`${file}: missing patch anchor`);
  fs.writeFileSync(file, source.replace(from, to), 'utf8');
}

replaceOnce(
  'scripts/test-u32-release-candidate-packaging.mjs',
  `  close() {\n    try { this.socket?.close(); } catch {}\n  }`,
  `  close() {\n    const error = new Error('CDP client closed');\n    for (const pending of this.pending.values()) pending.reject(error);\n    this.pending.clear();\n    try { this.socket?.close(); } catch {}\n  }`,
);

replaceOnce(
  'scripts/test-u32-release-candidate-packaging.mjs',
  `    await cdp.evaluate('window.close(); true');\n    requestedClose = true;`,
  `    const closeRequest = cdp.evaluate('window.close(); true').catch(() => undefined);\n    requestedClose = true;\n    await Promise.race([closeRequest, waitForChildExit(child, 2_000), delay(1_000)]);`,
);

replaceOnce(
  'scripts/verify-u39-final-acceptance.mjs',
  `  'scripts/test-u39f-architecture-guardrails.mjs',\n  '.github/workflows/u39-final-acceptance.yml',`,
  `  'scripts/test-u39f-architecture-guardrails.mjs',\n  'scripts/test-u32-release-candidate-packaging.mjs',\n  '.github/workflows/u39-final-acceptance.yml',`,
);

replaceOnce(
  'scripts/verify-u39-final-acceptance.mjs',
  `  'scripts/verify-u39-final-acceptance.mjs',\n];`,
  `  'scripts/verify-u39-final-acceptance.mjs',\n  'scripts/test-u32-release-candidate-packaging.mjs',\n];`,
);

console.log('U39-G packaged close-race patch PASS');
