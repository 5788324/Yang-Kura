import type React from 'react';
import { Suspense, lazy } from 'react';
import DiagnosticsRuntimeBoundary from '../components/DiagnosticsRuntimeBoundary';
import LibraryPageState, { type LibraryPageKind } from '../features/library/LibraryPageState';
import LibraryRouteBoundary from '../features/library/LibraryRouteBoundary';
import type { LibrarySessionSnapshot } from '../services/librarySessionService';
import type { AsmrMetadataSaveContext } from '../services/metadataOverrideService';
import { Button, Feedback, Surface } from '../shared/ui';
import type {
  AudioTrack,
  LibrarySettings,
  MusicAlbum,
  PageType,
  PlayerState,
  Playlist,
  RJWork,
} from '../types';

const Dashboard = lazy(() => import('../components/Dashboard'));
const AsmrLibrary = lazy(() => import('../components/AsmrLibrary'));
const AsmrDetail = lazy(() => import('../components/AsmrDetail'));
const MusicLibrary = lazy(() => import('../components/MusicLibrary'));
const PlaylistPage = lazy(() => import('../components/PlaylistPage'));
const DiagnosticsPageShell = lazy(() => import('../components/DiagnosticsPageShell'));
const ImporterPage = lazy(() => import('../components/ImporterPage'));
const DownloaderPage = lazy(() => import('../components/DownloaderPage'));
const SettingsPage = lazy(() => import('../components/SettingsPage'));

export interface AppRouterProps {
  currentPage: PageType;
  asmrDetailId: string | null;
  playlistDetailId: string | null;
  recentTracks: AudioTrack[];
  librarySessionSnapshot: LibrarySessionSnapshot;
  playlists: Playlist[];
  rjWorks: RJWork[];
  musicAlbums: MusicAlbum[];
  playerState: PlayerState;
  searchQuery: string;
  favorites: string[];
  settings: LibrarySettings;
  scanStatus: string;
  setCurrentPage: React.Dispatch<React.SetStateAction<PageType>>;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setRjWorks: React.Dispatch<React.SetStateAction<RJWork[]>>;
  setMusicAlbums: React.Dispatch<React.SetStateAction<MusicAlbum[]>>;
  setAsmrDetailId: (id: string | null) => void;
  setPlaylistDetailId: (id: string | null) => void;
  onPlayTrack: (track: AudioTrack, queue?: AudioTrack[]) => void;
  onAddToQueue: (track: AudioTrack) => void;
  toggleFavorite: (trackId: string) => void;
  onUpdateRjWork: (updated: RJWork, source?: AsmrMetadataSaveContext) => void;
  onClearRjWorkOverride: (workId: string) => void;
  onDeleteRjWork: (id: string) => void;
  onRefetchRjMetadata: (rjId: string) => void;
  onAddRjWorkTracksToPlaylist: (rjId: string, playlistId: string) => void;
  onUpdateMusicAlbum: (updated: MusicAlbum) => void;
  onUpdateMusicTrack: (updated: AudioTrack) => void;
  onClearMusicAlbumOverride: (albumId: string) => void;
  onClearMusicTrackOverride: (trackId: string) => void;
  onMetadataStoreChanged: () => void;
  onCreatePlaylist: (name: string, description: string) => void;
  onDeletePlaylist: (playlistId: string) => void;
  onRemoveTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  updateSettings: (updates: Partial<LibrarySettings>) => void;
  onScanLibrary: () => void;
}

