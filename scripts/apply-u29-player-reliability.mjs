#!/usr/bin/env node
import fs from 'node:fs';

function read(file) {
  return fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
}

function write(file, content) {
  fs.writeFileSync(file, content, 'utf8');
}

function replaceOnce(file, before, after, label) {
  const source = read(file);
  if (!source.includes(before)) throw new Error(`${label}: anchor not found in ${file}`);
  if (source.indexOf(before) !== source.lastIndexOf(before)) throw new Error(`${label}: anchor is not unique in ${file}`);
  write(file, source.replace(before, after));
}

replaceOnce(
  'src/hooks/useAudioPlayer.ts',
  "import { mpvPlaybackPreferenceService, type MpvPlaybackPreference } from '../services/mpvPlaybackPreferenceService';\n",
  "import { mpvPlaybackPreferenceService, type MpvPlaybackPreference } from '../services/mpvPlaybackPreferenceService';\nimport {\n  clampPlaybackPosition,\n  isLocalTrackAwaitingAuthorization,\n  reconcilePlayerStateWithLibrary,\n  resolvePlaybackStart,\n} from '../player/playerRuntimePolicy';\n",
  'player runtime policy import',
);

replaceOnce(
  'src/hooks/useAudioPlayer.ts',
  "  const pendingInitialSeekRef = useRef<{ trackId: string; progress: number } | null>(null);\n",
  "  const pendingInitialSeekRef = useRef<{ trackId: string; progress: number } | null>(\n    restoredQueueState?.currentTrack\n      ? { trackId: restoredQueueState.currentTrack.id, progress: restoredQueueState.progress }\n      : null,\n  );\n",
  'restored queue playback start',
);

replaceOnce(
  'src/hooks/useAudioPlayer.ts',
  `    const handleLoadedMetadata = () => {\n      setPlayerState((prev) => {\n        if (!prev.currentTrack || prev.playbackMode !== 'html-audio') return prev;\n        const duration = safeDuration(audio.duration);\n        if (!duration) return prev;\n        const updatedTrack = { ...prev.currentTrack, duration };\n        const updatedQueue = prev.queue.map((track) => (track.id === updatedTrack.id ? { ...track, duration } : track));\n        return { ...prev, currentTrack: updatedTrack, queue: updatedQueue };\n      });\n    };\n`,
  `    const handleLoadedMetadata = () => {\n      const current = stateRef.current.currentTrack;\n      if (current) {\n        const target = resolvePlaybackStart(current, pendingInitialSeekRef.current, stateRef.current.progress);\n        if (target > 0 && Math.abs(audio.currentTime - target) > 0.1) audio.currentTime = target;\n        if (pendingInitialSeekRef.current?.trackId === current.id) pendingInitialSeekRef.current = null;\n      }\n      setPlayerState((prev) => {\n        if (!prev.currentTrack || prev.playbackMode !== 'html-audio') return prev;\n        const duration = safeDuration(audio.duration);\n        if (!duration) return prev;\n        const updatedTrack = { ...prev.currentTrack, duration };\n        const updatedQueue = prev.queue.map((track) => (track.id === updatedTrack.id ? { ...track, duration } : track));\n        return { ...prev, currentTrack: updatedTrack, queue: updatedQueue };\n      });\n    };\n`,
  'HTMLAudio metadata resume',
);

replaceOnce(
  'src/hooks/useAudioPlayer.ts',
  `  const handleTogglePlay = useCallback(() => {\n    setPlayerState(prev => {\n      if (!prev.currentTrack) return prev;\n      const willPlay = !prev.isPlaying;\n      const nextPlaybackMode = willPlay && prev.playbackMode === 'idle'\n        ? (isTokenizedLocalTrack(prev.currentTrack) ? 'resolving-local-media' : 'mock-simulated')\n        : prev.playbackMode;\n      return { ...prev, isPlaying: willPlay, playbackMode: nextPlaybackMode, playbackError: null };\n    });\n  }, []);\n`,
  `  const handleTogglePlay = useCallback(() => {\n    setPlayerState(prev => {\n      if (!prev.currentTrack) return prev;\n      const willPlay = !prev.isPlaying;\n      if (willPlay && isLocalTrackAwaitingAuthorization(prev.currentTrack)) {\n        return {\n          ...prev,\n          isPlaying: false,\n          playbackMode: 'idle',\n          playbackError: '当前音轨需要重新授权资源库并读取 Index 后才能播放。',\n          playbackNotice: null,\n        };\n      }\n      if (willPlay && prev.playbackMode === 'idle') {\n        pendingInitialSeekRef.current = {\n          trackId: prev.currentTrack.id,\n          progress: clampPlaybackPosition(prev.progress, prev.currentTrack.duration),\n        };\n      }\n      const nextPlaybackMode = willPlay && prev.playbackMode === 'idle'\n        ? (isTokenizedLocalTrack(prev.currentTrack) ? 'resolving-local-media' : 'mock-simulated')\n        : prev.playbackMode;\n      return { ...prev, isPlaying: willPlay, playbackMode: nextPlaybackMode, playbackError: null };\n    });\n  }, []);\n`,
  'authorization-aware play toggle',
);

