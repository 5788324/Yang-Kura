import fs from 'node:fs';

const detail = fs.readFileSync('src/components/AsmrDetail.tsx', 'utf8');
const failures = [];

for (const marker of [
  "localStorage.getItem('asmr_tracks_progress')",
  'setTrackProgress({});',
  'setTrackSubtitles({});',
  'setTrackProgress(JSON.parse(stored))',
  'setTrackSubtitles(JSON.parse(storedSubs))',
]) {
  if (!detail.includes(marker)) failures.push(`missing truthful-state marker: ${marker}`);
}

for (const forbidden of [
  'Seed initial mock completion',
  'percent: 62',
  "idx === 0) seed[t.id] = 'bilingual'",
  "idx === 1) seed[t.id] = 'zh'",
  'localStorage.setItem(key, JSON.stringify(seed))',
  'localStorage.setItem(subKey, JSON.stringify(seed))',
]) {
  if (detail.includes(forbidden)) failures.push(`mock ASMR state remains: ${forbidden}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('U05 truthful ASMR detail state verifier PASS');