export default function AppRouter(props: AppRouterProps) {
  const selectedAsmrWork = props.rjWorks.find((work) => work.id === props.asmrDetailId);
  const hasConnectedLibrary = Boolean(props.librarySessionSnapshot.lastIndex);
  const dashboardItemCount = props.rjWorks.length + props.musicAlbums.length + props.playlists.length + props.recentTracks.length;

  const renderLibraryPage = (
    kind: LibraryPageKind,
    pageTitle: string,
    itemCount: number,
    content: React.ReactNode,
    resetKeySuffix = '',
  ) => (
    <LibraryRouteBoundary
      pageTitle={pageTitle}
      resetKey={`${kind}:${itemCount}:${props.searchQuery}:${resetKeySuffix}`}
    >
      <LibraryPageState
        kind={kind}
        connected={hasConnectedLibrary}
        itemCount={itemCount}
        onOpenSettings={() => props.setCurrentPage('settings')}
      >
        {content}
      </LibraryPageState>
    </LibraryRouteBoundary>
  );

  return (
    <Suspense fallback={<div className="min-h-[240px] rounded-2xl border border-border-color/50 bg-card-bg/30 p-6 text-sm text-text-muted">正在打开页面…</div>}>
      {props.currentPage === 'dashboard' && !props.asmrDetailId && !props.playlistDetailId && renderLibraryPage(
        'dashboard',
        '首页',
        dashboardItemCount,
        <Dashboard
          recentTracks={props.recentTracks}
          librarySessionSnapshot={props.librarySessionSnapshot}
          playlists={props.playlists}
          rjWorks={props.rjWorks}
          musicAlbums={props.musicAlbums}
          playerState={props.playerState}
          onPlayTrack={props.onPlayTrack}
          setAsmrDetailId={props.setAsmrDetailId}
          setPlaylistDetailId={props.setPlaylistDetailId}
          setCurrentPage={props.setCurrentPage}
          searchQuery={props.searchQuery}
        />,
      )}

      {props.currentPage === 'asmr-lib' && !props.asmrDetailId && renderLibraryPage(
        'asmr',
        '音声库',
        props.rjWorks.length,
        <AsmrLibrary
          rjWorks={props.rjWorks}
          setAsmrDetailId={props.setAsmrDetailId}
          searchQuery={props.searchQuery}
          onUpdateRjWork={props.onUpdateRjWork}
          onDeleteRjWork={props.onDeleteRjWork}
          onRefetchRjMetadata={props.onRefetchRjMetadata}
          onAddRjWorkTracksToPlaylist={props.onAddRjWorkTracksToPlaylist}
          playlists={props.playlists}
        />,
      )}

      {props.currentPage === 'asmr-lib' && props.asmrDetailId && selectedAsmrWork && (
        <LibraryRouteBoundary
          pageTitle="RJ 详情"
          resetKey={`asmr-detail:${selectedAsmrWork.id}:${selectedAsmrWork.addedAt ?? ''}`}
        >
          <div className="yk-library-page" data-library-page="asmr-detail" data-u37a-library-page="ready">
            <AsmrDetail
              rjWork={selectedAsmrWork}
              onBack={() => props.setAsmrDetailId(null)}
              onPlayTrack={props.onPlayTrack}
              onAddToQueue={props.onAddToQueue}
              favorites={props.favorites}
              toggleFavorite={props.toggleFavorite}
              onUpdateRjWork={props.onUpdateRjWork}
              onClearRjWorkOverride={props.onClearRjWorkOverride}
              onExplore={(query) => {
                props.setSearchQuery(query);
                props.setAsmrDetailId(null);
                props.setCurrentPage('asmr-lib');
              }}
            />
          </div>
        </LibraryRouteBoundary>
      )}

      {props.currentPage === 'asmr-lib' && props.asmrDetailId && !selectedAsmrWork && (
        <div className="yk-library-page yk-library-page-state" data-library-page="asmr-detail" data-u37a-library-page="missing-selection">
          <Surface className="yk-library-page-state__surface" padding="lg" elevation="raised">
            <Feedback
              tone="warning"
              title="找不到该音声作品"
              description="作品可能已从 Index 移除、重新扫描后 ID 发生变化，或当前详情链接已经失效。"
              action={(
                <Button variant="primary" onClick={() => props.setAsmrDetailId(null)}>
                  返回音声库
                </Button>
              )}
            />
          </Surface>
        </div>
      )}

      {props.currentPage === 'music-lib' && renderLibraryPage(
        'music',
        '音乐库',
        props.musicAlbums.reduce((count, album) => count + album.tracks.length, 0),
        <MusicLibrary
          albums={props.musicAlbums}
          onPlayTrack={props.onPlayTrack}
          onAddToQueue={props.onAddToQueue}
          favorites={props.favorites}
          toggleFavorite={props.toggleFavorite}
          searchQuery={props.searchQuery}
          onUpdateMusicAlbum={props.onUpdateMusicAlbum}
          onUpdateMusicTrack={props.onUpdateMusicTrack}
          onClearMusicAlbumOverride={props.onClearMusicAlbumOverride}
          onClearMusicTrackOverride={props.onClearMusicTrackOverride}
          onMetadataStoreChanged={props.onMetadataStoreChanged}
        />,
        props.musicAlbums.length.toString(),
      )}

      {props.currentPage === 'playlists' && (
        <PlaylistPage
          playlists={props.playlists}
          activePlaylistId={props.playlistDetailId}
          setPlaylistDetailId={props.setPlaylistDetailId}
          onPlayTrack={props.onPlayTrack}
          onAddToQueue={props.onAddToQueue}
          favorites={props.favorites}
          toggleFavorite={props.toggleFavorite}
          searchQuery={props.searchQuery}
          onCreatePlaylist={props.onCreatePlaylist}
          onDeletePlaylist={props.onDeletePlaylist}
          onRemoveTrackFromPlaylist={props.onRemoveTrackFromPlaylist}
        />
      )}

      {props.currentPage === 'importer' && <ImporterPage />}

      {props.currentPage === 'downloader' && <DownloaderPage onPlayTrack={props.onPlayTrack} />}

      {props.currentPage === 'settings' && (
        <SettingsPage settings={props.settings} updateSettings={props.updateSettings} />
      )}

      {props.currentPage === 'diagnostics' && (
        <DiagnosticsRuntimeBoundary resetKey={`diagnostics-shell-${props.rjWorks.length}-${props.musicAlbums.length}-${props.scanStatus}`}>
          <DiagnosticsPageShell
            onScanLibrary={props.onScanLibrary}
            scanStatus={props.scanStatus}
            rjWorks={props.rjWorks}
            setRjWorks={props.setRjWorks}
            musicAlbums={props.musicAlbums}
            setMusicAlbums={props.setMusicAlbums}
            setAsmrDetailId={props.setAsmrDetailId}
            onRefetchRjMetadata={props.onRefetchRjMetadata}
          />
        </DiagnosticsRuntimeBoundary>
      )}
    </Suspense>
  );
}
