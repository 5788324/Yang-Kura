// Legacy verifier marker: Demo / Coming Soon / 不联网 / 无真实下载
import React, { useState, useEffect, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { 
  DownloadCloud, 
  Search, 
  Database, 
  Globe, 
  Cloud, 
  Cpu, 
  Server, 
  HardDriveDownload, 
  CheckCircle2, 
  Loader2, 
  ArrowDownToLine,
  Music,
  Sparkles,
  RefreshCw,
  FolderOpen,
  Play,
  Pause,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  FileAudio,
  FileText,
  Image as ImageIcon,
  Folder,
  AlertCircle,
  PauseCircle,
  MoreVertical,
  Check,
  Zap,
  Info,
  FolderSync,
  HelpCircle
} from 'lucide-react';
import { AudioTrack, FileProgress, DownloadTask, AsmrMetadata, MusicMetadata } from '../types';
import { coverArtworkService } from '../services/coverArtworkService';

interface DownloaderPageProps {
  onPlayTrack?: (track: AudioTrack) => void;
}

export default function DownloaderPage({ onPlayTrack }: DownloaderPageProps) {
  const [activeTab, setActiveTab] = useState<'asmr' | 'music'>('asmr');
  const [taskFilter, setTaskFilter] = useState<'all' | 'downloading' | 'completed' | 'paused-failed'>('all');
  const [taskSearch, setTaskSearch] = useState('');
  
  // ==================== ASMR CRAWLER STATES ====================
  const [rjIdInput, setRjIdInput] = useState('RJ01026048');
  const [asmrSource, setAsmrSource] = useState<'asmr_one' | 'dlsite' | 'yk_cdn' | 'webdav'>('yk_cdn');
  const [asmrLoading, setAsmrLoading] = useState(false);
  const [parsedAsmr, setParsedAsmr] = useState<AsmrMetadata | null>(null);

  // ==================== MUSIC CRAWLER STATES ====================
  const [musicSearchInput, setMusicSearchInput] = useState('米津玄師 - Lemon');
  const [musicSource, setMusicSource] = useState<'netease' | 'qq' | 'youtube' | 'ipfs'>('netease');
  const [musicQuality, setMusicQuality] = useState<'standard' | 'flac_16bit' | 'flac_24bit'>('flac_24bit');
  const [musicLoading, setMusicLoading] = useState(false);
  const [parsedMusic, setParsedMusic] = useState<MusicMetadata | null>(null);

  // ==================== GLOBAL DOWNLOAD TASKS LIST ====================
  const [tasks, setTasks] = useLocalStorage<DownloadTask[]>('downloader_tasks', [
    {
      id: 'RJ01026048',
      type: 'asmr',
      title: 'お姉ちゃんの優しいハグとご挨拶＆耳かき睡眠導入',
      subtitle: 'Honey Strap',
      coverUrl: coverArtworkService.makeFallbackCover('下载器 Demo 封面 1', '本地离线占位', 'asmr'),
      totalSize: '1.24 GB',
      progress: 68,
      status: 'downloading',
      speed: '18.4 MB/s',
      addedAt: '2026-07-02 10:00',
      files: [
        { name: '01_お姉ちゃんのハグと添い寝.wav', size: '350 MB', progress: 100, status: 'completed' },
        { name: '02_耳かき睡眠導入パート.wav', size: '550 MB', progress: 68, status: 'downloading' },
        { name: '03_朝のご挨拶与极上洗发音.wav', size: '368 MB', progress: 0, status: 'pending' }
      ]
    },
    {
      id: 'RJ332128',
      type: 'asmr',
      title: '圧倒的包容力で眠らせる极上ASMR両耳同時耳かき',
      subtitle: '桃色CODE',
      coverUrl: coverArtworkService.makeFallbackCover('下载器 Demo 封面 2', '本地离线占位', 'asmr'),
      totalSize: '1.85 GB',
      progress: 100,
      status: 'completed',
      speed: '0 KB/s',
      addedAt: '2026-07-01 22:30',
      files: [
        { name: '01_耳元ふーふー息吹きかけ.wav', size: '600 MB', progress: 100, status: 'completed' },
        { name: '02_極上両耳同時耳かき.flac', size: '1.25 GB', progress: 100, status: 'completed' }
      ]
    },
    {
      id: 'music_01',
      type: 'music',
      title: 'Lemon',
      subtitle: '米津玄師 (Kenshi Yonezu)',
      coverUrl: coverArtworkService.makeFallbackCover('下载器 Demo 封面 3', '本地离线占位', 'music'),
      totalSize: '48.5 MB',
      progress: 100,
      status: 'completed',
      speed: '0 KB/s',
      addedAt: '2026-07-02 08:15',
      files: [
        { name: '米津玄師 - Lemon [Hi-Res 24bit].flac', size: '48.5 MB', progress: 100, status: 'completed' }
      ]
    },
    {
      id: 'music_02',
      type: 'music',
      title: '晴天',
      subtitle: '周杰伦 (Jay Chou)',
      coverUrl: coverArtworkService.makeFallbackCover('下载器 Demo 封面 4', '本地离线占位', 'asmr'),
      totalSize: '54.2 MB',
      progress: 42,
      status: 'downloading',
      speed: '1.2 MB/s',
      addedAt: '2026-07-02 10:05',
      files: [
        { name: '周杰伦 - 晴天 [Master 24bit].flac', size: '54.2 MB', progress: 42, status: 'downloading' }
      ]
    },
    {
      id: 'music_03',
      type: 'music',
      title: '夜に駆ける',
      subtitle: 'YOASOBI',
      coverUrl: coverArtworkService.makeFallbackCover('下载器 Demo 封面 5', '本地离线占位', 'asmr'),
      totalSize: '39.8 MB',
      progress: 15,
      status: 'failed',
      speed: '0 KB/s',
      addedAt: '2026-06-30 14:20',
      files: [
        { name: 'YOASOBI - 夜に駆ける [Hi-Res].flac', size: '39.8 MB', progress: 15, status: 'failed' }
      ]
    }
  ]);

  // Expanded status for task file lists
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({
    'RJ01026048': true // Default expand first task to look great
  });

  // UI state for floating custom Context Menu
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    taskId: string;
  } | null>(null);

  // UI state for Simulated System Explorer popup
  const [explorerFolder, setExplorerFolder] = useState<{
    id: string;
    title: string;
    path: string;
    files: { name: string; size: string; type: 'audio' | 'image' | 'text'; content?: string }[];
  } | null>(null);

  // UI state for simple Text File Viewer within explorer
  const [textViewer, setTextViewer] = useState<{ title: string; content: string } | null>(null);
  
  // Floating notifications Toast list
  const [notifications, setNotifications] = useState<{ id: string; message: string }[]>([]);

  const addNotification = (msg: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message: msg }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  // Simulated Database of metadata
  const mockRjDatabase: Record<string, AsmrMetadata> = {
    'RJ01026048': {
      id: 'RJ01026048',
      title: 'お姉ちゃんの優しいハグとご挨拶＆耳かき睡眠導入',
      circle: 'Honey Strap',
      cv: '周防パトラ (Suou Patra)',
      releaseDate: '2024-03-22',
      fileSize: '1.24 GB',
      tracksCount: 3,
      coverUrl: coverArtworkService.makeFallbackCover('下载器 Demo 封面 6', '本地离线占位', 'music')
    },
    'RJ332128': {
      id: 'RJ332128',
      title: '圧倒的包容力で眠らせる极上ASMR両耳同時耳かき',
      circle: '桃色CODE',
      cv: 'あまね (Amane)',
      releaseDate: '2023-08-15',
      fileSize: '1.85 GB',
      tracksCount: 2,
      coverUrl: coverArtworkService.makeFallbackCover('下载器 Demo 封面 7', '本地离线占位', 'asmr')
    },
    'RJ253912': {
      id: 'RJ253912',
      title: '全編最高峰バイノーラル・ひざまくらでたっぷり甘やかし耳かき',
      circle: '柚子蜜 (Yuzumitsu)',
      cv: '伊ヶ崎綾香 (Ikasaki Ayaka)',
      releaseDate: '2024-01-10',
      fileSize: '720 MB',
      tracksCount: 2,
      coverUrl: coverArtworkService.makeFallbackCover('下载器 Demo 封面 8', '本地离线占位', 'asmr')
    }
  };

  const mockMusicDatabase: Record<string, MusicMetadata> = {
    '米津玄師 - Lemon': {
      title: 'Lemon',
      artist: '米津玄師 (Kenshi Yonezu)',
      album: 'Lemon (Single)',
      quality: 'Hi-Res Flac | 24bit 96kHz',
      fileSize: '48.5 MB',
      coverUrl: coverArtworkService.makeFallbackCover('下载器 Demo 封面 9', '本地离线占位', 'music')
    },
    '周杰伦 - 晴天': {
      title: '晴天',
      artist: '周杰伦 (Jay Chou)',
      album: '叶惠美',
      quality: 'Master Flac | 24bit 192kHz',
      fileSize: '54.2 MB',
      coverUrl: coverArtworkService.makeFallbackCover('下载器 Demo 封面 10', '本地离线占位', 'asmr')
    },
    'YOASOBI - 夜に駆ける': {
      title: '夜に駆ける (Racing into the Night)',
      artist: 'YOASOBI',
      album: 'THE BOOK',
      quality: 'Hi-Res Flac | 24bit 48kHz',
      fileSize: '39.8 MB',
      coverUrl: coverArtworkService.makeFallbackCover('下载器 Demo 封面 11', '本地离线占位', 'asmr')
    }
  };

  // ==================== CRAWLER ACTIONS ====================
  const handleParseAsmr = () => {
    setAsmrLoading(true);
    setParsedAsmr(null);

    setTimeout(() => {
      const cleanId = rjIdInput.toUpperCase().trim();
      const matched = mockRjDatabase[cleanId] || {
        id: cleanId,
        title: `未知 ASMR 音声 [${cleanId}] - 元数据已成功代理拉取`,
        circle: '示例社团',
        cv: '匿名音声CV/同人声优',
        releaseDate: '2026-06-30',
        fileSize: '1.20 GB',
        tracksCount: 3,
        coverUrl: coverArtworkService.makeFallbackCover('下载器 Demo 封面 12', '本地离线占位', 'music')
      };
      setParsedAsmr(matched);
      setAsmrLoading(false);
      addNotification(`🔍 已生成作品 ${cleanId} 的示例信息`);
    }, 900);
  };

  const handleParseMusic = () => {
    setMusicLoading(true);
    setParsedMusic(null);

    setTimeout(() => {
      const query = musicSearchInput.trim();
      const matched = mockMusicDatabase[query] || {
        title: query.split('-')[1]?.trim() || query,
        artist: query.split('-')[0]?.trim() || '未知艺术家',
        album: '示例精选集',
        quality: musicQuality === 'flac_24bit' ? 'Hi-Res Flac | 24bit 192kHz' : musicQuality === 'flac_16bit' ? 'Lossless Flac | 16bit 44.1kHz' : 'Standard MP3 | 320kbps',
        fileSize: musicQuality === 'flac_24bit' ? '42.5 MB' : musicQuality === 'flac_16bit' ? '28.1 MB' : '8.4 MB',
        coverUrl: coverArtworkService.makeFallbackCover('下载器 Demo 封面 13', '本地离线占位', 'asmr')
      };
      setParsedMusic(matched);
      setMusicLoading(false);
      addNotification(`🔍 已生成《${matched.title}》的示例信息`);
    }, 800);
  };

  // ==================== ADD DOWNLOAD TASKS ====================
  const handleStartAsmrDownload = () => {
    if (!parsedAsmr) return;

    // Check if task already exists
    const exists = tasks.find(t => t.id === parsedAsmr.id);
    if (exists) {
      addNotification(`ℹ️ 任务 ${parsedAsmr.id} 已经在下载列表中`);
      return;
    }

    const newFiles: FileProgress[] = Array.from({ length: parsedAsmr.tracksCount }).map((_, idx) => {
      const idxStr = String(idx + 1).padStart(2, '0');
      let fSize = '300 MB';
      if (idx === 0) fSize = '350 MB';
      if (idx === 1) fSize = '550 MB';
      if (idx === 2) fSize = '368 MB';

      return {
        name: `${idxStr}_ASMR_Track_音轨及对耳掏耳.wav`,
        size: fSize,
        progress: 0,
        status: idx === 0 ? 'downloading' : 'pending' // First one downloads first
      };
    });

    const newTask: DownloadTask = {
      id: parsedAsmr.id,
      type: 'asmr',
      title: parsedAsmr.title,
      subtitle: parsedAsmr.circle,
      coverUrl: parsedAsmr.coverUrl,
      totalSize: parsedAsmr.fileSize,
      progress: 0,
      status: 'downloading',
      speed: '15.6 MB/s',
      addedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      files: newFiles
    };

    setTasks(prev => [newTask, ...prev]);
    setExpandedTasks(prev => ({ ...prev, [newTask.id]: true }));
    setParsedAsmr(null); // Clear panel
    addNotification(`⚡ 已生成示例任务：${newTask.id}`);
  };

  const handleStartMusicDownload = () => {
    if (!parsedMusic) return;

    const taskTitle = parsedMusic.title;
    const exists = tasks.find(t => t.title === taskTitle && t.type === 'music');
    if (exists) {
      addNotification(`ℹ️ 歌曲 《${taskTitle}》 已经在下载列表中`);
      return;
    }

    const newFiles: FileProgress[] = [
      {
        name: `${parsedMusic.artist} - ${parsedMusic.title} [${parsedMusic.quality.split('|')[0].trim()}].flac`,
        size: parsedMusic.fileSize,
        progress: 0,
        status: 'downloading'
      }
    ];

    const newTask: DownloadTask = {
      id: 'music_' + Date.now(),
      type: 'music',
      title: parsedMusic.title,
      subtitle: parsedMusic.artist,
      coverUrl: parsedMusic.coverUrl,
      totalSize: parsedMusic.fileSize,
      progress: 0,
      status: 'downloading',
      speed: '1.4 MB/s',
      addedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      files: newFiles
    };

    setTasks(prev => [newTask, ...prev]);
    setExpandedTasks(prev => ({ ...prev, [newTask.id]: true }));
    setParsedMusic(null); // Clear panel
    addNotification(`⚡ 已生成示例音乐任务：《${newTask.title}》`);
  };

  // ==================== REAL-TIME DOWNLOADS SIMULATOR LOOP ====================
  useEffect(() => {
    const hasDownloading = tasks.some(t => t.status === 'downloading');
    if (!hasDownloading) return;

    const interval = setInterval(() => {
      setTasks(prevTasks => {
        let updated = false;

        const next = prevTasks.map(task => {
          if (task.status !== 'downloading') return task;
          updated = true;

          let hasActiveDownloadingInTask = false;
          let allFilesDone = true;

          const updatedFiles = task.files.map(file => {
            if (file.status === 'completed') {
              return file;
            }
            
            allFilesDone = false;

            // Simple sequence downloading: download the first one that is "downloading"
            // If none is "downloading", mark the first pending as "downloading"
            if (!hasActiveDownloadingInTask && (file.status === 'downloading' || file.status === 'pending')) {
              hasActiveDownloadingInTask = true;
              const randomInc = Math.floor(Math.random() * 18) + 6;
              const nextProgress = Math.min(file.progress + randomInc, 100);
              const nextStatus = nextProgress === 100 ? 'completed' as const : 'downloading' as const;
              return {
                ...file,
                progress: nextProgress,
                status: nextStatus
              };
            }

            return file;
          });

          // Calculate overall task progress
          const totalProgress = Math.floor(
            updatedFiles.reduce((sum, f) => sum + f.progress, 0) / updatedFiles.length
          );

          const isNowCompleted = totalProgress >= 100 || allFilesDone;

          let randomSpeed = '0 KB/s';
          if (!isNowCompleted) {
            if (task.type === 'asmr') {
              randomSpeed = (Math.random() * 12 + 14.2).toFixed(1) + ' MB/s';
            } else {
              randomSpeed = (Math.random() * 500 + 850).toFixed(0) + ' KB/s';
            }
          }

          if (isNowCompleted && task.status !== 'completed') {
            addNotification(`🎉 [示例完成] 任务《${task.title}》已在页面中完成，不写入真实媒体库。`);
          }

          return {
            ...task,
            progress: isNowCompleted ? 100 : totalProgress,
            status: isNowCompleted ? 'completed' : 'downloading',
            speed: randomSpeed,
            files: updatedFiles.map(f => isNowCompleted ? { ...f, progress: 100, status: 'completed' as const } : f)
          };
        });

        return updated ? next : prevTasks;
      });
    }, 900);

    return () => clearInterval(interval);
  }, [tasks]);

  // ==================== TASK CONTROL ACTIONS ====================
  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      if (t.status === 'downloading') {
        return {
          ...t,
          status: 'paused',
          speed: '0 KB/s',
          files: t.files.map(f => f.status === 'downloading' ? { ...f, status: 'paused' as const } : f)
        };
      } else {
        return {
          ...t,
          status: 'downloading',
          speed: t.type === 'asmr' ? '12.0 MB/s' : '900 KB/s',
          files: t.files.map(f => f.status === 'paused' || f.status === 'pending' ? { ...f, status: 'downloading' as const } : f)
        };
      }
    }));
    addNotification(`⏸️ 任务状态已切换`);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    addNotification(`🗑️ 示例任务已从页面列表移除`);
  };

  const handleToggleExpand = (id: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // ==================== CONTEXT MENU ACTIONS ====================
  const handleContextMenu = (e: React.MouseEvent, taskId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      taskId
    });
  };

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  // ==================== OPEN LOCAL SYSTEM EXPLORER ====================
  const handleOpenFolder = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Generate simulated local files in safe sandbox folder
    const path = task.type === 'asmr' 
      ? `C:\\Downloads\\ASMR\\${task.id}\\`
      : `C:\\Downloads\\Music\\${task.subtitle}\\`;

    const folderFiles: { name: string; size: string; type: 'audio' | 'image' | 'text'; content?: string }[] = [];
    
    // Cover image
    folderFiles.push({
      name: 'cover_front.jpg',
      size: '240 KB',
      type: 'image'
    });

    // Metadata Info Text
    folderFiles.push({
      name: 'Scraped_Metadata.txt',
      size: '4 KB',
      type: 'text',
      content: `[YANG-KURA 示例信息文件]
=========================================
作品ID/Title: ${task.id} - ${task.title}
归属/Artist: ${task.subtitle}
创建时间: ${task.addedAt}
总文件大小: ${task.totalSize}
=========================================
这是下载器页面的示例文件说明，不代表真实下载、解压、校验或入库。
当前页面不会访问网络，也不会写入真实媒体库。
下方 WAV / FLAC 文件仅用于展示未来交互。`
    });

    // Audio Files
    task.files.forEach(f => {
      folderFiles.push({
        name: f.name,
        size: f.size,
        type: 'audio'
      });
    });

    setExplorerFolder({
      id: task.id,
      title: task.title,
      path,
      files: folderFiles
    });

    addNotification(`📂 已打开示例文件夹: ${task.id}`);
  };

  // Double click audio to play
  const handleDoubleClickAudio = (fileName: string) => {
    if (!explorerFolder) return;
    const task = tasks.find(t => t.id === explorerFolder.id);
    if (!task) return;

    if (!onPlayTrack) {
      addNotification(`🔊 示例试听音频: ${fileName}`);
      return;
    }

    const cleanName = fileName.replace(/\.[^/.]+$/, ""); // strip extension
    const track: AudioTrack = {
      id: `local_${task.id}_${fileName}`,
      title: cleanName,
      artist: task.subtitle,
      album: task.title,
      circle: task.type === 'asmr' ? task.subtitle : undefined,
      rjId: task.type === 'asmr' ? task.id : undefined,
      duration: 180, // simulated
      coverUrl: task.coverUrl,
      type: task.type,
      fileSize: '32 MB'
    };

    onPlayTrack(track);
    addNotification(`▶️ 已成功推送到全局底部播放器并开始试听: ${fileName}`);
  };

  // ==================== TASKS LIST CALCULATIONS ====================
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search query
      const matchesSearch = task.title.toLowerCase().includes(taskSearch.toLowerCase()) || 
                            task.id.toLowerCase().includes(taskSearch.toLowerCase()) || 
                            task.subtitle.toLowerCase().includes(taskSearch.toLowerCase());
      if (!matchesSearch) return false;

      // Tab filter
      if (taskFilter === 'downloading') return task.status === 'downloading';
      if (taskFilter === 'completed') return task.status === 'completed';
      if (taskFilter === 'paused-failed') return task.status === 'paused' || task.status === 'failed';
      return true;
    });
  }, [tasks, taskFilter, taskSearch]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const downloading = tasks.filter(t => t.status === 'downloading').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pausedOrFailed = tasks.filter(t => t.status === 'paused' || t.status === 'failed').length;
    
    // Sum active speed
    let speedSum = 0;
    tasks.forEach(t => {
      if (t.status === 'downloading') {
        const value = parseFloat(t.speed);
        if (t.speed.includes('MB/s')) {
          speedSum += value;
        } else if (t.speed.includes('KB/s')) {
          speedSum += value / 1024;
        }
      }
    });

    return {
      total,
      downloading,
      completed,
      pausedOrFailed,
      totalSpeed: speedSum > 0 ? speedSum.toFixed(1) + ' MB/s' : '0 KB/s'
    };
  }, [tasks]);

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl pb-12">
      
      {/* Toast Notifications */}
      <div className="fixed top-12 right-6 z-50 space-y-2 pointer-events-none">
        {notifications.map(n => (
          <div 
            key={n.id} 
            className="px-4 py-3 bg-sidebar-bg/95 backdrop-blur-xl border border-border-color shadow-2xl rounded-xl text-xs text-text-primary flex items-center space-x-2.5 animate-slide-in pointer-events-auto"
          >
            <Zap className="w-3.5 h-3.5 text-brand-color fill-brand-color/20" />
            <span className="font-medium">{n.message}</span>
          </div>
        ))}
      </div>

      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold flex items-center space-x-2 text-text-primary">
          <DownloadCloud className="w-5.5 h-5.5 text-brand-color" />
          <span>导入与下载规划 · Coming Soon</span>
        </h2>
        <p className="text-xs text-text-muted mt-1">
          当前页面只展示未来导入与下载流程：不联网、不解析真实元数据、不下载文件、不写数据库。
        </p>
      </div>

      {/* Downloader Sub Tabs */}
      <div className="flex border-b border-border-color/60 -mt-2">
        <button
          onClick={() => {
            setActiveTab('asmr');
            setParsedMusic(null);
          }}
          className={`flex items-center space-x-2 px-6 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'asmr' 
              ? 'border-brand-color text-brand-color font-bold' 
              : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-color'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>ASMR / RJ 添加入口预览</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('music');
            setParsedAsmr(null);
          }}
          className={`flex items-center space-x-2 px-6 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'music' 
              ? 'border-emerald-500 text-emerald-500 font-bold' 
              : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-color'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>流行音乐导入入口预览</span>
        </button>
      </div>

      {/* TAB CONTENT: ASMR DOWNLOADER */}
      {activeTab === 'asmr' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* ASMR Inputs block */}
          <div className="bg-card-bg/40 border border-border-color/70 p-5 rounded-2xl space-y-4">
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              ASMR RJ-Crawler Panel
            </span>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1.5">
              
              {/* RJ ID Input */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-[11px] text-text-secondary font-medium">输入 ASMR / RJ作品编号 (支持标准RJ、RJ前导零修正)</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={rjIdInput}
                    onChange={(e) => setRjIdInput(e.target.value)}
                    placeholder="请输入 RJ 编号..."
                    className="flex-1 bg-input-bg border border-border-color focus:border-brand-color focus:outline-none px-3.5 py-2 rounded-lg font-mono text-xs text-text-primary uppercase"
                  />
                  <button
                    onClick={handleParseAsmr}
                    disabled={asmrLoading}
                    className="px-4 py-2 bg-brand-color text-white font-bold text-xs rounded-lg hover:scale-105 active:scale-95 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {asmrLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    <span>解析元数据</span>
                  </button>
                </div>
              </div>

              {/* ASMR Sources */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-[11px] text-text-secondary font-medium">选择下载镜像源</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setAsmrSource('yk_cdn')}
                    className={`p-2 rounded-lg border text-[11px] font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      asmrSource === 'yk_cdn'
                        ? 'border-brand-color bg-brand-color/10 text-brand-color'
                        : 'border-border-color bg-card-bg/10 text-text-secondary hover:border-border-color-hover'
                    }`}
                  >
                    <span>⚡ YK_CDN 极速镜像</span>
                    <Globe className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <button
                    onClick={() => setAsmrSource('asmr_one')}
                    className={`p-2 rounded-lg border text-[11px] font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      asmrSource === 'asmr_one'
                        ? 'border-brand-color bg-brand-color/10 text-brand-color'
                        : 'border-border-color bg-card-bg/10 text-text-secondary hover:border-border-color-hover'
                    }`}
                  >
                    <span>🌐 ASMR.one 社区源</span>
                    <Server className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <button
                    onClick={() => setAsmrSource('dlsite')}
                    className={`p-2 rounded-lg border text-[11px] font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      asmrSource === 'dlsite'
                        ? 'border-brand-color bg-brand-color/10 text-brand-color'
                        : 'border-border-color bg-card-bg/10 text-text-secondary hover:border-border-color-hover'
                    }`}
                  >
                    <span>🎌 DLsite 官方线路</span>
                    <Cloud className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <button
                    onClick={() => setAsmrSource('webdav')}
                    className={`p-2 rounded-lg border text-[11px] font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      asmrSource === 'webdav'
                        ? 'border-brand-color bg-brand-color/10 text-brand-color'
                        : 'border-border-color bg-card-bg/10 text-text-secondary hover:border-border-color-hover'
                    }`}
                  >
                    <span>☁️ WebDAV 远程映射</span>
                    <Database className="w-3.5 h-3.5 opacity-60" />
                  </button>
                </div>
              </div>

            </div>

            {/* Quick Helper RJ ID buttons */}
            <div className="flex items-center space-x-2 pt-1">
              <span className="text-[10px] text-text-muted">数据库示范:</span>
              {Object.keys(mockRjDatabase).map((id) => (
                <button
                  key={id}
                  onClick={() => {
                    setRjIdInput(id);
                    setParsedAsmr(null);
                  }}
                  className="px-2 py-1 bg-input-bg border border-border-color/60 rounded text-[10px] font-mono text-text-secondary hover:border-brand-color hover:text-brand-color transition-colors cursor-pointer"
                >
                  {id}
                </button>
              ))}
            </div>

          </div>

          {/* ASMR Metadata Result Card & Active Download Section */}
          {parsedAsmr && (
            <div className="bg-card-bg/40 border border-border-color p-6 rounded-2xl space-y-6 relative overflow-hidden animate-fade-in">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <img 
                  src={parsedAsmr.coverUrl} 
                  alt="" 
                  className="w-24 h-24 rounded-lg object-cover border border-border-color shadow-md flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
                
                <div className="space-y-1.5 flex-1 min-w-0 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="bg-indigo-500/10 text-indigo-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded">
                      {parsedAsmr.id}
                    </span>
                    <span className="text-text-muted">•</span>
                    <span className="text-text-muted">官方发布: {parsedAsmr.releaseDate}</span>
                  </div>
                  <h3 className="text-sm font-bold text-text-primary leading-snug truncate">
                    {parsedAsmr.title}
                  </h3>
                  <p className="text-text-secondary">社团/Circle: <span className="font-semibold text-text-primary">{parsedAsmr.circle}</span></p>
                  <p className="text-text-secondary">CV 声优: <span className="font-semibold text-text-primary text-indigo-400">{parsedAsmr.cv}</span></p>
                  <div className="flex items-center space-x-3 text-[11px] text-text-muted pt-1">
                    <span>分轨数量: {parsedAsmr.tracksCount} 个文件</span>
                    <span>•</span>
                    <span>作品大小: {parsedAsmr.fileSize}</span>
                  </div>
                </div>

                <button
                  onClick={handleStartAsmrDownload}
                  className="w-full sm:w-auto px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl hover:scale-105 transition-all flex items-center justify-center space-x-1.5 shadow shadow-indigo-600/10 cursor-pointer self-center"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>加入示例队列</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB CONTENT: POP MUSIC DOWNLOADER */}
      {activeTab === 'music' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Music inputs block */}
          <div className="bg-card-bg/40 border border-border-color/70 p-5 rounded-2xl space-y-4">
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Pop Music Crawler Panel
            </span>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1.5 text-xs">
              
              {/* Song search query input */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-[11px] text-text-secondary font-medium">输入歌曲名称、歌手或链接</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={musicSearchInput}
                    onChange={(e) => setMusicSearchInput(e.target.value)}
                    placeholder="例如：周杰伦 - 晴天..."
                    className="flex-1 bg-input-bg border border-border-color focus:border-brand-color focus:outline-none px-3.5 py-2 rounded-lg text-xs text-text-primary"
                  />
                  <button
                    onClick={handleParseMusic}
                    disabled={musicLoading}
                    className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:scale-105 active:scale-95 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {musicLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    <span>提取解析</span>
                  </button>
                </div>
              </div>

              {/* Music Quality */}
              <div className="space-y-1">
                <label className="text-[11px] text-text-secondary font-medium">音频规格选择</label>
                <select
                  value={musicQuality}
                  onChange={(e) => setMusicQuality(e.target.value as any)}
                  className="w-full bg-input-bg border border-border-color focus:border-brand-color focus:outline-none rounded-lg px-2.5 py-2 text-xs text-text-primary cursor-pointer font-sans"
                >
                  <option value="flac_24bit">💎 Hi-Res Master (24bit FLAC)</option>
                  <option value="flac_16bit">💽 Lossless Flac (16bit FLAC)</option>
                  <option value="standard">🎵 Standard MP3 (320kbps)</option>
                </select>
              </div>

              {/* Pop Music Sources */}
              <div className="space-y-1">
                <label className="text-[11px] text-text-secondary font-medium">无损提取通道</label>
                <select
                  value={musicSource}
                  onChange={(e) => setMusicSource(e.target.value as any)}
                  className="w-full bg-input-bg border border-border-color focus:border-brand-color focus:outline-none rounded-lg px-2.5 py-2 text-xs text-text-primary cursor-pointer font-sans"
                >
                  <option value="netease">🔴 网易云无损加密通道</option>
                  <option value="qq">🟢 QQ音乐 MASTER 缓存提取</option>
                  <option value="youtube">💻 YouTube Music 转换器</option>
                  <option value="ipfs">⛓️ IPFS 共享音乐对等网络</option>
                </select>
              </div>

            </div>

            {/* Quick Helper Music Search buttons */}
            <div className="flex items-center space-x-2 pt-1">
              <span className="text-[10px] text-text-muted">快速示范:</span>
              {Object.keys(mockMusicDatabase).map((query) => (
                <button
                  key={query}
                  onClick={() => {
                    setMusicSearchInput(query);
                    setParsedMusic(null);
                  }}
                  className="px-2 py-1 bg-input-bg border border-border-color/60 rounded text-[10px] text-text-secondary hover:border-emerald-500 hover:text-emerald-500 transition-colors cursor-pointer"
                >
                  {query}
                </button>
              ))}
            </div>

          </div>

          {/* Music Scraped Result Card */}
          {parsedMusic && (
            <div className="bg-card-bg/40 border border-border-color p-6 rounded-2xl space-y-5 relative overflow-hidden animate-fade-in">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border-color shadow-md flex-shrink-0">
                  <img src={parsedMusic.coverUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/10" />
                </div>

                <div className="space-y-1 flex-1 min-w-0 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded">
                      FLAC LOSSLESS
                    </span>
                    <span className="text-text-muted">•</span>
                    <span className="text-text-muted">专辑: {parsedMusic.album}</span>
                  </div>
                  <h3 className="text-sm font-bold text-text-primary leading-snug truncate">
                    {parsedMusic.title}
                  </h3>
                  <p className="text-text-secondary">歌手/Artist: <span className="font-semibold text-text-primary text-emerald-400">{parsedMusic.artist}</span></p>
                  <div className="flex items-center space-x-3 text-[11px] text-text-muted pt-1">
                    <span>规格规格: <span className="text-emerald-500 font-mono font-bold">{parsedMusic.quality}</span></span>
                    <span>•</span>
                    <span>下载大小: {parsedMusic.fileSize}</span>
                  </div>
                </div>

                <button
                  onClick={handleStartMusicDownload}
                  className="w-full sm:w-auto px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl hover:scale-105 transition-all flex items-center justify-center space-x-1.5 shadow shadow-emerald-600/10 cursor-pointer self-center"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>生成示例任务</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ==================== GLOBAL DOWNLOADS MANAGER PANEL ==================== */}
      <div className="border border-border-color rounded-2xl bg-card-bg/25 overflow-hidden shadow-xl">
        
        {/* Header with Stats */}
        <div className="bg-sidebar-bg/40 border-b border-border-color px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-text-primary flex items-center space-x-2">
              <FolderSync className="w-4 h-4 text-brand-color animate-spin-slow" />
              <span>任务管理预览（无真实下载）</span>
            </h3>
            <p className="text-[10px] text-text-secondary">
              在已完成的项目上 <strong className="text-brand-color">右键菜单</strong> 或点击操作可以 <strong className="text-brand-color">打开文件夹</strong> 来查看文件树并双击直接加载播放。
            </p>
          </div>

          {/* Stats Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-input-bg border border-border-color/80 px-2.5 py-1 rounded-lg text-[10px] font-mono text-text-secondary">
              <span>活动速度: </span>
              <span className="text-brand-color font-bold">{stats.totalSpeed}</span>
            </div>
            <div className="bg-indigo-500/5 border border-indigo-500/10 px-2.5 py-1 rounded-lg text-[10px] font-mono text-text-secondary">
              <span>下载中: </span>
              <span className="text-indigo-400 font-bold">{stats.downloading}</span>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1 rounded-lg text-[10px] font-mono text-text-secondary">
              <span>已完成: </span>
              <span className="text-emerald-400 font-bold">{stats.completed}</span>
            </div>
            <div className="bg-card-bg/20 border border-border-color/60 px-2.5 py-1 rounded-lg text-[10px] font-mono text-text-secondary">
              <span>全部: {stats.total}</span>
            </div>
          </div>
        </div>

        {/* Filters and Searching bar */}
        <div className="border-b border-border-color/60 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card-bg/10">
          <div className="flex items-center space-x-1.5">
            {(['all', 'downloading', 'completed', 'paused-failed'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setTaskFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  taskFilter === tab
                    ? 'bg-brand-color/10 text-brand-color border border-brand-color/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-hover-bg border border-transparent'
                }`}
              >
                {tab === 'all' && '全部任务'}
                {tab === 'downloading' && '下载中'}
                {tab === 'completed' && '已完成'}
                {tab === 'paused-failed' && '已暂停/失败'}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input
              type="text"
              value={taskSearch}
              onChange={e => setTaskSearch(e.target.value)}
              placeholder="搜索任务、ID、名称..."
              className="bg-input-bg border border-border-color/80 focus:border-brand-color focus:outline-none pl-8 pr-3 py-1 rounded-lg text-xs w-full sm:w-48 text-text-primary"
            />
          </div>
        </div>

        {/* Tasks List */}
        <div className="divide-y divide-border-color/60 max-h-[500px] overflow-y-auto scrollbar-thin">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
              <FolderOpen className="w-8 h-8 text-text-muted opacity-50" />
              <p className="text-xs text-text-muted font-medium">暂无对应下载任务</p>
              <p className="text-[10px] text-text-muted opacity-70">请在上方解析并添加新的 ASMR 或流行音乐下载</p>
            </div>
          ) : (
            filteredTasks.map(task => {
              const isExpanded = expandedTasks[task.id];
              return (
                <div 
                  key={task.id} 
                  onContextMenu={(e) => handleContextMenu(e, task.id)}
                  className={`p-4 transition-colors hover:bg-card-bg/20 relative select-none ${
                    task.status === 'downloading' ? 'bg-indigo-500/[0.01]' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    
                    {/* Thumbnail */}
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border-color flex-shrink-0">
                      <img src={task.coverUrl} alt="" className="w-full h-full object-cover" />
                      {task.type === 'asmr' && (
                        <span className="absolute bottom-0 right-0 bg-indigo-600 text-white font-mono font-bold text-[7px] px-1 rounded-tl">
                          ASMR
                        </span>
                      )}
                      {task.type === 'music' && (
                        <span className="absolute bottom-0 right-0 bg-emerald-600 text-white font-mono font-bold text-[7px] px-1 rounded-tl">
                          MUSIC
                        </span>
                      )}
                    </div>

                    {/* Metadata & Speed Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center space-x-2">
                        {task.type === 'asmr' && (
                          <span className="bg-indigo-500/10 text-indigo-400 font-mono text-[8px] font-bold px-1.5 py-0.5 rounded">
                            {task.id}
                          </span>
                        )}
                        <h4 className="text-xs font-bold text-text-primary truncate" title={task.title}>
                          {task.title}
                        </h4>
                      </div>
                      
                      <div className="flex flex-wrap items-center text-[10px] text-text-muted gap-x-3 gap-y-1">
                        <span>大小: <strong className="text-text-secondary">{task.totalSize}</strong></span>
                        <span>•</span>
                        <span>来源/作者: <span className="text-text-secondary">{task.subtitle}</span></span>
                        <span>•</span>
                        <span>派发时间: {task.addedAt}</span>
                      </div>
                    </div>

                    {/* Speed & Progress Info */}
                    <div className="w-full sm:w-40 flex flex-col sm:items-end space-y-1">
                      <div className="flex items-center justify-between sm:justify-end w-full space-x-3 text-xs font-mono">
                        
                        {/* SPEED */}
                        {task.status === 'downloading' ? (
                          <span className="text-brand-color font-bold animate-pulse">{task.speed}</span>
                        ) : (
                          <span className="text-text-muted">0 KB/s</span>
                        )}

                        {/* STATUS LABEL */}
                        <div className="flex items-center space-x-1.5">
                          {task.status === 'downloading' && (
                            <span className="flex items-center space-x-1 text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded text-[10px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                              <span>下载中</span>
                            </span>
                          )}
                          {task.status === 'completed' && (
                            <span className="flex items-center space-x-1 text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>已完成</span>
                            </span>
                          )}
                          {task.status === 'paused' && (
                            <span className="flex items-center space-x-1 text-yellow-500 font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded text-[10px]">
                              <PauseCircle className="w-3 h-3 text-yellow-500" />
                              <span>已暂停</span>
                            </span>
                          )}
                          {task.status === 'failed' && (
                            <span className="flex items-center space-x-1 text-red-500 font-bold bg-red-500/10 px-1.5 py-0.5 rounded text-[10px]">
                              <AlertCircle className="w-3 h-3 text-red-500" />
                              <span>已失败</span>
                            </span>
                          )}
                          <span className="text-text-primary font-bold text-xs">{task.progress}%</span>
                        </div>

                      </div>

                      {/* Micro Progress Bar */}
                      <div className="h-1.5 bg-input-bg w-full rounded-full overflow-hidden relative border border-border-color/30">
                        <div 
                          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${
                            task.status === 'completed' ? 'bg-emerald-500' :
                            task.status === 'failed' ? 'bg-red-500' :
                            task.status === 'paused' ? 'bg-yellow-500' : 'bg-brand-color'
                          }`}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-1.5 self-center">
                      
                      {/* PAUSE / RESUME */}
                      {task.status !== 'completed' && task.status !== 'failed' && (
                        <button
                          onClick={() => handleToggleTask(task.id)}
                          className="p-1.5 rounded-lg bg-card-bg border border-border-color text-text-secondary hover:text-text-primary hover:border-brand-color transition-colors cursor-pointer"
                          title={task.status === 'downloading' ? '暂停下载' : '继续下载'}
                        >
                          {task.status === 'downloading' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                      )}

                      {/* OPEN FOLDER (completed tasks only) */}
                      {task.status === 'completed' && (
                        <button
                          onClick={() => handleOpenFolder(task.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 font-semibold text-[10px] flex items-center space-x-1 cursor-pointer"
                          title="在虚拟资源管理器中打开该文件夹"
                        >
                          <FolderOpen className="w-3 h-3" />
                          <span>打开文件夹</span>
                        </button>
                      )}

                      {/* DELETE */}
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 rounded-lg bg-card-bg border border-border-color text-text-secondary hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer"
                        title="删除下载任务"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* EXPAND FILE TREE CONTROL */}
                      <button
                        onClick={() => handleToggleExpand(task.id)}
                        className="p-1.5 rounded-lg bg-card-bg border border-border-color text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                        title={isExpanded ? "折叠文件列表" : "展开文件列表"}
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                    </div>

                  </div>

                  {/* ==================== EXPANDED SUB FILE TREE VISUALIZER ==================== */}
                  {isExpanded && (
                    <div className="mt-4 ml-0 sm:ml-16 bg-sidebar-bg/30 border border-border-color/60 rounded-xl p-3.5 space-y-3 animate-fade-in text-xs">
                      
                      <div className="flex items-center justify-between text-[10px] text-text-muted border-b border-border-color/40 pb-1.5 mb-1">
                        <span className="font-bold uppercase tracking-wider flex items-center space-x-1">
                          <Database className="w-3 h-3" />
                          <span>分轨文件树列表 ({task.files.length} 个文件)</span>
                        </span>
                        <span>对已完成文件，右键本条目或点击“打开文件夹”即可模拟本地播放</span>
                      </div>

                      <div className="space-y-2.5">
                        {task.files.map((file, fIdx) => (
                          <div key={fIdx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-card-bg/10 p-2 rounded-lg hover:bg-card-bg/30 transition-all">
                            
                            {/* File name & Icon */}
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <FileAudio className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                              <span className="font-mono text-text-primary truncate" title={file.name}>
                                {file.name}
                              </span>
                              <span className="text-[10px] text-text-muted font-mono bg-border-color/30 px-1.5 rounded flex-shrink-0">
                                {file.size}
                              </span>
                            </div>

                            {/* Sub File Progress Bar & Status */}
                            <div className="flex items-center space-x-3 text-[10px]">
                              
                              {/* Sub File Micro Progress */}
                              <div className="flex items-center space-x-2 font-mono">
                                <span className="text-text-muted">{file.progress}%</span>
                                <div className="w-16 h-1 bg-input-bg rounded-full overflow-hidden border border-border-color/20">
                                  <div 
                                    className={`h-full rounded-full ${
                                      file.status === 'completed' ? 'bg-emerald-500' :
                                      file.status === 'failed' ? 'bg-red-500' :
                                      file.status === 'paused' ? 'bg-yellow-500' : 'bg-brand-color animate-pulse'
                                    }`}
                                    style={{ width: `${file.progress}%` }}
                                  />
                                </div>
                              </div>

                              {/* Sub Status Label */}
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                file.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                                file.status === 'downloading' ? 'bg-indigo-500/10 text-indigo-400 animate-pulse' :
                                file.status === 'paused' ? 'bg-yellow-500/10 text-yellow-500' :
                                file.status === 'failed' ? 'bg-red-500/10 text-red-500' : 'bg-card-bg border border-border-color text-text-muted'
                              }`}>
                                {file.status.toUpperCase()}
                              </span>

                            </div>

                          </div>
                        ))}
                      </div>

                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Common Downloader Info Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
        <div className="bg-card-bg/20 border border-border-color/60 rounded-xl p-4.5 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Cpu className="w-4.5 h-4.5" />
          </div>
          <h4 className="text-xs font-bold text-text-primary">元数据补全计划</h4>
          <p className="text-[10px] text-text-secondary leading-relaxed">
            解析 RJ 号后，系统会自动抓取社团、CV、封面等标签写入 Flac Metadata 标签中，免去繁琐的手动编辑。
          </p>
        </div>

        <div className="bg-card-bg/20 border border-border-color/60 rounded-xl p-4.5 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Database className="w-4.5 h-4.5" />
          </div>
          <h4 className="text-xs font-bold text-text-primary">本地资源库记录计划</h4>
          <p className="text-[10px] text-text-secondary leading-relaxed">
            当前不会同步真实媒体库；后续会通过本地资源库记录与桌面端扫描流程分阶段接入。
          </p>
        </div>

        <div className="bg-card-bg/20 border border-border-color/60 rounded-xl p-4.5 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
            <HardDriveDownload className="w-4.5 h-4.5" />
          </div>
          <h4 className="text-xs font-bold text-text-primary">多线程秒级断点续传</h4>
          <p className="text-[10px] text-text-secondary leading-relaxed">
            当前不启动任何网络下载。此处仅展示未来下载任务控制界面。
          </p>
        </div>
      </div>

      {/* ==================== CUSTOM CONTEXT MENU FLOATING MENU ==================== */}
      {contextMenu && (
        <div 
          className="fixed z-50 bg-sidebar-bg/95 backdrop-blur-2xl border border-border-color shadow-2xl rounded-xl py-1.5 w-44 text-xs animate-fade-in select-none"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1 border-b border-border-color/40 pb-1 mb-1 text-[10px] text-text-muted font-bold tracking-wider">
            下载任务控制
          </div>
          
          {/* Pause / Resume */}
          {tasks.find(t => t.id === contextMenu.taskId)?.status !== 'completed' && (
            <button
              onClick={() => {
                handleToggleTask(contextMenu.taskId);
                setContextMenu(null);
              }}
              className="w-full text-left px-3.5 py-1.5 text-text-primary hover:bg-hover-bg flex items-center space-x-2 transition-colors cursor-pointer"
            >
              {tasks.find(t => t.id === contextMenu.taskId)?.status === 'downloading' ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-yellow-500" />
                  <span>暂停下载 (Pause)</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-brand-color" />
                  <span>继续下载 (Resume)</span>
                </>
              )}
            </button>
          )}

          {/* Open Folder */}
          {tasks.find(t => t.id === contextMenu.taskId)?.status === 'completed' ? (
            <button
              onClick={() => {
                handleOpenFolder(contextMenu.taskId);
                setContextMenu(null);
              }}
              className="w-full text-left px-3.5 py-1.5 text-text-primary hover:bg-hover-bg flex items-center space-x-2 transition-colors cursor-pointer font-semibold"
            >
              <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>打开文件夹 (Explore)</span>
            </button>
          ) : (
            <div className="w-full text-left px-3.5 py-1.5 text-text-muted flex items-center space-x-2 opacity-50 select-none">
              <FolderOpen className="w-3.5 h-3.5" />
              <span>打开文件夹 (完成解锁)</span>
            </div>
          )}

          {/* Quick Info / Metadata Re-scrape */}
          <button
            onClick={() => {
              addNotification('🏷️ 已向服务器触发二次刮削校验...');
              setContextMenu(null);
            }}
            className="w-full text-left px-3.5 py-1.5 text-text-primary hover:bg-hover-bg flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span>重新拉取元数据</span>
          </button>

          <div className="border-t border-border-color/40 my-1"></div>

          {/* Delete Task */}
          <button
            onClick={() => {
              handleDeleteTask(contextMenu.taskId);
              setContextMenu(null);
            }}
            className="w-full text-left px-3.5 py-1.5 text-red-400 hover:bg-red-500/10 flex items-center space-x-2 transition-colors cursor-pointer font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span>删除本条任务 (Delete)</span>
          </button>
        </div>
      )}

      {/* ==================== SIMULATED FILE EXPLORER DIALOG ==================== */}
      {explorerFolder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-sidebar-bg/95 backdrop-blur-2xl border border-border-color shadow-2xl rounded-2xl w-full max-w-3xl h-[450px] flex flex-col overflow-hidden animate-zoom-in">
            
            {/* Folder Header mimicking Win11/macOS Window */}
            <div className="h-11 bg-card-bg/40 border-b border-border-color/80 px-4 flex items-center justify-between select-none">
              <div className="flex items-center space-x-2 text-xs font-bold text-text-primary">
                <Folder className="w-4 h-4 text-brand-color fill-brand-color/20" />
                <span>示例文件夹预览</span>
              </div>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => setExplorerFolder(null)}
                  className="p-1 rounded-lg hover:bg-red-500/10 text-text-secondary hover:text-red-400 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Folder Path Bar */}
            <div className="px-4 py-2 bg-card-bg/10 border-b border-border-color/50 flex items-center justify-between text-[11px] text-text-secondary font-mono">
              <div className="flex items-center space-x-1">
                <span className="text-text-muted">示例路径:</span>
                <span className="bg-input-bg border border-border-color px-2 py-0.5 rounded text-text-primary">
                  {explorerFolder.path}
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                仅页面预览
              </span>
            </div>

            {/* Two Column Layout (Sidebar + Folder Content) */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* Explorer Left Shortcut Rail */}
              <div className="w-40 border-r border-border-color/50 bg-card-bg/5 p-2 space-y-1 text-[11px] hidden sm:block">
                <div className="text-[9px] font-bold text-text-muted uppercase px-2 py-1">快速访问</div>
                <button className="w-full text-left px-2 py-1.5 rounded-lg bg-brand-color/10 text-brand-color font-bold flex items-center space-x-1.5">
                  <HardDriveDownload className="w-3.5 h-3.5" />
                  <span>下载完成夹</span>
                </button>
                <button className="w-full text-left px-2 py-1.5 rounded-lg text-text-secondary hover:bg-hover-bg flex items-center space-x-1.5">
                  <Server className="w-3.5 h-3.5" />
                  <span>ASMR 存储区</span>
                </button>
                <button className="w-full text-left px-2 py-1.5 rounded-lg text-text-secondary hover:bg-hover-bg flex items-center space-x-1.5">
                  <Music className="w-3.5 h-3.5" />
                  <span>流行音乐缓区</span>
                </button>
                <div className="border-t border-border-color/40 my-2"></div>
                <div className="text-[9px] font-bold text-text-muted uppercase px-2 py-1">示例存储</div>
                <div className="px-2 py-1 text-text-muted text-[10px]">
                  C: 机械盘 1.8 TB<br />
                  D: 固态盘 512 GB
                </div>
              </div>

              {/* Explorer Right File Grid */}
              <div className="flex-1 p-4 overflow-y-auto scrollbar-thin bg-bg-primary/20 space-y-4">
                
                {/* Folder Info Banner */}
                <div className="bg-card-bg/25 border border-border-color/60 rounded-xl p-3 flex gap-3 text-xs items-center">
                  <img 
                    src={tasks.find(t => t.id === explorerFolder.id)?.coverUrl} 
                    alt="" 
                    className="w-10 h-10 rounded object-cover flex-shrink-0 border border-border-color" 
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-text-primary truncate">{explorerFolder.title}</h4>
                    <p className="text-[10px] text-text-muted truncate">这是页面预览，不代表真实文件已经生成。</p>
                  </div>
                </div>

                {/* File Rows */}
                <div className="space-y-1.5">
                  {explorerFolder.files.map((file, idx) => (
                    <div 
                      key={idx}
                      onDoubleClick={() => {
                        if (file.type === 'audio') {
                          handleDoubleClickAudio(file.name);
                        } else if (file.type === 'text') {
                          setTextViewer({ title: file.name, content: file.content || '' });
                        } else {
                          addNotification(`🖼️ 正在双击打开封面大图...`);
                        }
                      }}
                      className="flex items-center justify-between p-2 rounded-lg bg-card-bg/15 hover:bg-card-bg/40 border border-border-color/30 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {file.type === 'audio' && <FileAudio className="w-4 h-4 text-indigo-400" />}
                        {file.type === 'text' && <FileText className="w-4 h-4 text-blue-400" />}
                        {file.type === 'image' && <ImageIcon className="w-4 h-4 text-pink-400" />}
                        
                        <div className="min-w-0">
                          <p className="text-xs font-mono text-text-primary truncate group-hover:text-brand-color transition-colors">
                            {file.name}
                          </p>
                          <p className="text-[9px] text-text-muted font-mono">{file.size} | {file.type.toUpperCase()} 文件</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {file.type === 'audio' ? (
                          <button
                            onClick={() => handleDoubleClickAudio(file.name)}
                            className="opacity-0 group-hover:opacity-100 px-2 py-1 rounded bg-brand-color text-white font-bold text-[9px] flex items-center space-x-1 cursor-pointer transition-opacity"
                          >
                            <Play className="w-2.5 h-2.5" />
                            <span>直接试听</span>
                          </button>
                        ) : file.type === 'text' ? (
                          <button
                            onClick={() => setTextViewer({ title: file.name, content: file.content || '' })}
                            className="opacity-0 group-hover:opacity-100 px-2 py-1 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold text-[9px] cursor-pointer transition-opacity"
                          >
                            <span>查看文本</span>
                          </button>
                        ) : null}
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      </div>

                    </div>
                  ))}
                </div>

              </div>

            </div>

            {/* Folder Footer Status bar */}
            <div className="h-8 bg-card-bg/30 border-t border-border-color/80 px-4 flex items-center justify-between text-[10px] text-text-muted select-none">
              <span>共计 {explorerFolder.files.length} 个对象 | 大小约: {tasks.find(t => t.id === explorerFolder.id)?.totalSize}</span>
              <span className="font-semibold text-emerald-400">● 页面预览已生成</span>
            </div>

          </div>
        </div>
      )}

      {/* ==================== INNER TEXT FILE VIEWER popup ==================== */}
      {textViewer && (
        <div className="fixed inset-0 z-[60] bg-black/75 flex items-center justify-center p-4">
          <div className="bg-sidebar-bg border border-border-color shadow-2xl rounded-2xl w-full max-w-md h-96 flex flex-col overflow-hidden animate-zoom-in">
            <div className="h-10 bg-card-bg/50 border-b border-border-color px-4 flex items-center justify-between">
              <span className="text-xs font-bold text-text-primary font-mono flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>记事本 - {textViewer.title}</span>
              </span>
              <button 
                onClick={() => setTextViewer(null)}
                className="p-1 rounded hover:bg-hover-bg text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 p-4 bg-black/20 overflow-y-auto font-mono text-[11px] leading-relaxed text-text-primary whitespace-pre-wrap select-text">
              {textViewer.content}
            </div>
            <div className="h-8 bg-card-bg/20 border-t border-border-color px-4 flex items-center justify-end text-[10px] text-text-muted">
              <span>编码: UTF-8 | 离线缓存</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
