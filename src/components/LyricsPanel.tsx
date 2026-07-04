import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  Play, 
  Pause,
  SkipBack,
  SkipForward,
  ListMusic, 
  Subtitles, 
  FolderTree, 
  Disc, 
  Volume2, 
  VolumeX,
  Sparkles,
  Heart,
  Repeat,
  Repeat1,
  Shuffle,
  Languages,
  Maximize2,
  Moon,
  Bookmark,
  Trash2,
  Plus,
  Clock
} from 'lucide-react';
import { AudioTrack, PlayerState, RJWork } from '../types';

interface LyricsPanelProps {
  playerState: PlayerState;
  onClose: () => void;
  onPlayTrack: (track: AudioTrack) => void;
  rjWorks: RJWork[];
  togglePlay?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onSeek?: (seconds: number) => void;
  onVolumeChange?: (volume: number) => void;
  toggleMute?: () => void;
  favorites?: string[];
  toggleFavorite?: (trackId: string) => void;
  toggleLoopMode?: () => void;
}

export default function LyricsPanel({
  playerState,
  onClose,
  onPlayTrack,
  rjWorks,
  togglePlay,
  onPrev,
  onNext,
  onSeek,
  onVolumeChange,
  toggleMute,
  favorites = [],
  toggleFavorite,
  toggleLoopMode
}: LyricsPanelProps) {
  const { currentTrack, progress, queue, isPlaying, volume, isMuted, loopMode } = playerState;
  
  // 3 Player styles: classic (经典), vinyl (黑胶), lyrics (歌词)
  const [playerStyle, setPlayerStyle] = useState<'classic' | 'vinyl' | 'lyrics'>('classic');
  const [classicVisualType, setClassicVisualType] = useState<'record' | 'cover'>('record');
  const [activeRightTab, setActiveRightTab] = useState<'lyrics' | 'chapters' | 'queue' | 'bookmarks'>('lyrics');
  
  // --- Refs for high-fidelity physics-based smooth animation (Vinyl Record & Stylus arm) ---
  const recordRef = useRef<HTMLDivElement>(null);
  const tonearmRef = useRef<HTMLDivElement>(null);
  
  const rotationAngleRef = useRef<number>(0);
  const currentSpeedRef = useRef<number>(0);
  const currentArmAngleRef = useRef<number>(-18);
  const animationFrameIdRef = useRef<number | null>(null);

  const isPlayingRef = useRef<boolean>(isPlaying);
  const progressRef = useRef<number>(progress);
  const totalDurationRef = useRef<number>(currentTrack?.duration || 0);

  // Synchronize playing states instantly to refs to avoid react state triggers interrupting frame rendering loops
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    totalDurationRef.current = currentTrack?.duration || 0;
  }, [currentTrack?.duration]);

  useEffect(() => {
    let lastTime = performance.now();
    
    const updatePhysics = (now: number) => {
      const dt = Math.min((now - lastTime) / 16.666, 4); // limit frame jump
      lastTime = now;

      const playing = isPlayingRef.current;
      const prog = progressRef.current;
      const dur = totalDurationRef.current;

      // 1. Vinyl Record rotation speed physics (elegant acceleration / friction deceleration)
      const targetSpeed = playing ? 0.6 : 0;
      const speedDamping = playing ? 0.04 : 0.012; // slow drift decelerate
      
      currentSpeedRef.current += (targetSpeed - currentSpeedRef.current) * speedDamping * dt;
      rotationAngleRef.current = (rotationAngleRef.current + currentSpeedRef.current * dt) % 360;

      if (recordRef.current) {
        recordRef.current.style.transform = `rotate(${rotationAngleRef.current}deg)`;
      }

      // 2. Tonearm rotation angle physics (air-damped tone-arm entry/return)
      const progressPercent = dur > 0 ? (prog / dur) * 100 : 0;
      // Resting angle: -18deg. Playing start angle: 8deg. Playing end angle: 22deg.
      const targetArmAngle = playing 
        ? 8 + (progressPercent / 100) * 14 
        : -18;
      
      const armDamping = 0.03; // Smooth fluid slide
      currentArmAngleRef.current += (targetArmAngle - currentArmAngleRef.current) * armDamping * dt;

      if (tonearmRef.current) {
        tonearmRef.current.style.transform = `rotate(${currentArmAngleRef.current}deg)`;
      }

      animationFrameIdRef.current = requestAnimationFrame(updatePhysics);
    };

    animationFrameIdRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);
  
  // --- Sleep Timer (睡眠定时) States & Logic ---
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerSecondsLeft, setSleepTimerSecondsLeft] = useState<number>(0);
  const [isFadeOutEnabled, setIsFadeOutEnabled] = useState<boolean>(true);
  const [isSleepTimerMenuOpen, setIsSleepTimerMenuOpen] = useState<boolean>(false);

  // --- Sleep Dim Screen Overlay (睡前暗屏/低亮度) State ---
  const [isSleepDimActive, setIsSleepDimActive] = useState<boolean>(false);

  // --- Bookmarks State ---
  const [bookmarks, setBookmarks] = useState<{ id: string; time: number; note: string }[]>([]);
  const [bookmarkInput, setBookmarkInput] = useState<string>('');

  // --- User Activity State for 简洁模式 (Ambient Mode) ---
  const [isUserInactive, setIsUserInactive] = useState<boolean>(false);
  const inactiveTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const resetTimer = () => {
      setIsUserInactive(false);
      if (inactiveTimeoutRef.current) {
        clearTimeout(inactiveTimeoutRef.current);
      }
      inactiveTimeoutRef.current = setTimeout(() => {
        setIsUserInactive(true);
      }, 8000); // Enter ambient mode after 8 seconds of inactivity
    };

    resetTimer();

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('mousedown', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('touchstart', resetTimer);

    return () => {
      if (inactiveTimeoutRef.current) {
        clearTimeout(inactiveTimeoutRef.current);
      }
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('mousedown', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, []);

  // Auto-load and pre-populate bookmarks for ASMR tracks
  useEffect(() => {
    if (!currentTrack?.id) return;
    const key = `asmr_bookmarks_${currentTrack.id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setBookmarks(JSON.parse(stored));
      } catch (e) {
        setBookmarks([]);
      }
    } else {
      // Generate standard immersive demo bookmarks
      const totalSec = currentTrack.duration || 600;
      const demoBookmarks = [
        { id: 'b1', time: Math.floor(totalSec * 0.05), note: '👂 左右声道定位测试 / 轻快低语' },
        { id: 'b2', time: Math.floor(totalSec * 0.35), note: '💆 主编耳搔掏耳：极度酥麻高能段' },
        { id: 'b3', time: Math.floor(totalSec * 0.72), note: '😴 催眠向环境音：睡眠呼吸配合' }
      ].filter(b => b.time < totalSec);
      setBookmarks(demoBookmarks);
      localStorage.setItem(key, JSON.stringify(demoBookmarks));
    }
  }, [currentTrack?.id]);

  // Save bookmarks helper
  const saveBookmarks = (newBookmarks: typeof bookmarks) => {
    setBookmarks(newBookmarks);
    if (currentTrack?.id) {
      localStorage.setItem(`asmr_bookmarks_${currentTrack.id}`, JSON.stringify(newBookmarks));
    }
  };

  // Add bookmark
  const handleAddBookmark = () => {
    const noteText = bookmarkInput.trim() || `精彩片段 🏷️ ${formatTime(progress)}`;
    const newB = {
      id: 'b_' + Date.now(),
      time: Math.floor(progress),
      note: noteText
    };
    const updated = [...bookmarks, newB].sort((a, b) => a.time - b.time);
    saveBookmarks(updated);
    setBookmarkInput('');
  };

  // Delete bookmark
  const handleDeleteBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = bookmarks.filter(b => b.id !== id);
    saveBookmarks(updated);
  };

  // Sleep Timer countdown mechanism
  useEffect(() => {
    if (sleepTimerMinutes === null) return;
    
    const interval = setInterval(() => {
      setSleepTimerSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setSleepTimerMinutes(null);
          // Pause the audio
          if (isPlaying && togglePlay) {
            togglePlay();
          }
          return 0;
        }

        // Smoothly fade out volume in the final 60 seconds
        if (isFadeOutEnabled && prev <= 60 && prev > 1 && onVolumeChange && !isMuted) {
          const ratio = (prev - 1) / 60; // 1.0 -> 0.0
          const originalVolRef = localStorage.getItem('last_user_volume');
          const baseVol = originalVolRef ? parseFloat(originalVolRef) : 0.8;
          onVolumeChange(baseVol * ratio);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerMinutes, isPlaying, isFadeOutEnabled, isMuted]);

  // Trigger sleep timer presets
  const handleStartTimer = (mins: number) => {
    // Record current volume
    localStorage.setItem('last_user_volume', volume.toString());
    setSleepTimerMinutes(mins);
    setSleepTimerSecondsLeft(mins * 60);
    setIsSleepTimerMenuOpen(false);
  };

  const handleStopTimer = () => {
    setSleepTimerMinutes(null);
    setIsSleepTimerMenuOpen(false);
    // Restore original volume if faded
    const originalVolRef = localStorage.getItem('last_user_volume');
    if (originalVolRef && onVolumeChange) {
      onVolumeChange(parseFloat(originalVolRef));
    }
  };

  // Format countdown text mm:ss or hh:mm:ss
  const formatCountdown = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  // Parse [mm:ss.xx] or [mm:ss] into seconds
  const parseLrcLine = (line: string) => {
    const timeReg = /\[(\d+):(\d+)(?:\.(\d+))?\]/;
    const match = line.match(timeReg);
    if (!match) return { time: -1, text: line };
    const mins = parseInt(match[1]);
    const secs = parseInt(match[2]);
    const ms = match[3] ? parseFloat('0.' + match[3]) : 0;
    const time = mins * 60 + secs + ms;
    const text = line.replace(timeReg, '').trim();
    return { time, text };
  };

  // Memoized parsed lyrics lines
  const parsedLyrics = useMemo(() => {
    if (!currentTrack || !currentTrack.lyrics) return [];
    return currentTrack.lyrics.map(line => parseLrcLine(line)).filter(item => item.time >= 0);
  }, [currentTrack]);

  // Support bilingual lyrics (e.g. "Japanese Original / Chinese Translation" or split by |)
  const bilingualData = useMemo(() => {
    return parsedLyrics.map((lrc) => {
      let original = lrc.text;
      let translation = '';
      
      // Common delimiters for translation/bilingual lyrics in ASMR works
      const delimiters = [' // ', ' || ', ' / ', ' | ', ' /', '/ ', ' |', '| '];
      for (const d of delimiters) {
        if (lrc.text.includes(d)) {
          const parts = lrc.text.split(d);
          if (parts.length >= 2 && parts[0].trim() && parts[1].trim()) {
            original = parts[0].trim();
            translation = parts.slice(1).join(' / ').trim();
            break;
          }
        }
      }
      
      return {
        time: lrc.time,
        original,
        translation,
      };
    });
  }, [parsedLyrics]);

  // Find the current active lyric line index
  const activeLyricIndex = useMemo(() => {
    if (parsedLyrics.length === 0) return -1;
    let activeIdx = 0;
    for (let i = 0; i < parsedLyrics.length; i++) {
      if (progress >= parsedLyrics[i].time) {
        activeIdx = i;
      } else {
        break;
      }
    }
    return activeIdx;
  }, [parsedLyrics, progress]);

  // Auto-scroll the active lyric line to center
  useEffect(() => {
    if (activeRightTab === 'lyrics' && lyricsContainerRef.current && activeLyricIndex >= 0) {
      const activeElement = lyricsContainerRef.current.children[activeLyricIndex] as HTMLElement;
      if (activeElement) {
        lyricsContainerRef.current.scrollTo({
          top: activeElement.offsetTop - lyricsContainerRef.current.clientHeight / 2 + activeElement.clientHeight / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [activeLyricIndex, playerStyle, activeRightTab]);

  if (!currentTrack) return null;

  // Find other tracks in this RJ work if ASMR
  const relatedRjWork = rjWorks.find(rj => rj.id === currentTrack.rjId);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = currentTrack.duration;
  const progressPercent = totalDuration > 0 ? (progress / totalDuration) * 100 : 0;
  const isFavorite = favorites.includes(currentTrack.id);

  return (
    <div 
      id="full-lyrics-panel" 
      className="fixed inset-0 z-[100] bg-zinc-950 text-white overflow-hidden flex flex-col animate-slide-up select-none"
    >
      {/* Bedtime Ambient Dim Screen Overlay */}
      {isSleepDimActive && (
        <div 
          onClick={() => setIsSleepDimActive(false)}
          className="absolute inset-0 z-[120] bg-zinc-950/98 flex flex-col items-center justify-between p-12 text-center select-none cursor-pointer animate-fade-in"
        >
          {/* Top Status */}
          <div className="flex items-center space-x-2 text-zinc-600 text-xs font-mono">
            <Moon className="w-4 h-4 animate-pulse text-indigo-400" />
            <span>睡前极简呼吸模式 • 双耳立体声</span>
            {sleepTimerMinutes !== null && (
              <span className="text-brand-color font-bold">
                | 定时剩余: {formatCountdown(sleepTimerSecondsLeft)}
              </span>
            )}
          </div>

          {/* Centered Breathing Lyric */}
          <div className="flex flex-col items-center justify-center max-w-3xl space-y-4">
            <span className="text-2xl md:text-3xl text-zinc-300 font-bold tracking-wide animate-pulse leading-relaxed">
              {bilingualData[activeLyricIndex]?.original || currentTrack.title}
            </span>
            {bilingualData[activeLyricIndex]?.translation && (
              <span className="text-base md:text-lg text-indigo-400/80 font-semibold animate-pulse leading-relaxed">
                {bilingualData[activeLyricIndex]?.translation}
              </span>
            )}
          </div>

          {/* Bottom digital clock & exit hint */}
          <div className="flex flex-col items-center space-y-2">
            <div className="text-4xl font-extrabold font-mono text-zinc-700 tracking-wider">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <span className="text-[10px] text-zinc-600 uppercase font-mono tracking-widest">
              点击屏幕任意位置唤醒
            </span>
          </div>
        </div>
      )}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes float-blob-1 {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.15); }
          66% { transform: translate(-30px, 30px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float-blob-2 {
          0% { transform: translate(0px, 0px) scale(1.1); }
          50% { transform: translate(-50px, 50px) scale(0.85); }
          100% { transform: translate(0px, 0px) scale(1.1); }
        }
        .animate-blob-1 {
          animation: float-blob-1 25s infinite ease-in-out;
        }
        .animate-blob-2 {
          animation: float-blob-2 30s infinite ease-in-out;
        }
      `}</style>

      {/* Immersive blurred cover art atmosphere */}
      <div 
        className="absolute inset-0 bg-cover bg-center scale-110 blur-[100px] opacity-25 transition-all duration-1000 pointer-events-none"
        style={{ backgroundImage: `url(${currentTrack.coverUrl})` }}
      />
      {/* High-quality dark frosted-glass overlay vignette */}
      <div 
        className="absolute inset-0 pointer-events-none z-0" 
        style={{ backgroundImage: 'radial-gradient(circle at center, rgba(9, 9, 11, 0.4) 0%, rgba(9, 9, 11, 0.98) 100%)' }}
      />

      {/* Dynamic soft Gaussian blurred background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent blur-[140px] animate-blob-1" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-brand-color/8 via-rose-500/4 to-transparent blur-[150px] animate-blob-2" />
        <div className="absolute top-[30%] left-[20%] w-[45%] h-[45%] rounded-full bg-emerald-500/3 blur-[160px] animate-blob-1" style={{ animationDelay: '-5s' }} />
      </div>

      {/* Header Area (Borderless and fades out during inactivity) */}
      <div className={`relative z-10 px-6 py-4 flex items-center justify-between bg-transparent backdrop-blur-sm transition-all duration-700 ${
        isUserInactive ? 'opacity-0 pointer-events-none -translate-y-4' : 'opacity-100 translate-y-0'
      }`}>
        
        {/* Left: Close Button and Window Controls */}
        <div className="flex items-center space-x-4">
          <button 
            id="lyrics-close-btn"
            onClick={onClose}
            className="p-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center space-x-1.5 border border-white/5 active:scale-95"
            title="收起播放页"
          >
            <ChevronDown className="w-4 h-4" />
            <span className="text-xs font-semibold">返回</span>
          </button>
          
          {/* Decorative Windows/Mac Style Dots */}
          <div className="hidden sm:flex items-center space-x-1.5 pl-2">
            <div className="w-3 h-3 rounded-full bg-red-500/40 border border-red-500/20" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/40 border border-yellow-500/20" />
            <div className="w-3 h-3 rounded-full bg-green-500/40 border border-green-500/20" />
          </div>
        </div>

        {/* Center: Immersive Player Style Selector */}
        <div className="flex bg-white/5 border border-white/10 p-0.5 rounded-full text-xs font-semibold shadow-inner">
          <button
            onClick={() => setPlayerStyle('classic')}
            className={`px-4 py-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              playerStyle === 'classic' 
                ? 'bg-brand-color text-white shadow-md font-bold scale-102' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            经典模式
          </button>
          <button
            onClick={() => setPlayerStyle('vinyl')}
            className={`px-4 py-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              playerStyle === 'vinyl' 
                ? 'bg-brand-color text-white shadow-md font-bold scale-102' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            黑胶唱片
          </button>
          <button
            onClick={() => setPlayerStyle('lyrics')}
            className={`px-4 py-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              playerStyle === 'lyrics' 
                ? 'bg-brand-color text-white shadow-md font-bold scale-102' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            歌词模式
          </button>
        </div>

        {/* Right: Audio Info details */}
        <div className="text-right hidden sm:block">
          <span className="text-[9px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">
            无损 Hi-Fi 渲染
          </span>
          <p className="text-[10px] text-zinc-400 mt-1 font-mono">ASMR Direct Audio 24bit</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 lg:px-16 py-4 items-center justify-center overflow-hidden ${
        playerStyle === 'classic' 
          ? 'flex flex-col lg:grid lg:grid-cols-12 lg:gap-16' 
          : 'flex flex-col'
      }`}>
        
        {playerStyle === 'classic' ? (
          /* ========================================== */
          /*         NEW PREMIUM CLASSIC PLAYBACK PAGE    */
          /* ========================================== */
          <>
            {/* Left Side: Selected Album Cover or Simplified spinning Record */}
            <div className="w-full lg:col-span-5 flex flex-col items-center justify-center text-center space-y-8 relative h-full flex-shrink-0 animate-fade-in lg:pr-6">
              
              <div className="relative w-[320px] h-[320px] lg:w-[420px] lg:h-[420px] flex items-center justify-center">
                {classicVisualType === 'record' ? (
                  /* SIMPLIFIED RECORD (圆形唱片图 with white concentric ring and stylus needle) */
                  <div className="relative w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] flex items-center justify-center">
                    
                    {/* Glowing shadow behind record */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center rounded-full blur-3xl opacity-40 scale-105 pointer-events-none transition-transform duration-700"
                      style={{ backgroundImage: `url(${currentTrack.coverUrl})` }}
                    />

                    {/* Stylus Needle */}
                    <div 
                      className="absolute z-20 transition-all duration-700 ease-in-out"
                      style={{
                        top: '-20px',
                        left: '50%',
                        transform: isPlaying ? 'rotate(3deg)' : 'rotate(-26deg)',
                        transformOrigin: '24px 24px',
                        width: '90px',
                        height: '140px'
                      }}
                    >
                      <svg width="90" height="140" viewBox="0 0 90 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
                        {/* Pivot joint */}
                        <circle cx="24" cy="24" r="12" fill="#3f3f46" stroke="#e4e4e7" strokeWidth="2" />
                        <circle cx="24" cy="24" r="5" fill="#18181b" />
                        {/* White metal arm */}
                        <path d="M24 24L38 65L62 105L54 112" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        {/* Cartridge */}
                        <rect x="48" y="108" width="16" height="11" rx="2" transform="rotate(22 48 108)" fill="#ffffff" />
                        <path d="M52 116L58 118" stroke="#18181b" strokeWidth="1.5" />
                      </svg>
                    </div>

                    {/* Concentric grooved disc plate */}
                    <div 
                      className="w-full h-full rounded-full bg-zinc-950 border-[14px] border-zinc-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex items-center justify-center overflow-hidden ring-4 ring-white/5 relative"
                      style={{
                        backgroundImage: 'radial-gradient(circle, #27272a 0%, #18181b 30%, #09090b 60%, #020202 100%)'
                      }}
                    >
                      {/* Reflection glossy shine */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent rotate-45 pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-white/5 to-transparent rotate-45 pointer-events-none" />

                      {/* Concentric ring paths */}
                      <div className="absolute inset-4 rounded-full border border-white/5 pointer-events-none opacity-40" />
                      <div className="absolute inset-12 rounded-full border border-white/5 pointer-events-none opacity-40" />
                      <div className="absolute inset-20 rounded-full border border-white/5 pointer-events-none opacity-40" />
                      <div className="absolute inset-28 rounded-full border border-white/5 pointer-events-none opacity-40" />
                      <div className="absolute inset-36 rounded-full border border-white/5 pointer-events-none opacity-40" />

                      {/* Center Cover Art */}
                      <div 
                        className={`w-40 h-40 lg:w-[210px] lg:h-[210px] rounded-full overflow-hidden border-[6px] border-zinc-950 shadow-2xl flex-shrink-0 ${
                          isPlaying ? 'animate-spin-slow' : '[animation-play-state:paused]'
                        }`}
                      >
                        <img 
                          src={currentTrack.coverUrl} 
                          alt="" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Center pin hole */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-9 h-9 rounded-full bg-zinc-900/90 border border-white/15 flex items-center justify-center shadow-md">
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* CLASSIC SQUARE COVER (专辑封面) */
                  <div className="relative group p-2 animate-fade-in">
                    {/* Glowing shadow behind */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center rounded-3xl blur-3xl opacity-45 scale-105 pointer-events-none transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url(${currentTrack.coverUrl})` }}
                    />
                    <div className="relative aspect-square w-72 h-72 lg:w-[380px] lg:h-[380px] rounded-2xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] transition-transform duration-500 hover:scale-[1.03]">
                      <img 
                        src={currentTrack.coverUrl} 
                        alt={currentTrack.album} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Minimalist Switch Controls for Cover vs Record (Borderless text style - fades in ambient mode) */}
              <div className={`flex bg-white/5 p-0.5 rounded-full text-[11px] font-semibold tracking-wide shadow-sm transition-all duration-700 ${
                isUserInactive ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0'
              }`}>
                <button
                  onClick={() => setClassicVisualType('record')}
                  className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                    classicVisualType === 'record' 
                      ? 'bg-zinc-100 text-zinc-950 font-bold shadow-md' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  简化唱片
                </button>
                <button
                  onClick={() => setClassicVisualType('cover')}
                  className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                    classicVisualType === 'cover' 
                      ? 'bg-zinc-100 text-zinc-950 font-bold shadow-md' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  专辑封面
                </button>
              </div>

            </div>

            {/* Right Side: Title, Subtitle, Metadata info, Capsule Tabs & Scrolling Lyrics */}
            <div className="w-full lg:col-span-7 flex flex-col h-[520px] lg:h-[620px] max-h-[620px] space-y-5 justify-between animate-fade-in text-left">
              
              {/* Song Information Block (Fades in ambient mode) */}
              <div className={`space-y-3 flex-shrink-0 transition-all duration-700 ${
                isUserInactive ? 'opacity-0 pointer-events-none -translate-y-4' : 'opacity-100 translate-y-0'
              }`}>
                <div className="flex items-center space-x-2.5">
                  <h1 className="text-2xl lg:text-3xl font-extrabold text-zinc-100 tracking-tight leading-tight select-text">
                    {currentTrack.title}
                  </h1>
                  {/* VIP Badge matching standard high-fidelity desktop view */}
                  <span className="text-[9px] bg-brand-color/15 text-brand-color border border-brand-color/30 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-widest">
                    VIP
                  </span>
                </div>

                {/* Subtitle / Sub-title representation */}
                <p className="text-xs lg:text-sm text-zinc-400 font-medium">
                  {currentTrack.type === 'asmr' ? '极高无损立体声 ASMR 特别音声' : '无损极高品质音频重现'}
                </p>

                {/* Grid Metadata details matching the user mockup perfectly (Borderless spacing) */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-zinc-400 select-text font-medium pt-2">
                  <span className="truncate">
                    <span className="text-zinc-500 mr-1.5">专辑:</span>
                    <span className="text-zinc-300 hover:underline cursor-pointer">{currentTrack.album}</span>
                  </span>
                  <span className="truncate">
                    <span className="text-zinc-500 mr-1.5">歌手:</span>
                    <span className="text-zinc-300 hover:underline cursor-pointer">{currentTrack.artist}</span>
                  </span>
                  <span className="truncate">
                    <span className="text-zinc-500 mr-1.5">来源:</span>
                    <span className="text-zinc-300">我喜欢的音乐</span>
                  </span>
                </div>
              </div>

              {/* Pill capsules filter selector (Borderless style - fades in ambient mode) */}
              <div className={`flex space-x-2 pb-2 flex-shrink-0 transition-all duration-700 ${
                isUserInactive ? 'opacity-0 pointer-events-none -translate-y-4' : 'opacity-100 translate-y-0'
              }`}>
                <button
                  onClick={() => setActiveRightTab('lyrics')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeRightTab === 'lyrics' 
                      ? 'bg-zinc-800 text-brand-color shadow-sm font-extrabold' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  歌词
                </button>
                {currentTrack.type === 'asmr' && relatedRjWork && (
                  <button
                    onClick={() => setActiveRightTab('chapters')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      activeRightTab === 'chapters' 
                        ? 'bg-zinc-800 text-brand-color shadow-sm font-extrabold' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    分轨 ({relatedRjWork.tracks.length})
                  </button>
                )}
                <button
                  onClick={() => setActiveRightTab('queue')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeRightTab === 'queue' 
                      ? 'bg-zinc-800 text-brand-color shadow-sm font-extrabold' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  即将播放 ({queue.length})
                </button>
                <button
                  onClick={() => setActiveRightTab('bookmarks')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeRightTab === 'bookmarks' 
                      ? 'bg-zinc-800 text-brand-color shadow-sm font-extrabold' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  感官标记 ({bookmarks.length})
                </button>
              </div>

              {/* Interactive content viewport with 80% height to fill workspace (Completely borderless) */}
              <div className="h-[80%] w-full bg-transparent overflow-hidden relative">
                
                {/* Dynamic transparent fading masks for lyrics */}
                {activeRightTab === 'lyrics' && (
                  <>
                    <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-zinc-950 via-zinc-950/40 to-transparent pointer-events-none z-10" />
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent pointer-events-none z-10" />
                  </>
                )}

                {/* Lyrics Container (Borderless, hide-scrollbar, optimized with py-20 and space-y-6) */}
                {activeRightTab === 'lyrics' && (
                  <div 
                    ref={lyricsContainerRef}
                    className="relative w-full h-full overflow-y-auto py-20 px-6 space-y-6 hide-scrollbar scroll-smooth text-center"
                    style={{ writingMode: 'horizontal-tb', transform: 'none' }}
                  >
                    {bilingualData.length === 0 ? (
                      <div className="py-24 text-center text-zinc-500 text-xs flex flex-col items-center justify-center space-y-2">
                        <Sparkles className="w-7 h-7 text-zinc-600 animate-pulse" />
                        <span>本音频暂时无歌词字幕数据</span>
                      </div>
                    ) : (
                      bilingualData.map((lrc, idx) => {
                        const isActive = idx === activeLyricIndex;
                        return (
                          <div
                            key={idx}
                            onClick={() => onSeek && onSeek(lrc.time)}
                            className={`transition-all duration-500 cursor-pointer flex flex-col items-center justify-center py-2.5 origin-center ${
                              isActive 
                                ? "scale-[1.05] opacity-100 z-10" 
                                : "scale-100 opacity-30 hover:opacity-75"
                            }`}
                            title="双击或点击此行跳转播放"
                            style={{ writingMode: 'horizontal-tb', transform: 'none' }}
                          >
                            <span className={`transition-all duration-500 block leading-relaxed text-base lg:text-lg font-bold ${
                              isActive 
                                ? "text-white drop-shadow-[0_2px_15px_rgba(255,255,255,0.3)]" 
                                : "text-zinc-400"
                            }`}>
                              {lrc.original}
                            </span>
                            {lrc.translation && (
                              <span className={`transition-all duration-500 block leading-relaxed mt-1.5 text-xs lg:text-sm font-semibold ${
                                isActive 
                                  ? "text-brand-color" 
                                  : "text-zinc-500"
                              }`}>
                                {lrc.translation}
                              </span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Other Tabs content rendering */}
                {activeRightTab === 'chapters' && relatedRjWork && (
                  <div className="w-full h-full overflow-y-auto p-4 space-y-2 hide-scrollbar text-left">
                    <div className="text-[10px] text-zinc-500 font-mono mb-2 uppercase px-1">本音声包含的所有分段音轨:</div>
                    {relatedRjWork.tracks.map((track) => {
                      const isPlayingThis = track.id === currentTrack.id;
                      return (
                        <div
                          key={track.id}
                          onClick={() => onPlayTrack(track)}
                          className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer border ${
                            isPlayingThis 
                              ? 'bg-brand-color/15 border-brand-color text-brand-color font-bold shadow-md' 
                              : 'bg-white/2 border-white/5 hover:border-white/10 text-zinc-300 hover:text-white'
                          }`}
                        >
                          <div className="min-w-0 flex-1 flex items-center space-x-2.5">
                            <Disc className={`w-3.5 h-3.5 flex-shrink-0 ${isPlayingThis ? 'animate-spin text-brand-color' : 'text-zinc-500'}`} />
                            <span className="text-xs truncate">{track.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-400 ml-3">{Math.floor(track.duration / 60)}分钟</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeRightTab === 'queue' && (
                  <div className="w-full h-full overflow-y-auto p-4 space-y-2 hide-scrollbar text-left">
                    <div className="text-[10px] text-zinc-500 font-mono mb-2 uppercase px-1">即将播放顺序队列 (可直接点击切换):</div>
                    {queue.map((track, idx) => {
                      const isPlayingThis = track.id === currentTrack.id;
                      return (
                        <div
                          key={track.id + '_' + idx}
                          onClick={() => onPlayTrack(track)}
                          className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer border ${
                            isPlayingThis 
                              ? 'bg-brand-color/10 border-brand-color/30 text-brand-color font-bold' 
                              : 'bg-white/2 border-white/5 hover:border-white/10 text-zinc-300 hover:text-white'
                          }`}
                        >
                          <div className="min-w-0 flex-1 flex items-center space-x-3">
                            <span className="text-[10px] font-mono text-zinc-500 w-5">{String(idx + 1).padStart(2, '0')}</span>
                            <img src={track.coverUrl} alt="" className="w-7 h-7 rounded object-cover shadow-sm" referrerPolicy="no-referrer" />
                            <span className="text-xs truncate">{track.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-400 ml-3">{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeRightTab === 'bookmarks' && (
                  <div className="w-full h-full flex flex-col p-4 overflow-hidden text-left">
                    <div className="text-[10px] text-zinc-500 font-mono mb-2 uppercase px-1">
                      当前音轨精彩片段与感官书签 (点击跳转):
                    </div>
                    
                    {/* Add Bookmark form */}
                    <div className="flex gap-2 mb-3 bg-white/2 p-2 rounded-xl border border-white/5 flex-shrink-0">
                      <input
                        type="text"
                        value={bookmarkInput}
                        onChange={(e) => setBookmarkInput(e.target.value)}
                        placeholder={`标记当前位置：${formatTime(progress)} (输入标签名...)`}
                        className="flex-1 bg-zinc-950/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-color placeholder-zinc-500"
                        onKeyDown={(e) => {
                           if (e.key === 'Enter') handleAddBookmark();
                        }}
                      />
                      <button
                        onClick={handleAddBookmark}
                        className="bg-brand-color hover:bg-brand-color/90 text-white text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 font-bold active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>标记</span>
                      </button>
                    </div>

                    {/* Bookmarks List */}
                    <div className="flex-1 overflow-y-auto space-y-2 hide-scrollbar">
                      {bookmarks.length === 0 ? (
                        <div className="py-12 text-center text-zinc-500 text-xs flex flex-col items-center justify-center space-y-2">
                          <Bookmark className="w-6 h-6 text-zinc-600 animate-pulse" />
                          <span>还没有为该音轨添加过任何感官标记</span>
                          <p className="text-[10px] text-zinc-600">在您想记住的掏耳或呼吸瞬间点击上方“标记”按钮</p>
                        </div>
                      ) : (
                        bookmarks.map((b) => {
                          const isCurrentBookmarkActive = Math.abs(progress - b.time) < 2;
                          return (
                            <div
                              key={b.id}
                              onClick={() => onSeek && onSeek(b.time)}
                              className={`group/b flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer border ${
                                isCurrentBookmarkActive
                                  ? 'bg-brand-color/15 border-brand-color text-brand-color font-bold shadow-sm'
                                  : 'bg-white/2 border-white/5 hover:border-white/10 text-zinc-300 hover:text-white'
                              }`}
                            >
                              <div className="min-w-0 flex-1 flex items-center space-x-2.5">
                                <span className="text-[10px] font-mono bg-white/5 border border-white/10 text-brand-color px-2 py-0.5 rounded flex-shrink-0">
                                  {formatTime(b.time)}
                                </span>
                                <span className="text-xs truncate">{b.note}</span>
                              </div>
                              
                              <button
                                onClick={(e) => handleDeleteBookmark(b.id, e)}
                                className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-400/10 opacity-0 group-hover/b:opacity-100 transition-all cursor-pointer"
                                title="删除该书签"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

              </div>

            </div>
          </>
        ) : playerStyle === 'vinyl' ? (
          /* ========================================== */
          /*         NEW HIGH-FIDELITY VINYL LAYOUT      */
          /* ========================================== */
          <div className="w-full flex-1 flex flex-col items-center justify-center text-center space-y-6 md:space-y-8 py-2 relative max-w-2xl mx-auto animate-fade-in">
            {/* Ambient Album Glow behind Vinyl */}
            <div 
              className="absolute w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] md:w-[360px] md:h-[360px] bg-cover bg-center rounded-full blur-[80px] opacity-35 scale-110 pointer-events-none transition-transform duration-700"
              style={{ backgroundImage: `url(${currentTrack.coverUrl})` }}
            />

            {/* 3D Vinyl Plate Container */}
            <div className="relative w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] md:w-[380px] md:h-[380px] aspect-square flex-shrink-0 flex items-center justify-center select-none">
              
              {/* Stylus Needle (Realistic Golden/Beige Metal Tonearm) - Under raf high fidelity physics control */}
              <div 
                ref={tonearmRef}
                className="absolute z-20 -top-8 right-[5%] sm:right-[10%] scale-90 sm:scale-100 md:scale-110"
                style={{
                  transformOrigin: '50px 25px',
                  width: '100px',
                  height: '150px'
                }}
              >
                <svg width="100" height="150" viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
                  {/* Metallic Pivot ring */}
                  <circle cx="50" cy="25" r="16" fill="#1e1e24" stroke="#d4af37" strokeWidth="2" />
                  <circle cx="50" cy="25" r="10" fill="#3f3f46" stroke="#ffffff" strokeWidth="1" />
                  <circle cx="50" cy="25" r="5" fill="#121212" />
                  
                  {/* Golden curved needle arm */}
                  <path 
                    d="M50 25 C50 60, 80 80, 55 125" 
                    stroke="url(#metallic-gold-panel)" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                  
                  {/* Cartridge headshell */}
                  <rect x="47" y="123" width="16" height="18" rx="2" transform="rotate(25 47 123)" fill="#ffffff" stroke="#d4af37" strokeWidth="1" />
                  {/* Stylus details */}
                  <rect x="52" y="131" width="6" height="8" rx="1" transform="rotate(25 52 131)" fill="#d4af37" />
                  <circle cx="53" cy="130" r="1.5" fill="#f43f5e" />

                  <defs>
                    <linearGradient id="metallic-gold-panel" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#f3e5ab" />
                      <stop offset="50%" stopColor="#d4af37" />
                      <stop offset="100%" stopColor="#aa7c11" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* 3D Vinyl Plate - Under raf high fidelity physics control */}
              <div 
                ref={recordRef}
                className="w-full h-full rounded-full bg-zinc-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),_inset_0_4px_20px_rgba(255,255,255,0.06)] flex items-center justify-center overflow-hidden ring-2 ring-white/5 relative"
                style={{
                  backgroundImage: 'radial-gradient(circle, #2a2a2e 0%, #1a1a1d 35%, #101012 60%, #060608 85%, #010102 100%)'
                }}
              >
                {/* Realistic gloss reflections */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent rotate-45 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-white/[0.04] to-transparent rotate-45 pointer-events-none" />
                
                {/* Concentric groove paths to simulate vinyl grooves */}
                <div className="absolute inset-4 rounded-full border border-white/[0.03] pointer-events-none" />
                <div className="absolute inset-8 rounded-full border border-white/[0.03] pointer-events-none" />
                <div className="absolute inset-12 rounded-full border border-white/[0.03] pointer-events-none" />
                <div className="absolute inset-16 rounded-full border border-white/[0.03] pointer-events-none" />
                <div className="absolute inset-20 rounded-full border border-white/[0.03] pointer-events-none" />
                <div className="absolute inset-24 rounded-full border border-white/[0.03] pointer-events-none" />
                <div className="absolute inset-28 rounded-full border border-white/[0.03] pointer-events-none" />
                <div className="absolute inset-32 rounded-full border border-white/[0.03] pointer-events-none" />
                <div className="absolute inset-36 rounded-full border border-white/[0.03] pointer-events-none" />
                <div className="absolute inset-40 rounded-full border border-white/[0.03] pointer-events-none" />
                <div className="absolute inset-44 rounded-full border border-white/[0.03] pointer-events-none" />
                <div className="absolute inset-48 rounded-full border border-white/[0.03] pointer-events-none" />

                {/* Center album cover art inside the vinyl (gorgeous gold border) */}
                <div 
                  className="w-[44%] h-[44%] rounded-full overflow-hidden border-[6px] border-zinc-950 shadow-2xl flex-shrink-0 relative z-10 ring-4 ring-[#d4af37]/35"
                >
                  <img 
                    src={currentTrack.coverUrl} 
                    alt="" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Center pin hole */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center shadow-md">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
                  </div>
                </div>
              </div>
            </div>

            {/* Song details below Vinyl Plate */}
            <div className="space-y-2 w-full max-w-md select-text flex-shrink-0 z-10 relative">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight tracking-wide drop-shadow-md truncate px-4">
                {currentTrack.title}
              </h2>
              <p className="text-sm md:text-base text-zinc-400 font-medium truncate px-4">
                CV 声优/歌手: {currentTrack.artist}
              </p>
              {currentTrack.rjId && (
                <div className="inline-block text-[10px] text-brand-color font-mono font-bold bg-brand-color/10 px-2.5 py-0.5 rounded border border-brand-color/20 mt-1">
                  来自 RJ工作区 [{currentTrack.rjId}]
                </div>
              )}
            </div>

            {/* Highlighted active single lyric line */}
            <div className="min-h-[80px] flex flex-col items-center justify-center px-4 py-2 mt-2 pb-16 w-full max-w-xl mx-auto transition-all duration-500 select-text flex-shrink-0 z-10 relative">
              {bilingualData[activeLyricIndex] ? (
                <div className="space-y-2 animate-fade-in text-center">
                  <p className="text-xl md:text-2xl font-extrabold text-white leading-relaxed tracking-wide drop-shadow-[0_2px_15px_rgba(255,255,255,0.35)]">
                    {bilingualData[activeLyricIndex].original}
                  </p>
                  {bilingualData[activeLyricIndex].translation && (
                    <p className="text-base md:text-lg text-brand-color font-semibold leading-relaxed drop-shadow-[0_1px_5px_rgba(0,0,0,0.5)]">
                      {bilingualData[activeLyricIndex].translation}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-zinc-500 text-sm italic animate-pulse">
                  {isPlaying ? "～ 伴奏中 ～" : "已暂停"}
                </p>
              )}
            </div>
          </div>
        ) : (
          /* ========================================== */
          /*         EXISTING IMMERSIVE LYRICS LAYOUT   */
          /* ========================================== */
          <>
            <div 
              className="w-full h-full flex-1 max-w-4xl mx-auto flex flex-col bg-transparent overflow-hidden transition-all duration-500 animate-fade-in"
              style={{ transform: 'none', perspective: 'none' }}
            >
              {/* Tab selectors (Fades out in ambient mode) */}
              <div className={`flex border-b border-white/5 text-xs text-zinc-400 font-semibold bg-white/2 transition-all duration-700 ${
                isUserInactive ? 'opacity-0 pointer-events-none -translate-y-2' : 'opacity-100 translate-y-0'
              }`}>
                <button
                  onClick={() => setActiveRightTab('lyrics')}
                  className={`flex-1 py-3 flex items-center justify-center space-x-1.5 transition-colors border-r border-white/5 ${
                    activeRightTab === 'lyrics' ? 'text-brand-color bg-white/5 font-bold' : 'hover:text-white'
                  }`}
                >
                  <Subtitles className="w-4 h-4" />
                  <span>{playerStyle === 'lyrics' ? '同步双语字幕' : '滚动歌词'}</span>
                </button>
                
                {currentTrack.type === 'asmr' && relatedRjWork && (
                  <button
                    onClick={() => setActiveRightTab('chapters')}
                    className={`flex-1 py-3 flex items-center justify-center space-x-1.5 transition-colors border-r border-white/5 ${
                      activeRightTab === 'chapters' ? 'text-brand-color bg-white/5 font-bold' : 'hover:text-white'
                    }`}
                  >
                    <FolderTree className="w-4 h-4" />
                    <span>ASMR分轨 ({relatedRjWork.tracks.length})</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveRightTab('queue')}
                  className={`flex-1 py-3 flex items-center justify-center space-x-1.5 transition-colors ${
                    activeRightTab === 'queue' ? 'text-brand-color bg-white/5 font-bold' : 'hover:text-white'
                  }`}
                >
                  <ListMusic className="w-4 h-4" />
                  <span>播放列表 ({queue.length})</span>
                </button>
              </div>

              {/* Interactive Content Viewport */}
              <div className="flex-1 overflow-hidden relative" style={{ transform: 'none', perspective: 'none' }}>
                
                {/* Top and Bottom Fading gradient transparent masks for immersive text floating */}
                {activeRightTab === 'lyrics' && (
                  <>
                    <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-zinc-950 via-zinc-950/30 to-transparent pointer-events-none z-10" />
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent pointer-events-none z-10" />
                  </>
                )}

                {/* Tab: Lyrics list with bilingual original/translation support */}
                {activeRightTab === 'lyrics' && (
                  <div 
                    ref={lyricsContainerRef}
                    className="relative w-full h-full overflow-y-auto py-28 px-6 space-y-8 hide-scrollbar scroll-smooth text-center"
                    style={{ transform: 'none', writingMode: 'horizontal-tb' }}
                  >
                    {bilingualData.length === 0 ? (
                      <div className="py-24 text-center text-zinc-500 text-xs flex flex-col items-center justify-center space-y-2">
                        <Sparkles className="w-7 h-7 text-zinc-600 animate-pulse" />
                        <span>本音声暂时无中文字幕数据</span>
                      </div>
                    ) : (
                      bilingualData.map((lrc, idx) => {
                        const isActive = idx === activeLyricIndex;
                        
                        // Layout-stable styling to prevent offsetTop jumps, layout thrashing, and jittery scrolling
                        let containerClass = "transition-all duration-500 cursor-pointer flex flex-col items-center justify-center origin-center ";
                        let originalClass = "transition-all duration-500 block leading-relaxed ";
                        let translationClass = "transition-all duration-500 block leading-relaxed ";
                        
                        if (playerStyle === 'lyrics') {
                          // Constant padding py-4 and same font size to guarantee absolute zero offsetTop layout shifts!
                          containerClass += "py-4 " + (isActive 
                            ? "scale-[1.06] opacity-100 z-10" 
                            : "scale-100 opacity-25 hover:opacity-70");
                          originalClass += "text-xl md:text-2xl font-bold tracking-wide " + (isActive 
                            ? "text-white drop-shadow-[0_2px_15px_rgba(255,255,255,0.35)]" 
                            : "text-zinc-400");
                          translationClass += "text-sm md:text-base mt-2 " + (isActive 
                            ? "text-brand-color font-semibold" 
                            : "text-zinc-500");
                        } else { // vinyl
                          // Constant padding py-3 and same font size to guarantee absolute zero offsetTop layout shifts!
                          containerClass += "py-3 " + (isActive 
                            ? "scale-[1.05] opacity-100 z-10" 
                            : "scale-100 opacity-30 hover:opacity-75");
                          originalClass += "text-base md:text-lg font-bold " + (isActive 
                            ? "text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.25)]" 
                            : "text-zinc-400");
                          translationClass += "text-xs md:text-sm mt-1.5 " + (isActive 
                            ? "text-indigo-300 font-semibold" 
                            : "text-zinc-500");
                        }

                        return (
                          <div
                            key={idx}
                            onClick={() => onSeek && onSeek(lrc.time)}
                            className={containerClass}
                            title="双击或点击此行跳转播放"
                            style={{ writingMode: 'horizontal-tb', transform: 'none' }}
                          >
                            <span className={originalClass} style={{ transform: 'none' }}>{lrc.original}</span>
                            {lrc.translation && (
                              <span className={translationClass} style={{ transform: 'none' }}>{lrc.translation}</span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Tab: Chapters tracklist selection */}
                {activeRightTab === 'chapters' && relatedRjWork && (
                  <div className="w-full h-full overflow-y-auto p-4 space-y-2 scrollbar-thin">
                    <div className="text-[10px] text-zinc-500 font-mono mb-2 uppercase px-1">本音声包含的所有分段音轨:</div>
                    {relatedRjWork.tracks.map((track) => {
                      const isPlayingThis = track.id === currentTrack.id;
                      return (
                        <div
                          key={track.id}
                          onClick={() => onPlayTrack(track)}
                          className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer border ${
                            isPlayingThis 
                              ? 'bg-brand-color/15 border-brand-color text-brand-color font-bold shadow-md' 
                              : 'bg-white/2 border-white/5 hover:border-white/10 text-zinc-300 hover:text-white'
                          }`}
                        >
                          <div className="min-w-0 flex-1 flex items-center space-x-2.5">
                            <Disc className={`w-3.5 h-3.5 flex-shrink-0 ${isPlayingThis ? 'animate-spin text-brand-color' : 'text-zinc-500'}`} />
                            <span className="text-xs truncate">{track.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-400 ml-3">{Math.floor(track.duration / 60)}分钟</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Tab: Playlist active queue queue list */}
                {activeRightTab === 'queue' && (
                  <div className="w-full h-full overflow-y-auto p-4 space-y-2 scrollbar-thin">
                    <div className="text-[10px] text-zinc-500 font-mono mb-2 uppercase px-1">即将播放顺序队列 (可直接点击切换):</div>
                    {queue.map((track, idx) => {
                      const isPlayingThis = track.id === currentTrack.id;
                      return (
                        <div
                          key={track.id + '_' + idx}
                          onClick={() => onPlayTrack(track)}
                          className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer border ${
                            isPlayingThis 
                              ? 'bg-brand-color/10 border-brand-color/30 text-brand-color font-bold' 
                              : 'bg-white/2 border-white/5 hover:border-white/10 text-zinc-300 hover:text-white'
                          }`}
                        >
                          <div className="min-w-0 flex-1 flex items-center space-x-3">
                            <span className="text-[10px] font-mono text-zinc-500 w-5">{String(idx + 1).padStart(2, '0')}</span>
                            <img src={track.coverUrl} alt="" className="w-7 h-7 rounded object-cover shadow-sm" referrerPolicy="no-referrer" />
                            <span className="text-xs truncate">{track.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-400 ml-3">{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Tab: Sensory Bookmarks & Highlights */}
                {activeRightTab === 'bookmarks' && (
                  <div className="w-full h-full flex flex-col p-4 overflow-hidden">
                    <div className="text-[10px] text-zinc-500 font-mono mb-2 uppercase px-1">
                      当前音轨精彩片段与感官书签 (点击跳转):
                    </div>
                    
                    {/* Add Bookmark form */}
                    <div className="flex gap-2 mb-3 bg-white/2 p-2 rounded-xl border border-white/5 flex-shrink-0">
                      <input
                        type="text"
                        value={bookmarkInput}
                        onChange={(e) => setBookmarkInput(e.target.value)}
                        placeholder={`标记当前位置：${formatTime(progress)} (输入标签名...)`}
                        className="flex-1 bg-zinc-950/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-color placeholder-zinc-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddBookmark();
                        }}
                      />
                      <button
                        onClick={handleAddBookmark}
                        className="bg-brand-color hover:bg-brand-color/90 text-white text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 font-bold active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>标记</span>
                      </button>
                    </div>

                    {/* Bookmarks List */}
                    <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
                      {bookmarks.length === 0 ? (
                        <div className="py-12 text-center text-zinc-500 text-xs flex flex-col items-center justify-center space-y-2">
                          <Bookmark className="w-6 h-6 text-zinc-600 animate-pulse" />
                          <span>还没有为该音轨添加过任何感官标记</span>
                          <p className="text-[10px] text-zinc-600">在您想记住的掏耳或呼吸瞬间点击上方“标记”按钮</p>
                        </div>
                      ) : (
                        bookmarks.map((b) => {
                          const isCurrentBookmarkActive = Math.abs(progress - b.time) < 2;
                          return (
                            <div
                              key={b.id}
                              onClick={() => onSeek && onSeek(b.time)}
                              className={`group/b flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer border ${
                                isCurrentBookmarkActive
                                  ? 'bg-brand-color/15 border-brand-color text-brand-color font-bold shadow-sm'
                                  : 'bg-white/2 border-white/5 hover:border-white/10 text-zinc-300 hover:text-white'
                              }`}
                            >
                              <div className="min-w-0 flex-1 flex items-center space-x-2.5">
                                <span className="text-[10px] font-mono bg-white/5 border border-white/10 text-brand-color px-2 py-0.5 rounded flex-shrink-0">
                                  {formatTime(b.time)}
                                </span>
                                <span className="text-xs truncate">{b.note}</span>
                              </div>
                              
                              <button
                                onClick={(e) => handleDeleteBookmark(b.id, e)}
                                className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-400/10 opacity-0 group-hover/b:opacity-100 transition-all cursor-pointer"
                                title="删除该书签"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Immersive Subtitles Status Info */}
              <div className="p-3 border-t border-white/5 bg-zinc-950/40 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                <span className="flex items-center space-x-1.5">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500'}`} />
                  <span>本地无损解码中</span>
                </span>
                <span>无损 Hi-Res FLAC | Stereo | 24bit</span>
              </div>

            </div>
          </>
        )}

      </div>

      {/* Shared Fixed Player Bottom Controls Bar (Fades out in ambient mode) */}
      <div className={`relative z-10 w-full bg-zinc-950/70 border-t border-white/5 pt-6 pb-6 px-6 md:px-16 backdrop-blur-2xl flex flex-col space-y-4 transition-all duration-700 ${
        isUserInactive ? 'opacity-0 pointer-events-none translate-y-6' : 'opacity-100 translate-y-0'
      }`}>
        
        {/* Timeline Slider with beautiful edge-to-edge floating style */}
        <div className="flex items-center space-x-4 text-[10px] text-zinc-400 font-mono max-w-5xl mx-auto w-full">
          <span className="w-10 text-right">{formatTime(progress)}</span>
          
          <div className="flex-1 relative h-1 group cursor-pointer">
            <input 
              type="range" 
              min="0"
              max={totalDuration || 100}
              value={progress}
              onChange={(e) => onSeek && onSeek(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
            {/* Timeline track background */}
            <div className="absolute inset-0 bg-white/10 rounded-full group-hover:bg-white/15 transition-colors" />
            
            {/* Timeline progress bar */}
            <div 
              className="absolute top-0 left-0 h-full bg-brand-color rounded-full transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Slider thumb handle */}
            <div 
              className="absolute top-1/2 w-3 h-3 bg-white rounded-full border border-brand-color -translate-y-1/2 -translate-x-1/2 shadow opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          <span className="w-10">{formatTime(totalDuration)}</span>
        </div>

        {/* Playback Button Actions & Utilities Bar */}
        <div className="flex items-center justify-between max-w-5xl mx-auto w-full gap-4">
          
          {/* Left Side: Playback Controls & Mode */}
          <div className="w-1/3 flex items-center justify-start space-x-3">
            {/* Favorite / Like Button */}
            <button
              onClick={() => toggleFavorite?.(currentTrack.id)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer border border-white/5 group active:scale-95 flex items-center justify-center"
              title={isFavorite ? "取消喜欢" : "添加喜欢"}
            >
              <Heart className={`w-4 h-4 transition-all duration-300 ${isFavorite ? "fill-rose-500 text-rose-500 scale-110" : "text-zinc-300 group-hover:scale-105"}`} />
            </button>

            {/* Prev Track */}
            <button
              onClick={onPrev}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer border border-white/5 active:scale-90"
              title="上一首"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            {/* Play/Pause Main Key */}
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-white hover:scale-105 active:scale-95 text-zinc-950 flex items-center justify-center shadow-lg hover:shadow-white/5 transition-all cursor-pointer"
              title={isPlaying ? '暂停' : '播放'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current text-zinc-900" />
              ) : (
                <Play className="w-5 h-5 fill-current text-zinc-900 translate-x-0.5" />
              )}
            </button>

            {/* Next Track */}
            <button
              onClick={onNext}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer border border-white/5 active:scale-90"
              title="下一首"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            {/* Playback Loop Mode */}
            <button
              onClick={toggleLoopMode}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-white/5"
              title={loopMode === 'shuffle' ? '随机播放' : loopMode === 'one' ? '单曲循环' : '列表循环'}
            >
              {loopMode === 'shuffle' ? (
                <Shuffle className="w-4 h-4 text-indigo-400" />
              ) : loopMode === 'one' ? (
                <Repeat1 className="w-4 h-4 text-pink-400 animate-pulse" />
              ) : (
                <Repeat className="w-4 h-4 text-emerald-400" />
              )}
            </button>
          </div>

          {/* Middle Side: Current Track meta thumb */}
          <div className="w-1/3 flex items-center justify-center text-center">
            {playerStyle === 'lyrics' ? (
              <div className="flex items-center space-x-2 bg-white/5 p-1 px-3 rounded-full border border-white/5 max-w-[280px] truncate animate-fade-in">
                <img src={currentTrack.coverUrl} alt="" className="w-5 h-5 rounded object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                <span className="text-xs font-bold text-zinc-200 truncate">{currentTrack.title}</span>
                <span className="text-[10px] text-zinc-400 flex-shrink-0">• {currentTrack.artist}</span>
              </div>
            ) : (
              <div className="text-[11px] text-zinc-400 font-mono tracking-wide bg-white/5 px-3 py-1 rounded-full border border-white/5">
                双轨立体声 Hi-Res 解码中
              </div>
            )}
          </div>

          {/* Right Side: Volume & Queue shortcuts */}
          <div className="w-1/3 flex items-center justify-end space-x-3">
            
            {/* Quick volume control icon and slider */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="text-zinc-400 hover:text-white p-1.5 rounded hover:bg-white/5 transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              
              <div className="relative w-16 md:w-24 h-1 bg-white/10 rounded-full flex items-center group/vol cursor-pointer">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onVolumeChange && onVolumeChange(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div 
                  className="h-full bg-brand-color group-hover/vol:bg-brand-color rounded-full transition-all duration-75"
                  style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                />
                <div 
                  className="absolute w-2.5 h-2.5 bg-white rounded-full -translate-x-1/2 opacity-0 group-hover/vol:opacity-100 transition-opacity pointer-events-none shadow"
                  style={{ left: `${(isMuted ? 0 : volume) * 100}%` }}
                />
              </div>
            </div>

            {/* Divider */}
            <span className="text-white/10">|</span>

            {/* Bedtime Dim Mode Button */}
            <button
              onClick={() => setIsSleepDimActive(true)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-indigo-300 transition-all cursor-pointer border border-white/5 flex items-center justify-center relative"
              title="开启睡前低亮度屏保"
            >
              <Moon className="w-4 h-4" />
            </button>

            {/* Sleep Timer (睡眠定时器) Trigger Button with Floating Preset Menu */}
            <div className="relative">
              <button
                onClick={() => setIsSleepTimerMenuOpen(!isSleepTimerMenuOpen)}
                className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1 border ${
                  sleepTimerMinutes !== null 
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                    : 'bg-white/5 border-white/5 text-zinc-300 hover:text-emerald-400 hover:bg-white/10'
                }`}
                title="设置睡眠定时关闭"
              >
                <Clock className="w-4 h-4" />
                {sleepTimerMinutes !== null && (
                  <span className="text-[10px] font-mono font-bold">
                    {formatCountdown(sleepTimerSecondsLeft)}
                  </span>
                )}
              </button>

              {/* Sleep Preset Floating Menu */}
              {isSleepTimerMenuOpen && (
                <div className="absolute bottom-12 right-0 w-52 bg-zinc-950/95 border border-white/10 rounded-xl p-3 shadow-2xl z-50 backdrop-blur-xl animate-fade-in space-y-2.5">
                  <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider border-b border-white/5 pb-1 flex justify-between items-center">
                    <span>设置睡眠定时器</span>
                    {sleepTimerMinutes !== null && (
                      <span className="text-emerald-400 font-bold">运行中</span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1.5">
                    {[15, 30, 45, 60, 90].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => handleStartTimer(mins)}
                        className={`py-1 rounded-lg text-xs font-semibold cursor-pointer text-center transition-colors ${
                          sleepTimerMinutes === mins 
                            ? 'bg-brand-color text-white' 
                            : 'bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {mins} 分钟
                      </button>
                    ))}
                  </div>

                  {/* Fadeout setting */}
                  <label className="flex items-center space-x-2 text-[11px] text-zinc-400 select-none cursor-pointer hover:text-white pt-1">
                    <input
                      type="checkbox"
                      checked={isFadeOutEnabled}
                      onChange={(e) => setIsFadeOutEnabled(e.target.checked)}
                      className="rounded bg-zinc-900 border-white/10 text-brand-color focus:ring-0"
                    />
                    <span>最后一分钟音量渐隐</span>
                  </label>

                  {sleepTimerMinutes !== null && (
                    <button
                      onClick={handleStopTimer}
                      className="w-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-400 text-[10px] font-bold py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      取消定时器
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Divider */}
            <span className="text-white/10">|</span>

            {/* Quick Queue List Tab trigger */}
            <button
              onClick={() => setActiveRightTab(activeRightTab === 'queue' ? 'lyrics' : 'queue')}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1 border ${
                activeRightTab === 'queue' 
                  ? 'bg-brand-color/15 border-brand-color/30 text-brand-color' 
                  : 'bg-white/5 border-white/5 text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
              title="查看当前队列"
            >
              <ListMusic className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold">{queue.length}</span>
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
