import type { AudioTrack, LocalJsonIndex, MusicAlbum, Playlist, RJWork } from '../types';
import { libraryIndexNormalizationService } from './libraryIndexNormalizationService';

const QUEUE_KEY = 'yang_kura_player_queue_v1';
const HISTORY_KEY = 'yang_kura_playback_history_v1';
const PLAYLIST_KEY = 'yang_kura_user_playlists_v1';
const LEGACY_PLAYLIST_KEY = 'sqlite_playlists';
const RJ_WORKS_KEY = 'sqlite_rj_works';
const MUSIC_ALBUMS_KEY = 'sqlite_music_albums';
const FAVORITES_KEY = 'sqlite_favorites';
const INDEX_RESULT_KEY = 'yang_kura_last_read_library_index_result';
const SESSION_KEY = 'yang_kura_library_session_v1';
const ROOT_KEYS = ['yang_kura_u28_authorized_roots_v1', 'yang_kura_persisted_authorized_roots_v1'];
const LAST_TRACK_KEYS = ['last_played_track_json', 'last_played_track_id', 'last_played_track_progress'];
const FIXTURE_PATTERN = /(?:^|[\s_-])(u28|u29|u30|u31|u32|u39|u40b|u40-b)(?:[\s_-]|$)/i;
const FIXTURE_TEXT_PATTERN = /(?:U28|U29|U30|U31|U32|U39|U40-B|E2E|fixture|自动验收)/i;

export interface AutomationProfileCleanupReport {
  removedQueueTracks: number;
  removedHistoryEntries: number;
  removedPlaylistTracks: number;
  removedWorks: number;
  removedAlbums: number;
  normalizedCachedIndex: boolean;
}

function parseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function isFixtureText(value: unknown): boolean {
  return typeof value === 'string' && (FIXTURE_PATTERN.test(value) || FIXTURE_TEXT_PATTERN.test(value));
}

function isFixtureTrack(track: Partial<AudioTrack> | null | undefined): boolean {
  return Boolean(track && (isFixtureText(track.id) || isFixtureText(track.title) || isFixtureText(track.album) || isFixtureText(track.artist)));
}

function writeOrRemove(key: string, value: unknown, shouldRemove = false): void {
  if (shouldRemove) localStorage.removeItem(key);
  else localStorage.setItem(key, JSON.stringify(value));
}

function cleanQueue(report: AutomationProfileCleanupReport): void {
  const snapshot = parseJson<{ queue?: AudioTrack[]; currentTrackId?: string | null; currentIndex?: number }>(localStorage.getItem(QUEUE_KEY));
  if (!snapshot || !Array.isArray(snapshot.queue)) return;
  const queue = snapshot.queue.filter((track) => !isFixtureTrack(track));
  report.removedQueueTracks += snapshot.queue.length - queue.length;
  if (queue.length === 0) {
    localStorage.removeItem(QUEUE_KEY);
    return;
  }
  const currentIndex = Math.max(0, Math.min(queue.length - 1, queue.findIndex((track) => track.id === snapshot.currentTrackId)));
  writeOrRemove(QUEUE_KEY, { ...snapshot, queue, currentIndex, currentTrackId: queue[currentIndex]?.id ?? null });
}

function cleanHistory(report: AutomationProfileCleanupReport): void {
  const entries = parseJson<Array<{ trackId?: string; title?: string; track?: AudioTrack }>>(localStorage.getItem(HISTORY_KEY));
  if (!Array.isArray(entries)) return;
  const next = entries.filter((entry) => !isFixtureText(entry.trackId) && !isFixtureText(entry.title) && !isFixtureTrack(entry.track));
  report.removedHistoryEntries += entries.length - next.length;
  writeOrRemove(HISTORY_KEY, next, next.length === 0);
}

function cleanPlaylists(report: AutomationProfileCleanupReport): void {
  const clean = (key: string, wrapped: boolean) => {
    const parsed = parseJson<{ playlists?: Playlist[] } | Playlist[]>(localStorage.getItem(key));
    const playlists = Array.isArray(parsed) ? parsed : parsed?.playlists;
    if (!Array.isArray(playlists)) return;
    let removed = 0;
    const next = playlists
      .filter((playlist) => !isFixtureText(playlist.id) && !isFixtureText(playlist.name))
      .map((playlist) => {
        const tracks = (playlist.tracks ?? []).filter((track) => !isFixtureTrack(track));
        removed += (playlist.tracks?.length ?? 0) - tracks.length;
        return { ...playlist, tracks, tracksCount: tracks.length };
      });
    report.removedPlaylistTracks += removed;
    writeOrRemove(key, wrapped ? { ...(Array.isArray(parsed) ? {} : parsed), playlists: next } : next, next.length === 0);
  };
  clean(PLAYLIST_KEY, true);
  clean(LEGACY_PLAYLIST_KEY, false);
}

