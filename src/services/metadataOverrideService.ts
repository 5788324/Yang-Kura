import type { AudioTrack, MusicAlbum, RJWork } from '../types';

export type MetadataOverrideVersion = 1;
export type PersonalListeningStatus = 'unheard' | 'listening' | 'completed' | 'abandoned';

export interface AsmrMetadataOverride {
  workId: string;
  title?: string;
  circle?: string;
  cvs?: string[];
  releaseDate?: string;
  description?: string;
  tags?: string[];
  rating?: number;
  personalStatus?: PersonalListeningStatus;
  personalNotes?: string;
  updatedAt: string;
}

export interface MusicAlbumMetadataOverride {
  albumId: string;
  title?: string;
  artist?: string;
  releaseYear?: string;
  genre?: string;
  updatedAt: string;
}

export interface TrackMetadataOverride {
  trackId: string;
  title?: string;
  artist?: string;
  album?: string;
  updatedAt: string;
}

export interface MetadataOverrideStoreV1 {
  version: MetadataOverrideVersion;
  updatedAt: string;
  asmrWorks: Record<string, AsmrMetadataOverride>;
  musicAlbums: Record<string, MusicAlbumMetadataOverride>;
  tracks: Record<string, TrackMetadataOverride>;
}

export interface MetadataOverrideSummary {
  asmrWorks: number;
  musicAlbums: number;
  tracks: number;
  totalRecords: number;
  totalFields: number;
}

export interface MetadataOverrideImportPreview {
  ok: boolean;
  mode: 'replace' | 'merge';
  message: string;
  currentSummary: MetadataOverrideSummary;
  incomingSummary: MetadataOverrideSummary;
  resultingSummary: MetadataOverrideSummary;
}

export interface MetadataOverrideImportResult {
  ok: boolean;
  mode: 'replace' | 'merge';
  message: string;
  summary: MetadataOverrideSummary;
}

export type AsmrMetadataOverridePatch = Omit<Partial<AsmrMetadataOverride>, 'workId' | 'updatedAt'>;
export type MusicAlbumMetadataOverridePatch = Omit<Partial<MusicAlbumMetadataOverride>, 'albumId' | 'updatedAt'>;
export type TrackMetadataOverridePatch = Omit<Partial<TrackMetadataOverride>, 'trackId' | 'updatedAt'>;

const STORAGE_KEY = 'yang_kura_metadata_overrides_v1';
const UPDATE_EVENT = 'yang-kura-metadata-overrides-updated';

const emptyStore = (): MetadataOverrideStoreV1 => ({
  version: 1,
  updatedAt: new Date(0).toISOString(),
  asmrWorks: {},
  musicAlbums: {},
  tracks: {},
});

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
const cleanText = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};
const cleanTextArray = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const items = [...new Set(value.map(cleanText).filter((item): item is string => Boolean(item)))];
  return items.length > 0 ? items : [];
};
const cleanRating = (value: unknown): number | undefined => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return Math.min(5, Math.max(0, Math.round(value)));
};
const cleanStatus = (value: unknown): PersonalListeningStatus | undefined => {
  return value === 'unheard' || value === 'listening' || value === 'completed' || value === 'abandoned'
    ? value
    : undefined;
};

