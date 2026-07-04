import React from 'react';
import { 
  ListMusic, 
  Play, 
  Plus, 
  Heart, 
  Trash, 
  ArrowLeft, 
  Clock, 
  Headphones, 
  Music,
  Bookmark,
  Share2,
  CheckCircle,
  HelpCircle,
  ListPlus
} from 'lucide-react';
import { Playlist, AudioTrack } from '../types';

interface PlaylistPageProps {
  playlists: Playlist[];
  activePlaylistId: string | null;
  setPlaylistDetailId: (id: string | null) => void;
  onPlayTrack: (track: AudioTrack, customQueue?: AudioTrack[]) => void;
  onAddToQueue: (track: AudioTrack) => void;
  favorites: string[];
  toggleFavorite: (trackId: string) => void;
  searchQuery: string;
}

export default function PlaylistPage({
  playlists,
  activePlaylistId,
  setPlaylistDetailId,
  onPlayTrack,
  onAddToQueue,
  favorites,
  toggleFavorite,
  searchQuery
}: PlaylistPageProps) {

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const activePlaylist = playlists.find(p => p.id === activePlaylistId);

  // Play entire playlist
  const handlePlayPlaylist = (playlist: Playlist) => {
    if (playlist.tracks && playlist.tracks.length > 0) {
      onPlayTrack(playlist.tracks[0], playlist.tracks);
    }
  };

  // Add all playlist tracks to player queue
  const handleQueuePlaylist = (playlist: Playlist) => {
    playlist.tracks.forEach(track => {
      onAddToQueue(track);
    });
  };

  // Filter playlists by search query (if any)
  const filteredPlaylists = playlists.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (activePlaylist) {
    return (
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Back navigation */}
        <button 
          id="playlist-back"
          onClick={() => setPlaylistDetailId(null)}
          className="flex items-center space-x-2 text-xs font-semibold text-text-secondary hover:text-text-primary bg-card-bg/40 border border-border-color px-3.5 py-2 rounded-xl hover:bg-card-bg transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回歌单列表</span>
        </button>

        {/* Playlist Hero Detail Header */}
        <div className="relative overflow-hidden rounded-2xl bg-card-bg/50 border border-border-color/80 p-6 flex flex-col md:flex-row gap-6 items-start">
          
          {activePlaylist.coverUrl && (
            <div 
              className="absolute inset-0 bg-cover bg-center scale-110 blur-3xl opacity-15 pointer-events-none"
              style={{ backgroundImage: `url(${activePlaylist.coverUrl})` }}
            />
          )}

          <img 
            src={activePlaylist.coverUrl} 
            alt={activePlaylist.name} 
            className="w-40 h-40 md:w-44 md:h-44 rounded-xl object-cover shadow-xl border border-white/5 relative z-10" 
            referrerPolicy="no-referrer"
          />

          <div className="flex-1 space-y-4 relative z-10 min-w-0">
            <div className="space-y-1.5">
              <span className="text-[10px] bg-pink-500/10 border border-pink-500/20 text-pink-400 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {activePlaylist.isSystem ? '系统默认歌单' : '本地自建歌单'}
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-text-primary truncate">
                {activePlaylist.name}
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">
                {activePlaylist.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-muted">
              <span>创建者: <span className="text-text-primary font-medium">{activePlaylist.creator}</span></span>
              <span>•</span>
              <span>收录音频: <span className="text-text-primary font-bold font-mono">{activePlaylist.tracksCount} 个</span></span>
              <span>•</span>
              <span>类型: <span className="text-text-primary">ASMR / 音乐混合库</span></span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button 
                id="play-all-playlist"
                onClick={() => handlePlayPlaylist(activePlaylist)}
                disabled={activePlaylist.tracks.length === 0}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-color hover:bg-brand-color-hover text-white text-xs font-semibold shadow-lg shadow-brand-color/20 hover:scale-103 active:scale-97 transition-all cursor-pointer disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>立即顺序播放</span>
              </button>
              <button 
                id="queue-all-playlist"
                onClick={() => handleQueuePlaylist(activePlaylist)}
                disabled={activePlaylist.tracks.length === 0}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-card-bg hover:bg-hover-bg border border-border-color text-text-primary text-xs font-semibold hover:scale-103 active:scale-97 transition-all cursor-pointer disabled:opacity-50"
              >
                <ListPlus className="w-4 h-4" />
                <span>加入播放队列</span>
              </button>
            </div>

          </div>

        </div>

        {/* Tracks List Table (Mixed ASMR and Normal tracks) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-text-muted px-2">
            <span>收录音轨明细 ({activePlaylist.tracks.length})</span>
            <span className="flex items-center space-x-1 font-sans text-brand-color bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>支持ASMR双耳作品与普通音乐混合播放</span>
            </span>
          </div>

          {activePlaylist.tracks.length === 0 ? (
            <div className="py-16 text-center bg-card-bg/20 rounded-2xl border border-dashed border-border-color">
              <ListMusic className="w-10 h-10 text-text-muted mx-auto mb-2 stroke-1" />
              <p className="text-xs text-text-muted">歌单内暂无音频，快去收藏或添加一些吧！</p>
            </div>
          ) : (
            <div className="bg-card-bg/40 border border-border-color/60 rounded-xl overflow-hidden divide-y divide-border-color/40">
              {activePlaylist.tracks.map((track, idx) => {
                const isFav = favorites.includes(track.id);
                return (
                  <div 
                    key={track.id}
                    className="group flex items-center justify-between p-3.5 hover:bg-hover-bg transition-colors"
                  >
                    {/* Cover & Title */}
                    <div 
                      onClick={() => onPlayTrack(track, activePlaylist.tracks)}
                      className="flex items-center space-x-3.5 flex-1 min-w-0 cursor-pointer"
                    >
                      <span className="text-xs text-text-muted font-mono w-6 text-center group-hover:text-brand-color">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <img src={track.coverUrl} alt="" className="w-10 h-10 rounded object-cover shadow-sm flex-shrink-0" referrerPolicy="no-referrer" />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-bold text-text-primary group-hover:text-brand-color truncate">
                            {track.title}
                          </h4>
                          {/* Type badge (ASMR or Music) */}
                          {track.type === 'asmr' ? (
                            <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded flex items-center space-x-0.5 flex-shrink-0">
                              <Headphones className="w-2.5 h-2.5" />
                              <span>ASMR</span>
                            </span>
                          ) : (
                            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded flex items-center space-x-0.5 flex-shrink-0">
                              <Music className="w-2.5 h-2.5" />
                              <span>MUSIC</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-text-secondary mt-1 truncate">
                          {track.artist} · <span className="text-text-muted">{track.album}</span>
                        </p>
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex items-center space-x-4 ml-4">
                      <span className="text-[10px] text-text-muted font-mono bg-border-color/30 px-2 py-0.5 rounded">
                        {track.fileSize || '24.1 MB'}
                      </span>
                      <span className="text-xs text-text-muted font-mono">{formatDuration(track.duration)}</span>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => toggleFavorite(track.id)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="收藏"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>
                        <button
                          onClick={() => onAddToQueue(track)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-brand-color hover:bg-indigo-500/10 transition-colors"
                          title="加入播放队列"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onPlayTrack(track, activePlaylist.tracks)}
                          className="p-1.5 rounded-lg bg-brand-color text-white opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* List View Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center space-x-2">
          <ListMusic className="w-5.5 h-5.5 text-brand-color" />
          <span>本地播放歌单</span>
        </h2>
        <p className="text-xs text-text-muted mt-1">
          将双耳拟音作品和舒缓背景音乐分门别类，制作独属于您的睡前白噪音序列。
        </p>
      </div>

      {/* Playlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlaylists.map(playlist => (
          <div
            key={playlist.id}
            onClick={() => setPlaylistDetailId(playlist.id)}
            className="group bg-card-bg/40 hover:bg-card-bg border border-border-color/60 hover:border-brand-color/50 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg flex flex-col"
          >
            {/* Cover Area */}
            <div className="relative aspect-[16/9] w-full bg-zinc-800 overflow-hidden">
              <img 
                src={playlist.coverUrl} 
                alt={playlist.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                <span className="text-[9px] bg-pink-500/80 backdrop-blur-md text-white font-mono px-2 py-0.5 rounded-md w-fit mb-1 font-bold">
                  {playlist.isSystem ? 'DEFAULT' : 'PLAYLIST'}
                </span>
                <h3 className="text-sm font-bold text-white group-hover:text-brand-color transition-colors truncate">
                  {playlist.name}
                </h3>
              </div>
            </div>

            {/* Description & Specs */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                {playlist.description}
              </p>

              <div className="pt-3 border-t border-border-color/30 flex items-center justify-between text-[10px] text-text-muted font-mono">
                <span>作者: {playlist.creator}</span>
                <span className="bg-border-color/50 px-2 py-0.5 rounded font-bold text-text-secondary">
                  {playlist.tracksCount} 首音频
                </span>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