function cleanLibraryData(report: AutomationProfileCleanupReport): void {
  const works = parseJson<RJWork[]>(localStorage.getItem(RJ_WORKS_KEY));
  if (Array.isArray(works)) {
    const next = works.filter((work) => !isFixtureText(work.id) && !isFixtureText(work.title));
    report.removedWorks += works.length - next.length;
    writeOrRemove(RJ_WORKS_KEY, next, next.length === 0);
  }
  const albums = parseJson<MusicAlbum[]>(localStorage.getItem(MUSIC_ALBUMS_KEY));
  if (Array.isArray(albums)) {
    const next = albums.filter((album) => !isFixtureText(album.id) && !isFixtureText(album.title));
    report.removedAlbums += albums.length - next.length;
    writeOrRemove(MUSIC_ALBUMS_KEY, next, next.length === 0);
  }
  const favorites = parseJson<string[]>(localStorage.getItem(FAVORITES_KEY));
  if (Array.isArray(favorites)) {
    const next = favorites.filter((id) => !isFixtureText(id));
    writeOrRemove(FAVORITES_KEY, next, next.length === 0);
  }
}

function cleanRootSessions(): void {
  for (const key of ROOT_KEYS) {
    const storage = key.includes('u28') ? sessionStorage : localStorage;
    const roots = parseJson<Record<string, { displayName?: string; rootPathToken?: string }>>(storage.getItem(key));
    if (!roots) continue;
    const next = Object.fromEntries(Object.entries(roots).filter(([, root]) => !isFixtureText(root.displayName) && !isFixtureText(root.rootPathToken)));
    if (Object.keys(next).length === 0) storage.removeItem(key);
    else storage.setItem(key, JSON.stringify(next));
  }
}

function normalizeCachedIndex(report: AutomationProfileCleanupReport): void {
  const result = parseJson<YangKuraReadLibraryIndexResult>(localStorage.getItem(INDEX_RESULT_KEY));
  if (!result?.ok) return;
  const index = result.index as LocalJsonIndex;
  const fixtureOnly = index.tracks.length > 0 && index.tracks.every((track) => isFixtureText(track.id) || isFixtureText(track.title));
  if (fixtureOnly || isFixtureText(result.displayName)) {
    localStorage.removeItem(INDEX_RESULT_KEY);
    return;
  }
  const normalized = libraryIndexNormalizationService.normalize(index);
  if (normalized !== index) {
    const next: YangKuraReadLibraryIndexSuccessResult = {
      ...result,
      index: normalized,
      summary: {
        ...result.summary,
        collectionCount: normalized.collections.length,
        trackCount: normalized.tracks.length,
        warningCount: normalized.warnings.length,
      },
    };
    localStorage.setItem(INDEX_RESULT_KEY, JSON.stringify(next));
    report.normalizedCachedIndex = true;
  }
}

function cleanSessionSnapshot(): void {
  const snapshot = parseJson<Record<string, unknown>>(localStorage.getItem(SESSION_KEY));
  if (!snapshot) return;
  const selectedRoots = (snapshot.selectedRoots && typeof snapshot.selectedRoots === 'object')
    ? snapshot.selectedRoots as Record<string, { displayName?: string }>
    : {};
  const nextRoots = Object.fromEntries(Object.entries(selectedRoots).filter(([, root]) => !isFixtureText(root.displayName)));
  const lastIndex = snapshot.lastIndex as { displayName?: string } | undefined;
  const lastReadAttempt = snapshot.lastReadAttempt as { displayName?: string; message?: string } | undefined;
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    ...snapshot,
    selectedRoots: nextRoots,
    lastIndex: lastIndex && !isFixtureText(lastIndex.displayName) ? lastIndex : undefined,
    lastReadAttempt: lastReadAttempt && !isFixtureText(lastReadAttempt.displayName) && !isFixtureText(lastReadAttempt.message) ? lastReadAttempt : undefined,
  }));
}

export const automationProfileCleanupService = {
  run(automationProfile: boolean): AutomationProfileCleanupReport {
    const report: AutomationProfileCleanupReport = {
      removedQueueTracks: 0,
      removedHistoryEntries: 0,
      removedPlaylistTracks: 0,
      removedWorks: 0,
      removedAlbums: 0,
      normalizedCachedIndex: false,
    };
    if (typeof localStorage === 'undefined' || automationProfile) return report;
    cleanQueue(report);
    cleanHistory(report);
    cleanPlaylists(report);
    cleanLibraryData(report);
    cleanRootSessions();
    normalizeCachedIndex(report);
    cleanSessionSnapshot();
    LAST_TRACK_KEYS.forEach((key) => {
      const value = localStorage.getItem(key);
      if (isFixtureText(value)) localStorage.removeItem(key);
    });
    return report;
  },
};
