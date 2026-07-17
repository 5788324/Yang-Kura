import { useEffect, useMemo, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { AudioTrack, PlayerState } from '../types';
import { isTokenizedLocalTrack } from '../player/playerRuntimePolicy';

type SubtitleTrackPatch = Pick<
  AudioTrack,
  'lyrics' | 'lyricsSourceKind' | 'lyricsRelativePath' | 'lyricsLoadStatus' | 'lyricsLoadError'
>;

interface UsePlayerSubtitlesOptions {
  currentTrack: AudioTrack | null;
  setPlayerState: Dispatch<SetStateAction<PlayerState>>;
}

export function applySubtitlePatch(
  previous: PlayerState,
  trackId: string,
  patch: SubtitleTrackPatch,
): PlayerState {
  if (!previous.currentTrack || previous.currentTrack.id !== trackId) return previous;

  const updatedTrack: AudioTrack = {
    ...previous.currentTrack,
    ...patch,
  };

  return {
    ...previous,
    currentTrack: updatedTrack,
    queue: previous.queue.map((track) => (
      track.id === trackId ? { ...track, ...updatedTrack } : track
    )),
  };
}

export function mapSubtitleResult(
  result: YangKuraReadTrackLyricsResult,
): SubtitleTrackPatch {
  if (result.ok && result.normalizedLrcLines.length > 0) {
    return {
      lyrics: result.normalizedLrcLines,
      lyricsSourceKind: 'local-file',
      lyricsRelativePath: result.subtitleRelativePath,
      lyricsLoadStatus: 'loaded',
      lyricsLoadError: undefined,
    };
  }

  if (result.ok || result.status === 'mvp26-track-lyrics-missing-file') {
    return {
      lyrics: undefined,
      lyricsSourceKind: 'none',
      lyricsRelativePath: undefined,
      lyricsLoadStatus: 'missing',
      lyricsLoadError: result.message,
    };
  }

  return {
    lyrics: undefined,
    lyricsSourceKind: 'none',
    lyricsRelativePath: undefined,
    lyricsLoadStatus: 'error',
    lyricsLoadError: result.message,
  };
}

export function usePlayerSubtitles({
  currentTrack,
  setPlayerState,
}: UsePlayerSubtitlesOptions): void {
  const requestGenerationRef = useRef(0);
  const subtitleSourceSignature = useMemo(
    () => JSON.stringify(currentTrack?.subtitleRelativePaths ?? []),
    [currentTrack?.subtitleRelativePaths],
  );

  const currentTrackId = currentTrack?.id;
  const currentTrackRootToken = currentTrack?.rootPathToken;
  const currentTrackRelativePath = currentTrack?.sourceRelativePath;

  useEffect(() => {
    const requestGeneration = requestGenerationRef.current + 1;
    requestGenerationRef.current = requestGeneration;

    const isCurrentRequest = () => requestGenerationRef.current === requestGeneration;
    const commitPatch = (trackId: string, patch: SubtitleTrackPatch) => {
      if (!isCurrentRequest()) return;
      setPlayerState((previous) => (
        isCurrentRequest() ? applySubtitlePatch(previous, trackId, patch) : previous
      ));
    };

    if (!currentTrack || !isTokenizedLocalTrack(currentTrack)) {
      return () => {
        if (isCurrentRequest()) requestGenerationRef.current += 1;
      };
    }

    const trackId = currentTrack.id;
    const readTrackLyrics = window.yangKura?.requestReadTrackLyrics;

    if (!readTrackLyrics) {
      commitPatch(trackId, {
        lyrics: undefined,
        lyricsSourceKind: 'none',
        lyricsRelativePath: undefined,
        lyricsLoadStatus: 'error',
        lyricsLoadError: '当前 Electron preload 未暴露字幕读取接口。',
      });
      return () => {
        if (isCurrentRequest()) requestGenerationRef.current += 1;
      };
    }

    commitPatch(trackId, {
      lyrics: undefined,
      lyricsSourceKind: 'none',
      lyricsRelativePath: undefined,
      lyricsLoadStatus: 'loading',
      lyricsLoadError: undefined,
    });

    void readTrackLyrics({
      rootPathToken: currentTrack.rootPathToken,
      trackId,
      trackRelativePath: currentTrack.sourceRelativePath,
      mode: 'read-track-lyrics',
      subtitleRelativePaths: currentTrack.subtitleRelativePaths ?? [],
    }).then((result) => {
      commitPatch(trackId, mapSubtitleResult(result));
    }).catch((error) => {
      commitPatch(trackId, {
        lyrics: undefined,
        lyricsSourceKind: 'none',
        lyricsRelativePath: undefined,
        lyricsLoadStatus: 'error',
        lyricsLoadError: error instanceof Error ? error.message : String(error),
      });
    });

    return () => {
      if (isCurrentRequest()) requestGenerationRef.current += 1;
    };
  }, [
    currentTrackId,
    currentTrackRelativePath,
    currentTrackRootToken,
    setPlayerState,
    subtitleSourceSignature,
  ]);
}