replaceOnce(
  'src/hooks/useAudioPlayer.ts',
  `  const handleSeek = useCallback((seconds: number) => {\n    const normalized = Math.max(0, seconds);\n    const audio = audioRef.current;\n`,
  `  const handleSeek = useCallback((seconds: number) => {\n    const normalized = clampPlaybackPosition(seconds, stateRef.current.currentTrack?.duration);\n    const audio = audioRef.current;\n`,
  'seek duration clamp',
);

replaceOnce(
  'src/hooks/useAudioPlayer.ts',
  `      audioRef.current.src = result.mediaUrl;\n      const initialSeek = pendingInitialSeekRef.current?.trackId === currentTrack.id ? pendingInitialSeekRef.current.progress : 0;\n      audioRef.current.currentTime = Math.max(0, initialSeek);\n      audioRef.current.volume = stateRef.current.volume;\n      audioRef.current.muted = stateRef.current.isMuted;\n      audioRef.current.load();\n`,
  `      audioRef.current.src = result.mediaUrl;\n      audioRef.current.volume = stateRef.current.volume;\n      audioRef.current.muted = stateRef.current.isMuted;\n      const initialSeek = resolvePlaybackStart(currentTrack, pendingInitialSeekRef.current, stateRef.current.progress);\n      audioRef.current.load();\n      if (audioRef.current.readyState < 1) {\n        await new Promise<void>((resolve, reject) => {\n          const target = audioRef.current;\n          if (!target) return reject(new Error('HTMLAudio 实例已释放。'));\n          const cleanup = () => {\n            target.removeEventListener('loadedmetadata', handleReady);\n            target.removeEventListener('error', handleFailure);\n          };\n          const handleReady = () => { cleanup(); resolve(); };\n          const handleFailure = () => { cleanup(); reject(new Error('HTMLAudio 无法读取音频元数据。')); };\n          target.addEventListener('loadedmetadata', handleReady, { once: true });\n          target.addEventListener('error', handleFailure, { once: true });\n        });\n      }\n      if (cancelled || !audioRef.current) return;\n      audioRef.current.currentTime = initialSeek;\n      if (pendingInitialSeekRef.current?.trackId === currentTrack.id) pendingInitialSeekRef.current = null;\n`,
  'HTMLAudio resolved start',
);

replaceOnce(
  'src/hooks/useAudioPlayer.ts',
  `            startSeconds: pendingInitialSeekRef.current?.trackId === currentTrack.id ? pendingInitialSeekRef.current.progress : 0,\n`,
  `            startSeconds: resolvePlaybackStart(currentTrack, pendingInitialSeekRef.current, stateRef.current.progress),\n`,
  'mpv resolved start',
);

replaceOnce(
  'src/hooks/useAudioPlayer.ts',
  `          if (mpvResult.ok) {\n            forceHtmlFallbackTrackRef.current = null;\n            clearHtmlAudio();\n`,
  `          if (mpvResult.ok) {\n            forceHtmlFallbackTrackRef.current = null;\n            if (pendingInitialSeekRef.current?.trackId === currentTrack.id) pendingInitialSeekRef.current = null;\n            clearHtmlAudio();\n`,
  'mpv pending start cleanup',
);

