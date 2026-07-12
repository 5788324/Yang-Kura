import fs from 'node:fs';

const lyrics = fs.readFileSync('src/components/LyricsPanel.tsx', 'utf8');
const motionHook = fs.readFileSync('src/hooks/useVinylMotion.ts', 'utf8');
const failures = [];

for (const marker of [
  "window.matchMedia('(prefers-reduced-motion: reduce)')",
  "motionQuery.addEventListener('change', handleMotionPreferenceChange)",
  "motionQuery.removeEventListener('change', handleMotionPreferenceChange)",
  "recordRef.current.style.transform = 'rotate(0deg)'",
  "tonearmRef.current.style.transform = 'rotate(-18deg)'",
  'window.cancelAnimationFrame',
]) {
  if (!motionHook.includes(marker)) failures.push(`missing U07 motion marker: ${marker}`);
}

for (const marker of [
  'setBookmarks([]);',
  'setBookmarks(JSON.parse(stored))',
]) {
  if (!lyrics.includes(marker)) failures.push(`missing U07 bookmark marker: ${marker}`);
}

for (const forbidden of [
  'Generate standard immersive demo bookmarks',
  '左右声道定位测试 / 轻快低语',
  '主编耳搔掏耳：极度酥麻高能段',
  '催眠向环境音：睡眠呼吸配合',
  'localStorage.setItem(key, JSON.stringify(demoBookmarks))',
]) {
  if (lyrics.includes(forbidden)) failures.push(`demo player state remains: ${forbidden}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('U07 immersive player truthful motion verifier PASS');
