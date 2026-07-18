#!/usr/bin/env node
  import fs from 'node:fs';
  const backend = fs.readFileSync('src/hooks/usePlayerBackend.ts', 'utf8').replace(/\r\n/g, '\n');
  const settings = fs.readFileSync('src/components/SettingsPageDaily.tsx', 'utf8').replace(/\r\n/g, '\n');
  const required = [
    'HTML_AUDIO_METADATA_TIMEOUT_MS = 10_000',
    'HTML_AUDIO_PLAY_TIMEOUT_MS = 10_000',
    'await waitForHtmlAudioMetadata(audioRef.current, result.extension)',
    'await playHtmlAudioWithTimeout(audioRef.current, result.extension)',
    'clearHtmlAudio(audioRef.current);',
    '设置 → 播放方式',
  ];
  for (const token of required) if (!backend.includes(token)) throw new Error('missing backend marker: ' + token);
  if (!settings.includes('遇到不支持的编码时请点击“选择播放组件”')) throw new Error('settings guidance missing');
  if (!settings.includes('不支持的编码会明确提示')) throw new Error('settings boundary copy missing');
  console.log('[u40d3] HTMLAudio stall timeout and mpv guidance PASS');
  