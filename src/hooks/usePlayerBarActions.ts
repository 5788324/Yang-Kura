import { useCallback, useMemo, useState } from 'react';
import type { AudioTrack, Playlist } from '../types';
import {
  getFavoriteToggleMessage,
  getFloatingLyricsToggleMessage,
  getPlaylistSelectionDecision,
  MORE_PLAYER_ACTIONS_MESSAGE,
} from '../player/playerBarActionModel';
import { useAutoDismissMessage } from './usePlayerTransientUi';

interface UsePlayerBarActionsOptions {
  currentTrack: AudioTrack | null;
  favorites: string[];
  toggleFavorite: (trackId: string) => void;
  onAddToPlaylist: (track: AudioTrack, playlistId: string) => void;
}

export interface PlayerBarActions {
  isLiked: boolean;
  isPlaylistMenuOpen: boolean;
  isFloatingLyricsVisible: boolean;
  playerToastMessage: string | null;
  toggleCurrentFavorite: () => void;
  togglePlaylistMenu: () => void;
  closePlaylistMenu: () => void;
  selectPlaylist: (playlist: Playlist) => void;
  toggleFloatingLyrics: () => void;
  closeFloatingLyrics: () => void;
  showMoreActions: () => void;
}

export function usePlayerBarActions({
  currentTrack,
  favorites,
  toggleFavorite,
  onAddToPlaylist,
}: UsePlayerBarActionsOptions): PlayerBarActions {
  const [isPlaylistMenuOpen, setIsPlaylistMenuOpen] = useState(false);
  const [isFloatingLyricsVisible, setIsFloatingLyricsVisible] = useState(false);
  const { message: playerToastMessage, showMessage } = useAutoDismissMessage();

  const isLiked = useMemo(
    () => (currentTrack ? favorites.includes(currentTrack.id) : false),
    [currentTrack, favorites],
  );

  const toggleCurrentFavorite = useCallback(() => {
    if (!currentTrack) return;
    toggleFavorite(currentTrack.id);
    showMessage(getFavoriteToggleMessage(isLiked));
  }, [currentTrack, isLiked, showMessage, toggleFavorite]);

  const togglePlaylistMenu = useCallback(() => {
    if (currentTrack) setIsPlaylistMenuOpen((isOpen) => !isOpen);
  }, [currentTrack]);

  const closePlaylistMenu = useCallback(() => {
    setIsPlaylistMenuOpen(false);
  }, []);

  const selectPlaylist = useCallback(
    (playlist: Playlist) => {
      if (!currentTrack) return;

      const decision = getPlaylistSelectionDecision(currentTrack, playlist);
      if (decision.shouldAdd) onAddToPlaylist(currentTrack, playlist.id);
      showMessage(decision.message);
      setIsPlaylistMenuOpen(false);
    },
    [currentTrack, onAddToPlaylist, showMessage],
  );

  const toggleFloatingLyrics = useCallback(() => {
    if (!currentTrack) return;
    showMessage(getFloatingLyricsToggleMessage(isFloatingLyricsVisible));
    setIsFloatingLyricsVisible(!isFloatingLyricsVisible);
  }, [currentTrack, isFloatingLyricsVisible, showMessage]);

  const closeFloatingLyrics = useCallback(() => {
    setIsFloatingLyricsVisible(false);
  }, []);

  const showMoreActions = useCallback(() => {
    showMessage(MORE_PLAYER_ACTIONS_MESSAGE);
  }, [showMessage]);

  return {
    isLiked,
    isPlaylistMenuOpen,
    isFloatingLyricsVisible,
    playerToastMessage,
    toggleCurrentFavorite,
    togglePlaylistMenu,
    closePlaylistMenu,
    selectPlaylist,
    toggleFloatingLyrics,
    closeFloatingLyrics,
    showMoreActions,
  };
}
