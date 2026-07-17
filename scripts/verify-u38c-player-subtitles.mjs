#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';

const controller = fs.readFileSync('src/hooks/useAudioPlayer.ts', 'utf8');
const subtitles = fs.readFileSync('src/hooks/usePlayerSubtitles.ts', 'utf8');
const state = fs.readFileSync('PROJECT_STATE.md', 'utf8');

assert.match(controller, /usePlayerSubtitles/);
assert.doesNotMatch(controller, /requestReadTrackLyrics/);
assert.doesNotMatch(controller, /normalizedLrcLines/);
assert.doesNotMatch(controller, /lyricsLoadStatus:\s*'loading'/);

assert.match(subtitles, /requestGenerationRef/);
assert.match(subtitles, /requestGenerationRef\.current \+= 1/);
assert.match(subtitles, /subtitleSourceSignature/);
assert.match(subtitles, /JSON\.stringify\(currentTrack\?\.subtitleRelativePaths \?\? \[\]\)/);
assert.match(subtitles, /applySubtitlePatch/);
assert.match(subtitles, /queue:\s*previous\.queue\.map/);
assert.match(subtitles, /lyricsLoadStatus:\s*'loading'/);
assert.match(subtitles, /lyricsLoadStatus:\s*'loaded'/);
assert.match(subtitles, /lyricsLoadStatus:\s*'missing'/);
assert.match(subtitles, /lyricsLoadStatus:\s*'error'/);
assert.match(subtitles, /lyrics:\s*undefined/);
assert.match(subtitles, /mvp26-track-lyrics-missing-file/);
assert.match(subtitles, /isTokenizedLocalTrack/);

assert.match(state, /U38-C：播放器字幕加载与状态边界完成/);
assert.match(state, /当前任务：日常体验与真实 Bug 优先/);

console.log('U38-C player subtitle boundary verifier PASS');