replaceOnce(
  'src/hooks/useAudioPlayer.ts',
  `  useEffect(() => {\n    const track = playerState.currentTrack;\n    if (!track) return;\n`,
  `  const handleReconcileQueueWithLibrary = useCallback((currentLibraryTracks: AudioTrack[]) => {\n    setPlayerState((previous) => {\n      const next = reconcilePlayerStateWithLibrary(previous, currentLibraryTracks);\n      if (next.currentTrack && next.currentTrack !== previous.currentTrack && next.progress > 0) {\n        pendingInitialSeekRef.current = { trackId: next.currentTrack.id, progress: next.progress };\n      }\n      return next;\n    });\n  }, []);\n\n  useEffect(() => {\n    const track = playerState.currentTrack;\n    if (!track) return;\n`,
  'queue reconciliation handler',
);

replaceOnce(
  'src/hooks/useAudioPlayer.ts',
  `    handleToggleLoopMode,\n    handleToggleCompletionMode,\n  };\n`,
  `    handleToggleLoopMode,\n    handleToggleCompletionMode,\n    handleReconcileQueueWithLibrary,\n  };\n`,
  'return queue reconciliation handler',
);

for (const [file, importAnchor] of [
  ['src/services/playerQueuePersistenceService.ts', "import type { AudioTrack, PlayerState, PlaybackCompletionMode } from '../types';\n"],
  ['src/services/playbackHistoryService.ts', "import type { AudioTrack } from '../types';\n"],
  ['src/services/playlistPersistenceService.ts', "import type { AudioTrack, Playlist } from '../types';\n"],
]) {
  replaceOnce(file, importAnchor, `${importAnchor}import { sanitizePersistedPlayerTrack } from '../player/playerRuntimePolicy';\n`, `${file} policy import`);
}

replaceOnce(
  'src/services/playerQueuePersistenceService.ts',
  `function sanitizeTrackForQueue(track: AudioTrack): AudioTrack {\n  return {\n    ...track,\n    mediaUrl: undefined,\n    lyrics: track.lyricsSourceKind === 'mock' ? track.lyrics : undefined,\n    lyricsLoadStatus: track.lyricsLoadStatus === 'loaded' ? 'idle' : track.lyricsLoadStatus,\n    lyricsLoadError: undefined,\n  };\n}\n`,
  `function sanitizeTrackForQueue(track: AudioTrack): AudioTrack {\n  return sanitizePersistedPlayerTrack(track);\n}\n`,
  'queue persistence token cleanup',
);

replaceOnce(
  'src/services/playbackHistoryService.ts',
  `function sanitizeTrack(track: AudioTrack): AudioTrack {\n  return {\n    ...track,\n    mediaUrl: undefined,\n    lyrics: track.lyricsSourceKind === 'mock' ? track.lyrics : undefined,\n    lyricsLoadStatus: track.lyricsLoadStatus === 'loaded' ? 'idle' : track.lyricsLoadStatus,\n    lyricsLoadError: undefined,\n  };\n}\n`,
  `function sanitizeTrack(track: AudioTrack): AudioTrack {\n  return sanitizePersistedPlayerTrack(track);\n}\n`,
  'history persistence token cleanup',
);

replaceOnce(
  'src/services/playlistPersistenceService.ts',
  `function sanitizePlaylistTrack(track: AudioTrack): AudioTrack {\n  return {\n    ...track,\n    mediaUrl: undefined,\n    lyrics: track.lyricsSourceKind === 'mock' ? track.lyrics : undefined,\n    lyricsLoadStatus: track.lyricsLoadStatus === 'loaded' ? 'idle' : track.lyricsLoadStatus,\n    lyricsLoadError: undefined,\n  };\n}\n`,
  `function sanitizePlaylistTrack(track: AudioTrack): AudioTrack {\n  return sanitizePersistedPlayerTrack(track);\n}\n`,
  'playlist persistence token cleanup',
);

replaceOnce(
  'src/App.tsx',
  "import { settingsPathPrivacyService } from './services/settingsPathPrivacyService';\n",
  "import { settingsPathPrivacyService } from './services/settingsPathPrivacyService';\nimport { reconcileTracksWithLibrary } from './player/playerRuntimePolicy';\n",
  'App player policy import',
);

