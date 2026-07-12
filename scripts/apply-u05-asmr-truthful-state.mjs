import fs from 'node:fs';

const filePath = 'src/components/AsmrDetail.tsx';
let source = fs.readFileSync(filePath, 'utf8');

const replaceExactlyOnce = (pattern, replacement, label) => {
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
  const matches = [...source.matchAll(new RegExp(pattern.source, flags))];
  if (matches.length !== 1) {
    throw new Error(`${label}: expected exactly one match, found ${matches.length}`);
  }
  source = source.replace(pattern, replacement);
};

replaceExactlyOnce(
  /    } else \{\n      \/\/ Seed initial mock completion for first tracks for immersive realistic feel\n[\s\S]*?      localStorage\.setItem\(key, JSON\.stringify\(seed\)\);\n    \}/,
  `    } else {\n      setTrackProgress({});\n    }`,
  'track progress seed block',
);

replaceExactlyOnce(
  /    } else \{\n      const seed: Record<string, 'none' \| 'ja' \| 'zh' \| 'bilingual'> = \{\};\n[\s\S]*?      localStorage\.setItem\(subKey, JSON\.stringify\(seed\)\);\n    \}/,
  `    } else {\n      setTrackSubtitles({});\n    }`,
  'subtitle association seed block',
);

for (const forbidden of [
  'Seed initial mock completion',
  'percent: 62',
  "idx === 0) seed[t.id] = 'bilingual'",
  'localStorage.setItem(subKey, JSON.stringify(seed))',
]) {
  if (source.includes(forbidden)) throw new Error(`forbidden seeded state remains: ${forbidden}`);
}

fs.writeFileSync(filePath, source, 'utf8');
console.log('Applied U05 truthful ASMR detail state patch.');
