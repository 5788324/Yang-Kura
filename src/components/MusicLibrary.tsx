import React, { useState, useMemo } from 'react';
import { 
  Music, 
  Disc, 
  User, 
  Folder, 
  Play, 
  Plus, 
  Heart,
  Search,
  LayoutGrid,
  List,
  FolderOpen,
  ArrowUpDown
} from 'lucide-react';
import { MusicAlbum, AudioTrack } from '../types';

interface MusicLibraryProps {
  albums: MusicAlbum[];
  onPlayTrack: (track: AudioTrack, customQueue?: AudioTrack[]) => void;
  onAddToQueue: (track: AudioTrack) => void;
  favorites: string[];
  toggleFavorite: (trackId: string) => void;
  searchQuery: string;
}

type SubViewType = 'tracks' | 'albums' | 'artists' | 'folders';

export default function MusicLibrary({
  albums,
  onPlayTrack,
  onAddToQueue,
  favorites,
  toggleFavorite,
  searchQuery
}: MusicLibraryProps) {
  const [activeSubView, setActiveSubView] = useState<SubViewType>('tracks');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'added-desc' | 'title-asc' | 'duration-desc' | 'album-asc'>('added-desc');

  // Flatten all songs from all albums
  const allTracks = useMemo(() => {
    return albums.flatMap(album => album.tracks);
  }, [albums]);

  // Format single track duration (mm:ss)
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get list of unique artists
  const artistsList = useMemo(() => {
    const list = new Set<string>();
    albums.forEach(album => list.add(album.artist));
    return Array.from(list);
  }, [albums]);

  // Folder Mock Names
  const foldersMock = [
    { name: 'C:/Users/Admin/Music/Lo-Fi Code Beats', count: 3 },
    { name: 'D:/Acoustic/Folk Guitar Session', count: 3 },
    { name: 'E:/Audio/Space Drone Sleep', count: 2 }
  ];

  // Filters based on queries, selected items
  const filteredTracks = useMemo(() => {
    let list = [...allTracks];

    // Filter by global search query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      list = list.filter(track => 
        track.title.toLowerCase().includes(q) ||
        track.artist.toLowerCase().includes(q) ||
        track.album.toLowerCase().includes(q)
      );
    }

    // Filter by selected album
    if (selectedAlbumId) {
      list = list.filter(track => {
        const albumObj = albums.find(a => a.id === selectedAlbumId);
        return track.album === albumObj?.title;
      });
    }

    // Filter by selected artist
    if (selectedArtist) {
      list = list.filter(track => track.artist === selectedArtist);
    }

    // Filter by selected folder
    if (selectedFolder) {
      if (selectedFolder.includes('Lo-Fi')) {
        list = list.filter(track => track.album.includes('Lo-Fi'));
      } else if (selectedFolder.includes('Acoustic')) {
        list = list.filter(track => track.album.includes('Acoustic'));
      } else {
        list = list.filter(track => track.album.includes('Space'));
      }
    }

    // Sort tracks
    list.sort((a, b) => {
      if (sortBy === 'added-desc') {
        const dateA = a.addedAt || '';
        const dateB = b.addedAt || '';
        return dateB.localeCompare(dateA);
      } else if (sortBy === 'title-asc') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'duration-desc') {
        return b.duration - a.duration;
      } else if (sortBy === 'album-asc') {
        return a.album.localeCompare(b.album);
      }
      return 0;
    });

    return list;
  }, [allTracks, searchQuery, selectedAlbumId, selectedArtist, selectedFolder, albums, sortBy]);

  // Reset drill-downs
  const resetFilters = () => {
    setSelectedAlbumId(null);
    setSelectedArtist(null);
    setSelectedFolder(null);
  };

  const handleSubViewChange = (view: SubViewType) => {
    setActiveSubView(view);
    resetFilters();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <Music className="w-5.5 h-5.5 text-brand-color" />
            <span>流行音乐媒体库</span>
          </h2>
          <p className="text-xs text-text-muted mt-1">
            浏览本地无损歌曲、古典及治愈系Lo-Fi音乐，无云端广告干扰。
          </p>
        </div>

        {/* View togglers as requested */}
        <div className="flex bg-card-bg/50 border border-border-color p-1 rounded-xl text-xs font-semibold self-start">
          <button
            onClick={() => handleSubViewChange('tracks')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${activeSubView === 'tracks' ? 'bg-brand-active text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
          >
            <List className="w-3.5 h-3.5" />
            <span>歌曲列表</span>
          </button>
          <button
            onClick={() => handleSubViewChange('albums')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${activeSubView === 'albums' ? 'bg-brand-active text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
          >
            <Disc className="w-3.5 h-3.5" />
            <span>专辑视图</span>
          </button>
          <button
            onClick={() => handleSubViewChange('artists')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${activeSubView === 'artists' ? 'bg-brand-active text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
          >
            <User className="w-3.5 h-3.5" />
            <span>艺术家</span>
          </button>
          <button
            onClick={() => handleSubViewChange('folders')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${activeSubView === 'folders' ? 'bg-brand-active text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>文件夹视图</span>
          </button>
        </div>
      </div>

      {/* Breadcrumbs for drill down views */}
      {(selectedAlbumId || selectedArtist || selectedFolder) && (
        <div className="flex items-center space-x-2 text-xs bg-brand-color/10 border border-brand-color/20 text-brand-color px-3.5 py-2 rounded-xl">
          <span>当前过滤器: </span>
          <span className="font-bold">
            {selectedAlbumId && `专辑 [${albums.find(a => a.id === selectedAlbumId)?.title}]`}
            {selectedArtist && `艺术家 [${selectedArtist}]`}
            {selectedFolder && `文件夹 [${selectedFolder}]`}
          </span>
          <button onClick={resetFilters} className="underline hover:text-brand-color-hover pl-2 cursor-pointer font-semibold">
            重置并显示全部歌曲
          </button>
        </div>
      )}

      {/* Main SubView Content */}
      {activeSubView === 'tracks' || selectedAlbumId || selectedArtist || selectedFolder ? (
        
        /* SubView: Track List */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-text-muted px-2">
            <div>
              <span>共找到 <span className="text-text-primary font-bold font-mono">{filteredTracks.length}</span> 首本地单曲</span>
              <span className="ml-2 hidden sm:inline text-[11px] opacity-70">(双击或点击播放按钮加载)</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>排序方式:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-card-bg border border-border-color text-text-primary rounded px-2 py-1 text-xs outline-none focus:border-brand-color transition-colors cursor-pointer"
              >
                <option value="added-desc">添加时间 (从新到旧)</option>
                <option value="title-asc">歌曲名称 (A-Z)</option>
                <option value="duration-desc">播放时长 (从长到短)</option>
                <option value="album-asc">专辑名称 (A-Z)</option>
              </select>
            </div>
          </div>

          {filteredTracks.length === 0 ? (
            <div className="py-16 text-center bg-card-bg/20 rounded-2xl border border-dashed border-border-color">
              <p className="text-xs text-text-muted">没有在当前筛选中找到任何音乐音轨</p>
            </div>
          ) : (
            <div className="bg-card-bg/40 border border-border-color/60 rounded-xl overflow-hidden divide-y divide-border-color/40">
              {filteredTracks.map((track, idx) => {
                const isFav = favorites.includes(track.id);
                return (
                  <div 
                    key={track.id}
                    className="group flex items-center justify-between p-3.5 hover:bg-hover-bg transition-colors"
                  >
                    <div 
                      onClick={() => onPlayTrack(track, filteredTracks)}
                      className="flex items-center space-x-3.5 flex-1 min-w-0 cursor-pointer"
                    >
                      <span className="text-xs text-text-muted font-mono w-6 text-center group-hover:text-brand-color">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <img src={track.coverUrl} alt="" className="w-9 h-9 rounded object-cover shadow-sm flex-shrink-0" referrerPolicy="no-referrer" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-text-primary group-hover:text-brand-color truncate">
                          {track.title}
                        </h4>
                        <p className="text-[10px] text-text-secondary mt-0.5 truncate">
                          {track.artist} · <span className="text-text-muted">{track.album}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 ml-4">
                      <span className="text-[10px] text-text-muted font-mono bg-border-color/30 px-2 py-0.5 rounded">
                        {track.fileSize || '5.1 MB'}
                      </span>
                      <span className="text-xs text-text-muted font-mono">{formatDuration(track.duration)}</span>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => toggleFavorite(track.id)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>
                        <button
                          onClick={() => onAddToQueue(track)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-brand-color hover:bg-indigo-500/10 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onPlayTrack(track, filteredTracks)}
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

      ) : activeSubView === 'albums' ? (
        
        /* SubView: Albums Cover Wall */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {albums.map(album => (
            <div
              key={album.id}
              onClick={() => setSelectedAlbumId(album.id)}
              className="group bg-card-bg/40 hover:bg-card-bg border border-border-color/60 hover:border-brand-color/50 rounded-xl overflow-hidden p-3 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg flex flex-col"
            >
              <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-zinc-800 mb-3">
                <img 
                  src={album.coverUrl} 
                  alt={album.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-xs text-white bg-brand-color px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>查看收录音轨</span>
                  </span>
                </div>
              </div>
              <h3 className="text-xs font-bold text-text-primary line-clamp-1 group-hover:text-brand-color transition-colors">
                {album.title}
              </h3>
              <p className="text-[11px] text-text-muted truncate mt-1">{album.artist} · {album.releaseYear} 年发售</p>
              <div className="mt-3.5 pt-2.5 border-t border-border-color/30 flex items-center justify-between text-[10px] text-text-secondary font-mono">
                <span>{album.genre}</span>
                <span>{album.tracks.length} 首歌曲</span>
              </div>
            </div>
          ))}
        </div>

      ) : activeSubView === 'artists' ? (
        
        /* SubView: Artists View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {artistsList.map(artist => {
            const count = allTracks.filter(t => t.artist === artist).length;
            const artistCover = albums.find(a => a.artist === artist)?.coverUrl;
            return (
              <div
                key={artist}
                onClick={() => setSelectedArtist(artist)}
                className="group flex items-center space-x-4 p-4 rounded-xl bg-card-bg/40 hover:bg-card-bg border border-border-color/60 hover:border-brand-color/40 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 border border-white/5">
                  {artistCover ? (
                    <img src={artistCover} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                      <User className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-text-primary group-hover:text-brand-color transition-colors">
                    {artist}
                  </h3>
                  <p className="text-[10px] text-text-muted mt-1">本地共收录 {count} 首曲目</p>
                </div>
              </div>
            );
          })}
        </div>

      ) : (
        
        /* SubView: Folder View */
        <div className="space-y-3">
          {foldersMock.map(f => (
            <div
              key={f.name}
              onClick={() => setSelectedFolder(f.name)}
              className="group flex items-center justify-between p-4 rounded-xl bg-card-bg/40 hover:bg-card-bg border border-border-color/60 hover:border-brand-color/40 cursor-pointer transition-all"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <FolderOpen className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-xs font-mono font-semibold text-text-primary group-hover:text-brand-color transition-colors truncate">
                    {f.name}
                  </h3>
                  <p className="text-[10px] text-text-muted mt-1 font-sans">物理存储路径已由 Yang-Kura 安全挂载</p>
                </div>
              </div>
              <span className="text-[10px] text-text-secondary font-mono bg-border-color/50 px-2.5 py-1 rounded">
                {f.count} 首音频
              </span>
            </div>
          ))}
        </div>

      )}

    </div>
  );
}
