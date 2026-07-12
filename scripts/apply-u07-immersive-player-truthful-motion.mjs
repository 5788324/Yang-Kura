import fs from 'node:fs';

const filePath = 'src/components/LyricsPanel.tsx';
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
  /  useEffect\(\(\) => \{\n    let lastTime = performance\.now\(\);[\s\S]*?  \}, \[\]\);\n  \n  \/\/ --- Sleep Timer/,
  `  useEffect(() => {\n    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');\n    let lastTime = performance.now();\n\n    const setStaticVisuals = () => {\n      currentSpeedRef.current = 0;\n      currentArmAngleRef.current = -18;\n      if (recordRef.current) recordRef.current.style.transform = 'rotate(0deg)';\n      if (tonearmRef.current) tonearmRef.current.style.transform = 'rotate(-18deg)';\n    };\n\n    const cancelPhysicsAnimation = () => {\n      if (animationFrameIdRef.current !== null) {\n        cancelAnimationFrame(animationFrameIdRef.current);\n        animationFrameIdRef.current = null;\n      }\n    };\n\n    const updatePhysics = (now: number) => {\n      if (motionQuery.matches) {\n        setStaticVisuals();\n        animationFrameIdRef.current = null;\n        return;\n      }\n\n      const dt = Math.min((now - lastTime) / 16.666, 4);\n      lastTime = now;\n\n      const playing = isPlayingRef.current;\n      const prog = Number.isFinite(progressRef.current) ? Math.max(0, progressRef.current) : 0;\n      const dur = getSafeDuration(totalDurationRef.current);\n      const targetSpeed = playing ? 0.6 : 0;\n      const speedDamping = playing ? 0.04 : 0.012;\n\n      currentSpeedRef.current += (targetSpeed - currentSpeedRef.current) * speedDamping * dt;\n      rotationAngleRef.current = (rotationAngleRef.current + currentSpeedRef.current * dt) % 360;\n\n      if (recordRef.current) {\n        recordRef.current.style.transform = \\`rotate(\\${rotationAngleRef.current}deg)\\`;\n      }\n\n      const progressPercent = dur > 0 ? clamp((prog / dur) * 100, 0, 100) : 0;\n      const targetArmAngle = playing ? 8 + (progressPercent / 100) * 14 : -18;\n      currentArmAngleRef.current += (targetArmAngle - currentArmAngleRef.current) * 0.03 * dt;\n\n      if (tonearmRef.current) {\n        tonearmRef.current.style.transform = \\`rotate(\\${currentArmAngleRef.current}deg)\\`;\n      }\n\n      animationFrameIdRef.current = requestAnimationFrame(updatePhysics);\n    };\n\n    const startPhysicsAnimation = () => {\n      if (animationFrameIdRef.current !== null || motionQuery.matches) return;\n      lastTime = performance.now();\n      animationFrameIdRef.current = requestAnimationFrame(updatePhysics);\n    };\n\n    const handleMotionPreferenceChange = () => {\n      cancelPhysicsAnimation();\n      if (motionQuery.matches) setStaticVisuals();\n      else startPhysicsAnimation();\n    };\n\n    motionQuery.addEventListener('change', handleMotionPreferenceChange);\n    handleMotionPreferenceChange();\n\n    return () => {\n      motionQuery.removeEventListener('change', handleMotionPreferenceChange);\n      cancelPhysicsAnimation();\n    };\n  }, []);\n  \n  // --- Sleep Timer`,
  'vinyl physics effect',
);

replaceExactlyOnce(
  /    \} else \{\n      \/\/ Generate standard immersive demo bookmarks[\s\S]*?      localStorage\.setItem\(key, JSON\.stringify\(demoBookmarks\)\);\n    \}/,
  `    } else {\n      setBookmarks([]);\n    }`,
  'demo bookmark block',
);

for (const forbidden of [
  'Generate standard immersive demo bookmarks',
  '左右声道定位测试 / 轻快低语',
  'localStorage.setItem(key, JSON.stringify(demoBookmarks))',
]) {
  if (source.includes(forbidden)) throw new Error(`forbidden U07 state remains: ${forbidden}`);
}

fs.writeFileSync(filePath, source, 'utf8');
console.log('Applied U07 immersive player truthful motion patch.');
