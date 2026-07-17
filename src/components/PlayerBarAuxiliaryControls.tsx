import type { ChangeEvent } from 'react';
import { FolderPlus, MoreHorizontal, Tv, Volume2, VolumeX } from 'lucide-react';
import type { HomePlayerBetaChip } from '../services/homePlayerBetaPolishService';
import type { AudioTrack, Playlist } from '../types';
import { PlayerPlaylistMenu, PlayerVolumePopover } from './PlayerTransientPresenters';

const AUXILIARY_ICON_BUTTON_BASE_CLASS =
  'p-2 rounded-xl transition-all border flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-color';
const AUXILIARY_ICON_BUTTON_IDLE_CLASS =
  'text-text-muted hover:text-text-primary hover:bg-hover-bg border-transparent hover:border-border-color cursor-pointer';
const AUXILIARY_ICON_BUTTON_DISABLED_CLASS = 'opacity-30 border-transparent';

interface PlayerAuxiliaryControlsProps {
  hasTrack: boolean;
  completionLabel: string;
  completionHint: string;
  canToggleCompletion: boolean;
  onToggleCompletion: () => void;
  currentTrack: AudioTrack | null;
  playlists: Playlist[];
  isPlaylistMenuOpen: boolean;
  onTogglePlaylist: () => void;
  onClosePlaylist: () => void;
  onSelectPlaylist: (playlist: Playlist) => void;
  isFloatingLyricsVisible: boolean;
  onToggleFloatingLyrics: () => void;
  isMuted: boolean;
  isVolumePopoverVisible: boolean;
  visibleVolume: number;
  visibleVolumePercent: number;
  onToggleMute: () => void;
  onVolumeMouseEnter: () => void;
  onVolumeMouseLeave: () => void;
  onVolumeChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onMoreActions: () => void;
}

export function PlayerAuxiliaryControls({
  hasTrack,
  completionLabel,
  completionHint,
  canToggleCompletion,
  onToggleCompletion,
  currentTrack,
  playlists,
  isPlaylistMenuOpen,
  onTogglePlaylist,
  onClosePlaylist,
  onSelectPlaylist,
  isFloatingLyricsVisible,
  onToggleFloatingLyrics,
  isMuted,
  isVolumePopoverVisible,
  visibleVolume,
  visibleVolumePercent,
  onToggleMute,
  onVolumeMouseEnter,
  onVolumeMouseLeave,
  onVolumeChange,
  onMoreActions,
}: PlayerAuxiliaryControlsProps) {
  return (
    <div
      className="u30-player-aux w-[30%] min-w-0 flex items-center justify-end space-x-1 xl:space-x-4 pl-1 xl:pl-4"
      onClick={(event) => event.stopPropagation()}
      role="group"
      aria-label="辅助播放控制"
    >
      <button
        type="button"
        onClick={onToggleCompletion}
        disabled={!hasTrack || !canToggleCompletion}
        className="u30-completion-control text-[10px] border border-border-color bg-card-bg/60 text-text-secondary px-2.5 py-1 rounded-full font-bold flex-shrink-0 hover:border-brand-color/40 hover:text-brand-color disabled:opacity-40 disabled:hover:border-border-color disabled:hover:text-text-secondary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-color"
        title={completionHint}
        aria-label={`播放完成策略：${completionLabel}`}
      >
        <span hidden aria-hidden="true">播放策略</span>
        <span hidden aria-hidden="true">策略：</span>
        {completionLabel}
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={onTogglePlaylist}
          disabled={!hasTrack}
          className={`${AUXILIARY_ICON_BUTTON_BASE_CLASS} ${
            !hasTrack ? AUXILIARY_ICON_BUTTON_DISABLED_CLASS : ''
          } ${
            isPlaylistMenuOpen
              ? 'bg-brand-color/15 border-brand-color/40 text-brand-color'
              : AUXILIARY_ICON_BUTTON_IDLE_CLASS
          }`}
          title="收藏到歌单"
          aria-label="收藏到歌单"
          aria-haspopup="menu"
          aria-expanded={isPlaylistMenuOpen}
        >
          <FolderPlus className="w-4.5 h-4.5" aria-hidden="true" />
        </button>

        {isPlaylistMenuOpen && currentTrack && (
          <PlayerPlaylistMenu
            currentTrack={currentTrack}
            playlists={playlists}
            onClose={onClosePlaylist}
            onSelectPlaylist={onSelectPlaylist}
          />
        )}
      </div>

      <button
        type="button"
        onClick={onToggleFloatingLyrics}
        disabled={!hasTrack}
        className={`${AUXILIARY_ICON_BUTTON_BASE_CLASS} ${
          !hasTrack ? AUXILIARY_ICON_BUTTON_DISABLED_CLASS : ''
        } ${
          isFloatingLyricsVisible
            ? 'bg-brand-color/15 border-brand-color/40 text-brand-color font-extrabold scale-105'
            : AUXILIARY_ICON_BUTTON_IDLE_CLASS
        }`}
        title="歌词浮窗开关"
        aria-label={isFloatingLyricsVisible ? '关闭歌词浮窗' : '开启歌词浮窗'}
        aria-pressed={isFloatingLyricsVisible}
      >
        <Tv className="w-4.5 h-4.5" aria-hidden="true" />
      </button>

      <span className="text-border-color" aria-hidden="true">|</span>

      <div
        className="relative flex items-center justify-center"
        onMouseEnter={onVolumeMouseEnter}
        onMouseLeave={onVolumeMouseLeave}
      >
        <button
          type="button"
          onClick={onToggleMute}
          className="text-text-muted hover:text-text-primary p-2 rounded-xl hover:bg-hover-bg transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-color"
          title={isMuted ? '取消静音' : '静音'}
          aria-label={isMuted ? '取消静音' : '静音'}
          aria-pressed={isMuted}
        >
          {isMuted ? (
            <VolumeX className="w-4.5 h-4.5 text-text-muted" aria-hidden="true" />
          ) : (
            <Volume2 className="w-4.5 h-4.5" aria-hidden="true" />
          )}
        </button>

        {isVolumePopoverVisible && (
          <PlayerVolumePopover
            visibleVolume={visibleVolume}
            visibleVolumePercent={visibleVolumePercent}
            onChange={onVolumeChange}
          />
        )}
      </div>

      <button
        type="button"
        onClick={onMoreActions}
        className="u30-more-control text-text-muted hover:text-text-primary p-1 rounded transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-color"
        title="更多播放操作（后续开放）"
        aria-label="更多播放操作（后续开放）"
      >
        <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}

interface PlayerCompatibilityMarkersProps {
  betaChips: HomePlayerBetaChip[];
  hiddenMaintenanceNote: string;
}

export function PlayerCompatibilityMarkers({
  betaChips,
  hiddenMaintenanceNote,
}: PlayerCompatibilityMarkersProps) {
  return (
    <div hidden aria-hidden="true">
      <div id="mvp59-player-beta-chips">
        {betaChips.map((chip) => (
          <span key={chip.id}>{chip.label}：{chip.value}</span>
        ))}
      </div>
      <div id="mvp79-player-ui-bugfix">{hiddenMaintenanceNote}</div>
    </div>
  );
}
