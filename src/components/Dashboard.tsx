import React from 'react';
import { Play, Headphones, Disc, Clock, Calendar, ChevronRight, User, ListMusic } from 'lucide-react';
import { AudioTrack, RJWork, MusicAlbum, Playlist, PageType } from '../types';

interface DashboardProps {
  recentTracks: AudioTrack[];
  playlists: Playlist[];
  rjWorks: RJWork[];
  musicAlbums: MusicAlbum[];
  onPlayTrack: (track: AudioTrack, customQueue?: AudioTrack[]) => void;
  setAsmrDetailId: (id: string | null) => void;
  setPlaylistDetailId: (id: string | null) => void;
  setCurrentPage: (page: PageType) => void;
  searchQuery: string;
}

export default function Dashboard({
  recentTracks,
  playlists,
  rjWorks,
  musicAlbums,
  onPlayTrack,
  setAsmrDetailId,
  setPlaylistDetailId,
  setCurrentPage,
  searchQuery
}: DashboardProps) {

  // Helper: Format duration (seconds -> mm:ss)
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // If there's a search query, we show a filtered search results list instead of the default Dashboard
  const isSearching = searchQuery.trim().length > 0;
  
  const filteredRjs = rjWorks.filter(rj => 
    rj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rj.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rj.circle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rj.cvs.some(cv => cv.toLowerCase().includes(searchQuery.toLowerCase())) ||
    rj.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredMusic = musicAlbums.flatMap(album => album.tracks).filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.album.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Take the very first track in recent tracks as "Continue Playing" target
  const continueTrack = recentTracks[0] || rjWorks[0].tracks[0];

  if (isSearching) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-xl font-bold mb-2">搜索结果</h2>
          <p className="text-xs text-text-muted">找到匹配 &quot;{searchQuery}&quot; 的本地媒体项目</p>
        </div>

        {/* RJ Works Results */}
        <div>
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center space-x-2">
            <Headphones className="w-4 h-4 text-indigo-400" />
            <span>音声作品 ({filteredRjs.length})</span>
          </h3>
          {filteredRjs.length === 0 ? (
            <p className="text-xs text-text-muted italic bg-card-bg/20 p-4 rounded-xl border border-dashed border-border-color">无匹配的ASMR/RJ作品</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredRjs.map(rj => (
                <div 
                  key={rj.id}
                  onClick={() => setAsmrDetailId(rj.id)}
                  className="group bg-card-bg/60 hover:bg-card-bg border border-border-color/60 hover:border-brand-color/50 rounded-xl p-3 flex flex-col cursor-pointer transition-all duration-300 hover:shadow-xl"
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-zinc-800 mb-3">
                    {rj.coverUrl ? (
                      <img 
                        src={rj.coverUrl} 
                        alt={rj.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 text-zinc-500 text-xs">
                        <Headphones className="w-10 h-10 mb-2 stroke-1" />
                        <span>暂无封面</span>
                      </div>
                    )}
                    <span className="absolute top-2 left-2 bg-black/75 backdrop-blur-md text-[10px] text-zinc-300 font-mono px-2 py-0.5 rounded font-medium">
                      {rj.id}
                    </span>
                  </div>
                  <div className="flex-1 min-h-[4rem]">
                    <h4 className="text-xs font-semibold text-text-primary line-clamp-2 leading-tight group-hover:text-brand-color transition-colors">
                      {rj.title}
                    </h4>
                    <p className="text-[11px] text-text-muted mt-1.5 truncate">{rj.circle}</p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-border-color/40 flex items-center justify-between text-[10px] text-text-muted">
                    <span>{rj.fileCount} 个文件</span>
                    <span>{formatDuration(rj.totalDuration)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Music Track Results */}
        <div>
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center space-x-2">
            <Disc className="w-4 h-4 text-pink-400" />
            <span>普通音乐单曲 ({filteredMusic.length})</span>
          </h3>
          {filteredMusic.length === 0 ? (
            <p className="text-xs text-text-muted italic bg-card-bg/20 p-4 rounded-xl border border-dashed border-border-color">无匹配的单曲</p>
          ) : (
            <div className="bg-card-bg/50 border border-border-color/60 rounded-xl overflow-hidden divide-y divide-border-color/40">
              {filteredMusic.map((track, idx) => (
                <div 
                  key={track.id}
                  onClick={() => onPlayTrack(track, filteredMusic)}
                  className="flex items-center justify-between p-3 hover:bg-hover-bg group cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <span className="text-xs text-text-muted font-mono w-6 text-center">{String(idx + 1).padStart(2, '0')}</span>
                    <img src={track.coverUrl} alt="" className="w-9 h-9 rounded object-cover" referrerPolicy="no-referrer" />
                    <div className="truncate">
                      <p className="text-xs font-medium text-text-primary group-hover:text-brand-color transition-colors truncate">{track.title}</p>
                      <p className="text-[11px] text-text-muted truncate mt-0.5">{track.artist} · {track.album}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 ml-4">
                    <span className="text-[10px] text-text-muted font-mono bg-border-color/30 px-2 py-0.5 rounded">
                      {track.fileSize || 'N/A'}
                    </span>
                    <span className="text-xs text-text-muted font-mono">{formatDuration(track.duration)}</span>
                    <button className="p-1.5 rounded-full bg-brand-color text-white opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-200">
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome & Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-card-bg border border-border-color p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between shadow-xl">
        <div className="z-10 max-w-xl space-y-3">
          <span className="bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full font-bold">
            Yang-Kura Next Prototype
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-primary">
            舒适，安全，极速的本地音声净土
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            专为声音爱好者量身定制的本地媒体管理方案。极致的 Windows 视觉美学，完美的 ASMR 音频树节点解析，一切数据和隐私均留存在您本地电脑中。
          </p>
          <div className="pt-2 flex items-center space-x-3">
            <button 
              id="dashboard-play-recommend"
              onClick={() => continueTrack && onPlayTrack(continueTrack)}
              className="flex items-center space-x-2 px-4.5 py-2 rounded-xl bg-brand-color hover:bg-brand-color-hover text-white text-xs font-semibold shadow-lg shadow-brand-color/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>继续播放最近音声</span>
            </button>
            <button 
              id="dashboard-goto-asmr"
              onClick={() => setCurrentPage('asmr-lib')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/5 text-text-primary hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              浏览全部作品
            </button>
          </div>
        </div>
        
        {/* Featured continuing playing card representation */}
        {continueTrack && (
          <div className="mt-6 md:mt-0 z-10 flex-shrink-0 flex items-center space-x-4 bg-black/30 backdrop-blur-md border border-white/5 p-3.5 rounded-xl max-w-sm">
            <img 
              src={continueTrack.coverUrl} 
              alt={continueTrack.album} 
              className="w-16 h-16 rounded-lg object-cover shadow-lg"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[9px] text-indigo-400 font-mono font-bold tracking-wider uppercase">继续播放</span>
              <h3 className="text-xs font-bold text-text-primary truncate mt-0.5">{continueTrack.title}</h3>
              <p className="text-[11px] text-text-muted truncate mt-1">{continueTrack.artist}</p>
            </div>
            <button 
              id="hero-play-btn"
              onClick={() => onPlayTrack(continueTrack)}
              className="w-8 h-8 rounded-full bg-white text-zinc-900 flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-md cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current translate-x-0.5 text-indigo-600" />
            </button>
          </div>
        )}

        {/* Decorative backdrop blobs */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-0"></div>
        <div className="absolute right-40 -bottom-16 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl -z-0"></div>
      </div>

      {/* Recent Plays Track List (最近播放 - Row Scroll) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-text-primary flex items-center space-x-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <span>最近播放音频</span>
          </h3>
          <span className="text-xs text-text-muted font-mono uppercase bg-card-bg border border-border-color px-2.5 py-0.5 rounded-full font-medium">DEMO HISTORY</span>
        </div>
        {recentTracks.length === 0 ? (
          <p className="text-xs text-text-muted italic py-6">暂无播放记录</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {recentTracks.slice(0, 5).map((track) => (
              <div 
                key={track.id}
                onClick={() => onPlayTrack(track, recentTracks)}
                className="group relative bg-card-bg/40 hover:bg-card-bg border border-border-color/60 hover:border-brand-color/40 rounded-xl p-3 flex items-center space-x-3 cursor-pointer transition-all duration-200"
              >
                <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-800">
                  <img src={track.coverUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="w-4 h-4 text-white fill-current" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-text-primary truncate group-hover:text-brand-color transition-colors">
                    {track.title}
                  </h4>
                  <p className="text-[10px] text-text-muted truncate mt-0.5">
                    {track.artist}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Split Grid: Curated Playlists & Recently added ASMR */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Side: Playlist Panel */}
        <div className="xl:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-text-primary flex items-center space-x-2">
              <ListMusic className="w-5 h-5 text-pink-400" />
              <span>常听歌单</span>
            </h3>
            <button 
              onClick={() => setCurrentPage('playlists')}
              className="text-xs text-brand-color hover:underline flex items-center space-x-0.5"
            >
              <span>查看全部</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {playlists.map(playlist => (
              <div 
                key={playlist.id}
                onClick={() => setPlaylistDetailId(playlist.id)}
                className="group flex items-center space-x-3.5 p-3 rounded-xl bg-card-bg/50 hover:bg-card-bg border border-border-color/60 hover:border-brand-color/30 transition-all cursor-pointer"
              >
                <img 
                  src={playlist.coverUrl} 
                  alt={playlist.name} 
                  className="w-12 h-12 rounded-lg object-cover shadow-sm group-hover:scale-102 transition-transform" 
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-text-primary group-hover:text-brand-color transition-colors truncate">
                    {playlist.name}
                  </h4>
                  <p className="text-[10px] text-text-muted truncate mt-1">
                    {playlist.description}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono bg-border-color/40 text-text-secondary px-2 py-0.5 rounded">
                    {playlist.tracksCount} 首
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Newly Added RJ Works / Music Albums */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Recently Added RJ Works */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-text-primary flex items-center space-x-2">
                <Headphones className="w-5 h-5 text-purple-400" />
                <span>最近加入的 RJ 音声作品</span>
              </h3>
              <button 
                onClick={() => setCurrentPage('asmr-lib')}
                className="text-xs text-brand-color hover:underline flex items-center space-x-0.5"
              >
                <span>进入音声库</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {rjWorks.slice(0, 3).map(rj => (
                <div 
                  key={rj.id}
                  onClick={() => setAsmrDetailId(rj.id)}
                  className="group bg-card-bg/40 hover:bg-card-bg border border-border-color/60 hover:border-indigo-500/30 rounded-xl p-3 flex flex-col cursor-pointer transition-all duration-200"
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-zinc-800 mb-2.5">
                    {rj.coverUrl ? (
                      <img 
                        src={rj.coverUrl} 
                        alt={rj.title} 
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 text-zinc-500 text-xs">
                        <Headphones className="w-8 h-8 mb-1.5 stroke-1" />
                        <span>无封面</span>
                      </div>
                    )}
                    <div className="absolute bottom-1.5 left-1.5 bg-black/75 backdrop-blur-md text-[9px] font-mono text-zinc-200 px-1.5 py-0.5 rounded font-bold">
                      {rj.id}
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-text-primary line-clamp-1 group-hover:text-brand-color transition-colors">
                    {rj.title}
                  </h4>
                  <span className="text-[10px] text-text-muted mt-1 truncate">{rj.circle}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recently Added Music Albums */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-text-primary flex items-center space-x-2">
                <Disc className="w-5 h-5 text-emerald-400" />
                <span>最近加入的普通音乐专辑</span>
              </h3>
              <button 
                onClick={() => setCurrentPage('music-lib')}
                className="text-xs text-brand-color hover:underline flex items-center space-x-0.5"
              >
                <span>进入音乐库</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {musicAlbums.slice(0, 3).map(album => (
                <div 
                  key={album.id}
                  onClick={() => {
                    // Navigate to music library and select album view
                    setCurrentPage('music-lib');
                  }}
                  className="group bg-card-bg/40 hover:bg-card-bg border border-border-color/60 hover:border-emerald-500/30 rounded-xl p-3 flex flex-col cursor-pointer transition-all duration-200"
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-zinc-800 mb-2.5">
                    <img 
                      src={album.coverUrl} 
                      alt={album.title} 
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-1.5 right-1.5 bg-emerald-500/80 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {album.genre.split('/')[0].trim()}
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-text-primary line-clamp-1 group-hover:text-brand-color transition-colors">
                    {album.title}
                  </h4>
                  <span className="text-[10px] text-text-muted mt-1 truncate">{album.artist}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