const sanitizeStore = (value: unknown): MetadataOverrideStoreV1 => {
  if (!value || typeof value !== 'object') return emptyStore();
  const source = value as Partial<MetadataOverrideStoreV1>;
  const store = emptyStore();
  store.updatedAt = cleanText(source.updatedAt) ?? store.updatedAt;

  if (source.asmrWorks && typeof source.asmrWorks === 'object') {
    for (const [workId, raw] of Object.entries(source.asmrWorks)) {
      if (!raw || typeof raw !== 'object') continue;
      const item = raw as Partial<AsmrMetadataOverride>;
      const safeId = cleanText(workId);
      if (!safeId) continue;
      store.asmrWorks[safeId] = {
        workId: safeId,
        ...(cleanText(item.title) ? { title: cleanText(item.title) } : {}),
        ...(cleanText(item.circle) ? { circle: cleanText(item.circle) } : {}),
        ...(cleanTextArray(item.cvs) !== undefined ? { cvs: cleanTextArray(item.cvs) } : {}),
        ...(cleanText(item.releaseDate) ? { releaseDate: cleanText(item.releaseDate) } : {}),
        ...(typeof item.description === 'string' ? { description: item.description.trim() } : {}),
        ...(cleanTextArray(item.tags) !== undefined ? { tags: cleanTextArray(item.tags) } : {}),
        ...(cleanRating(item.rating) !== undefined ? { rating: cleanRating(item.rating) } : {}),
        ...(cleanStatus(item.personalStatus) ? { personalStatus: cleanStatus(item.personalStatus) } : {}),
        ...(typeof item.personalNotes === 'string' ? { personalNotes: item.personalNotes.trim() } : {}),
        updatedAt: cleanText(item.updatedAt) ?? new Date().toISOString(),
      };
    }
  }

  if (source.musicAlbums && typeof source.musicAlbums === 'object') {
    for (const [albumId, raw] of Object.entries(source.musicAlbums)) {
      if (!raw || typeof raw !== 'object') continue;
      const item = raw as Partial<MusicAlbumMetadataOverride>;
      const safeId = cleanText(albumId);
      if (!safeId) continue;
      store.musicAlbums[safeId] = {
        albumId: safeId,
        ...(cleanText(item.title) ? { title: cleanText(item.title) } : {}),
        ...(cleanText(item.artist) ? { artist: cleanText(item.artist) } : {}),
        ...(cleanText(item.releaseYear) ? { releaseYear: cleanText(item.releaseYear) } : {}),
        ...(cleanText(item.genre) ? { genre: cleanText(item.genre) } : {}),
        updatedAt: cleanText(item.updatedAt) ?? new Date().toISOString(),
      };
    }
  }

  if (source.tracks && typeof source.tracks === 'object') {
    for (const [trackId, raw] of Object.entries(source.tracks)) {
      if (!raw || typeof raw !== 'object') continue;
      const item = raw as Partial<TrackMetadataOverride>;
      const safeId = cleanText(trackId);
      if (!safeId) continue;
      store.tracks[safeId] = {
        trackId: safeId,
        ...(cleanText(item.title) ? { title: cleanText(item.title) } : {}),
        ...(cleanText(item.artist) ? { artist: cleanText(item.artist) } : {}),
        ...(cleanText(item.album) ? { album: cleanText(item.album) } : {}),
        updatedAt: cleanText(item.updatedAt) ?? new Date().toISOString(),
      };
    }
  }

  return store;
};

const persist = (store: MetadataOverrideStoreV1): MetadataOverrideStoreV1 => {
  const safe = sanitizeStore(store);
  safe.updatedAt = new Date().toISOString();
  if (canUseStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: { updatedAt: safe.updatedAt } }));
  }
  return safe;
};

const shallowArrayEqual = (a: string[] = [], b: string[] = []) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

const countOverrideFields = (record: Record<string, unknown>, identityKeys: string[]) =>
  Object.keys(record).filter((key) => !identityKeys.includes(key) && key !== 'updatedAt').length;

const summaryOf = (store: MetadataOverrideStoreV1): MetadataOverrideSummary => {
  const asmrWorks = Object.keys(store.asmrWorks).length;
  const musicAlbums = Object.keys(store.musicAlbums).length;
  const tracks = Object.keys(store.tracks).length;
  const totalFields = [
    ...Object.values(store.asmrWorks).map((item) => countOverrideFields(item as unknown as Record<string, unknown>, ['workId'])),
    ...Object.values(store.musicAlbums).map((item) => countOverrideFields(item as unknown as Record<string, unknown>, ['albumId'])),
    ...Object.values(store.tracks).map((item) => countOverrideFields(item as unknown as Record<string, unknown>, ['trackId'])),
  ].reduce((sum, count) => sum + count, 0);
  return { asmrWorks, musicAlbums, tracks, totalRecords: asmrWorks + musicAlbums + tracks, totalFields };
};

