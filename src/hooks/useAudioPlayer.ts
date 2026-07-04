import { useState, useEffect, useCallback, useRef } from 'react';
import { PlayerState, AudioTrack } from '../types';

export function useAudioPlayer() {
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTrack: null,
    isPlaying: false,
    progress: 0,
    volume: 0.75,
    queue: [],
    currentIndex: -1,
    isMuted: false,
    loopMode: 'all',
  });

  // Reference to avoid dependency array triggers on fast updates
  const stateRef = useRef(playerState);
  stateRef.current = playerState;

  // Track End Auto-Advance Logic
  const handleNextTrack = useCallback(() => {
    setPlayerState(prev => {
      if (prev.queue.length === 0) return prev;
      
      let nextIndex = prev.currentIndex + 1;
      if (prev.loopMode === 'shuffle') {
        nextIndex = Math.floor(Math.random() * prev.queue.length);
      } else if (nextIndex >= prev.queue.length) {
        nextIndex = 0; // wrap around
      }
      
      const nextTrack = prev.queue[nextIndex];
      return {
        ...prev,
        currentIndex: nextIndex,
        currentTrack: nextTrack,
        progress: 0,
        isPlaying: true
      };
    });
  }, []);

  const handlePrevTrack = useCallback(() => {
    setPlayerState(prev => {
      if (prev.queue.length === 0) return prev;
      
      let prevIndex = prev.currentIndex - 1;
      if (prev.loopMode === 'shuffle') {
        prevIndex = Math.floor(Math.random() * prev.queue.length);
      } else if (prevIndex < 0) {
        prevIndex = prev.queue.length - 1; // wrap around
      }
      
      const prevTrack = prev.queue[prevIndex];
      return {
        ...prev,
        currentIndex: prevIndex,
        currentTrack: prevTrack,
        progress: 0,
        isPlaying: true
      };
    });
  }, []);

  // Audio Play Actions
  const handlePlayTrack = useCallback((track: AudioTrack, customQueue?: AudioTrack[]) => {
    const playQueue = customQueue && customQueue.length > 0 ? customQueue : [track];
    const idx = playQueue.findIndex(t => t.id === track.id);
    
    if (track.rjId) {
      localStorage.setItem(`asmr_last_played_${track.rjId}`, Date.now().toString());
    }
    
    setPlayerState(prev => ({
      ...prev,
      currentTrack: track,
      isPlaying: true,
      progress: 0,
      queue: playQueue,
      currentIndex: idx >= 0 ? idx : 0,
    }));
  }, []);

  const handleAddToQueue = useCallback((track: AudioTrack) => {
    setPlayerState(prev => {
      const isAlreadyInQueue = prev.queue.some(t => t.id === track.id);
      const updatedQueue = isAlreadyInQueue ? prev.queue : [...prev.queue, track];
      return {
        ...prev,
        queue: updatedQueue,
        currentIndex: prev.currentIndex === -1 ? 0 : prev.currentIndex,
        currentTrack: prev.currentTrack ? prev.currentTrack : track
      };
    });
  }, []);

  const handleTogglePlay = useCallback(() => {
    setPlayerState(prev => {
      if (!prev.currentTrack) return prev;
      return { ...prev, isPlaying: !prev.isPlaying };
    });
  }, []);

  const handleSeek = useCallback((seconds: number) => {
    setPlayerState(prev => ({ ...prev, progress: seconds }));
  }, []);

  const handleVolumeChange = useCallback((vol: number) => {
    setPlayerState(prev => ({ ...prev, volume: vol, isMuted: vol === 0 }));
  }, []);

  const handleToggleMute = useCallback(() => {
    setPlayerState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const handleToggleLoopMode = useCallback(() => {
    setPlayerState(prev => {
      let nextMode: 'all' | 'one' | 'shuffle' = 'all';
      if (prev.loopMode === 'all') nextMode = 'one';
      else if (prev.loopMode === 'one') nextMode = 'shuffle';
      return { ...prev, loopMode: nextMode };
    });
  }, []);

  // Set specific progress safely
  const setPlayerProgress = useCallback((seconds: number) => {
    setPlayerState(prev => ({ ...prev, progress: seconds }));
  }, []);

  // 1. simulated audio progress incrementer timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (playerState.isPlaying && playerState.currentTrack) {
      timer = setInterval(() => {
        setPlayerState(prev => {
          if (!prev.currentTrack || !prev.isPlaying) return prev;
          const nextProgress = prev.progress + 1;
          
          if (nextProgress >= prev.currentTrack.duration) {
            return {
              ...prev,
              progress: prev.currentTrack.duration
            };
          }
          return {
            ...prev,
            progress: nextProgress
          };
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [playerState.isPlaying, playerState.currentTrack?.id]);

  // 2. auto-advance when a track finishes
  const currentTrackId = playerState.currentTrack?.id;
  const currentTrackDuration = playerState.currentTrack?.duration;
  const isPlaying = playerState.isPlaying;
  const progress = playerState.progress;

  useEffect(() => {
    if (isPlaying && currentTrackId && currentTrackDuration && progress >= currentTrackDuration) {
      if (playerState.loopMode === 'one') {
        setPlayerProgress(0);
      } else {
        handleNextTrack();
      }
    }
  }, [isPlaying, progress, currentTrackId, currentTrackDuration, playerState.loopMode, handleNextTrack, setPlayerProgress]);

  // 3. sync play progress to localStorage (for session recovery)
  useEffect(() => {
    if (playerState.currentTrack) {
      localStorage.setItem('last_played_track_id', playerState.currentTrack.id);
      localStorage.setItem('last_played_progress', playerState.progress.toString());
      localStorage.setItem('last_played_track_json', JSON.stringify(playerState.currentTrack));
    }
  }, [playerState.currentTrack?.id, playerState.progress]);

  return {
    playerState,
    setPlayerState,
    handlePlayTrack,
    handleAddToQueue,
    handleTogglePlay,
    handleNextTrack,
    handlePrevTrack,
    handleSeek,
    handleVolumeChange,
    handleToggleMute,
    handleToggleLoopMode,
  };
}
