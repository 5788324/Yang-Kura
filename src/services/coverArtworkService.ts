import type { CoverSource, LibraryCollection, Playlist, AudioTrack } from '../types';

export type CoverArtworkFallbackKind = 'asmr' | 'music' | 'playlist' | 'track';

const TOKENIZED_COVER_PROTOCOL = 'yang-kura-media://cover/';
const TOKENIZED_TRACK_PROTOCOL = 'yang-kura-media://track/';

const sanitizeSvgText = (value: string, fallback: string): string => {
  const cleaned = String(value || fallback).replace(/[<>&"']/g, '').trim();
  return cleaned.slice(0, 24) || fallback;
};

const hueFor = (seed: string, fallbackHue: number): number => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = ((hash << 5) - hash + seed.charCodeAt(index)) | 0;
  }
  return Math.abs(hash || fallbackHue) % 360;
};

export const coverArtworkService = {
  storageSafeProtocolNotes: [
    'MVP-37 uses yang-kura-media://cover/<rootPathToken>/<relativePath> for local cover previews.',
    'Renderer still never receives absolutePath or file://.',
    'Generated fallback covers are data:image/svg+xml URLs and do not touch disk.',
  ],

  isTokenizedCoverUrl(value?: string): boolean {
    return typeof value === 'string' && value.startsWith(TOKENIZED_COVER_PROTOCOL);
  },

  isTokenizedMediaUrl(value?: string): boolean {
    return typeof value === 'string' && (value.startsWith(TOKENIZED_COVER_PROTOCOL) || value.startsWith(TOKENIZED_TRACK_PROTOCOL));
  },

  normalizeRelativeCoverPath(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined;
    const normalized = value.replace(/\\/g, '/').replace(/^\/+/, '').trim();
    if (!normalized) return undefined;
    if (normalized.includes('\0') || normalized.includes('file://')) return undefined;
    if (/^[A-Za-z]:[\\/]/.test(normalized)) return undefined;
    if (normalized.startsWith('/') || normalized.startsWith('\\')) return undefined;
    const parts = normalized.split('/').filter(Boolean);
    if (parts.length === 0 || parts.some((part) => part === '..' || part === '.')) return undefined;
    return parts.join('/');
  },

  buildTokenizedCoverUrl(rootPathToken: string, relativePath: string): string | undefined {
    const normalized = this.normalizeRelativeCoverPath(relativePath);
    if (!rootPathToken || !normalized) return undefined;
    return `${TOKENIZED_COVER_PROTOCOL}${encodeURIComponent(rootPathToken)}/${encodeURIComponent(normalized)}`;
  },

  makeFallbackCover(title: string, subtitle: string, kind: CoverArtworkFallbackKind = 'track'): string {
    const safeTitle = sanitizeSvgText(title, 'Yang-Kura');
    const safeSubtitle = sanitizeSvgText(subtitle, '本地媒体库');
    const baseHue = kind === 'asmr' ? 315 : kind === 'music' ? 215 : kind === 'playlist' ? 265 : 190;
    const hue = hueFor(`${kind}:${safeTitle}:${safeSubtitle}`, baseHue);
    const accentHue = (hue + 54) % 360;
    const icon = kind === 'asmr' ? 'RJ' : kind === 'music' ? '♫' : kind === 'playlist' ? 'PL' : '♪';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},72%,34%)"/><stop offset=".56" stop-color="hsl(${accentHue},70%,22%)"/><stop offset="1" stop-color="hsl(${(hue + 105) % 360},62%,12%)"/></linearGradient><radialGradient id="r" cx="72%" cy="20%" r="65%"><stop offset="0" stop-color="rgba(255,255,255,.28)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient></defs><rect width="512" height="512" rx="76" fill="url(#g)"/><rect width="512" height="512" rx="76" fill="url(#r)"/><circle cx="382" cy="142" r="110" fill="rgba(255,255,255,.10)"/><circle cx="150" cy="370" r="142" fill="rgba(0,0,0,.18)"/><text x="46" y="112" font-family="Arial, 'Microsoft YaHei', sans-serif" font-size="44" font-weight="800" fill="rgba(255,255,255,.85)">${icon}</text><text x="46" y="300" font-family="Arial, 'Microsoft YaHei', sans-serif" font-size="38" font-weight="800" fill="white">${safeTitle}</text><text x="48" y="350" font-family="Arial, 'Microsoft YaHei', sans-serif" font-size="22" font-weight="600" fill="rgba(255,255,255,.72)">${safeSubtitle}</text><text x="48" y="410" font-family="Arial, 'Microsoft YaHei', sans-serif" font-size="18" fill="rgba(255,255,255,.52)">本地封面占位</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  },

  resolveCollectionCoverUrl(collection: LibraryCollection, rootPathToken: string | undefined, index: number): string {
    if (collection.cover?.url) return collection.cover.url;
    const localCover = collection.cover?.sourceKind === 'local-file'
      ? this.buildTokenizedCoverUrl(rootPathToken || '', collection.cover.relativePath || '')
      : undefined;
    if (localCover) return localCover;
    const kind: CoverArtworkFallbackKind = collection.collectionType === 'rj_work' ? 'asmr' : 'music';
    return this.makeFallbackCover(
      collection.title || collection.codeNorm || `Collection ${index + 1}`,
      collection.codeNorm || collection.artist || collection.circle || '本地索引',
      kind,
    );
  },

  resolveTrackCoverUrl(track: AudioTrack, fallbackKind: CoverArtworkFallbackKind = 'track'): string {
    if (track.coverUrl && !this.isTokenizedMediaUrl(track.coverUrl)) return track.coverUrl;
    return track.coverUrl || this.makeFallbackCover(track.title, track.artist || track.album, fallbackKind);
  },

  buildPlaylistCoverUrl(playlist: Pick<Playlist, 'name' | 'coverUrl' | 'tracks'>): string {
    if (playlist.coverUrl && !this.isTokenizedMediaUrl(playlist.coverUrl)) return playlist.coverUrl;
    const firstTrackCover = playlist.tracks.find((track) => track.coverUrl && !this.isTokenizedMediaUrl(track.coverUrl))?.coverUrl;
    if (firstTrackCover) return firstTrackCover;
    return this.makeFallbackCover(playlist.name, `${playlist.tracks.length} 首音轨`, 'playlist');
  },
};