const combineStores = (
  current: MetadataOverrideStoreV1,
  incoming: MetadataOverrideStoreV1,
  mode: 'replace' | 'merge',
) => mode === 'merge'
  ? sanitizeStore({
      ...current,
      asmrWorks: { ...current.asmrWorks, ...incoming.asmrWorks },
      musicAlbums: { ...current.musicAlbums, ...incoming.musicAlbums },
      tracks: { ...current.tracks, ...incoming.tracks },
    })
  : incoming;

export const metadataOverrideService = {
  storageKey: STORAGE_KEY,
  updateEventName: UPDATE_EVENT,

  getStore(): MetadataOverrideStoreV1 {
    if (!canUseStorage()) return emptyStore();
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    try {
      return sanitizeStore(JSON.parse(raw));
    } catch {
      return emptyStore();
    }
  },

  getSummary(): MetadataOverrideSummary {
    return summaryOf(this.getStore());
  },

  getAsmrOverrideFieldCount(workId: string): number {
    const item = this.getAsmrOverride(workId);
    return item ? countOverrideFields(item as unknown as Record<string, unknown>, ['workId']) : 0;
  },

  previewImportSnapshot(raw: string, mode: 'replace' | 'merge' = 'replace'): MetadataOverrideImportPreview {
    const current = this.getStore();
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!parsed || typeof parsed !== 'object' || (parsed as { version?: unknown }).version !== 1) {
        return {
          ok: false,
          mode,
          message: '备份格式不受支持，需要 version=1。',
          currentSummary: summaryOf(current),
          incomingSummary: summaryOf(emptyStore()),
          resultingSummary: summaryOf(current),
        };
      }
      const incoming = sanitizeStore(parsed);
      const resulting = combineStores(current, incoming, mode);
      return {
        ok: true,
        mode,
        message: mode === 'merge' ? '可合并这份备份，不会清除现有修改。' : '可用这份备份替换当前全部修改。',
        currentSummary: summaryOf(current),
        incomingSummary: summaryOf(incoming),
        resultingSummary: summaryOf(resulting),
      };
    } catch (error) {
      return {
        ok: false,
        mode,
        message: `无法读取备份：${error instanceof Error ? error.message : String(error)}`,
        currentSummary: summaryOf(current),
        incomingSummary: summaryOf(emptyStore()),
        resultingSummary: summaryOf(current),
      };
    }
  },

  getAsmrOverride(workId: string): AsmrMetadataOverride | undefined {
    return this.getStore().asmrWorks[workId];
  },

  hasAsmrOverride(workId: string): boolean {
    return Boolean(this.getAsmrOverride(workId));
  },

  buildAsmrPatch(before: RJWork, after: RJWork): AsmrMetadataOverridePatch {
    const patch: AsmrMetadataOverridePatch = {};
    if (before.title !== after.title) patch.title = after.title;
    if (before.circle !== after.circle) patch.circle = after.circle;
    if (!shallowArrayEqual(before.cvs, after.cvs)) patch.cvs = after.cvs;
    if (before.releaseDate !== after.releaseDate) patch.releaseDate = after.releaseDate;
    if (before.description !== after.description) patch.description = after.description;
    if (!shallowArrayEqual(before.tags, after.tags)) patch.tags = after.tags;
    if (before.rating !== after.rating && after.rating !== undefined) patch.rating = after.rating;
    if (before.personalStatus !== after.personalStatus && after.personalStatus !== undefined) patch.personalStatus = after.personalStatus;
    if (before.personalNotes !== after.personalNotes && after.personalNotes !== undefined) patch.personalNotes = after.personalNotes;
    return patch;
  },

  upsertAsmrOverride(workId: string, patch: AsmrMetadataOverridePatch): AsmrMetadataOverride | undefined {
    const safeId = cleanText(workId);
    if (!safeId || Object.keys(patch).length === 0) return this.getAsmrOverride(workId);
    const store = this.getStore();
    const previous = store.asmrWorks[safeId];
    const merged = sanitizeStore({
      ...store,
      asmrWorks: {
        ...store.asmrWorks,
        [safeId]: { ...previous, ...patch, workId: safeId, updatedAt: new Date().toISOString() },
      },
    });
    return persist(merged).asmrWorks[safeId];
  },

  clearAsmrOverride(workId: string): boolean {
    const store = this.getStore();
    if (!store.asmrWorks[workId]) return false;
    const next = { ...store.asmrWorks };
    delete next[workId];
    persist({ ...store, asmrWorks: next });
    return true;
  },

  applyAsmrOverride(work: RJWork): RJWork {
    const override = this.getAsmrOverride(work.id);
    if (!override) return work;
    return {
      ...work,
      ...(override.title !== undefined ? { title: override.title } : {}),
      ...(override.circle !== undefined ? { circle: override.circle } : {}),
      ...(override.cvs !== undefined ? { cvs: override.cvs } : {}),
      ...(override.releaseDate !== undefined ? { releaseDate: override.releaseDate } : {}),
      ...(override.description !== undefined ? { description: override.description } : {}),
      ...(override.tags !== undefined ? { tags: override.tags } : {}),
      ...(override.rating !== undefined ? { rating: override.rating } : {}),
      ...(override.personalStatus !== undefined ? { personalStatus: override.personalStatus } : {}),
      ...(override.personalNotes !== undefined ? { personalNotes: override.personalNotes } : {}),
    };
  },

  applyAsmrOverrides(works: RJWork[]): RJWork[] {
    const store = this.getStore();
    return works.map((work) => {
      const override = store.asmrWorks[work.id];
      if (!override) return work;
      return {
        ...work,
        ...(override.title !== undefined ? { title: override.title } : {}),
        ...(override.circle !== undefined ? { circle: override.circle } : {}),
        ...(override.cvs !== undefined ? { cvs: override.cvs } : {}),
        ...(override.releaseDate !== undefined ? { releaseDate: override.releaseDate } : {}),
        ...(override.description !== undefined ? { description: override.description } : {}),
        ...(override.tags !== undefined ? { tags: override.tags } : {}),
        ...(override.rating !== undefined ? { rating: override.rating } : {}),
        ...(override.personalStatus !== undefined ? { personalStatus: override.personalStatus } : {}),
        ...(override.personalNotes !== undefined ? { personalNotes: override.personalNotes } : {}),
      };
    });
  },

  getMusicAlbumOverride(albumId: string): MusicAlbumMetadataOverride | undefined {
    return this.getStore().musicAlbums[albumId];
  },

  hasMusicAlbumOverride(albumId: string): boolean {
    return Boolean(this.getMusicAlbumOverride(albumId));
  },

  buildMusicAlbumPatch(before: MusicAlbum, after: MusicAlbum): MusicAlbumMetadataOverridePatch {
    const patch: MusicAlbumMetadataOverridePatch = {};
    if (before.title !== after.title) patch.title = after.title;
    if (before.artist !== after.artist) patch.artist = after.artist;
    if (before.releaseYear !== after.releaseYear) patch.releaseYear = after.releaseYear;
    if (before.genre !== after.genre) patch.genre = after.genre;
    return patch;
  },

  upsertMusicAlbumOverride(albumId: string, patch: MusicAlbumMetadataOverridePatch): MusicAlbumMetadataOverride | undefined {
    const safeId = cleanText(albumId);
    if (!safeId || Object.keys(patch).length === 0) return this.getMusicAlbumOverride(albumId);
    const store = this.getStore();
    const merged = sanitizeStore({
      ...store,
      musicAlbums: {
        ...store.musicAlbums,
        [safeId]: { ...store.musicAlbums[safeId], ...patch, albumId: safeId, updatedAt: new Date().toISOString() },
      },
    });
    return persist(merged).musicAlbums[safeId];
  },

  clearMusicAlbumOverride(albumId: string): boolean {
    const store = this.getStore();
    if (!store.musicAlbums[albumId]) return false;
    const next = { ...store.musicAlbums };
    delete next[albumId];
    persist({ ...store, musicAlbums: next });
    return true;
  },

  getTrackOverride(trackId: string): TrackMetadataOverride | undefined {
    return this.getStore().tracks[trackId];
  },

  hasTrackOverride(trackId: string): boolean {
    return Boolean(this.getTrackOverride(trackId));
  },

  buildTrackPatch(before: AudioTrack, after: AudioTrack): TrackMetadataOverridePatch {
    const patch: TrackMetadataOverridePatch = {};
    if (before.title !== after.title) patch.title = after.title;
    if (before.artist !== after.artist) patch.artist = after.artist;
    if (before.album !== after.album) patch.album = after.album;
    return patch;
  },

  upsertTrackOverride(trackId: string, patch: TrackMetadataOverridePatch): TrackMetadataOverride | undefined {
    const safeId = cleanText(trackId);
    if (!safeId || Object.keys(patch).length === 0) return this.getTrackOverride(trackId);
    const store = this.getStore();
    const merged = sanitizeStore({
      ...store,
      tracks: {
        ...store.tracks,
        [safeId]: { ...store.tracks[safeId], ...patch, trackId: safeId, updatedAt: new Date().toISOString() },
      },
    });
    return persist(merged).tracks[safeId];
  },

  clearTrackOverride(trackId: string): boolean {
    const store = this.getStore();
    if (!store.tracks[trackId]) return false;
    const next = { ...store.tracks };
    delete next[trackId];
    persist({ ...store, tracks: next });
    return true;
  },

  applyTrackOverride(track: AudioTrack, fallbackAlbumTitle?: string): AudioTrack {
    const override = this.getTrackOverride(track.id);
    return {
      ...track,
      ...(fallbackAlbumTitle ? { album: fallbackAlbumTitle } : {}),
      ...(override?.title !== undefined ? { title: override.title } : {}),
      ...(override?.artist !== undefined ? { artist: override.artist } : {}),
      ...(override?.album !== undefined ? { album: override.album } : {}),
    };
  },

  applyMusicAlbumOverride(album: MusicAlbum): MusicAlbum {
    const store = this.getStore();
    const override = store.musicAlbums[album.id];
    const title = override?.title ?? album.title;
    const artist = override?.artist ?? album.artist;
    return {
      ...album,
      title,
      artist,
      ...(override?.releaseYear !== undefined ? { releaseYear: override.releaseYear } : {}),
      ...(override?.genre !== undefined ? { genre: override.genre } : {}),
      tracks: album.tracks.map((track) => {
        const trackOverride = store.tracks[track.id];
        return {
          ...track,
          album: title,
          ...(track.artist === album.artist ? { artist } : {}),
          ...(trackOverride?.title !== undefined ? { title: trackOverride.title } : {}),
          ...(trackOverride?.artist !== undefined ? { artist: trackOverride.artist } : {}),
          ...(trackOverride?.album !== undefined ? { album: trackOverride.album } : {}),
        };
      }),
    };
  },

  applyMusicAlbumOverrides(albums: MusicAlbum[]): MusicAlbum[] {
    return albums.map((album) => this.applyMusicAlbumOverride(album));
  },

  exportSnapshot(): string {
    return JSON.stringify(this.getStore(), null, 2);
  },

  importSnapshot(raw: string, mode: 'replace' | 'merge' = 'replace'): MetadataOverrideImportResult {
    try {
      const parsed = JSON.parse(raw) as unknown;
      const incoming = sanitizeStore(parsed);
      if (!parsed || typeof parsed !== 'object' || (parsed as { version?: unknown }).version !== 1) {
        return { ok: false, mode, message: '备份格式不受支持，需要 version=1。', summary: summaryOf(this.getStore()) };
      }
      const current = this.getStore();
      const next = combineStores(current, incoming, mode);
      const saved = persist(next);
      return { ok: true, mode, message: '本地元数据备份已恢复。', summary: summaryOf(saved) };
    } catch (error) {
      return {
        ok: false,
        mode,
        message: `无法读取备份：${error instanceof Error ? error.message : String(error)}`,
        summary: summaryOf(this.getStore()),
      };
    }
  },

  clearAll(): void {
    persist(emptyStore());
  },
};
