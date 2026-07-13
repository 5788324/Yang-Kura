import fs from 'node:fs';

const filePath = 'src/components/PlayerBar.tsx';
let source = fs.readFileSync(filePath, 'utf8');

function replaceExactlyOnce(search, replacement, label) {
  const count = source.split(search).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one match, found ${count}`);
  source = source.replace(search, replacement);
}

replaceExactlyOnce(
  "import CoverArtwork from './CoverArtwork';\n",
  "import CoverArtwork from './CoverArtwork';\nimport { getActiveLyricText, parseLyrics } from '../player/lyricsTimeline';\nimport {\n  clampPlayerValue,\n  formatPlayerTime,\n  getPlayerProgressMetrics,\n  getPlayerVolumeMetrics,\n  getSafeTrackDuration,\n  seekFromPointerPosition,\n} from '../player/playerBarMath';\n",
  'player helper imports',
);

replaceExactlyOnce(
  `  // Format seconds to mm:ss\n  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));\n\n  const getSafeDuration = (track: AudioTrack | null): number => {\n    if (!track || !Number.isFinite(track.duration) || track.duration <= 0) return 0;\n    return track.duration;\n  };\n\n  const formatTime = (seconds: number) => {\n    const safeSeconds = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;\n    const mins = Math.floor(safeSeconds / 60);\n    const secs = Math.floor(safeSeconds % 60);\n    return \`${'${mins}'}:${'${secs.toString().padStart(2, \'0\')}'}\`;\n  };\n\n  const parseLrcFractionalSeconds = (fraction: string | undefined): number => {\n    if (!fraction) return 0;\n    const parsed = Number.parseInt(fraction, 10);\n    if (!Number.isFinite(parsed)) return 0;\n    return parsed / Math.pow(10, fraction.length);\n  };\n\n  const seekFromPointer = (clientX: number, rect: DOMRect, duration: number) => {\n    if (duration <= 0 || rect.width <= 0) return null;\n    const percent = clamp((clientX - rect.left) / rect.width, 0, 1);\n    return percent * duration;\n  };\n\n`,
  '',
  'inline player math',
);

source = source.replaceAll('const duration = getSafeDuration(currentTrack);', 'const duration = getSafeTrackDuration(currentTrack);');
replaceExactlyOnce(
  'const newProgress = seekFromPointer(e.clientX, rect, duration);',
  'const newProgress = seekFromPointerPosition(e.clientX, rect.left, rect.width, duration);',
  'pointer seek mapping',
);
replaceExactlyOnce(
  'const percent = clamp((e.clientX - rect.left) / rect.width, 0, 1);',
  'const percent = clampPlayerValue((e.clientX - rect.left) / rect.width, 0, 1);',
  'hover percentage clamp',
);

replaceExactlyOnce(
  `  const totalDuration = getSafeDuration(currentTrack);\n  const safeProgress = Number.isFinite(progress) ? Math.max(0, progress) : 0;\n  const currentDisplayProgress = totalDuration > 0 ? clamp(dragValue !== null ? dragValue : safeProgress, 0, totalDuration) : 0;\n  const progressPercent = totalDuration > 0 ? clamp((currentDisplayProgress / totalDuration) * 100, 0, 100) : 0;\n  const safeVolume = clamp(Number.isFinite(volume) ? volume : 0, 0, 1);\n  const visibleVolume = isMuted ? 0 : safeVolume;\n  const visibleVolumePercent = clamp(visibleVolume * 100, 0, 100);\n`,
  `  const totalDuration = getSafeTrackDuration(currentTrack);\n  const { currentDisplayProgress, progressPercent } = getPlayerProgressMetrics(progress, dragValue, totalDuration);\n  const { visibleVolume, visibleVolumePercent } = getPlayerVolumeMetrics(volume, isMuted);\n`,
  'player progress and volume metrics',
);

replaceExactlyOnce(
  `  // Real-time parsed lyrics parser for Desktop Floating Overlay (Requirement 10)\n  const parsedLyrics = useMemo(() => {\n    if (!currentTrack || !currentTrack.lyrics) return [];\n    return currentTrack.lyrics.map(line => {\n      const timeReg = /\\[(\\d+):(\\d+)(?:\\.(\\d+))?\\]/;\n      const match = line.match(timeReg);\n      if (!match) return { time: -1, text: line };\n      const mins = parseInt(match[1]);\n      const secs = parseInt(match[2]);\n      const ms = parseLrcFractionalSeconds(match[3]);\n      const time = mins * 60 + secs + ms;\n      const text = line.replace(timeReg, '').trim();\n      return { time, text };\n    }).filter(item => item.time >= 0);\n  }, [currentTrack]);\n\n  const activeLyric = useMemo(() => {\n    if (!currentTrack) return '';\n    if (parsedLyrics.length === 0) return 'Yang-Kura 本地音频播放中';\n    let active = parsedLyrics[0].text;\n    for (let i = 0; i < parsedLyrics.length; i++) {\n      if (progress >= parsedLyrics[i].time) {\n        active = parsedLyrics[i].text;\n      } else {\n        break;\n      }\n    }\n    return active;\n  }, [parsedLyrics, progress, currentTrack]);\n`,
  `  // Desktop floating lyrics reuse the shared LRC timeline contract.\n  const parsedLyrics = useMemo(() => parseLyrics(currentTrack?.lyrics), [currentTrack]);\n\n  const activeLyric = useMemo(() => {\n    if (!currentTrack) return '';\n    return getActiveLyricText(parsedLyrics, progress, 'Yang-Kura 本地音频播放中');\n  }, [parsedLyrics, progress, currentTrack]);\n`,
  'floating lyric timeline',
);

source = source.replaceAll('{formatTime(hoverTime)}', '{formatPlayerTime(hoverTime)}');
source = source.replaceAll('{formatTime(currentDisplayProgress)}', '{formatPlayerTime(currentDisplayProgress)}');
source = source.replaceAll('{formatTime(totalDuration)}', '{formatPlayerTime(totalDuration)}');
source = source.replaceAll(
  'clamp(Number.isFinite(parsedValue) ? parsedValue : 0, 0, totalDuration)',
  'clampPlayerValue(Number.isFinite(parsedValue) ? parsedValue : 0, 0, totalDuration)',
);
source = source.replaceAll(
  'onSeek(clamp(finalSeek, 0, totalDuration));',
  'onSeek(clampPlayerValue(finalSeek, 0, totalDuration));',
);

for (const forbidden of [
  'const clamp =',
  'const getSafeDuration =',
  'const formatTime =',
  'const parseLrcFractionalSeconds =',
  'const seekFromPointer =',
  'currentTrack.lyrics.map(line =>',
]) {
  if (source.includes(forbidden)) throw new Error(`extracted logic remains: ${forbidden}`);
}

fs.writeFileSync(filePath, source, 'utf8');
console.log('Applied U15 player bar pure logic patch.');
