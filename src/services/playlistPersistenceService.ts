import type { AudioTrack, Playlist } from '../types';
import { sanitizePersistedPlayerTrack } from '../player/playerRuntimePolicy';
import { coverArtworkService } from './coverArtworkService';

const STORAGE_KEY = 'yang_kura_user_playlists_v1';
const LEGACY_STORAGE_KEY = 'sqlite_playlists';
const UPDATE_EVENT_NAME = 'yang-kura-playlists-updated';
const VERSION = 1 as const;
const MAX_USER_PLAYLISTS = 200;
const MAX_TRACKS_PER_PLAYLIST = 1000;

export type PersistedPlaylistSourceKind = 'user-local' | 'demo-user';

export interface PersistedPlaylistSnapshot {
  version: typeof VERSION;
  updatedAt: string;
  playlists: Playlist[];
}

export interface PlaylistPersistenceSummary {
  storageKey: string;
  userPlaylistCount: number;
  totalUserTracks: number;
  updatedAt?: string;
}

function emitUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(UPDATE_EVENT_NAME));
}

function stableUniqueTracks(tracks: AudioTrack[]): AudioTrack[] {
  const seen = new Set<string>();
  const result: AudioTrack[] = [];
  for (const track of tracks) {
    if (!track || typeof track.id !== 'string' || seen.has(track.id)) continue;
    seen.add(track.id);
    result.push(sanitizePlaylistTrack(track));
    if (result.length >= MAX_TRACKS_PER_PLAYLIST) break;
  }
  return result;
}

function sanitizePlaylistTrack(track: AudioTrack): AudioTrack {
  return sanitizePersistedPlayerTrack(track);
}

function sanitizeUserPlaylist(playlist: Playlist): Playlist | null {
  if (!playlist || typeof playlist.id !== 'string' || typeof playlist.name !== 'string') return null;
  if (playlist.isSystem) return null;
  const tracks = stableUniqueTracks(Array.isArray(playlist.tracks) ? playlist.tracks : []);
  return {
    ...playlist,
    id: playlist.id.trim(),
    name: playlist.name.trim() || '未命名歌单',
    description: typeof playlist.description === 'string' ? playlist.description : '',
    coverUrl: typeof playlist.coverUrl === 'string' ? playlist.coverUrl : '',
    creator: playlist.creator || '本地用户',
    isSystem: false,
    sourceKind: playlist.sourceKind === 'demo-user' ? 'demo-user' : 'user-local',
    tracks,
    tracksCount: tracks.length,
    updatedAt: new Date().toISOString(),
  } as Playlist;
}

function parseSnapshot(raw: string | null): PersistedPlaylistSnapshot | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<PersistedPlaylistSnapshot>;
    if (parsed.version !== VERSION || !Array.isArray(parsed.playlists)) return null;
    const playlists = parsed.playlists
      .map((playlist) => sanitizeUserPlaylist(playlist as Playlist))
      .filter((playlist): playlist is Playlist => Boolean(playlist))
      .slice(0, MAX_USER_PLAYLISTS);
    return {
      version: VERSION,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date(0).toISOString(),
      playlists,
    };
  } catch {
    return null;
  }
}

function loadLegacyUserPlaylists(): Playlist[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Playlist[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((playlist) => sanitizeUserPlaylist(playlist))
      .filter((playlist): playlist is Playlist => Boolean(playlist));
  } catch {
    return [];
  }
}

function getSystemPlaylists(defaultPlaylists: Playlist[]): Playlist[] {
  return defaultPlaylists
    .filter((playlist) => playlist.isSystem)
    .map((playlist) => ({ ...playlist, sourceKind: playlist.sourceKind ?? 'system-demo' }));
}

function getDefaultUserPlaylists(defaultPlaylists: Playlist[]): Playlist[] {
  return defaultPlaylists
    .filter((playlist) => !playlist.isSystem)
    .map((playlist) => sanitizeUserPlaylist({ ...playlist, sourceKind: playlist.sourceKind ?? 'demo-user' } as Playlist))
    .filter((playlist): playlist is Playlist => Boolean(playlist));
}

function mergeSystemAndUserPlaylists(systemPlaylists: Playlist[], userPlaylists: Playlist[]): Playlist[] {
  const systemIds = new Set(systemPlaylists.map((playlist) => playlist.id));
  const dedupedUsers = userPlaylists.filter((playlist) => !systemIds.has(playlist.id));
  return [...systemPlaylists, ...dedupedUsers];
}

export const playlistPersistenceService = {
  storageKey: STORAGE_KEY,
  legacyStorageKey: LEGACY_STORAGE_KEY,
  updateEventName: UPDATE_EVENT_NAME,

  loadSnapshot(): PersistedPlaylistSnapshot | null {
    if (typeof localStorage === 'undefined') return null;
    return parseSnapshot(localStorage.getItem(STORAGE_KEY));
  },

  saveUserPlaylists(playlists: Playlist[]): PersistedPlaylistSnapshot {
    const sanitized = playlists
      .map((playlist) => sanitizeUserPlaylist(playlist))
      .filter((playlist): playlist is Playlist => Boolean(playlist))
      .slice(0, MAX_USER_PLAYLISTS);
    const snapshot: PersistedPlaylistSnapshot = {
      version: VERSION,
      updatedAt: new Date().toISOString(),
      playlists: sanitized,
    };
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
        emitUpdated();
      } catch {
        // Playlist UX must remain usable if localStorage is unavailable or full.
      }
    }
    return snapshot;
  },

  saveFromMergedPlaylists(playlists: Playlist[]): PersistedPlaylistSnapshot {
    return this.saveUserPlaylists(playlists.filter((playlist) => !playlist.isSystem));
  },

  hydrateInitialPlaylists(defaultPlaylists: Playlist[]): Playlist[] {
    const systemPlaylists = getSystemPlaylists(defaultPlaylists);
    const stored = this.loadSnapshot();
    if (stored && stored.playlists.length > 0) {
      return mergeSystemAndUserPlaylists(systemPlaylists, stored.playlists);
    }

    const legacy = loadLegacyUserPlaylists();
    if (legacy.length > 0) {
      this.saveUserPlaylists(legacy);
      return mergeSystemAndUserPlaylists(systemPlaylists, legacy);
    }

    const seededUsers = getDefaultUserPlaylists(defaultPlaylists);
    this.saveUserPlaylists(seededUsers);
    return mergeSystemAndUserPlaylists(systemPlaylists, seededUsers);
  },

  createUserPlaylist(name: string, description = ''): Playlist {
    const now = new Date().toISOString();
    return {
      id: `playlist_user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim() || '未命名歌单',
      description: description.trim() || '本地自建歌单，可混合收藏 ASMR 音轨和普通音乐。',
      coverUrl: coverArtworkService.makeFallbackCover(name.trim() || '未命名歌单', '本地自建歌单', 'playlist'),
      creator: '本地用户',
      tracksCount: 0,
      tracks: [],
      isSystem: false,
      sourceKind: 'user-local',
      createdAt: now,
      updatedAt: now,
    };
  },

  getSummary(snapshot: PersistedPlaylistSnapshot | null = this.loadSnapshot()): PlaylistPersistenceSummary {
    const playlists = snapshot?.playlists ?? [];
    return {
      storageKey: STORAGE_KEY,
      userPlaylistCount: playlists.length,
      totalUserTracks: playlists.reduce((sum, playlist) => sum + playlist.tracks.length, 0),
      updatedAt: snapshot?.updatedAt,
    };
  },
};
