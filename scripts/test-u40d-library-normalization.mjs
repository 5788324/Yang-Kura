#!/usr/bin/env node
import assert from 'node:assert/strict';

const RJ_PATTERN = /RJ\d{5,8}/i;
const normalizePath = (value) => (value ?? '').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '').trim();
const directoryOf = (value) => {
  const parts = normalizePath(value).split('/').filter(Boolean);
  return parts.length > 1 ? parts.slice(0, -1).join('/') : 'root';
};
const groupPath = (relativePath) => {
  const directory = directoryOf(relativePath);
  const segments = directory.split('/').filter(Boolean);
  const rjIndex = segments.findIndex((segment) => RJ_PATTERN.test(segment));
  if (rjIndex >= 0) return segments.slice(0, rjIndex + 1).join('/');
  if (segments.length >= 2) return segments.slice(0, 2).join('/');
  return segments[0] ?? 'root';
};

const paths = [
  '分类A/RJ123456 作品甲/track01.wav',
  '分类A/RJ123456 作品甲/sub/track02.wav',
  '分类A/RJ654321 作品乙/track01.wav',
  '分类B/无编号作品/track01.mp3',
  '分类B/无编号作品/分轨/track02.mp3',
];
const groups = paths.map(groupPath);
assert.deepEqual(groups, [
  '分类A/RJ123456 作品甲',
  '分类A/RJ123456 作品甲',
  '分类A/RJ654321 作品乙',
  '分类B/无编号作品',
  '分类B/无编号作品',
]);
assert.equal(new Set(groups).size, 3);
assert.equal(groups.includes('分类A'), false);
assert.equal(groups.includes('分类B'), false);
console.log('[test-u40d-normalization] real hierarchy grouping PASS');
