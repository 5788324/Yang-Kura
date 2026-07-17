import { useMemo } from 'react';
import {
  ArrowRight,
  Disc3,
  FolderOpen,
  Headphones,
  Library,
  ListMusic,
  Play,
  Settings2,
  Sparkles,
} from 'lucide-react';
import CoverArtwork from '../../components/CoverArtwork';
import type { LibrarySessionSnapshot } from '../../services/librarySessionService';
import { Button, MediaCard, Surface, TrackRow } from '../../shared/ui';
import type {
  AudioTrack,
  MusicAlbum,
  PageType,
  PlayerState,
  Playlist,
  RJWork,
} from '../../types';

export interface HomeLibraryPageProps {
  recentTracks: AudioTrack[];
  librarySessionSnapshot: LibrarySessionSnapshot;
  playlists: Playlist[];
  rjWorks: RJWork[];
  musicAlbums: MusicAlbum[];
  playerState: PlayerState;
  onPlayTrack: (track: AudioTrack, queue?: AudioTrack[]) => void;
  setAsmrDetailId: (id: string | null) => void;
  setPlaylistDetailId: (id: string | null) => void;
  setCurrentPage: (page: PageType) => void;
  searchQuery: string;
}

function formatDuration(seconds: number | undefined) {
  if (!Number.isFinite(seconds)) return '--:--';
  const safeSeconds = Math.max(0, Math.floor(seconds ?? 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  if (hours > 0) return `${hours} 小时 ${minutes} 分`;
  return `${minutes} 分钟`;
}

function includesQuery(value: string | undefined, query: string) {
  return Boolean(value?.toLocaleLowerCase().includes(query));
}

export default function HomeLibraryPage({
  recentTracks,
  librarySessionSnapshot,
  playlists,
  rjWorks,
  musicAlbums,
  playerState,
  onPlayTrack,
  setAsmrDetailId,
  setPlaylistDetailId,
  setCurrentPage,
  searchQuery,
}: HomeLibraryPageProps) {
  const lastIndex = librarySessionSnapshot.lastIndex;
  const hasLoadedIndex = Boolean(lastIndex);
  const hasAuthorizedRoot = Object.keys(librarySessionSnapshot.selectedRoots).length > 0;
  const indexedTrackCount = lastIndex?.trackCount ?? 0;
  const actualMusicTrackCount = musicAlbums.reduce((count, album) => count + album.tracks.length, 0);
  const fallbackTrack = rjWorks[0]?.tracks[0] ?? musicAlbums[0]?.tracks[0] ?? null;
  const continueTrack = playerState.currentTrack ?? recentTracks[0] ?? fallbackTrack;
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const isSearching = normalizedQuery.length > 0;

  const searchResults = useMemo(() => {
    if (!normalizedQuery) return { works: [] as RJWork[], tracks: [] as AudioTrack[] };
    const works = rjWorks.filter((work) =>
      includesQuery(work.id, normalizedQuery) ||
      includesQuery(work.title, normalizedQuery) ||
      includesQuery(work.circle, normalizedQuery) ||
      work.cvs.some((cv) => includesQuery(cv, normalizedQuery)) ||
      work.tags.some((tag) => includesQuery(tag, normalizedQuery)),
    );
    const tracks = musicAlbums
      .flatMap((album) => album.tracks)
      .filter((track) =>
        includesQuery(track.title, normalizedQuery) ||
        includesQuery(track.artist, normalizedQuery) ||
        includesQuery(track.album, normalizedQuery),
      );
    return { works, tracks };
  }, [musicAlbums, normalizedQuery, rjWorks]);

  const libraryStatus = hasLoadedIndex
    ? indexedTrackCount > 0
      ? {
          tone: 'ready',
          title: '已连接本地资源库',
          description: `已连接「${lastIndex?.displayName}」：${lastIndex?.collectionCount ?? 0} 个集合，${indexedTrackCount} 条音轨。`,
          metric: `已加载 ${indexedTrackCount} 条音轨`,
          action: '管理资源库',
        }
      : {
          tone: 'empty',
          title: '已连接空资源库',
          description: '资源库已连接，当前没有音轨。Index 已成功读取，可以重新扫描或检查目录内容。',
          metric: '已加载 0 条音轨',
          action: '检查资源库',
        }
    : hasAuthorizedRoot
      ? {
          tone: 'waiting',
          title: '等待读取资源库',
          description: '目录已授权，尚未读取资源库记录。请前往设置页读取已有记录。',
          metric: '目录已授权',
          action: '读取资源库',
        }
      : {
          tone: 'disconnected',
          title: '尚未选择资源库',
          description: '选择本地音声或音乐目录后，即可读取已有 Index，或扫描建立资源库。',
          metric: '等待导入资源库',
          action: '选择资源库',
        };

  const recentAddedWorks = [...rjWorks]
    .sort((a, b) => (b.addedAt ?? '').localeCompare(a.addedAt ?? ''))
    .slice(0, 4);

  const openWork = (workId: string) => {
    setAsmrDetailId(workId);
    setCurrentPage('asmr-lib');
  };

  if (isSearching) {
    return (
      <div className="u37b-home" data-u37b-home="search-results">
        <header className="u37b-page-heading">
          <div>
            <p className="u37b-page-heading__eyebrow">全局搜索</p>
            <h2>“{searchQuery.trim()}”的结果</h2>
            <p>匹配 {searchResults.works.length} 个音声作品和 {searchResults.tracks.length} 首音乐。</p>
          </div>
        </header>

        <section className="u37b-section" aria-labelledby="u37b-search-works-title">
          <div className="u37b-section__heading">
            <div>
              <h3 id="u37b-search-works-title">音声作品</h3>
              <p>按标题、RJ 号、社团、声优和标签匹配。</p>
            </div>
          </div>
          {searchResults.works.length > 0 ? (
            <div className="u37b-media-grid">
              {searchResults.works.slice(0, 8).map((work) => (
                <MediaCard
                  key={work.id}
                  title={work.title}
                  subtitle={`${work.id} · ${work.circle}`}
                  interactive
                  role="button"
                  tabIndex={0}
                  onClick={() => openWork(work.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openWork(work.id); }
                  }}
                  visual={(
                    <CoverArtwork
                      src={work.coverUrl}
                      title={work.title}
                      subtitle={work.id}
                      kind="asmr"
                      className="h-full w-full object-cover"
                    />
                  )}
                  meta={`${work.fileCount} 个分轨 · ${formatDuration(work.totalDuration)}`}
                />
              ))}
            </div>
          ) : (
            <Surface padding="md" tone="subtle" className="u37b-empty-inline">没有匹配的音声作品。</Surface>
          )}
        </section>

        <section className="u37b-section" aria-labelledby="u37b-search-tracks-title">
          <div className="u37b-section__heading">
            <div>
              <h3 id="u37b-search-tracks-title">音乐曲目</h3>
              <p>点击曲目直接播放当前搜索结果。</p>
            </div>
          </div>
          {searchResults.tracks.length > 0 ? (
            <Surface padding="sm" className="u37b-track-list">
              {searchResults.tracks.slice(0, 12).map((track) => (
                <TrackRow
                  key={track.id}
                  title={track.title}
                  subtitle={`${track.artist} · ${track.album}`}
                  duration={formatDuration(track.duration)}
                  onActivate={() => onPlayTrack(track, searchResults.tracks)}
                  leading={(
                    <CoverArtwork
                      src={track.coverUrl}
                      title={track.title}
                      subtitle={track.artist}
                      kind="music"
                      className="h-full w-full object-cover"
                    />
                  )}
                />
              ))}
            </Surface>
          ) : (
            <Surface padding="md" tone="subtle" className="u37b-empty-inline">没有匹配的音乐曲目。</Surface>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="u37b-home" data-u37b-home="daily">
      <section className="u37b-home-hero" data-library-state={libraryStatus.tone}>
        <div className="u37b-home-hero__copy">
          <div className="u37b-home-hero__icon" aria-hidden="true"><Library /></div>
          <div>
            <p className="u37b-page-heading__eyebrow">本地媒体库</p>
            <h2>{libraryStatus.title}</h2>
            <p>{libraryStatus.description}</p>
          </div>
        </div>
        <div className="u37b-home-hero__aside">
          <strong>{libraryStatus.metric}</strong>
          <Button
            variant="primary"
            size="sm"
            leadingIcon={<Settings2 aria-hidden="true" />}
            onClick={() => setCurrentPage('settings')}
          >
            {libraryStatus.action}
          </Button>
        </div>
      </section>

      <section id="mvp45-home-recent-listening" className="u37b-home-listening" aria-labelledby="u37b-continue-title">
        <div className="u37b-home-listening__hero">
          <div className="u37b-home-listening__visual">
            {continueTrack ? (
              <CoverArtwork
                src={continueTrack.coverUrl}
                title={continueTrack.title}
                subtitle={continueTrack.artist}
                kind={continueTrack.type === 'asmr' ? 'asmr' : 'music'}
                className="h-full w-full object-cover"
              />
            ) : (
              <Sparkles aria-hidden="true" />
            )}
          </div>
          <div className="u37b-home-listening__copy">
            <p className="u37b-page-heading__eyebrow">继续播放</p>
            <h3 id="u37b-continue-title">{continueTrack?.title ?? '从资源库选择第一段声音'}</h3>
            <p>{continueTrack ? `${continueTrack.artist} · ${continueTrack.album}` : '连接资源库后，这里会显示最近收听和断点续播。'}</p>
            <div className="u37b-home-listening__actions">
              <Button
                variant="primary"
                leadingIcon={<Play aria-hidden="true" />}
                disabled={!continueTrack}
                onClick={() => continueTrack && onPlayTrack(continueTrack)}
              >
                {continueTrack && playerState.currentTrack?.id === continueTrack.id ? '继续当前播放' : '开始播放'}
              </Button>
              <Button variant="ghost" trailingIcon={<ArrowRight aria-hidden="true" />} onClick={() => setCurrentPage('asmr-lib')}>
                浏览音声库
              </Button>
            </div>
          </div>
        </div>

        <Surface padding="sm" tone="subtle" className="u37b-home-listening__recent">
          <div className="u37b-mini-heading">
            <span>最近播放</span>
            <span>{recentTracks.length} 条</span>
          </div>
          {recentTracks.length > 0 ? recentTracks.slice(0, 4).map((track) => (
            <TrackRow
              key={track.id}
              title={track.title}
              subtitle={`${track.artist} · ${track.album}`}
              duration={formatDuration(track.duration)}
              active={playerState.currentTrack?.id === track.id}
              onActivate={() => onPlayTrack(track, recentTracks)}
              leading={(
                <CoverArtwork
                  src={track.coverUrl}
                  title={track.title}
                  subtitle={track.artist}
                  kind={track.type === 'asmr' ? 'asmr' : 'music'}
                  className="h-full w-full object-cover"
                />
              )}
            />
          )) : (
            <p className="u37b-empty-inline">还没有最近播放记录。</p>
          )}
        </Surface>
      </section>

      <section className="u37b-section" aria-labelledby="u37b-entry-title">
        <div className="u37b-section__heading">
          <div>
            <h3 id="u37b-entry-title">常用入口</h3>
            <p>直接进入作品、音乐和歌单，不展示维护或工程信息。</p>
          </div>
        </div>
        <div className="u37b-entry-grid">
          <button type="button" onClick={() => setCurrentPage('asmr-lib')}>
            <Headphones aria-hidden="true" />
            <span><strong>音声库</strong><small>{rjWorks.length} 个作品</small></span>
            <ArrowRight aria-hidden="true" />
          </button>
          <button type="button" onClick={() => setCurrentPage('music-lib')}>
            <Disc3 aria-hidden="true" />
            <span><strong>音乐库</strong><small>{actualMusicTrackCount} 首歌曲</small></span>
            <ArrowRight aria-hidden="true" />
          </button>
          <button type="button" onClick={() => setCurrentPage('playlists')}>
            <ListMusic aria-hidden="true" />
            <span><strong>歌单</strong><small>{playlists.length} 个歌单</small></span>
            <ArrowRight aria-hidden="true" />
          </button>
          <button type="button" onClick={() => setCurrentPage('importer')}>
            <FolderOpen aria-hidden="true" />
            <span><strong>导入文件</strong><small>安全复制到资源库</small></span>
            <ArrowRight aria-hidden="true" />
          </button>
        </div>
      </section>

      <section className="u37b-section" aria-labelledby="u37b-recent-added-title">
        <div className="u37b-section__heading">
          <div>
            <h3 id="u37b-recent-added-title">最近加入</h3>
            <p>优先展示最近进入资源库的音声作品。</p>
          </div>
          <Button variant="ghost" size="sm" trailingIcon={<ArrowRight aria-hidden="true" />} onClick={() => setCurrentPage('asmr-lib')}>
            查看全部
          </Button>
        </div>
        {recentAddedWorks.length > 0 ? (
          <div className="u37b-media-grid">
            {recentAddedWorks.map((work) => (
              <MediaCard
                key={work.id}
                title={work.title}
                subtitle={`${work.id} · ${work.circle}`}
                interactive
                role="button"
                tabIndex={0}
                onClick={() => openWork(work.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openWork(work.id); }
                }}
                visual={(
                  <CoverArtwork
                    src={work.coverUrl}
                    title={work.title}
                    subtitle={work.id}
                    kind="asmr"
                    className="h-full w-full object-cover"
                  />
                )}
                meta={`${work.fileCount} 个分轨 · ${formatDuration(work.totalDuration)}`}
                badges={work.tags.slice(0, 2).map((tag) => <span key={tag} className="u37b-badge">{tag}</span>)}
              />
            ))}
          </div>
        ) : (
          <Surface padding="lg" tone="subtle" className="u37b-empty-inline">
            读取或扫描资源库后，最近加入的作品会显示在这里。
          </Surface>
        )}
      </section>

      {playlists.length > 0 ? (
        <section className="u37b-section" aria-labelledby="u37b-playlist-title">
          <div className="u37b-section__heading">
            <div>
              <h3 id="u37b-playlist-title">你的歌单</h3>
              <p>继续整理常听的音声和音乐。</p>
            </div>
          </div>
          <div className="u37b-playlist-strip">
            {playlists.slice(0, 4).map((playlist) => (
              <button
                key={playlist.id}
                type="button"
                onClick={() => {
                  setPlaylistDetailId(playlist.id);
                  setCurrentPage('playlists');
                }}
              >
                <ListMusic aria-hidden="true" />
                <span><strong>{playlist.name}</strong><small>{playlist.tracksCount} 首</small></span>
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
