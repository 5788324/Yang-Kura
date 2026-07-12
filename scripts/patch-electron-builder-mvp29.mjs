import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const appBuilderRoot = path.join(root, 'node_modules', 'app-builder-lib');
const candidates = [
  path.join(appBuilderRoot, 'out', 'targets', 'blockmap', 'blockmap.js'),
  path.join(appBuilderRoot, 'src', 'targets', 'blockmap', 'blockmap.ts'),
];
const replacements = [
  ['require("@noble/hashes/blake2.js")', 'require("@noble/hashes/blake2b")'],
  ["require('@noble/hashes/blake2.js')", "require('@noble/hashes/blake2b')"],
  ['require("@noble/hashes/blake2")', 'require("@noble/hashes/blake2b")'],
  ["require('@noble/hashes/blake2')", "require('@noble/hashes/blake2b')"],
  ['from "@noble/hashes/blake2.js"', 'from "@noble/hashes/blake2b"'],
  ["from '@noble/hashes/blake2.js'", "from '@noble/hashes/blake2b'"],
  ['from "@noble/hashes/blake2"', 'from "@noble/hashes/blake2b"'],
  ["from '@noble/hashes/blake2'", "from '@noble/hashes/blake2b'"],
];

if (!fs.existsSync(appBuilderRoot)) {
  console.log('[Yang-Kura] electron-builder patch skipped: app-builder-lib is not installed.');
  process.exit(0);
}

let inspected = 0;
let patched = 0;
for (const filePath of candidates) {
  if (!fs.existsSync(filePath)) continue;
  inspected += 1;
  let source = fs.readFileSync(filePath, 'utf8');
  const before = source;
  for (const [from, to] of replacements) source = source.split(from).join(to);
  if (source !== before) {
    fs.writeFileSync(filePath, source, 'utf8');
    patched += 1;
    console.log(`[Yang-Kura] Patched electron-builder blockmap import: ${path.relative(root, filePath)}`);
  }
}

if (inspected === 0) {
  console.error('[Yang-Kura] electron-builder patch failed: no blockmap implementation was found.');
  process.exit(1);
}

const unresolved = [];
for (const filePath of candidates) {
  if (!fs.existsSync(filePath)) continue;
  const source = fs.readFileSync(filePath, 'utf8');
  if (source.includes('@noble/hashes/blake2.js') || /@noble\/hashes\/blake2["']/.test(source)) {
    unresolved.push(path.relative(root, filePath));
  }
}
if (unresolved.length) {
  console.error(`[Yang-Kura] electron-builder patch incomplete: ${unresolved.join(', ')}`);
  process.exit(1);
}

try {
  const resolvedBlockmap = path.join(appBuilderRoot, 'out', 'targets', 'blockmap', 'blockmap.js');
  if (fs.existsSync(resolvedBlockmap)) {
    await import(`${pathToFileURL(resolvedBlockmap).href}?patchCheck=${Date.now()}`);
  }
  const require = createRequire(import.meta.url);
  require.resolve('@noble/hashes/blake2b');
} catch (error) {
  console.error(`[Yang-Kura] electron-builder patch verification failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

console.log(`[Yang-Kura] electron-builder blockmap patch verified (${patched} file(s) changed, ${inspected} inspected).`);

