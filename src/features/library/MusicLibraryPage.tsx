import { useDeferredValue, useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import {
  ArrowLeft,
  CheckSquare2,
  Disc3,
  ExternalLink,
  Folder,
  FolderOpen,
  Heart,
  ListMusic,
  ListPlus,
  Music2,
  Play,
  Search,
  SlidersHorizontal,
  Square,
  UserRound,
  X,
} from 'lucide-react';
import CoverArtwork from '../../components/CoverArtwork';
import MusicMetadataManagementPanel from '../../components/MusicMetadataManagementPanel';
import { mediaSurfaceStatusService } from '../../services/mediaSurfaceStatusService';
import {
  LARGE_LIBRARY_RENDER_LIMITS,
  libraryPerformanceService,
} from '../../services/libraryPerformanceService';
import { Button, Feedback, MediaCard, Surface, TrackRow } from '../../shared/ui';
import type { AudioTrack, MusicAlbum } from '../../types';

export interface MusicLibraryPageProps {
  albums: MusicAlbum[];
  onPlayTrack: (track: AudioTrack, customQueue?: AudioTrack[]) => void;
  onAddToQueue: (track: AudioTrack) => void;
  favorites: string[];
  toggleFavorite: (trackId: string) => void;
  searchQuery: string;
  onUpdateMusicAlbum: (album: MusicAlbum) => void;
  onUpdateMusicTrack: (track: AudioTrack) => void;
  onClearMusicAlbumOverride: (albumId: string) => void;
  onClearMusicTrackOverride: (trackId: string) => void;
  onMetadataStoreChanged: () => void;
}

type LibraryView = 'tracks' | 'albums' | 'artists' | 'folders';
type SortMode = 'added-desc' | 'title-asc' | 'duration-desc' | 'album-asc';
type DetailSelection =
  | { kind: 'album'; id: string }
  | { kind: 'artist'; id: string }
  | { kind: 'folder'; id: string };

interface ArtistGroup {
  id: string;
  title: string;
  coverUrl: string;
  albums: MusicAlbum[];
  tracks: AudioTrack[];
}

interface FolderGroup {
  id: string;
  title: string;
  subtitle: string;
  coverUrl: string;
  tracks: AudioTrack[];
}

function formatDuration(seconds: number | undefined) {
  if (!Number.isFinite(seconds)) return '未统计';
  const safeSeconds = Math.max(0, Math.floor(seconds ?? 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function collectionDuration(tracks: AudioTrack[]) {
  return tracks.reduce((total, track) => total + (Number.isFinite(track.duration) ? track.duration : 0), 0);
}

function canUseHtmlAudio(track: AudioTrack) {
  return !['video', 'image', 'text', 'archive', 'other'].includes(track.mediaKind ?? 'audio');
}

function canOpenExternally(track: AudioTrack) {
  return Boolean(
    track.rootPathToken &&
    track.sourceRelativePath &&
    track.externalOpenSourceKind === 'tokenized-local-file',
  );
}

function externalKind(track: AudioTrack): YangKuraExternalOpenEntryKind {
  if (
    track.mediaKind === 'video' ||
    track.mediaKind === 'image' ||
    track.mediaKind === 'text' ||
    track.mediaKind === 'archive' ||
    track.mediaKind === 'other'
  ) {
    return track.mediaKind;
  }
  return 'audio';
}

function activateOnKeyboard(event: KeyboardEvent<HTMLElement>, action: () => void) {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  action();
}

export default function MusicLibraryPage({
  albums,
  onPlayTrack,
  onAddToQueue,
  favorites,
  toggleFavorite,
  searchQuery,
  onUpdateMusicAlbum,
  onUpdateMusicTrack,
  onClearMusicAlbumOverride,
  onClearMusicTrackOverride,
  onMetadataStoreChanged,
}: MusicLibraryPageProps) {
  const [activeView, setActiveView] = useState<LibraryView>('tracks');
  const [localQuery, setLocalQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('added-desc');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [detail, setDetail] = useState<DetailSelection | null>(null);
  const [selectedTrackIds, setSelectedTrackIds] = useState<Set<string>>(() => new Set<string>());
  const [renderLimit, setRenderLimit] = useState(LARGE_LIBRARY_RENDER_LIMITS.musicTracksInitial);
  const [feedback, setFeedback] = useState<string | null>(null);
  const deferredGlobalQuery = useDeferredValue(searchQuery);
  const deferredLocalQuery = useDeferredValue(localQuery);

  const allTracks = useMemo(() => albums.flatMap((album) => album.tracks), [albums]);
  const searchIndex = useMemo(() => libraryPerformanceService.buildMusicSearchIndex(albums), [albums]);
  const normalizedGlobalQuery = libraryPerformanceService.normalizeQuery(deferredGlobalQuery);
  const normalizedLocalQuery = libraryPerformanceService.normalizeQuery(deferredLocalQuery);
  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  const matchesQueries = (text: string | undefined) => {
    if (normalizedGlobalQuery && !text?.includes(normalizedGlobalQuery)) return false;
    if (normalizedLocalQuery && !text?.includes(normalizedLocalQuery)) return false;
    return true;
  };

  const filteredTracks = useMemo(() => {
    const tracks = allTracks.filter((track) => {
      if (!matchesQueries(searchIndex.trackTextById.get(track.id))) return false;
      if (favoritesOnly && !favoriteSet.has(track.id)) return false;
      return true;
    });

    return [...tracks].sort((left, right) => {
      if (sortMode === 'title-asc') return left.title.localeCompare(right.title);
      if (sortMode === 'duration-desc') return right.duration - left.duration;
      if (sortMode === 'album-asc') return left.album.localeCompare(right.album) || left.title.localeCompare(right.title);
      return (right.addedAt ?? '').localeCompare(left.addedAt ?? '') || right.id.localeCompare(left.id);
    });
  }, [
    allTracks,
    favoriteSet,
    favoritesOnly,
    normalizedGlobalQuery,
    normalizedLocalQuery,
    searchIndex,
    sortMode,
  ]);

  const filteredAlbums = useMemo(() => {
    const list = albums.filter((album) => {
      const albumMatches = matchesQueries(searchIndex.albumTextById.get(album.id));
      const trackMatches = album.tracks.some((track) => matchesQueries(searchIndex.trackTextById.get(track.id)));
      if (!albumMatches && !trackMatches) return false;
      if (favoritesOnly && !album.tracks.some((track) => favoriteSet.has(track.id))) return false;
      return true;
    });

    return [...list].sort((left, right) => {
      if (sortMode === 'title-asc') return left.title.localeCompare(right.title);
      if (sortMode === 'duration-desc') return collectionDuration(right.tracks) - collectionDuration(left.tracks);
      if (sortMode === 'album-asc') return left.artist.localeCompare(right.artist) || left.title.localeCompare(right.title);
      return right.releaseYear.localeCompare(left.releaseYear) || right.id.localeCompare(left.id);
    });
  }, [
    albums,
    favoriteSet,
    favoritesOnly,
    normalizedGlobalQuery,
    normalizedLocalQuery,
    searchIndex,
    sortMode,
  ]);

  const artistGroups = useMemo<ArtistGroup[]>(() => {
    const groups = new Map<string, ArtistGroup>();
    filteredAlbums.forEach((album) => {
      album.tracks.forEach((track) => {
        if (!matchesQueries(searchIndex.trackTextById.get(track.id)) && !matchesQueries(searchIndex.albumTextById.get(album.id))) return;
        if (favoritesOnly && !favoriteSet.has(track.id)) return;
        const artist = track.artist || album.artist || '未知艺术家';
        const current = groups.get(artist);
        if (current) {
          current.tracks.push(track);
          if (!current.albums.some((item) => item.id === album.id)) current.albums.push(album);
        } else {
          groups.set(artist, {
            id: artist,
            title: artist,
            coverUrl: track.coverUrl || album.coverUrl,
            albums: [album],
            tracks: [track],
          });
        }
      });
    });
    return [...groups.values()].sort((left, right) => left.title.localeCompare(right.title));
  }, [
    favoriteSet,
    favoritesOnly,
    filteredAlbums,
    normalizedGlobalQuery,
    normalizedLocalQuery,
    searchIndex,
  ]);

  const folderGroups = useMemo<FolderGroup[]>(() => (
    filteredAlbums.map((album) => ({
      id: album.id,
      title: album.title,
      subtitle: album.artist,
      coverUrl: album.coverUrl,
      tracks: album.tracks.filter((track) => !favoritesOnly || favoriteSet.has(track.id)),
    }))
  ), [favoriteSet, favoritesOnly, filteredAlbums]);

  const selectedAlbum = detail?.kind === 'album'
    ? albums.find((album) => album.id === detail.id) ?? null
    : null;
  const selectedArtist = detail?.kind === 'artist'
    ? artistGroups.find((artist) => artist.id === detail.id) ?? null
    : null;
  const selectedFolder = detail?.kind === 'folder'
    ? folderGroups.find((folder) => folder.id === detail.id) ?? null
    : null;

  const detailTracks = useMemo(() => {
    const source = selectedAlbum?.tracks ?? selectedArtist?.tracks ?? selectedFolder?.tracks ?? [];
    return source.filter((track) => !favoritesOnly || favoriteSet.has(track.id));
  }, [favoriteSet, favoritesOnly, selectedAlbum, selectedArtist, selectedFolder]);

  const detailTitle = selectedAlbum?.title ?? selectedArtist?.title ?? selectedFolder?.title ?? '';
  const detailSubtitle = selectedAlbum
    ? `${selectedAlbum.artist} · ${selectedAlbum.releaseYear || '年份未知'} · ${selectedAlbum.genre || '未分类'}`
    : selectedArtist
      ? `${selectedArtist.albums.length} 张专辑`
      : selectedFolder
        ? `${selectedFolder.subtitle} · 本地文件夹分组`
        : '';
  const detailCover = selectedAlbum?.coverUrl ?? selectedArtist?.coverUrl ?? selectedFolder?.coverUrl ?? '';
  const detailKindLabel = detail?.kind === 'album' ? '专辑' : detail?.kind === 'artist' ? '艺术家' : '文件夹';
  const currentTracks = detail ? detailTracks : filteredTracks;

  useEffect(() => {
    const validIds = new Set(allTracks.map((track) => track.id));
    setSelectedTrackIds((current) => {
      const next = new Set([...current].filter((id) => validIds.has(id)));
      return next.size === current.size ? current : next;
    });
  }, [allTracks]);

  useEffect(() => {
    setRenderLimit(
      activeView === 'tracks' || detail
        ? LARGE_LIBRARY_RENDER_LIMITS.musicTracksInitial
        : activeView === 'albums'
          ? LARGE_LIBRARY_RENDER_LIMITS.musicAlbumsInitial
          : LARGE_LIBRARY_RENDER_LIMITS.musicGroupsInitial,
    );
  }, [
    activeView,
    deferredGlobalQuery,
    deferredLocalQuery,
    detail,
    favoritesOnly,
    sortMode,
  ]);

  const visibleTracks = useMemo(
    () => libraryPerformanceService.sliceRenderWindow(currentTracks, renderLimit),
    [currentTracks, renderLimit],
  );
  const visibleAlbums = useMemo(
    () => libraryPerformanceService.sliceRenderWindow(filteredAlbums, renderLimit),
    [filteredAlbums, renderLimit],
  );
  const visibleArtists = useMemo(
    () => libraryPerformanceService.sliceRenderWindow(artistGroups, renderLimit),
    [artistGroups, renderLimit],
  );
  const visibleFolders = useMemo(
    () => libraryPerformanceService.sliceRenderWindow(folderGroups, renderLimit),
    [folderGroups, renderLimit],
  );

  const currentCollectionTotal = activeView === 'albums'
    ? filteredAlbums.length
    : activeView === 'artists'
      ? artistGroups.length
      : folderGroups.length;
  const currentCollectionVisible = activeView === 'albums'
    ? visibleAlbums.length
    : activeView === 'artists'
      ? visibleArtists.length
      : visibleFolders.length;
  const currentStep = activeView === 'tracks' || detail
    ? LARGE_LIBRARY_RENDER_LIMITS.musicTracksStep
    : activeView === 'albums'
      ? LARGE_LIBRARY_RENDER_LIMITS.musicAlbumsStep
      : LARGE_LIBRARY_RENDER_LIMITS.musicGroupsStep;
  const currentTotal = activeView === 'tracks' || detail ? currentTracks.length : currentCollectionTotal;
  const currentVisible = activeView === 'tracks' || detail ? visibleTracks.length : currentCollectionVisible;
  const currentNoun = activeView === 'tracks' || detail
    ? '曲目'
    : activeView === 'albums'
      ? '专辑'
      : activeView === 'artists'
        ? '艺术家'
        : '文件夹';
  const renderWindow = useMemo(
    () => libraryPerformanceService.getRenderWindowModel(currentTotal, currentVisible, currentStep, currentNoun),
    [currentNoun, currentStep, currentTotal, currentVisible],
  );

  const selectedTracks = useMemo(
    () => allTracks.filter((track) => selectedTrackIds.has(track.id)),
    [allTracks, selectedTrackIds],
  );
  const allCurrentTracksSelected = currentTracks.length > 0 && currentTracks.every((track) => selectedTrackIds.has(track.id));
  const isSearchPending = deferredGlobalQuery !== searchQuery || deferredLocalQuery !== localQuery;
  const hasFilters = Boolean(searchQuery || localQuery || favoritesOnly);

  const showFeedback = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), 2400);
  };

  const resetFilters = () => {
    setLocalQuery('');
    setFavoritesOnly(false);
  };

  const switchView = (view: LibraryView) => {
    setActiveView(view);
    setDetail(null);
    setSelectedTrackIds(new Set<string>());
  };

  const toggleTrackSelection = (trackId: string) => {
    setSelectedTrackIds((current) => {
      const next = new Set(current);
      if (next.has(trackId)) next.delete(trackId);
      else next.add(trackId);
      return next;
    });
  };

  const toggleAllCurrentTracks = () => {
    setSelectedTrackIds((current) => {
      const next = new Set(current);
      if (allCurrentTracksSelected) currentTracks.forEach((track) => next.delete(track.id));
      else currentTracks.forEach((track) => next.add(track.id));
      return next;
    });
  };

  const addSelectedToQueue = () => {
    if (selectedTracks.length === 0) return;
    selectedTracks.forEach(onAddToQueue);
    showFeedback(`已将 ${selectedTracks.length} 首曲目加入播放队列。`);
    setSelectedTrackIds(new Set<string>());
  };

  const addTracksToQueue = (tracks: AudioTrack[]) => {
    tracks.forEach(onAddToQueue);
    showFeedback(`已将 ${tracks.length} 首曲目加入播放队列。`);
  };

  const playTrack = (track: AudioTrack, queue: AudioTrack[]) => {
    if (canUseHtmlAudio(track)) onPlayTrack(track, queue);
    else void openExternalTrack(track);
  };

  const openExternalTrack = async (track: AudioTrack) => {
    if (!canOpenExternally(track) || !track.rootPathToken || !track.sourceRelativePath) {
      showFeedback('当前曲目没有可由系统应用打开的本地文件记录。');
      return;
    }
    if (!window.yangKura?.requestOpenExternalFile) {
      showFeedback('当前不在 Electron 桌面环境，无法调用系统默认应用。');
      return;
    }
    const result = await window.yangKura.requestOpenExternalFile({
      rootPathToken: track.rootPathToken,
      relativePath: track.sourceRelativePath,
      entryId: track.id,
      mode: 'open-external-file',
      expectedKind: externalKind(track),
    });
    showFeedback(result.message);
  };

  const openTrackInFileManager = async (track: AudioTrack) => {
    if (!canOpenExternally(track) || !track.rootPathToken || !track.sourceRelativePath) {
      showFeedback('当前曲目没有可定位的本地文件记录。');
      return;
    }
    if (!window.yangKura?.requestOpenInFileManager) {
      showFeedback('当前不在 Electron 桌面环境，无法打开文件管理器。');
      return;
    }
    const result = await window.yangKura.requestOpenInFileManager({
      rootPathToken: track.rootPathToken,
      relativePath: track.sourceRelativePath,
      entryId: track.id,
      mode: 'open-in-file-manager',
    });
    showFeedback(result.message);
  };

  const renderTrackBadges = (track: AudioTrack) => (
    <>
      {mediaSurfaceStatusService.getTrackBadges(track).slice(0, 3).map((badge) => (
        <span key={badge.id} className="u37d-badge" data-tone={badge.tone === 'rose' ? 'danger' : badge.tone === 'amber' ? 'warning' : badge.tone === 'emerald' ? 'success' : 'info'}>
          {badge.label}
        </span>
      ))}
    </>
  );

  const renderTrackActions = (track: AudioTrack, queue: AudioTrack[]) => {
    const isFavorite = favoriteSet.has(track.id);
    const isSelected = selectedTrackIds.has(track.id);
    return (
      <>
        <button
          type="button"
          className="u37d-icon-button"
          data-active={isSelected ? 'true' : 'false'}
          aria-label={isSelected ? `取消选择 ${track.title}` : `选择 ${track.title}`}
          onClick={() => toggleTrackSelection(track.id)}
        >
          {isSelected ? <CheckSquare2 /> : <Square />}
        </button>
        <button
          type="button"
          className="u37d-icon-button"
          data-active={isFavorite ? 'true' : 'false'}
          aria-label={isFavorite ? `取消收藏 ${track.title}` : `收藏 ${track.title}`}
          onClick={() => toggleFavorite(track.id)}
        >
          <Heart className={isFavorite ? 'u37d-heart-filled' : ''} />
        </button>
        <button
          type="button"
          className="u37d-icon-button"
          aria-label={`将 ${track.title} 加入播放队列`}
          onClick={() => {
            onAddToQueue(track);
            showFeedback(`已将《${track.title}》加入播放队列。`);
          }}
        >
          <ListPlus />
        </button>
        <button
          type="button"
          className="u37d-icon-button"
          disabled={!canOpenExternally(track)}
          aria-label={`用系统应用打开 ${track.title}`}
          onClick={() => void openExternalTrack(track)}
        >
          <ExternalLink />
        </button>
        <button
          type="button"
          className="u37d-icon-button"
          disabled={!canOpenExternally(track)}
          aria-label={`在文件管理器中定位 ${track.title}`}
          onClick={() => void openTrackInFileManager(track)}
        >
          <FolderOpen />
        </button>
        <button
          type="button"
          className="u37d-icon-button u37d-icon-button--primary"
          aria-label={`播放 ${track.title}`}
          onClick={() => playTrack(track, queue)}
        >
          <Play />
        </button>
      </>
    );
  };

  const renderTrackList = (tracks: AudioTrack[]) => {
    if (tracks.length === 0) {
      return (
        <Feedback
          tone="neutral"
          title={hasFilters ? '没有符合条件的曲目' : '这里还没有曲目'}
          description={hasFilters ? '调整搜索或收藏筛选后再试。' : '重新扫描资源库后，新曲目会显示在这里。'}
          action={hasFilters ? <Button onClick={resetFilters}>清除筛选</Button> : undefined}
        />
      );
    }

    return (
      <div className="u37d-track-list" data-u37d-track-list="ready">
        {visibleTracks.map((track) => (
          <div key={track.id} data-u37d-track-row={track.id}>
            <TrackRow
              title={track.title}
              subtitle={`${track.artist || '未知艺术家'} · ${track.album || '未分类专辑'}`}
              leading={(
                <CoverArtwork
                  src={track.coverUrl}
                  title={track.title}
                  subtitle={track.artist}
                  kind="music"
                  className="u37d-track-cover"
                />
              )}
              duration={formatDuration(track.duration)}
              badges={renderTrackBadges(track)}
              actions={renderTrackActions(track, tracks)}
              onActivate={() => playTrack(track, tracks)}
              active={selectedTrackIds.has(track.id)}
            />
          </div>
        ))}
      </div>
    );
  };

  const collectionActions = (tracks: AudioTrack[], title: string) => (
    <>
      <button
        type="button"
        className="u37d-icon-button"
        aria-label={`播放 ${title}`}
        disabled={tracks.length === 0}
        onClick={(event) => {
          event.stopPropagation();
          if (tracks[0]) playTrack(tracks[0], tracks);
        }}
      >
        <Play />
      </button>
      <button
        type="button"
        className="u37d-icon-button"
        aria-label={`将 ${title} 加入播放队列`}
        disabled={tracks.length === 0}
        onClick={(event) => {
          event.stopPropagation();
          addTracksToQueue(tracks);
        }}
      >
        <ListPlus />
      </button>
    </>
  );

  const renderCollections = () => {
    if (activeView === 'albums') {
      if (filteredAlbums.length === 0) {
        return <Feedback tone="neutral" title="没有符合条件的专辑" description="调整搜索或收藏筛选后再试。" action={<Button onClick={resetFilters}>清除筛选</Button>} />;
      }
      return (
        <div className="u37d-collection-grid" data-u37d-collection-grid="albums">
          {visibleAlbums.map((album) => (
            <MediaCard
              key={album.id}
              role="button"
              tabIndex={0}
              data-u37d-collection-card={`album:${album.id}`}
              interactive
              title={album.title}
              subtitle={album.artist || '未知艺术家'}
              visual={<CoverArtwork src={album.coverUrl} title={album.title} subtitle={album.artist} kind="music" className="u37d-card-cover" />}
              meta={<span>{album.releaseYear || '年份未知'} · {album.genre || '未分类'} · {album.tracks.length} 首</span>}
              badges={mediaSurfaceStatusService.getAlbumBadges(album).slice(0, 2).map((badge) => <span key={badge.id} className="u37d-badge">{badge.label}</span>)}
              actions={collectionActions(album.tracks, album.title)}
              onClick={() => setDetail({ kind: 'album', id: album.id })}
              onKeyDown={(event) => activateOnKeyboard(event, () => setDetail({ kind: 'album', id: album.id }))}
            />
          ))}
        </div>
      );
    }

    if (activeView === 'artists') {
      if (artistGroups.length === 0) {
        return <Feedback tone="neutral" title="没有符合条件的艺术家" description="调整搜索或收藏筛选后再试。" action={<Button onClick={resetFilters}>清除筛选</Button>} />;
      }
      return (
        <div className="u37d-collection-grid u37d-collection-grid--people" data-u37d-collection-grid="artists">
          {visibleArtists.map((artist) => (
            <MediaCard
              key={artist.id}
              role="button"
              tabIndex={0}
              data-u37d-collection-card={`artist:${artist.id}`}
              interactive
              title={artist.title}
              subtitle={`${artist.albums.length} 张专辑`}
              visual={<CoverArtwork src={artist.coverUrl} title={artist.title} subtitle="本地艺术家" kind="music" className="u37d-card-cover u37d-card-cover--round" rounded />}
              meta={<span>{artist.tracks.length} 首曲目 · {formatDuration(collectionDuration(artist.tracks))}</span>}
              actions={collectionActions(artist.tracks, artist.title)}
              onClick={() => setDetail({ kind: 'artist', id: artist.id })}
              onKeyDown={(event) => activateOnKeyboard(event, () => setDetail({ kind: 'artist', id: artist.id }))}
            />
          ))}
        </div>
      );
    }

    if (folderGroups.length === 0) {
      return <Feedback tone="neutral" title="没有符合条件的文件夹分组" description="调整搜索或收藏筛选后再试。" action={<Button onClick={resetFilters}>清除筛选</Button>} />;
    }
    return (
      <div className="u37d-folder-list" data-u37d-collection-grid="folders">
        {visibleFolders.map((folder) => (
          <MediaCard
            key={folder.id}
            role="button"
            tabIndex={0}
            data-u37d-collection-card={`folder:${folder.id}`}
            interactive
            className="u37d-folder-card"
            title={folder.title}
            subtitle={folder.subtitle}
            visual={<span className="u37d-folder-icon"><Folder /></span>}
            meta={<span>{folder.tracks.length} 首曲目 · {formatDuration(collectionDuration(folder.tracks))}</span>}
            actions={collectionActions(folder.tracks, folder.title)}
            onClick={() => setDetail({ kind: 'folder', id: folder.id })}
            onKeyDown={(event) => activateOnKeyboard(event, () => setDetail({ kind: 'folder', id: folder.id }))}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="u37d-music-library" data-u37d-music-library={detail ? `detail-${detail.kind}` : activeView}>
      {feedback ? (
        <div className="u37d-toast" role="status">
          {feedback}
        </div>
      ) : null}

      <header className="u37d-heading">
        <div>
          <p className="u37d-eyebrow">本地音乐</p>
          <h2><Music2 />音乐库</h2>
          <p>浏览歌曲、专辑、艺术家与文件夹分组；播放、收藏和整理操作保持在同一条日常路径内。</p>
        </div>
        <div className="u37d-heading__stats">
          <strong>{allTracks.length}</strong>
          <span>{albums.length} 张专辑</span>
        </div>
      </header>

      {!detail ? (
        <>
          <Surface className="u37d-toolbar" padding="md" elevation="raised">
            <div className="u37d-view-tabs" aria-label="音乐库视图">
              {([
                ['tracks', '歌曲', ListMusic],
                ['albums', '专辑', Disc3],
                ['artists', '艺术家', UserRound],
                ['folders', '文件夹', Folder],
              ] as const).map(([view, label, Icon]) => (
                <button
                  key={view}
                  type="button"
                  data-u37d-view={view}
                  aria-pressed={activeView === view}
                  onClick={() => switchView(view)}
                >
                  <Icon />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <label className="u37d-search">
              <Search />
              <span className="sr-only">搜索音乐库</span>
              <input
                value={localQuery}
                onChange={(event) => setLocalQuery(event.target.value)}
                placeholder={searchQuery ? `继续筛选“${searchQuery}”` : '搜索歌曲、专辑或艺术家'}
              />
              {localQuery ? (
                <button type="button" aria-label="清除页面搜索" onClick={() => setLocalQuery('')}>
                  <X />
                </button>
              ) : null}
            </label>

            <label className="u37d-sort">
              <SlidersHorizontal />
              <span>排序</span>
              <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}>
                <option value="added-desc">最近添加</option>
                <option value="title-asc">名称</option>
                <option value="duration-desc">总时长</option>
                <option value="album-asc">专辑 / 艺术家</option>
              </select>
            </label>

            <button
              type="button"
              className="u37d-favorite-filter"
              data-active={favoritesOnly ? 'true' : 'false'}
              aria-pressed={favoritesOnly}
              onClick={() => setFavoritesOnly((current) => !current)}
            >
              <Heart className={favoritesOnly ? 'u37d-heart-filled' : ''} />
              <span>仅看收藏</span>
            </button>
          </Surface>

          <div className="u37d-result-line">
            <span>{isSearchPending ? '正在更新结果…' : `${currentTotal} 个${currentNoun}`}</span>
            {hasFilters ? (
              <Button variant="ghost" size="sm" onClick={resetFilters}>清除页面筛选</Button>
            ) : null}
          </div>
        </>
      ) : (
        <Surface className="u37d-detail-hero" padding="lg" elevation="raised" data-u37d-detail={detail.kind}>
          <Button variant="ghost" size="sm" leadingIcon={<ArrowLeft />} onClick={() => setDetail(null)}>
            返回{activeView === 'albums' ? '专辑' : activeView === 'artists' ? '艺术家' : '文件夹'}
          </Button>
          <div className="u37d-detail-hero__content">
            <div className="u37d-detail-hero__visual">
              {detail.kind === 'folder'
                ? <Folder />
                : <CoverArtwork src={detailCover} title={detailTitle} subtitle={detailSubtitle} kind="music" className={detail.kind === 'artist' ? 'u37d-detail-cover u37d-detail-cover--round' : 'u37d-detail-cover'} rounded={detail.kind === 'artist'} />}
            </div>
            <div className="u37d-detail-hero__copy">
              <p className="u37d-eyebrow">{detailKindLabel}</p>
              <h3>{detailTitle}</h3>
              <p>{detailSubtitle}</p>
              <div className="u37d-detail-hero__metrics">
                <span><strong>{detailTracks.length}</strong> 首曲目</span>
                <span><strong>{formatDuration(collectionDuration(detailTracks))}</strong> 总时长</span>
                <span><strong>{detailTracks.filter((track) => favoriteSet.has(track.id)).length}</strong> 已收藏</span>
              </div>
              <div className="u37d-detail-hero__actions">
                <Button
                  variant="primary"
                  leadingIcon={<Play />}
                  disabled={!detailTracks[0]}
                  onClick={() => {
                    if (detailTracks[0]) playTrack(detailTracks[0], detailTracks);
                  }}
                >
                  播放全部
                </Button>
                <Button
                  leadingIcon={<ListPlus />}
                  disabled={detailTracks.length === 0}
                  onClick={() => addTracksToQueue(detailTracks)}
                >
                  全部加入队列
                </Button>
              </div>
            </div>
          </div>
        </Surface>
      )}

      {(activeView === 'tracks' || detail) && currentTracks.length > 0 ? (
        <Surface className="u37d-selection-bar" padding="sm" tone="subtle">
          <button type="button" onClick={toggleAllCurrentTracks}>
            {allCurrentTracksSelected ? <CheckSquare2 /> : <Square />}
            <span>{allCurrentTracksSelected ? '取消全选当前结果' : '全选当前结果'}</span>
          </button>
          <span>已选择 {selectedTrackIds.size} 首</span>
          <Button
            size="sm"
            leadingIcon={<ListPlus />}
            disabled={selectedTrackIds.size === 0}
            onClick={addSelectedToQueue}
          >
            批量加入队列
          </Button>
          {selectedTrackIds.size > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => setSelectedTrackIds(new Set<string>())}>
              清除选择
            </Button>
          ) : null}
        </Surface>
      ) : null}

      <section className="u37d-content">
        {activeView === 'tracks' || detail ? renderTrackList(currentTracks) : renderCollections()}
      </section>

      {renderWindow.hasMore ? (
        <div className="u37d-load-more">
          <span>{renderWindow.summary}</span>
          <Button size="sm" onClick={() => setRenderLimit((current) => current + currentStep)}>
            再显示 {renderWindow.nextCount} 项
          </Button>
        </div>
      ) : null}

      <Surface className="u37d-metadata-tools" padding="md" tone="subtle">
        <MusicMetadataManagementPanel
          albums={albums}
          onUpdateAlbum={onUpdateMusicAlbum}
          onUpdateTrack={onUpdateMusicTrack}
          onClearAlbumOverride={onClearMusicAlbumOverride}
          onClearTrackOverride={onClearMusicTrackOverride}
          onMetadataStoreChanged={onMetadataStoreChanged}
        />
      </Surface>
    </div>
  );
}
