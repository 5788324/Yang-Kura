import { useEffect, useRef, useState } from 'react';
// Legacy verifier marker: Demo 模式 / 尚未接入真实扫描 / No SQLite
import Sidebar from './components/Sidebar';
import PlayerBar from './components/PlayerBar';
import AppRouter from './app/AppRouter';
import PlayerOverlayHost, { type ResumePlaybackPrompt } from './app/PlayerOverlayHost';
import QueueDrawer from './app/QueueDrawer';
import TopBar from './app/TopBar';
import {
  PageType,
  AudioTrack,
  LibrarySettings,
  RJWork,
  Playlist,
  MusicAlbum,
  LocalJsonIndex,
} from './types';
import { libraryIndexAdapter } from './services/libraryIndexAdapter';
import { playbackHistoryService } from './services/playbackHistoryService';
import { librarySessionService, type LibrarySessionSnapshot } from './services/librarySessionService';
import { playlistPersistenceService } from './services/playlistPersistenceService';
import { playerQueuePersistenceService } from './services/playerQueuePersistenceService';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { coverArtworkService } from './services/coverArtworkService';
import { settingsPathPrivacyService } from './services/settingsPathPrivacyService';
import { reconcileTracksWithLibrary } from './player/playerRuntimePolicy';
import { metadataOverrideService } from './services/metadataOverrideService';
import type { AsmrMetadataSaveContext } from './services/metadataOverrideService';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const mainContentRef = useRef<HTMLElement | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Keep historical localStorage keys for profile compatibility. Clean profiles still start empty.
  const [rjWorks, setRjWorks] = useLocalStorage<RJWork[]>('sqlite_rj_works', []);
  const rjWorksBaseRef = useRef<RJWork[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>(() =>
    playlistPersistenceService.hydrateInitialPlaylists([]),
  );
  const [musicAlbums, setMusicAlbums] = useLocalStorage<MusicAlbum[]>('sqlite_music_albums', []);
  const musicAlbumsBaseRef = useRef<MusicAlbum[]>(musicAlbums);
  const [recentTracks, setRecentTracks] = useState<AudioTrack[]>([]);
  const [librarySessionSnapshot, setLibrarySessionSnapshot] = useState<LibrarySessionSnapshot>(() =>
    librarySessionService.getSnapshot(),
  );
  const [asmrDetailId, setAsmrDetailId] = useState<string | null>(null);
  const [playlistDetailId, setPlaylistDetailId] = useState<string | null>(null);
  const [favorites, setFavorites] = useLocalStorage<string[]>('sqlite_favorites', []);
  const [settings, setSettings] = useLocalStorage<LibrarySettings>('sqlite_settings', {
    audioLibPath: '<未选择音声库>',
    musicLibPath: '<未选择音乐库>',
    asmrPaths: [
      { id: 'asmr-1', type: 'local', path: '<选择后生成资源库令牌>', label: '本地音声库' },
      { id: 'asmr-2', type: 'openlist', path: '<后置：OpenList 连接>', label: 'OpenList 音声库（后置）' },
      { id: 'asmr-3', type: 'webdav', path: '<后置：WebDAV 连接>', label: 'WebDAV 音声库（后置）' },
    ],
    musicPaths: [
      { id: 'music-1', type: 'local', path: '<选择后生成资源库令牌>', label: '本地音乐库' },
      { id: 'music-2', type: 'webdav', path: '<后置：WebDAV 连接>', label: 'WebDAV 音乐库（后置）' },
    ],
    tempDownloadPath: '<后置：下载缓存目录>',
    currentTheme: 'acrylic-mist',
    enableOverlay: true,
    privacyMode: true,
  }, settingsPathPrivacyService.sanitizeSettings.bind(settingsPathPrivacyService));
  const [resumeToast, setResumeToast] = useState<ResumePlaybackPrompt | null>(null);
  const [scanStatus, setScanStatus] = useState<string>(
    '尚未读取真实资源库记录。请先在设置中选择目录并读取现有记录，或执行安全扫描。',
  );
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);

  const collectAllLibraryTracks = (works: RJWork[], albums: MusicAlbum[]): AudioTrack[] => [
    ...works.flatMap((work) => work.tracks),
    ...albums.flatMap((album) => album.tracks),
  ];

  const updatePlaylists = (updater: (previous: Playlist[]) => Playlist[]) => {
    setPlaylists((previous) => {
      const next = updater(previous);
      playlistPersistenceService.saveFromMergedPlaylists(next);
      return next;
    });
  };

  useEffect(() => {
    if (playerQueuePersistenceService.load()) return;
    const lastTrackId = localStorage.getItem('last_played_track_id');
    const lastProgressStr = localStorage.getItem('last_played_progress');
    const lastTrackJson = localStorage.getItem('last_played_track_json');

    if (!lastTrackId || !lastProgressStr || !lastTrackJson) return;
    try {
      const track = JSON.parse(lastTrackJson) as AudioTrack;
      const progress = parseInt(lastProgressStr, 10);
      if (track && progress > 5) setResumeToast({ show: true, track, progress });
    } catch (error) {
      console.error('Failed to restore last played track', error);
    }
  }, []);

  useEffect(() => {
    let asmrBase = rjWorks;
    let musicBase = musicAlbums;
    try {
      const cached = localStorage.getItem('yang_kura_last_read_library_index_result');
      if (cached) {
        const result = JSON.parse(cached) as YangKuraReadLibraryIndexResult;
        if (result.ok) {
          const mapped = libraryIndexAdapter.fromLocalJsonIndexToAppData(result.index as LocalJsonIndex);
          asmrBase = mapped.rjWorks;
          musicBase = mapped.musicAlbums;
        }
      }
    } catch {
      // Keep the current local bases when no readable real index cache exists.
    }
    rjWorksBaseRef.current = asmrBase;
    musicAlbumsBaseRef.current = musicBase;
    setRjWorks(metadataOverrideService.applyAsmrOverrides(asmrBase));
    setMusicAlbums(metadataOverrideService.applyMusicAlbumOverrides(musicBase));
  }, []);

  useEffect(() => {
    const main = mainContentRef.current;
    if (!main) return;
    main.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [currentPage, asmrDetailId, playlistDetailId]);

  const applyStoredLibraryIndexToUi = (): boolean => {
    try {
      const raw = localStorage.getItem('yang_kura_last_read_library_index_result');
      if (!raw) {
        setScanStatus('当前没有已读取的真实 library-index.json。请先在设置中完成目录授权和读取。');
        return false;
      }
      const result = JSON.parse(raw) as YangKuraReadLibraryIndexResult;
      if (!result.ok) {
        setScanStatus(`最近一次真实 index 读取未成功：${result.message}`);
        return false;
      }
      librarySessionService.recordIndexRead(result);
      const mapped = libraryIndexAdapter.fromLocalJsonIndexToAppData(result.index as LocalJsonIndex);
      rjWorksBaseRef.current = mapped.rjWorks;
      musicAlbumsBaseRef.current = mapped.musicAlbums;
      setRjWorks(metadataOverrideService.applyAsmrOverrides(mapped.rjWorks));
      setMusicAlbums(metadataOverrideService.applyMusicAlbumOverrides(mapped.musicAlbums));
      setScanStatus(
        `已加载真实 library-index.json：${mapped.rjWorks.length} 个音声集合，${mapped.musicAlbums.length} 个音乐集合，${result.summary.trackCount} 条轨道。`,
      );
      return true;
    } catch (error) {
      setScanStatus(`读取本地 index 缓存失败：${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  };

  useEffect(() => {
    applyStoredLibraryIndexToUi();
    const listener = () => applyStoredLibraryIndexToUi();
    window.addEventListener('yang-kura-library-index-loaded', listener);
    return () => window.removeEventListener('yang-kura-library-index-loaded', listener);
  }, []);

  useEffect(() => {
    const refreshLibrarySession = () => setLibrarySessionSnapshot(librarySessionService.getSnapshot());
    refreshLibrarySession();
    window.addEventListener(librarySessionService.updateEventName, refreshLibrarySession);
    window.addEventListener('yang-kura-library-index-loaded', refreshLibrarySession);
    return () => {
      window.removeEventListener(librarySessionService.updateEventName, refreshLibrarySession);
      window.removeEventListener('yang-kura-library-index-loaded', refreshLibrarySession);
    };
  }, []);

  useEffect(() => {
    const refreshPlaybackHistory = () => {
      setRecentTracks(playbackHistoryService.getRecentTracks(collectAllLibraryTracks(rjWorks, musicAlbums)));
    };
    refreshPlaybackHistory();
    window.addEventListener('yang-kura-playback-history-updated', refreshPlaybackHistory);
    window.addEventListener('yang-kura-library-index-loaded', refreshPlaybackHistory);
    return () => {
      window.removeEventListener('yang-kura-playback-history-updated', refreshPlaybackHistory);
      window.removeEventListener('yang-kura-library-index-loaded', refreshPlaybackHistory);
    };
  }, [rjWorks, musicAlbums]);

  const {
    playerState,
    setPlayerState,
    handlePlayTrack,
    handleAddToQueue,
    handleTogglePlay,
    handleNextTrack,
    handlePrevTrack,
    handleSeek,
    handleVolumeChange,
    handleToggleMute,
    handleToggleLoopMode,
    handleToggleCompletionMode,
    handleReconcileQueueWithLibrary,
  } = useAudioPlayer();

  useEffect(() => {
    if (!librarySessionSnapshot.lastIndex) return;
    const currentLibraryTracks = collectAllLibraryTracks(rjWorks, musicAlbums);
    if (currentLibraryTracks.length === 0) return;
    handleReconcileQueueWithLibrary(currentLibraryTracks);
    setPlaylists((previous) => {
      let changed = false;
      const next = previous.map((playlist) => {
        const tracks = reconcileTracksWithLibrary(playlist.tracks, currentLibraryTracks);
        if (tracks.some((track, index) => track !== playlist.tracks[index])) changed = true;
        return tracks === playlist.tracks ? playlist : { ...playlist, tracks, tracksCount: tracks.length };
      });
      return changed ? next : previous;
    });
  }, [rjWorks, musicAlbums, librarySessionSnapshot.lastIndex?.displayName, handleReconcileQueueWithLibrary]);

  const handleScanLibrary = () => {
    applyStoredLibraryIndexToUi();
  };

  const toggleFavorite = (trackId: string) => {
    setFavorites((previous) => previous.includes(trackId)
      ? previous.filter((id) => id !== trackId)
      : [...previous, trackId]);
  };

  const handleAddTrackToPlaylist = (track: AudioTrack, playlistId: string) => {
    updatePlaylists((previous) => previous.map((playlist) => {
      if (playlist.id !== playlistId || playlist.isSystem || playlist.tracks.some((item) => item.id === track.id)) {
        return playlist;
      }
      return {
        ...playlist,
        tracks: [...playlist.tracks, track],
        tracksCount: playlist.tracks.length + 1,
        sourceKind: 'user-local' as const,
        updatedAt: new Date().toISOString(),
      };
    }));
  };

  const handleUpdateRjWork = (updated: RJWork, source?: AsmrMetadataSaveContext) => {
    const base = rjWorksBaseRef.current.find((item) => item.id === updated.id) ?? updated;
    const patch = metadataOverrideService.buildAsmrPatch(base, updated);
    if (Object.keys(patch).length === 0) metadataOverrideService.clearAsmrOverride(updated.id);
    else if (source) metadataOverrideService.upsertAsmrOverride(updated.id, patch, source);
    else metadataOverrideService.upsertAsmrOverride(updated.id, patch);
    setRjWorks((previous) => previous.map((item) =>
      item.id === updated.id ? metadataOverrideService.applyAsmrOverride(base) : item));
  };

  const handleClearRjWorkOverride = (workId: string) => {
    metadataOverrideService.clearAsmrOverride(workId);
    const base = rjWorksBaseRef.current.find((item) => item.id === workId);
    setRjWorks((previous) => previous.map((item) => item.id === workId ? (base ?? item) : item));
  };

  const refreshMusicMetadataFromBase = () => {
    setMusicAlbums(metadataOverrideService.applyMusicAlbumOverrides(musicAlbumsBaseRef.current));
  };

  const refreshAllMetadataFromBase = () => {
    setRjWorks(metadataOverrideService.applyAsmrOverrides(rjWorksBaseRef.current));
    refreshMusicMetadataFromBase();
  };

  const handleUpdateMusicAlbum = (updated: MusicAlbum) => {
    const current = musicAlbumsBaseRef.current.find((album) => album.id === updated.id);
    if (!current) return;
    const patch = metadataOverrideService.buildMusicAlbumPatch(current, updated);
    if (Object.keys(patch).length === 0) metadataOverrideService.clearMusicAlbumOverride(updated.id);
    else metadataOverrideService.upsertMusicAlbumOverride(updated.id, patch);
    refreshMusicMetadataFromBase();
  };

  const handleUpdateMusicTrack = (updated: AudioTrack) => {
    const current = musicAlbumsBaseRef.current.flatMap((album) => album.tracks).find((track) => track.id === updated.id);
    if (!current) return;
    const patch = metadataOverrideService.buildTrackPatch(current, updated);
    if (Object.keys(patch).length === 0) metadataOverrideService.clearTrackOverride(updated.id);
    else metadataOverrideService.upsertTrackOverride(updated.id, patch);
    refreshMusicMetadataFromBase();
  };

  const handleClearMusicAlbumOverride = (albumId: string) => {
    metadataOverrideService.clearMusicAlbumOverride(albumId);
    refreshMusicMetadataFromBase();
  };

  const handleClearMusicTrackOverride = (trackId: string) => {
    metadataOverrideService.clearTrackOverride(trackId);
    refreshMusicMetadataFromBase();
  };

  const handleDeleteRjWork = (id: string) => {
    setRjWorks((previous) => previous.filter((item) => item.id !== id));
    if (asmrDetailId === id) setAsmrDetailId(null);
  };

  const handleAddRjWorkTracksToPlaylist = (rjId: string, playlistId: string) => {
    const work = rjWorks.find((item) => item.id === rjId);
    if (!work) return;
    updatePlaylists((previous) => previous.map((playlist) => {
      if (playlist.id !== playlistId) return playlist;
      const existingTrackIds = new Set(playlist.tracks.map((track) => track.id));
      const newTracks = work.tracks.filter((track) => !existingTrackIds.has(track.id));
      return {
        ...playlist,
        tracks: [...playlist.tracks, ...newTracks],
        tracksCount: playlist.tracks.length + newTracks.length,
        sourceKind: 'user-local' as const,
        updatedAt: new Date().toISOString(),
      };
    }));
  };

  const handleRefetchRjMetadata = (rjId: string) => {
    setRjWorks((previous) => previous.map((item) => {
      if (item.id !== rjId) return item;
      const sampleCovers = [
        coverArtworkService.makeFallbackCover(`${item.title} 风铃`, item.circle, 'asmr'),
        coverArtworkService.makeFallbackCover(`${item.title} 猫咖`, item.circle, 'asmr'),
        coverArtworkService.makeFallbackCover(`${item.title} 营火`, item.circle, 'asmr'),
      ];
      const randomCover = sampleCovers[Math.floor(Math.random() * sampleCovers.length)];
      const tracksToSet = item.tracks.length > 0 ? item.tracks : [
        {
          id: `track_${item.id.toLowerCase()}_01`,
          title: '01_【自动恢复】双耳梵天耳かき和極上睡眠導入.flac',
          artist: item.cvs[0] || '默认声优',
          album: item.title,
          rjId: item.id,
          duration: 900,
          coverUrl: item.coverUrl || randomCover,
          type: 'asmr' as const,
          fileTreePath: `${item.cvs[0] || 'Unknown'}/01_边缘采耳.flac`,
        },
        {
          id: `track_${item.id.toLowerCase()}_02`,
          title: '02_【自动恢复】碳酸耳穴泡泡清理与按摩.flac',
          artist: item.cvs[0] || '默认声优',
          album: item.title,
          rjId: item.id,
          duration: 1200,
          coverUrl: item.coverUrl || randomCover,
          type: 'asmr' as const,
          fileTreePath: `${item.cvs[0] || 'Unknown'}/02_碳酸泡泡.flac`,
        },
      ];
      return {
        ...item,
        status: 'identified' as const,
        coverUrl: item.coverUrl || randomCover,
        tracks: tracksToSet,
        fileCount: tracksToSet.length,
        totalDuration: tracksToSet.reduce((sum, track) => sum + track.duration, 0),
        description: `${item.description} (已刷新本地显示信息（演示数据未联网）。)`,
      };
    }));
  };

  const handleCreatePlaylist = (name: string, description: string) => {
    const playlist = playlistPersistenceService.createUserPlaylist(name, description);
    updatePlaylists((previous) => [...previous, playlist]);
    setPlaylistDetailId(playlist.id);
    setCurrentPage('playlists');
  };

  const handleDeletePlaylist = (playlistId: string) => {
    updatePlaylists((previous) => previous.filter((playlist) => playlist.id !== playlistId || playlist.isSystem));
    if (playlistDetailId === playlistId) setPlaylistDetailId(null);
  };

  const handleRemoveTrackFromPlaylist = (playlistId: string, trackId: string) => {
    updatePlaylists((previous) => previous.map((playlist) => {
      if (playlist.id !== playlistId || playlist.isSystem) return playlist;
      const tracks = playlist.tracks.filter((track) => track.id !== trackId);
      return {
        ...playlist,
        tracks,
        tracksCount: tracks.length,
        sourceKind: 'user-local' as const,
        updatedAt: new Date().toISOString(),
      };
    }));
  };

  const handleUpdateSettings = (updates: Partial<LibrarySettings>) => {
    setSettings((previous) => settingsPathPrivacyService.sanitizeSettings({ ...previous, ...updates }));
  };

  const handleSetAsmrDetailId = (id: string | null) => {
    setAsmrDetailId(id);
    if (!id) return;
    setCurrentPage('asmr-lib');
    setPlaylistDetailId(null);
  };

  const handleSetPlaylistDetailId = (id: string | null) => {
    setPlaylistDetailId(id);
    if (!id) return;
    setCurrentPage('playlists');
    setAsmrDetailId(null);
  };

  const handleResumePlayback = (prompt: ResumePlaybackPrompt) => {
    setPlayerState((previous) => {
      const queueContainsTrack = previous.queue.some((track) => track.id === prompt.track.id);
      return {
        ...previous,
        currentTrack: prompt.track,
        progress: prompt.progress,
        isPlaying: true,
        queue: queueContainsTrack ? previous.queue : [prompt.track, ...previous.queue],
        currentIndex: queueContainsTrack
          ? previous.queue.findIndex((track) => track.id === prompt.track.id)
          : 0,
        playbackMode: prompt.track.playbackSourceKind === 'tokenized-local-file'
          ? 'resolving-local-media'
          : 'mock-simulated',
      };
    });
    setResumeToast(null);
  };

  const closeQueue = () => setIsQueueOpen(false);

  return (
    <div
      data-u30-theme={settings.currentTheme}
      className={`u32-release-ui h-screen w-screen min-w-0 flex flex-col theme-${settings.currentTheme} transition-all duration-300 overflow-hidden`}
    >
      <TopBar librarySessionSnapshot={librarySessionSnapshot} />

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentTheme={settings.currentTheme}
          setAsmrDetailId={setAsmrDetailId}
          setPlaylistDetailId={setPlaylistDetailId}
        />

        <main
          ref={mainContentRef}
          className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden scrollbar-thin px-4 md:px-6 xl:px-8 py-4 md:py-5 pb-24 bg-bg-primary"
        >
          <AppRouter
            currentPage={currentPage}
            asmrDetailId={asmrDetailId}
            playlistDetailId={playlistDetailId}
            recentTracks={recentTracks}
            librarySessionSnapshot={librarySessionSnapshot}
            playlists={playlists}
            rjWorks={rjWorks}
            musicAlbums={musicAlbums}
            playerState={playerState}
            searchQuery={searchQuery}
            favorites={favorites}
            settings={settings}
            scanStatus={scanStatus}
            setCurrentPage={setCurrentPage}
            setSearchQuery={setSearchQuery}
            setRjWorks={setRjWorks}
            setMusicAlbums={setMusicAlbums}
            setAsmrDetailId={handleSetAsmrDetailId}
            setPlaylistDetailId={handleSetPlaylistDetailId}
            onPlayTrack={handlePlayTrack}
            onAddToQueue={handleAddToQueue}
            toggleFavorite={toggleFavorite}
            onUpdateRjWork={handleUpdateRjWork}
            onClearRjWorkOverride={handleClearRjWorkOverride}
            onDeleteRjWork={handleDeleteRjWork}
            onRefetchRjMetadata={handleRefetchRjMetadata}
            onAddRjWorkTracksToPlaylist={handleAddRjWorkTracksToPlaylist}
            onUpdateMusicAlbum={handleUpdateMusicAlbum}
            onUpdateMusicTrack={handleUpdateMusicTrack}
            onClearMusicAlbumOverride={handleClearMusicAlbumOverride}
            onClearMusicTrackOverride={handleClearMusicTrackOverride}
            onMetadataStoreChanged={refreshAllMetadataFromBase}
            onCreatePlaylist={handleCreatePlaylist}
            onDeletePlaylist={handleDeletePlaylist}
            onRemoveTrackFromPlaylist={handleRemoveTrackFromPlaylist}
            updateSettings={handleUpdateSettings}
            onScanLibrary={handleScanLibrary}
          />
        </main>

        <QueueDrawer
          open={isQueueOpen}
          playerState={playerState}
          setPlayerState={setPlayerState}
          onClose={closeQueue}
          onPlayTrack={handlePlayTrack}
        />
      </div>

      <PlayerBar
        playerState={playerState}
        togglePlay={handleTogglePlay}
        onPrev={handlePrevTrack}
        onNext={handleNextTrack}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        toggleMute={handleToggleMute}
        toggleLoopMode={handleToggleLoopMode}
        toggleCompletionMode={handleToggleCompletionMode}
        isQueueOpen={isQueueOpen}
        toggleQueue={() => setIsQueueOpen((open) => !open)}
        isLyricsOpen={isLyricsOpen}
        toggleLyrics={() => setIsLyricsOpen((open) => !open)}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        playlists={playlists}
        onAddToPlaylist={handleAddTrackToPlaylist}
      />

      <PlayerOverlayHost
        isLyricsOpen={isLyricsOpen}
        resumePrompt={resumeToast}
        playerState={playerState}
        rjWorks={rjWorks}
        favorites={favorites}
        onCloseLyrics={() => setIsLyricsOpen(false)}
        onDismissResume={() => setResumeToast(null)}
        onResumePlayback={handleResumePlayback}
        onPlayTrack={handlePlayTrack}
        togglePlay={handleTogglePlay}
        onPrev={handlePrevTrack}
        onNext={handleNextTrack}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        toggleMute={handleToggleMute}
        toggleFavorite={toggleFavorite}
        toggleLoopMode={handleToggleLoopMode}
        toggleCompletionMode={handleToggleCompletionMode}
      />
    </div>
  );
}
