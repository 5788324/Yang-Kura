import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const required = (text, token, label) => {
  if (!text.includes(token)) throw new Error(`Missing ${label}: ${token}`);
};
const forbidden = (text, token, label) => {
  if (text.includes(token)) throw new Error(`Forbidden ${label}: ${token}`);
};

const pkg = JSON.parse(read('package.json'));
if (!['0.151.0-mvp113', '0.152.0-mvp114', '0.153.0-mvp115', '0.154.0-mvp116', '0.155.0-mvp117', '0.156.0-mvp118', '0.157.0-mvp119', '0.158.0-mvp120', '0.159.0-mvp121', '0.160.0-mvp122', '0.161.0-mvp123', '0.162.0-mvp124', '0.163.0-mvp125', '0.164.0-mvp126', '0.165.0-mvp127', '0.166.0-mvp128', '0.167.0-mvp129'].includes(pkg.version)) throw new Error(`Unexpected version: ${pkg.version}`);
required(read('scripts/run-stable-regression.mjs'), 'verify:mvp113-accessibility-label-hotfix', 'verify:stable chain');

const layoutService = read('src/services/libraryCardLayoutPolishService.ts');
required(layoutService, "ariaLabel: '音声作品列表'", 'ASMR user-facing accessible label');
required(layoutService, "trackListAriaLabel: '音乐库歌曲列表'", 'music track list accessible label');
required(layoutService, "albumGridAriaLabel: '音乐专辑列表'", 'music album accessible label');
forbidden(layoutService, "ariaLabel: 'MVP76", 'MVP text in ASMR aria label');
forbidden(layoutService, "trackListAriaLabel: 'MVP76", 'MVP text in music track aria label');
forbidden(layoutService, "albumGridAriaLabel: 'MVP76", 'MVP text in music album aria label');

const music = read('src/components/MusicLibrary.tsx');
required(music, 'aria-label={mvp76CardLayout.trackListAriaLabel}', 'music track list label binding');
required(music, 'aria-label={mvp76CardLayout.albumGridAriaLabel}', 'music album label binding');

const asmr = read('src/components/AsmrLibrary.tsx');
required(asmr, 'aria-label={mvp76CardLayout.ariaLabel}', 'ASMR list label binding');

for (const path of ['src/components/MusicLibrary.tsx', 'src/components/AsmrLibrary.tsx']) {
  const source = read(path);
  const literalAriaLabels = [...source.matchAll(/aria-label\s*=\s*[\"']([^\"']+)[\"']/g)].map((match) => match[1]);
  const offending = literalAriaLabels.find((label) => /MVP\s*-?\s*\d+/i.test(label));
  if (offending) throw new Error(`Engineering MVP text exposed through literal accessibility label in ${path}: ${offending}`);
}

console.log('PASS MVP113 accessibility label hotfix verifier');
