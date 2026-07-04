import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AsmrLibrary from './components/AsmrLibrary';
import AsmrDetail from './components/AsmrDetail';
import MusicLibrary from './components/MusicLibrary';
import PlaylistPage from './components/PlaylistPage';
import DownloaderPage from './components/DownloaderPage';
import SettingsPage from './components/SettingsPage';
import PlayerBar from './components/PlayerBar';
import LyricsPanel from './components/LyricsPanel';
import DiagnosticsPage from './components/DiagnosticsPage';

import { PageType, AudioTrack, PlayerState, LibrarySettings, ThemeType, RJWork, Playlist, MusicAlbum } from './types';
import { mockRjWorks, mockMusicAlbums, mockPlaylists, mockRecentPlays } from './mockData';
import { Headphones, Sparkles, CheckCircle2, ChevronRight, X, Play } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useAudioPlayer } from './hooks/useAudioPlayer';

export default function App() {
  // Navigation States
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Demo prototype states. These localStorage keys are historical mock names; they are not SQLite or real disk sync.
  const [rjWorks, setRjWorks] = useLocalStorage<RJWork[]>('sqlite_rj_works', mockRjWorks);
  const [playlists, setPlaylists] = useLocalStorage<Playlist[]>('sqlite_playlists', mockPlaylists);
  const [musicAlbums, setMusicAlbums] = useLocalStorage<MusicAlbum[]>('sqlite_music_albums', mockMusicAlbums);

  // Drill-down Detail States
  const [asmrDetailId, setAsmrDetailId] = useState<string | null>(null);
  const [playlistDetailId, setPlaylistDetailId] = useState<string | null>(null);

  // Favorites (list of track IDs)
  const [favorites, setFavorites] = useLocalStorage<string[]>('sqlite_favorites', ['track_rj100204_02', 'track_music_01_01']);

  // Settings
  const [settings, setSettings] = useLocalStorage<LibrarySettings>('sqlite_settings', {
    audioLibPath: 'D:/YangKura/Asmr_Library',
    musicLibPath: 'C:/Users/Admin/Music',
    asmrPaths: [
      { id: 'asmr-1', type: 'local', path: 'D:/YangKura/Asmr_Library', label: '本地固态ASMR库' },
      { id: 'asmr-2', type: 'openlist', path: 'https://openlist.myasmr.net/share/yinse', label: '极客ASMR共享网络列表' },
      { id: 'asmr-3', type: 'webdav', path: 'https://dav.jianguoyun.com/dav/asmr', label: '坚果云ASMR网盘' }
    ],
    musicPaths: [
      { id: 'music-1', type: 'local', path: 'C:/Users/Admin/Music', label: 'C盘本地高品质音乐' },
      { id: 'music-2', type: 'webdav', path: 'https://dav.jianguoyun.com/dav/pop_music', label: '坚果云流行音乐备份' }
    ],
    tempDownloadPath: 'D:/YangKura/Temp_Cache',
    currentTheme: 'acrylic-mist',
    enableOverlay: true,
    privacyMode: true,
  });

  // Second-level Playback Resume Toast State
  const [resumeToast, setResumeToast] = useState<{
    show: boolean;
    track: AudioTrack;
    progress: number;
  } | null>(null);

  // On initial mount: Check if there's any second-level resume point stored
  useEffect(() => {
    const lastTrackId = localStorage.getItem('last_played_track_id');
    const lastProgressStr = localStorage.getItem('last_played_progress');
    const lastTrackJson = localStorage.getItem('last_played_track_json');
    
    if (lastTrackId && lastProgressStr && lastTrackJson) {
      try {
        const track = JSON.parse(lastTrackJson) as AudioTrack;
        const progress = parseInt(lastProgressStr, 10);
        if (track && progress > 5) { // Only resume if progress is more than 5s to avoid cluttering
          setResumeToast({
            show: true,
            track,
            progress
          });
        }
      } catch (e) {
        console.error('Failed to restore last played track', e);
      }
    }
  }, []);

  // Diagnostic Scan Logs Simulation State
  const [scanStatus, setScanStatus] = useState<string>(
    'Demo 模式：当前使用 mockData + localStorage。尚未接入真实扫描、Electron、SQLite 或本地音频播放。'
  );

  // Core Audio Player using custom hook
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
  } = useAudioPlayer();

  // Player sidebar drawer (Right side)
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);

  // Handler: Scan local physical library mock animation
  const handleScanLibrary = () => {
    setScanStatus('Demo 扫描演示：不会读取真实磁盘，只模拟未来 Local JSON Index 的状态提示。');
    setTimeout(() => {
      setScanStatus(
        `Demo 扫描演示完成。[${new Date().toLocaleTimeString()}] 当前没有读取真实目录，也没有写入 library-index.json。`
      );
    }, 2000);
  };

  // Toggle user liked state
  const toggleFavorite = (trackId: string) => {
    setFavorites(prev => {
      if (prev.includes(trackId)) {
        return prev.filter(id => id !== trackId);
      } else {
        return [...prev, trackId];
      }
    });
  };

  const handleAddTrackToPlaylist = (track: AudioTrack, playlistId: string) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        if (p.tracks.some(t => t.id === track.id)) {
          return p;
        }
        return {
          ...p,
          tracks: [...p.tracks, track],
          tracksCount: p.tracks.length + 1
        };
      }
      return p;
    }));
  };

  // Handler: Update metadata / manually added tags
  const handleUpdateRjWork = (updated: RJWork) => {
    setRjWorks(prev => prev.map(item => item.id === updated.id ? updated : item));
  };

  // Handler: Delete an album
  const handleDeleteRjWork = (id: string) => {
    setRjWorks(prev => prev.filter(item => item.id !== id));
    if (asmrDetailId === id) {
      setAsmrDetailId(null);
    }
  };

  // Handler: Add album tracks to a playlist
  const handleAddRjWorkTracksToPlaylist = (rjId: string, playlistId: string) => {
    const work = rjWorks.find(item => item.id === rjId);
    if (!work) return;
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        // filter out tracks already in playlist to avoid duplicates
        const existingTrackIds = new Set(p.tracks.map(t => t.id));
        const newTracks = work.tracks.filter(t => !existingTrackIds.has(t.id));
        return {
          ...p,
          tracks: [...p.tracks, ...newTracks],
          tracksCount: p.tracks.length + newTracks.length
        };
      }
      return p;
    }));
  };

  // Handler: Refetch metadata with mock dlsite/asmr.one proxy
  const handleRefetchRjMetadata = (rjId: string) => {
    setRjWorks(prev => prev.map(item => {
      if (item.id === rjId) {
        const sampleCovers = [
          'https://images.unsplash.com/photo-1508962914676-134849a727f0?q=80&w=350&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=350&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=350&auto=format&fit=crop'
        ];
        const randomCover = sampleCovers[Math.floor(Math.random() * sampleCovers.length)];
        
        const tracksToSet = item.tracks.length > 0 ? item.tracks : [
          {
            id: `track_${item.id.toLowerCase()}_01`,
            title: `01_【自动恢复】双耳梵天耳かき和極上睡眠導入.flac`,
            artist: item.cvs[0] || '默认声优',
            album: item.title,
            rjId: item.id,
            duration: 900,
            coverUrl: item.coverUrl || randomCover,
            type: 'asmr' as const,
            fileTreePath: `${item.cvs[0] || 'Unknown'}/01_边缘采耳.flac`
          },
          {
            id: `track_${item.id.toLowerCase()}_02`,
            title: `02_【自动恢复】碳酸耳穴泡泡清理与按摩.flac`,
            artist: item.cvs[0] || '默认声优',
            album: item.title,
            rjId: item.id,
            duration: 1200,
            coverUrl: item.coverUrl || randomCover,
            type: 'asmr' as const,
            fileTreePath: `${item.cvs[0] || 'Unknown'}/02_碳酸泡泡.flac`
          }
        ];

        return {
          ...item,
          status: 'identified' as const,
          coverUrl: item.coverUrl || randomCover,
          tracks: tracksToSet,
          fileCount: tracksToSet.length,
          totalDuration: tracksToSet.reduce((sum, t) => sum + t.duration, 0),
          description: item.description + ' (已补充 DLsite 代理元数据及无损音轨配置。)'
        };
      }
      return item;
    }));
  };

  // Helper for updating settings
  const handleUpdateSettings = (updates: Partial<LibrarySettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  // Set active RJ Detail
  const handleSetAsmrDetailId = (id: string | null) => {
    setAsmrDetailId(id);
    if (id) {
      setCurrentPage('asmr-lib');
      setPlaylistDetailId(null);
    }
  };

  // Set active Playlist Detail
  const handleSetPlaylistDetailId = (id: string | null) => {
    setPlaylistDetailId(id);
    if (id) {
      setCurrentPage('playlists');
      setAsmrDetailId(null);
    }
  };

  // Find detailed models for drill-downs
  const selectedAsmrWork = rjWorks.find(rj => rj.id === asmrDetailId);
  const selectedPlaylistObj = playlists.find(p => p.id === playlistDetailId);

  return (
    <div className={`h-screen w-screen flex flex-col theme-${settings.currentTheme} transition-all duration-300 overflow-hidden`}>
      
      {/* Top Windows Native-Style Custom Header Bar */}
      <header id="windows-app-bar" className="h-9 flex items-center justify-between px-4 bg-sidebar-bg/60 border-b border-border-color/60 text-xs text-text-secondary select-none z-50">
        <div className="flex items-center space-x-2 font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
          <span className="font-semibold text-[11px]">YANG-KURA NEXT // Windows Desktop Audio Library</span>
        </div>
        <div className="flex items-center space-x-2 font-sans">
          <span className="text-[10px] text-text-muted bg-border-color/40 px-2 py-0.5 rounded font-mono">
            Demo Session / No SQLite
          </span>
          <span className="text-emerald-500 flex items-center space-x-1 font-semibold text-[10px]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>本地只读沙盒</span>
          </span>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Sidebar Menu */}
        <Sidebar 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentTheme={settings.currentTheme}
          setAsmrDetailId={setAsmrDetailId}
          setPlaylistDetailId={setPlaylistDetailId}
        />

        {/* Central Scrollable Content Area */}
        <main className="flex-1 h-full overflow-y-auto scrollbar-thin px-6 md:px-10 py-6 bg-bg-primary">
          
          {/* Page Router with Drilldowns */}
          {currentPage === 'dashboard' && !asmrDetailId && !playlistDetailId && (
            <Dashboard 
              recentTracks={mockRecentPlays}
              playlists={playlists}
              rjWorks={rjWorks}
              musicAlbums={musicAlbums}
              onPlayTrack={handlePlayTrack}
              setAsmrDetailId={handleSetAsmrDetailId}
              setPlaylistDetailId={handleSetPlaylistDetailId}
              setCurrentPage={setCurrentPage}
              searchQuery={searchQuery}
            />
          )}

          {currentPage === 'asmr-lib' && !asmrDetailId && (
            <AsmrLibrary 
              rjWorks={rjWorks}
              setAsmrDetailId={handleSetAsmrDetailId}
              searchQuery={searchQuery}
              onUpdateRjWork={handleUpdateRjWork}
              onDeleteRjWork={handleDeleteRjWork}
              onRefetchRjMetadata={handleRefetchRjMetadata}
              onAddRjWorkTracksToPlaylist={handleAddRjWorkTracksToPlaylist}
              playlists={playlists}
            />
          )}

          {currentPage === 'asmr-lib' && asmrDetailId && selectedAsmrWork && (
            <AsmrDetail 
              rjWork={selectedAsmrWork}
              onBack={() => setAsmrDetailId(null)}
              onPlayTrack={handlePlayTrack}
              onAddToQueue={handleAddToQueue}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              onUpdateRjWork={handleUpdateRjWork}
              onExplore={(query) => {
                setSearchQuery(query);
                setAsmrDetailId(null);
                setCurrentPage('asmr-lib');
              }}
            />
          )}

          {currentPage === 'music-lib' && (
            <MusicLibrary 
              albums={musicAlbums}
              onPlayTrack={handlePlayTrack}
              onAddToQueue={handleAddToQueue}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              searchQuery={searchQuery}
            />
          )}

          {currentPage === 'playlists' && (
            <PlaylistPage 
              playlists={playlists}
              activePlaylistId={playlistDetailId}
              setPlaylistDetailId={handleSetPlaylistDetailId}
              onPlayTrack={handlePlayTrack}
              onAddToQueue={handleAddToQueue}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              searchQuery={searchQuery}
            />
          )}

          {currentPage === 'downloader' && (
            <DownloaderPage onPlayTrack={handlePlayTrack} />
          )}

          {currentPage === 'settings' && (
            <SettingsPage 
              settings={settings}
              updateSettings={handleUpdateSettings}
            />
          )}

          {currentPage === 'diagnostics' && (
            <DiagnosticsPage 
              onScanLibrary={handleScanLibrary}
              scanStatus={scanStatus}
              rjWorks={rjWorks}
              setRjWorks={setRjWorks}
              musicAlbums={musicAlbums}
              setMusicAlbums={setMusicAlbums}
              setAsmrDetailId={handleSetAsmrDetailId}
              onRefetchRjMetadata={handleRefetchRjMetadata}
            />
          )}

        </main>

        {/* Dynamic sliding side drawer for playing Queue */}
        {isQueueOpen && (
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-sidebar-bg/95 backdrop-blur-xl border-l border-border-color z-40 p-4 shadow-2xl flex flex-col justify-between animate-fade-in">
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between border-b border-border-color pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-text-primary">当前播放队列</span>
                  <span className="text-[10px] bg-border-color/60 text-text-secondary px-2 py-0.5 rounded-full font-mono">
                    {playerState.queue.length}
                  </span>
                </div>
                <button 
                  onClick={() => setIsQueueOpen(false)}
                  className="p-1 rounded hover:bg-hover-bg text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 pr-1">
                {playerState.queue.length === 0 ? (
                  <p className="text-xs text-text-muted italic text-center py-12">队列为空，快双击音声添加</p>
                ) : (
                  playerState.queue.map((track, idx) => {
                    const isPlayingThis = playerState.currentTrack?.id === track.id;
                    return (
                      <div
                        key={track.id + '_q_' + idx}
                        onClick={() => handlePlayTrack(track)}
                        className={`flex items-center space-x-2.5 p-2 rounded-lg cursor-pointer transition-all border ${isPlayingThis ? 'bg-brand-color/15 border-brand-color text-brand-color' : 'hover:bg-hover-bg border-transparent text-text-primary'}`}
                      >
                        <img src={track.coverUrl} alt="" className="w-8 h-8 rounded object-cover shadow-sm flex-shrink-0" referrerPolicy="no-referrer" />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[11px] font-bold truncate">{track.title}</h4>
                          <p className="text-[9px] text-text-secondary truncate mt-0.5">{track.artist}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-border-color text-center">
              <button 
                onClick={() => setPlayerState(prev => ({ ...prev, queue: [], currentTrack: null, isPlaying: false, currentIndex: -1, progress: 0 }))}
                className="text-[10px] text-rose-400 hover:text-rose-500 font-bold tracking-wider hover:underline w-full cursor-pointer"
              >
                清空当前播放队列
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Static Persistent Player Control Bar */}
      <PlayerBar 
        playerState={playerState}
        togglePlay={handleTogglePlay}
        onPrev={handlePrevTrack}
        onNext={handleNextTrack}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        toggleMute={handleToggleMute}
        toggleLoopMode={handleToggleLoopMode}
        isQueueOpen={isQueueOpen}
        toggleQueue={() => setIsQueueOpen(!isQueueOpen)}
        isLyricsOpen={isLyricsOpen}
        toggleLyrics={() => setIsLyricsOpen(!isLyricsOpen)}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        playlists={playlists}
        onAddToPlaylist={handleAddTrackToPlaylist}
      />

      {/* Full Screen Ambient Lyrics scrolling detail overlays */}
      {isLyricsOpen && (
        <LyricsPanel 
          playerState={playerState}
          onClose={() => setIsLyricsOpen(false)}
          onPlayTrack={(track) => handlePlayTrack(track)}
          rjWorks={mockRjWorks}
          togglePlay={handleTogglePlay}
          onPrev={handlePrevTrack}
          onNext={handleNextTrack}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          toggleMute={handleToggleMute}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          toggleLoopMode={handleToggleLoopMode}
        />
      )}

      {/* Floating Second-level Playback Resume Toast */}
      {resumeToast && resumeToast.show && (
        <div className="fixed bottom-24 left-6 z-50 max-w-sm p-4 rounded-xl bg-card-bg/95 backdrop-blur-xl border border-brand-color/50 shadow-2xl flex flex-col space-y-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-brand-color/10 text-brand-color flex-shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-text-primary">秒级断点续播</h4>
              <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                检测到上次播放到《{resumeToast.track.title}》第 <span className="font-mono text-brand-color font-bold">{Math.floor(resumeToast.progress / 60)}:{resumeToast.progress % 60 < 10 ? '0' : ''}{resumeToast.progress % 60}</span> 秒。是否继续播放？
              </p>
            </div>
            <button 
              onClick={() => setResumeToast(null)}
              className="text-text-muted hover:text-text-primary transition-colors cursor-pointer flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-end space-x-2 text-[10px]">
            <button
              onClick={() => setResumeToast(null)}
              className="px-2.5 py-1.5 rounded bg-zinc-850 text-text-secondary hover:text-text-primary transition-colors font-semibold cursor-pointer"
            >
              忽略
            </button>
            <button
              onClick={() => {
                // Resume play!
                setPlayerState(prev => ({
                  ...prev,
                  currentTrack: resumeToast.track,
                  progress: resumeToast.progress,
                  isPlaying: true,
                  queue: prev.queue.some(t => t.id === resumeToast.track.id) ? prev.queue : [resumeToast.track, ...prev.queue],
                  currentIndex: prev.queue.some(t => t.id === resumeToast.track.id) ? prev.queue.findIndex(t => t.id === resumeToast.track.id) : 0
                }));
                setResumeToast(null);
              }}
              className="px-3 py-1.5 rounded bg-brand-color hover:bg-brand-color-hover text-white flex items-center space-x-1.5 font-bold transition-all hover:scale-103 cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current text-white" />
              <span>恢复续播</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
