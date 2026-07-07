import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const blockmapPath = path.join(root, 'node_modules', 'app-builder-lib', 'out', 'targets', 'blockmap', 'blockmap.js');
const hashesPath = path.join(root, 'node_modules', 'app-builder-lib', 'node_modules', '@noble', 'hashes', 'package.json');

if (!fs.existsSync(blockmapPath)) {
  process.exit(0);
}

let source = fs.readFileSync(blockmapPath, 'utf8');
const before = source;
source = source.replace('require("@noble/hashes/blake2.js")', 'require("@noble/hashes/blake2b")');
source = source.replace('require("@noble/hashes/blake2")', 'require("@noble/hashes/blake2b")');
if (source !== before) {
  fs.writeFileSync(blockmapPath, source, 'utf8');
  console.log('[Yang-Kura] Patched electron-builder blockmap @noble/hashes import for MVP-29 packaging.');
}

if (fs.existsSync(hashesPath)) {
  const hashes = JSON.parse(fs.readFileSync(hashesPath, 'utf8'));
  if (hashes.version.startsWith('2.')) {
    console.warn('[Yang-Kura] Warning: @noble/hashes 2.x is ESM-only; package override should pin 1.4.0 for electron-builder 26.15.3.');
  }
}
