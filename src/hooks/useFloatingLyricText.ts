import { useMemo } from 'react';
import type { AudioTrack } from '../types';
import { getActiveLyricText, parseLyrics } from '../player/lyricsTimeline';

const DEFAULT_FLOATING_LYRIC_FALLBACK = 'Yang-Kura 本地音频播放中';

export function useFloatingLyricText(
  currentTrack: AudioTrack | null,
  progress: number,
  fallback = DEFAULT_FLOATING_LYRIC_FALLBACK,
): string {
  const parsedLyrics = useMemo(() => parseLyrics(currentTrack?.lyrics), [currentTrack]);

  return useMemo(() => {
    if (!currentTrack) return '';
    return getActiveLyricText(parsedLyrics, progress, fallback);
  }, [currentTrack, fallback, parsedLyrics, progress]);
}