replaceOnce(
  'src/App.tsx',
  `    handleToggleLoopMode,\n    handleToggleCompletionMode,\n  } = useAudioPlayer();\n`,
  `    handleToggleLoopMode,\n    handleToggleCompletionMode,\n    handleReconcileQueueWithLibrary,\n  } = useAudioPlayer();\n\n  useEffect(() => {\n    if (!librarySessionSnapshot.lastIndex) return;\n    const currentLibraryTracks = collectAllLibraryTracks(rjWorks, musicAlbums);\n    if (currentLibraryTracks.length === 0) return;\n    handleReconcileQueueWithLibrary(currentLibraryTracks);\n    setPlaylists((previous) => {\n      let changed = false;\n      const next = previous.map((playlist) => {\n        const tracks = reconcileTracksWithLibrary(playlist.tracks, currentLibraryTracks);\n        if (tracks.some((track, index) => track !== playlist.tracks[index])) changed = true;\n        return tracks === playlist.tracks ? playlist : { ...playlist, tracks, tracksCount: tracks.length };\n      });\n      return changed ? next : previous;\n    });\n  }, [rjWorks, musicAlbums, librarySessionSnapshot.lastIndex?.displayName, handleReconcileQueueWithLibrary]);\n`,
  'App queue and playlist reconciliation',
);

replaceOnce(
  'src/App.tsx',
  `          <div className="absolute right-0 top-0 bottom-0 w-80 bg-sidebar-bg/95 backdrop-blur-xl border-l border-border-color z-40 p-4 shadow-2xl flex flex-col justify-between animate-fade-in">\n`,
  `          <div id="u29-queue-drawer" className="absolute right-0 top-0 bottom-0 w-80 bg-sidebar-bg/95 backdrop-blur-xl border-l border-border-color z-40 p-4 shadow-2xl flex flex-col justify-between animate-fade-in">\n`,
  'queue drawer test id',
);

replaceOnce(
  'src/App.tsx',
  `                        key={track.id + '_q_' + idx}\n                        onClick={() => handlePlayTrack(track, playerState.queue)}\n`,
  `                        key={track.id + '_q_' + idx}\n                        data-queue-track-id={track.id}\n                        data-queue-current={isPlayingThis ? 'true' : 'false'}\n                        onClick={() => handlePlayTrack(track, playerState.queue)}\n`,
  'queue item test state',
);

replaceOnce(
  'src/components/PlayerBar.tsx',
  `      data-mvp79-player-ui-bugfix="true"\n`,
  `      data-mvp79-player-ui-bugfix="true"\n      data-u29-playback-mode={playerState.playbackMode ?? 'idle'}\n      data-u29-track-id={currentTrack?.id ?? ''}\n      data-u29-progress={Number.isFinite(progress) ? progress.toFixed(3) : '0.000'}\n      data-u29-duration={Number.isFinite(currentTrack?.duration) ? String(currentTrack?.duration ?? 0) : '0'}\n      data-u29-queue-count={String(playerState.queue.length)}\n      data-u29-current-index={String(playerState.currentIndex)}\n      data-u29-source-ready={currentTrack?.rootPathToken ? 'true' : 'false'}\n      data-u29-lyrics-status={currentTrack?.lyricsLoadStatus ?? 'idle'}\n`,
  'PlayerBar runtime test state',
);

replaceOnce(
  'src/components/LyricsPanel.tsx',
  `      tabIndex={-1}\n      className="fixed inset-0 z-[100] bg-zinc-950 text-white overflow-hidden flex flex-col animate-slide-up select-none"\n`,
  `      tabIndex={-1}\n      data-u29-track-id={currentTrack.id}\n      data-u29-lyrics-status={currentTrack.lyricsLoadStatus ?? 'idle'}\n      data-u29-lyrics-path={currentTrack.lyricsRelativePath ?? ''}\n      className="fixed inset-0 z-[100] bg-zinc-950 text-white overflow-hidden flex flex-col animate-slide-up select-none"\n`,
  'LyricsPanel runtime test state',
);

const pkg = JSON.parse(read('package.json'));
pkg.scripts['test:u29:electron-e2e'] = 'node scripts/test-u29-electron-e2e.mjs';
pkg.scripts['verify:u29-player-reliability'] = 'node scripts/verify-u29-player-reliability.mjs';
write('package.json', `${JSON.stringify(pkg, null, 2)}\n`);

console.log('U29 deterministic player reliability patch applied.');
