import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Play, 
  Plus, 
  Heart, 
  Folder, 
  FileAudio, 
  Clock, 
  Calendar, 
  Users, 
  Award,
  BookOpen,
  Subtitles,
  CheckCircle,
  HelpCircle,
  ListPlus,
  X,
  FileText,
  Edit3,
  Star,
  FolderOpen,
  Copy,
  ExternalLink,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { RJWork, AudioTrack } from '../types';
import CoverArtwork from './CoverArtwork';
import { collectionDetailExperienceService, type CollectionDetailStatusChip } from '../services/collectionDetailExperienceService';
import { asmrDetailSurfaceService, type AsmrDetailSurfaceChip } from '../services/asmrDetailSurfaceService';
import { asmrDetailSideRailService, type AsmrDetailSideRailChip } from '../services/asmrDetailSideRailService';
import { metadataOverrideService } from '../services/metadataOverrideService';
import AsmrMetadataProviderPreview from './AsmrMetadataProviderPreview';
import type { AsmrMetadataProviderCandidateV1 } from '../services/asmrMetadataProviderPreviewService';

interface AsmrDetailProps {
  rjWork: RJWork;
  onBack: () => void;
  onPlayTrack: (track: AudioTrack, customQueue?: AudioTrack[]) => void;
  onAddToQueue: (track: AudioTrack) => void;
  favorites: string[];
  toggleFavorite: (trackId: string) => void;
  onExplore?: (query: string) => void;
  onUpdateRjWork?: (updated: RJWork) => void;
  onClearRjWorkOverride?: (workId: string) => void;
}

export default function AsmrDetail({
  rjWork,
  onBack,
  onPlayTrack,
  onAddToQueue,
  favorites,
  toggleFavorite,
  onExplore,
  onUpdateRjWork,
  onClearRjWorkOverride
}: AsmrDetailProps) {
  const [activeTab, setActiveTab] = useState<'tracks' | 'info'>('tracks');

  // Local state for Metadata and Tags manual editor
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(rjWork.title);
  const [editCircle, setEditCircle] = useState(rjWork.circle);
  const [editCvsStr, setEditCvsStr] = useState(rjWork.cvs.join(', '));
  const [editReleaseDate, setEditReleaseDate] = useState(rjWork.releaseDate);
  const [editDescription, setEditDescription] = useState(rjWork.description || '');
  const [editTags, setEditTags] = useState<string[]>([...rjWork.tags]);
  const [newTagInput, setNewTagInput] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // --- ASMR Track Progress Persistence & Playback State ---
  const [trackProgress, setTrackProgress] = useState<Record<string, { percent: number; completed: boolean }>>({});

  useEffect(() => {
    const key = 'asmr_tracks_progress';
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setTrackProgress(JSON.parse(stored));
      } catch (e) {
        setTrackProgress({});
      }
    } else {
      // Seed initial mock completion for first tracks for immersive realistic feel
      const seed: Record<string, { percent: number; completed: boolean }> = {};
      if (rjWork.tracks && rjWork.tracks.length > 0) {
        seed[rjWork.tracks[0].id] = { percent: 100, completed: true };
        if (rjWork.tracks.length > 1) {
          seed[rjWork.tracks[1].id] = { percent: 62, completed: false };
        }
      }
      setTrackProgress(seed);
      localStorage.setItem(key, JSON.stringify(seed));
    }
  }, [rjWork.id]);

  // Handler to toggle completed status manually
  const toggleTrackCompleted = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = { ...trackProgress };
    const current = updated[trackId] || { percent: 0, completed: false };
    
    if (current.completed) {
      updated[trackId] = { percent: 0, completed: false };
      showFeedback('已重置音轨播放进度');
    } else {
      updated[trackId] = { percent: 100, completed: true };
      showFeedback('标记音轨为：已听完 ✓');
    }
    
    setTrackProgress(updated);
    localStorage.setItem('asmr_tracks_progress', JSON.stringify(updated));
  };

  // --- ASMR Folder, Track & Subtitle custom states ---
  const [folderPath, setFolderPath] = useState<string>(() => asmrDetailSurfaceService.getInitialFolderRecord(rjWork));
  const [trackRelocations, setTrackRelocations] = useState<Record<string, string>>({});
  const [trackSubtitles, setTrackSubtitles] = useState<Record<string, 'none' | 'ja' | 'zh' | 'bilingual'>>({});

  // --- ASMR Rating, Personal Status & Notes states ---
  const [rating, setRating] = useState<number>(0);
  const [pstatus, setPstatus] = useState<'unheard' | 'listening' | 'completed' | 'abandoned'>('unheard');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    // 1. Folder path
    const storedFolder = localStorage.getItem(`asmr_folder_path_${rjWork.id}`);
    if (storedFolder) {
      setFolderPath(storedFolder);
    } else {
      setFolderPath(asmrDetailSurfaceService.getInitialFolderRecord(rjWork));
    }

    // 2. Track relocations
    const storedRelocations = localStorage.getItem(`asmr_track_relocations`);
    if (storedRelocations) {
      try {
        setTrackRelocations(JSON.parse(storedRelocations));
      } catch (e) {}
    }

    // 3. Track subtitle associations
    const subKey = `asmr_track_subtitles_${rjWork.id}`;
    const storedSubs = localStorage.getItem(subKey);
    if (storedSubs) {
      try {
        setTrackSubtitles(JSON.parse(storedSubs));
      } catch (e) {}
    } else {
      const seed: Record<string, 'none' | 'ja' | 'zh' | 'bilingual'> = {};
      rjWork.tracks.forEach((t, idx) => {
        if (idx === 0) seed[t.id] = 'bilingual';
        else if (idx === 1) seed[t.id] = 'zh';
        else if (idx === 2) seed[t.id] = 'ja';
        else seed[t.id] = 'none';
      });
      setTrackSubtitles(seed);
      localStorage.setItem(subKey, JSON.stringify(seed));
    }

    // 4. Rating, Status, and Notes
    setRating(Number(localStorage.getItem(`asmr_rating_${rjWork.id}`)) || 0);
    setPstatus((localStorage.getItem(`asmr_pstatus_${rjWork.id}`) as any) || 'unheard');
    setNotes(localStorage.getItem(`asmr_notes_${rjWork.id}`) || '');
  }, [rjWork.id]);

  const handleOpenFolder = (path: string) => {
    showFeedback(`📂 已记录打开目录请求：${path}`);
  };

  const canUseExternalOpen = (track: AudioTrack) => Boolean(track.rootPathToken && track.sourceRelativePath && track.externalOpenSourceKind === 'tokenized-local-file');
  const getExternalKind = (track: AudioTrack): YangKuraExternalOpenEntryKind => {
    if (track.mediaKind === 'video' || track.mediaKind === 'image' || track.mediaKind === 'text' || track.mediaKind === 'archive' || track.mediaKind === 'other') return track.mediaKind;
    return 'audio';
  };
  const canUseHtmlAudio = (track: AudioTrack) => !['video', 'image', 'text', 'archive', 'other'].includes(track.mediaKind || 'audio');

  const handleOpenExternalTrack = async (track: AudioTrack) => {
    if (!canUseExternalOpen(track) || !track.rootPathToken || !track.sourceRelativePath) {
      showFeedback('当前音轨不是来自真实 library-index.json 的 tokenized 本地文件。');
      return;
    }
    if (!window.yangKura?.requestOpenExternalFile) {
      showFeedback('当前不在 Electron 桌面环境，无法调用系统默认应用。');
      return;
    }
    const result = await window.yangKura.requestOpenExternalFile({
      rootPathToken: track.rootPathToken,
      relativePath: track.sourceRelativePath,
      entryId: track.id,
      mode: 'open-external-file',
      expectedKind: getExternalKind(track),
    });
    showFeedback(result.message);
  };

  const handleOpenTrackInFileManager = async (track: AudioTrack) => {
    if (!canUseExternalOpen(track) || !track.rootPathToken || !track.sourceRelativePath) {
      showFeedback('当前音轨没有可定位的 tokenized 本地路径。');
      return;
    }
    if (!window.yangKura?.requestOpenInFileManager) {
      showFeedback('当前不在 Electron 桌面环境，无法打开文件管理器。');
      return;
    }
    const result = await window.yangKura.requestOpenInFileManager({
      rootPathToken: track.rootPathToken,
      relativePath: track.sourceRelativePath,
      entryId: track.id,
      mode: 'open-in-file-manager',
    });
    showFeedback(result.message);
  };

  const handlePlayOrOpenTrack = (track: AudioTrack) => {
    if (canUseHtmlAudio(track)) {
      onPlayTrack(track, rjWork.tracks);
      return;
    }
    void handleOpenExternalTrack(track);
  };

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    showFeedback('📋 资源库记录已复制到剪贴板');
  };

  const handleRelocateFolder = () => {
    const newPath = prompt('请输入该 RJ 作品的资源库目录记录（不要粘贴真实绝对路径）：', folderPath);
    if (newPath && newPath.trim()) {
      setFolderPath(newPath.trim());
      localStorage.setItem(`asmr_folder_path_${rjWork.id}`, newPath.trim());
      showFeedback('📁 已更新作品资源库记录');
    }
  };

  const handleRelocateTrack = (trackId: string, currentPath: string) => {
    const defaultVal = trackRelocations[trackId] || currentPath;
    const newPath = prompt('请输入该音轨的资源库内文件记录（不要粘贴真实绝对路径）：', defaultVal);
    if (newPath && newPath.trim()) {
      const updated = { ...trackRelocations, [trackId]: newPath.trim() };
      setTrackRelocations(updated);
      localStorage.setItem('asmr_track_relocations', JSON.stringify(updated));
      showFeedback('🎵 已更新该音轨的资源库记录');
    }
  };

  const handleAssociateSubtitle = (trackId: string) => {
    const types: ('none' | 'ja' | 'zh' | 'bilingual')[] = ['none', 'ja', 'zh', 'bilingual'];
    const labels = {
      none: '无字幕',
      ja: '日文字幕 (.ja.lrc)',
      zh: '中文字幕 (.zh.lrc)',
      bilingual: '双语字幕 (.bilingual.lrc)'
    };
    const current = trackSubtitles[trackId] || 'none';
    const nextIndex = (types.indexOf(current) + 1) % types.length;
    const nextType = types[nextIndex];
    
    const updated = { ...trackSubtitles, [trackId]: nextType };
    setTrackSubtitles(updated);
    localStorage.setItem(`asmr_track_subtitles_${rjWork.id}`, JSON.stringify(updated));
    showFeedback(`字幕关联变更为: ${labels[nextType]}`);
  };

  const handleSaveRating = (r: number) => {
    setRating(r);
    localStorage.setItem(`asmr_rating_${rjWork.id}`, String(r));
    if (onUpdateRjWork) {
      onUpdateRjWork({ ...rjWork, rating: r });
    }
    showFeedback(`评分更新为 ${r} 星 ⭐`);
  };

  const handleSavePstatus = (st: 'unheard' | 'listening' | 'completed' | 'abandoned') => {
    setPstatus(st);
    localStorage.setItem(`asmr_pstatus_${rjWork.id}`, st);
    if (onUpdateRjWork) {
      onUpdateRjWork({ ...rjWork, personalStatus: st });
    }
    showFeedback(`个人听毕归档状态: ${
      st === 'unheard' ? '未听 💤' :
      st === 'listening' ? '听过 🎧' :
      st === 'completed' ? '听完 🏆' : '弃坑 ❌'
    }`);
  };

  const handleSaveNotes = () => {
    localStorage.setItem(`asmr_notes_${rjWork.id}`, notes);
    if (onUpdateRjWork) {
      onUpdateRjWork({ ...rjWork, personalNotes: notes });
    }
    showFeedback('📝 个人追音感悟笔记已保存！');
  };

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 2000);
  };

  // Format single track duration (mm:ss)
  const formatDuration = (seconds: number | undefined) => {
    if (!Number.isFinite(seconds)) return '--:--';
    const safeSeconds = Math.max(0, Math.floor(seconds || 0));
    const mins = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  const mvp56HeroModel = asmrDetailSurfaceService.getHeroModel(rjWork);
  const mvp56TrackSummary = asmrDetailSurfaceService.getTrackSummaryModel({
    work: rjWork,
    trackProgress,
    trackSubtitles,
  });
  const mvp56RecordModel = asmrDetailSurfaceService.getRecordModel(rjWork, folderPath);
  const mvp57SideRailModel = asmrDetailSideRailService.getSideRailModel({
    work: rjWork,
    rating,
    personalStatus: pstatus,
    notes,
    trackSubtitles,
  });
  const mvp57ResourceRecordModel = asmrDetailSideRailService.getResourceRecordModel(rjWork, trackSubtitles);
  const mvp57SubtitlePanelModel = asmrDetailSideRailService.getSubtitlePanelModel(rjWork, trackSubtitles);

  const asmrDetailSideRailChipClassName = (chip: AsmrDetailSideRailChip) => {
    return `rounded-xl border px-2.5 py-2 text-[10px] ${asmrDetailSideRailService.getToneClassName(chip.tone)}`;
  };

  const asmrDetailSurfaceChipClassName = (chip: AsmrDetailSurfaceChip) => {
    return `rounded-xl border px-3 py-2 text-[10px] ${asmrDetailSurfaceService.getToneClassName(chip.tone)}`;
  };

  const asmrDetailSummary = collectionDetailExperienceService.getAsmrDetailSummary(rjWork);
  const asmrEmptyState = collectionDetailExperienceService.getAsmrEmptyState();
  const asmrBreadcrumbs = collectionDetailExperienceService.getBreadcrumbs({
    section: '音声库',
    parent: rjWork.circle,
    current: rjWork.id,
  });

  const detailChipClassName = (chip: CollectionDetailStatusChip) => {
    const toneMap: Record<CollectionDetailStatusChip['tone'], string> = {
      brand: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
      green: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
      muted: 'bg-zinc-500/10 border-zinc-500/20 text-text-muted',
    };
    return `text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${toneMap[chip.tone]}`;
  };

  // Play all tracks sequentially
  const handlePlayAll = () => {
    if (rjWork.tracks && rjWork.tracks.length > 0) {
      onPlayTrack(rjWork.tracks[0], rjWork.tracks);
    }
  };

  // Add all tracks to player queue
  const handleQueueAll = () => {
    rjWork.tracks.forEach(track => {
      onAddToQueue(track);
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Back Button */}
      <button 
        id="asmr-detail-back"
        onClick={onBack}
        className="flex items-center space-x-2 text-xs font-semibold text-text-secondary hover:text-text-primary bg-card-bg/40 border border-border-color px-3.5 py-2 rounded-xl hover:bg-card-bg transition-colors cursor-pointer w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>返回音声库</span>
      </button>

      {/* Hero Banner Area */}
      <div className="relative overflow-hidden rounded-2xl bg-card-bg/50 border border-border-color/80 p-6 md:p-8">
        
        {/* Ambient Blurred Background Cover */}
        {rjWork.coverUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center scale-110 blur-3xl opacity-15 pointer-events-none"
            style={{ backgroundImage: `url(${rjWork.coverUrl})` }}
          />
        )}

        <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          
          {/* Cover image (Left) */}
          <div className="w-44 h-44 md:w-52 md:h-52 rounded-xl overflow-hidden bg-zinc-800 shadow-xl flex-shrink-0 border border-white/5 relative group">
            <CoverArtwork
              src={rjWork.coverUrl}
              title={rjWork.title}
              subtitle={rjWork.id}
              kind="asmr"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2.5 right-2.5 bg-black/85 backdrop-blur-md px-2.5 py-0.5 rounded text-xs font-bold font-mono border border-white/10 text-brand-color">
              {rjWork.id}
            </div>
          </div>

          {/* Metadata Section (Right) */}
          <div className="flex-1 space-y-4 min-w-0">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                  ASMR音声
                </span>
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center space-x-1">
                  <CheckCircle className="w-2.5 h-2.5" />
                  <span>本地信息已记录</span>
                </span>
                {metadataOverrideService.hasAsmrOverride(rjWork.id) && (
                  <span className="bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                    本地修改 {metadataOverrideService.getAsmrOverrideFieldCount(rjWork.id)} 项
                  </span>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-text-primary leading-snug tracking-tight">
                {rjWork.title}
              </h2>
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-xs text-text-secondary">
              <div className="flex items-center space-x-2 truncate">
                <Award className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="text-text-muted">社团:</span>
                {onExplore ? (
                  <button
                    onClick={() => onExplore(rjWork.circle)}
                    className="font-medium text-amber-500 hover:text-amber-400 hover:underline transition-colors truncate cursor-pointer text-left"
                    title="探索该社团的作品"
                  >
                    {rjWork.circle}
                  </button>
                ) : (
                  <span className="font-medium text-text-primary truncate">{rjWork.circle}</span>
                )}
              </div>
              <div className="flex items-center space-x-2 min-w-0">
                <Users className="w-4 h-4 text-pink-400 flex-shrink-0" />
                <span className="text-text-muted flex-shrink-0">声优/CV:</span>
                <div className="flex flex-wrap gap-1 min-w-0">
                  {rjWork.cvs.map((cv, idx) => (
                    <React.Fragment key={cv}>
                      {onExplore ? (
                        <button
                          onClick={() => onExplore(cv)}
                          className="font-medium text-pink-400 hover:text-pink-300 hover:underline transition-colors cursor-pointer"
                          title={`探索 ${cv} 的作品`}
                        >
                          {cv}
                        </button>
                      ) : (
                        <span className="font-medium text-text-primary">{cv}</span>
                      )}
                      {idx < rjWork.cvs.length - 1 && <span className="text-text-muted select-none">/</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span className="text-text-muted">发售日期:</span>
                <span className="font-medium text-text-primary font-mono">{rjWork.releaseDate}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span className="text-text-muted">总文件 & 时长:</span>
                <span className="font-medium text-text-primary font-mono">{rjWork.fileCount} 个文件 / {Math.floor(rjWork.totalDuration / 60)} 分钟</span>
              </div>
            </div>

            {/* Tags area */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {rjWork.tags.map(tag => (
                <button 
                  key={tag} 
                  onClick={() => onExplore?.(tag)}
                  disabled={!onExplore}
                  className="text-[10px] bg-border-color/40 hover:bg-brand-color/10 hover:text-brand-color hover:border-brand-color/30 text-text-secondary px-2.5 py-0.5 rounded-lg border border-border-color/30 transition-all cursor-pointer disabled:pointer-events-none"
                >
                  #{tag}
                </button>
              ))}
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button 
                id="play-all-asmr"
                onClick={handlePlayAll}
                disabled={rjWork.tracks.length === 0}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-color hover:bg-brand-color-hover text-white text-xs font-semibold shadow-lg shadow-brand-color/20 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>播放全部音声</span>
              </button>
              <button 
                id="queue-all-asmr"
                onClick={handleQueueAll}
                disabled={rjWork.tracks.length === 0}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-card-bg hover:bg-hover-bg border border-border-color text-text-primary text-xs font-semibold hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                <ListPlus className="w-4 h-4" />
                <span>加入播放队列</span>
              </button>
              {onUpdateRjWork && (
                <button 
                  onClick={() => {
                    setEditTitle(rjWork.title);
                    setEditCircle(rjWork.circle);
                    setEditCvsStr(rjWork.cvs.join(', '));
                    setEditReleaseDate(rjWork.releaseDate);
                    setEditDescription(rjWork.description || '');
                    setEditTags([...rjWork.tags]);
                    setIsEditModalOpen(true);
                  }}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-indigo-400 border border-indigo-500/20 text-xs font-semibold hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>编辑作品信息与标签</span>
                </button>
              )}
              <button 
                onClick={() => handleOpenFolder(mvp56RecordModel.folderRecord)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-500/20 text-xs font-semibold hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title={`资源库记录：${mvp56RecordModel.folderRecord}`}
              >
                <FolderOpen className="w-4 h-4" />
                <span>{mvp56RecordModel.openLabel}</span>
              </button>
              <button 
                onClick={() => handleCopyPath(mvp56RecordModel.folderRecord)}
                className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/5 text-xs font-semibold hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="复制此作品资源库记录"
              >
                <Copy className="w-4 h-4" />
                <span>{mvp56RecordModel.copyLabel}</span>
              </button>
              <button 
                onClick={handleRelocateFolder}
                className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-teal-400 border border-teal-500/25 text-xs font-semibold hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="资源目录变化后更新此作品的资源库记录"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{mvp56RecordModel.relocateLabel}</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      <section id="mvp56-asmr-detail-summary" className="rounded-2xl border border-brand-color/20 bg-brand-color/5 p-5 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <h3 className="text-sm font-bold text-text-primary flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-brand-color" />
              <span>{mvp56HeroModel.title}</span>
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">{mvp56HeroModel.description}</p>
            <p className="text-[11px] text-text-muted leading-relaxed">{mvp56HeroModel.primaryHint}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2 min-w-0 lg:min-w-[420px]">
            {mvp56HeroModel.chips.map((chip) => (
              <div key={chip.id} className={asmrDetailSurfaceChipClassName(chip)}>
                <p className="font-bold opacity-80">{chip.label}</p>
                <p className="mt-1 text-[13px] font-extrabold">{chip.value}</p>
                <p className="mt-1 leading-relaxed opacity-75">{chip.helper}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[10px] text-emerald-50/80 leading-relaxed">
          {mvp56HeroModel.secondaryHint}
        </div>
      </section>

      <section id="mvp43-asmr-detail-navigation" className="rounded-2xl bg-card-bg/35 border border-border-color/60 p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-muted">
          {asmrBreadcrumbs.map((crumb, index) => (
            <React.Fragment key={`${crumb.label}-${crumb.value}`}>
              {index > 0 && <span className="text-text-muted/50">/</span>}
              <span className={index === asmrBreadcrumbs.length - 1 ? 'text-text-primary font-semibold' : ''}>
                {crumb.label}：{crumb.value}
              </span>
            </React.Fragment>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-text-primary">{asmrDetailSummary.title}</h3>
            <p className="text-xs text-text-secondary leading-relaxed">{asmrDetailSummary.description}</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {asmrDetailSummary.chips.map((chip) => (
                <span key={chip.label} className={detailChipClassName(chip)}>{chip.label}</span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {asmrDetailSummary.stats.map((item) => (
              <div key={item.label} className="rounded-xl bg-bg-primary/30 border border-border-color/50 px-3 py-2">
                <p className="text-[10px] text-text-muted">{item.label}</p>
                <p className="text-sm font-bold text-text-primary font-mono mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs list (Tracks vs Full Details Description) */}
      <div className="flex border-b border-border-color/60">
        <button
          onClick={() => setActiveTab('tracks')}
          className={`px-5 py-3 text-xs font-semibold relative transition-colors ${activeTab === 'tracks' ? 'text-brand-color' : 'text-text-muted hover:text-text-primary'}`}
        >
          <span>本地音声文件列表 ({rjWork.tracks.length})</span>
          {activeTab === 'tracks' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-color rounded-t"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('info')}
          className={`px-5 py-3 text-xs font-semibold relative transition-colors ${activeTab === 'info' ? 'text-brand-color' : 'text-text-muted hover:text-text-primary'}`}
        >
          <span>作品简介 / 详情</span>
          {activeTab === 'info' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-color rounded-t"></div>
          )}
        </button>
      </div>

      {/* Detail Sections Split */}
      {activeTab === 'tracks' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Playable Audio List (2/3 width) */}
          <div className="lg:col-span-2 space-y-3">
            <section id="mvp56-asmr-track-summary" className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 space-y-3">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-text-primary">{mvp56TrackSummary.title}</h3>
                  <p className="text-[10px] text-text-muted mt-1 leading-relaxed">{mvp56TrackSummary.description}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {mvp56TrackSummary.chips.map((chip) => (
                    <span key={chip.id} className={`rounded-full border px-2 py-1 text-[9px] font-bold ${asmrDetailSurfaceService.getToneClassName(chip.tone)}`}>
                      {chip.label}：{chip.value}
                    </span>
                  ))}
                </div>
              </div>
            </section>
            {rjWork.tracks.length === 0 ? (
              <div id="mvp43-asmr-empty-state" className="py-12 text-center bg-card-bg/20 rounded-2xl border border-dashed border-border-color px-6">
                <FileAudio className="w-10 h-10 text-text-muted mx-auto stroke-1 mb-3" />
                <p className="text-sm font-bold text-text-primary">{mvp56TrackSummary.emptyTitle}</p>
                <p className="text-xs text-text-muted mt-2 max-w-lg mx-auto leading-relaxed">{mvp56TrackSummary.emptyDescription}</p>
                <p className="text-[11px] text-text-muted/70 mt-2">{asmrEmptyState.helper}</p>
                <div className="flex justify-center gap-2 mt-4">
                  <button onClick={onBack} className="px-3.5 py-2 rounded-xl bg-brand-color text-white text-xs font-bold">{asmrEmptyState.actions[0]?.label}</button>
                  <button onClick={() => setActiveTab('info')} className="px-3.5 py-2 rounded-xl bg-card-bg border border-border-color text-text-secondary text-xs font-bold">{asmrEmptyState.actions[1]?.label}</button>
                </div>
              </div>
            ) : (
              <div className="bg-card-bg/40 border border-border-color/60 rounded-xl overflow-hidden divide-y divide-border-color/40">
                {rjWork.tracks.map((track, idx) => {
                  const isFav = favorites.includes(track.id);
                  const progressInfo = trackProgress[track.id];
                  const isCompleted = progressInfo?.completed || false;
                  
                  return (
                    <div 
                      key={track.id}
                      className="group flex items-center justify-between p-3.5 hover:bg-hover-bg transition-all duration-150"
                    >
                      <div 
                        onClick={() => handlePlayOrOpenTrack(track)}
                        className="flex items-center space-x-3.5 flex-1 min-w-0 cursor-pointer"
                      >
                        <span className="text-xs text-text-muted font-mono w-6 text-center group-hover:text-brand-color">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <h4 className="text-xs font-bold text-text-primary group-hover:text-brand-color transition-colors truncate">
                              {track.title}
                            </h4>
                            {isCompleted && (
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-1.5 py-px rounded">
                                已听完 ✓
                              </span>
                            )}
                            {/* Subtitle Badge */}
                            {(() => {
                              const subType = trackSubtitles[track.id] || 'none';
                              switch (subType) {
                                case 'zh':
                                  return (
                                    <span 
                                      onClick={(e) => { e.stopPropagation(); handleAssociateSubtitle(track.id); }}
                                      className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded font-bold cursor-pointer hover:bg-emerald-500/30 flex items-center space-x-0.5 select-none"
                                      title="中文字幕已关联 (点击变更)"
                                    >
                                      <Subtitles className="w-2.5 h-2.5" />
                                      <span>[中]</span>
                                    </span>
                                  );
                                case 'ja':
                                  return (
                                    <span 
                                      onClick={(e) => { e.stopPropagation(); handleAssociateSubtitle(track.id); }}
                                      className="text-[9px] bg-sky-500/15 text-sky-400 border border-sky-500/25 px-1.5 py-0.5 rounded font-bold cursor-pointer hover:bg-sky-500/30 flex items-center space-x-0.5 select-none"
                                      title="日文字幕已关联 (点击变更)"
                                    >
                                      <Subtitles className="w-2.5 h-2.5" />
                                      <span>[日]</span>
                                    </span>
                                  );
                                case 'bilingual':
                                  return (
                                    <span 
                                      onClick={(e) => { e.stopPropagation(); handleAssociateSubtitle(track.id); }}
                                      className="text-[9px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 px-1.5 py-0.5 rounded font-bold cursor-pointer hover:bg-indigo-500/30 flex items-center space-x-0.5 select-none"
                                      title="双语字幕已关联 (点击变更)"
                                    >
                                      <Subtitles className="w-2.5 h-2.5" />
                                      <span>[双]</span>
                                    </span>
                                  );
                                default:
                                  return (
                                    <span 
                                      onClick={(e) => { e.stopPropagation(); handleAssociateSubtitle(track.id); }}
                                      className="text-[9px] bg-zinc-800 text-zinc-500 border border-zinc-700/60 px-1.5 py-0.5 rounded font-medium cursor-pointer hover:bg-zinc-700/50 hover:text-zinc-300 flex items-center space-x-0.5 select-none"
                                      title="暂无关联字幕 (点击手动关联本地 LRC 歌词)"
                                    >
                                      <Subtitles className="w-2.5 h-2.5 text-zinc-650" />
                                      <span>[无]</span>
                                    </span>
                                  );
                              }
                            })()}
                          </div>
                          <span className="text-[10px] text-text-muted block mt-1 truncate" title={asmrDetailSurfaceService.getTrackRecordLabel(rjWork, track, trackRelocations[track.id])}>
                            本地记录：{asmrDetailSurfaceService.getTrackRecordLabel(rjWork, track, trackRelocations[track.id])}
                          </span>
                          
                          {/* Real-time playback progress bar */}
                          {progressInfo && progressInfo.percent > 0 && !isCompleted && (
                            <div className="flex items-center space-x-2 mt-1.5">
                              <div className="w-24 h-1 bg-white/5 border border-white/5 rounded-full overflow-hidden">
                                <div className="bg-brand-color h-full rounded-full" style={{ width: `${progressInfo.percent}%` }} />
                              </div>
                              <span className="text-[9px] text-brand-color font-mono font-bold">已听 {progressInfo.percent}%</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 ml-4 flex-shrink-0">
                        <span className="text-[10px] text-text-muted font-mono bg-border-color/30 px-2 py-0.5 rounded">
                          {track.fileSize || '35.4 MB'}
                        </span>
                        <span className="text-xs text-text-muted font-mono">{formatDuration(track.duration)}</span>
                        
                        <div className="flex items-center space-x-1">
                          {/* Open Track Folder */}
                          <button
                            onClick={(e) => { e.stopPropagation(); void handleOpenTrackInFileManager(track); }}
                            disabled={!canUseExternalOpen(track)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-amber-400 hover:bg-amber-400/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-muted"
                            title="在文件管理器中定位此文件"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => { e.stopPropagation(); void handleOpenExternalTrack(track); }}
                            disabled={!canUseExternalOpen(track)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-muted"
                            title="用系统默认应用打开此文件"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          {/* Copy Track File Path */}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCopyPath(asmrDetailSurfaceService.getTrackRecordLabel(rjWork, track, trackRelocations[track.id])); }}
                            className="p-1.5 rounded-lg text-text-muted hover:text-zinc-200 hover:bg-white/5 transition-colors"
                            title="复制此音轨资源库记录"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Relocate Track File */}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRelocateTrack(track.id, track.fileTreePath || ''); }}
                            className="p-1.5 rounded-lg text-text-muted hover:text-teal-400 hover:bg-teal-400/10 transition-colors"
                            title="更新音轨资源库记录"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Completed */}
                          <button
                            onClick={(e) => toggleTrackCompleted(track.id, e)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isCompleted 
                                ? 'text-emerald-400 hover:bg-emerald-500/10' 
                                : 'text-text-muted hover:text-emerald-400 hover:bg-emerald-500/10'
                            }`}
                            title={isCompleted ? "重置为未听完" : "标记为已听完"}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(track.id); }}
                            className="p-1.5 rounded-lg text-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title="收藏音轨"
                          >
                            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                          </button>
                          
                          <button
                            onClick={(e) => { e.stopPropagation(); onAddToQueue(track); }}
                            className="p-1.5 rounded-lg text-text-muted hover:text-brand-color hover:bg-indigo-500/10 transition-colors"
                            title="添加到队列"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={() => handlePlayOrOpenTrack(track)}
                            className="p-1.5 rounded-lg bg-brand-color text-white opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Local File Tree Structure and Subtitle Checklist (1/3 width) */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Personal Rating, Status & Notes block (Requirement 1) */}
            <div className="bg-card-bg/40 border border-border-color/60 rounded-xl p-4 space-y-4">
              <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                <Star className="w-4 h-4 text-amber-400" />
                <span>个人听音记录</span>
              </h3>
              
              <section id="mvp57-asmr-side-rail" className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 space-y-3">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-amber-100">{mvp57SideRailModel.title}</p>
                  <p className="text-[10px] text-amber-50/75 leading-relaxed">{mvp57SideRailModel.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {mvp57SideRailModel.chips.map((chip) => (
                    <div key={chip.id} className={asmrDetailSideRailChipClassName(chip)}>
                      <p className="font-bold opacity-80">{chip.label}</p>
                      <p className="mt-1 text-[12px] font-extrabold">{chip.value}</p>
                      <p className="mt-0.5 leading-relaxed opacity-75">{chip.helper}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-amber-50/70 leading-relaxed">{mvp57SideRailModel.helper}</p>
              </section>

              {/* Rating stars */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-text-muted">主观评分：{mvp57SideRailModel.ratingLabel}</span>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSaveRating(s)}
                      className="p-0.5 text-zinc-600 hover:text-amber-400 transition-colors"
                      title={`评 ${s} 星`}
                    >
                      <Star 
                        className={`w-5 h-5 transition-transform active:scale-90 ${
                          s <= rating 
                            ? 'fill-amber-400 text-amber-400 font-bold drop-shadow' 
                            : 'text-zinc-600'
                        }`} 
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="text-xs text-amber-400 font-bold ml-1.5 font-mono">{rating}.0 星</span>
                  )}
                </div>
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-text-muted">听后状态：{mvp57SideRailModel.statusLabel}</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['unheard', 'listening', 'completed', 'abandoned'] as const).map((st) => {
                    const labels = {
                      unheard: '未开始 💤',
                      listening: '追音中 🎧',
                      completed: '已听完 🏆',
                      abandoned: '弃坑 ❌'
                    };
                    const colorMap = {
                      unheard: st === pstatus ? 'bg-zinc-800 border-zinc-500 text-zinc-300 font-semibold' : 'bg-zinc-950/40 border-zinc-900 text-zinc-500 hover:text-zinc-400',
                      listening: st === pstatus ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 font-semibold' : 'bg-zinc-950/40 border-zinc-900 text-zinc-500 hover:text-indigo-400/80',
                      completed: st === pstatus ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-semibold' : 'bg-zinc-950/40 border-zinc-900 text-zinc-500 hover:text-emerald-400/80',
                      abandoned: st === pstatus ? 'bg-rose-500/20 border-rose-500 text-rose-400 font-semibold' : 'bg-zinc-950/40 border-zinc-900 text-zinc-500 hover:text-rose-400/80'
                    };
                    return (
                      <button
                        key={st}
                        onClick={() => handleSavePstatus(st)}
                        className={`py-1.5 px-2 rounded-lg text-xs border text-center transition-all cursor-pointer ${colorMap[st]}`}
                      >
                        {labels[st]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Personal Notes */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-text-muted">个人笔记：</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={mvp57SideRailModel.notePlaceholder}
                  className="w-full h-20 bg-zinc-950/60 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-zinc-600 resize-none scrollbar-thin"
                />
                <button
                  onClick={handleSaveNotes}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 rounded-lg text-xs transition-colors cursor-pointer active:scale-95"
                >
                  {mvp57SideRailModel.saveNoteLabel}
                </button>
              </div>
              <p className="text-[10px] text-text-muted leading-relaxed">{mvp57SideRailModel.noteHelper}</p>
            </div>
            
            {/* Folder layout visualization */}
            <div className="bg-card-bg/40 border border-border-color/60 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                <Folder className="w-4 h-4 text-amber-400" />
                <span>{mvp57ResourceRecordModel.title}</span>
              </h3>
              <p className="text-[10px] text-text-muted leading-relaxed">{mvp57ResourceRecordModel.description}</p>
              <div className="space-y-2 border-l-2 border-border-color/60 pl-3 ml-2 font-mono text-[11px] text-text-secondary leading-relaxed">
                <div>
                  <span className="text-amber-400">📁 {mvp57ResourceRecordModel.rootLabel}</span>
                  <div className="pl-3 mt-1.5 space-y-1.5 border-l border-border-color/40">
                    <div>📁 {mvp57ResourceRecordModel.audioLabel}</div>
                    <div className="pl-3 text-text-muted text-[10px]">
                      {rjWork.tracks.slice(0, 3).map(t => (
                        <div key={t.id} className="truncate">📄 {t.title}</div>
                      ))}
                      {mvp57ResourceRecordModel.hiddenCountLabel && <div className="text-[9px] text-indigo-400">{mvp57ResourceRecordModel.hiddenCountLabel}</div>}
                    </div>
                    <div>📁 {mvp57ResourceRecordModel.subtitleLabel}</div>
                    <div className="pl-3 text-text-muted text-[10px]">
                      <div className="text-[9px] text-emerald-400">{mvp57ResourceRecordModel.subtitleHelper}</div>
                    </div>
                    <div>📄 {mvp57ResourceRecordModel.infoLabel}</div>
                    <div>📄 {mvp57ResourceRecordModel.coverLabel}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtitle Status Panel */}
            <div className="bg-card-bg/40 border border-border-color/60 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                <Subtitles className="w-4 h-4 text-sky-400" />
                <span>{mvp57SubtitlePanelModel.title}</span>
              </h3>
              <div className="space-y-2.5 text-xs text-text-secondary">
                <p className="text-[10px] text-text-muted leading-relaxed">{mvp57SubtitlePanelModel.description}</p>
                {mvp57SubtitlePanelModel.rows.map((row) => (
                  <div key={row.id} className="flex items-center justify-between gap-3">
                    <span>{row.label}：</span>
                    <span className={`font-semibold text-right ${row.tone === 'emerald' ? 'text-emerald-400' : row.tone === 'amber' ? 'text-amber-300' : row.tone === 'purple' ? 'text-purple-300' : row.tone === 'brand' ? 'text-brand-color' : 'text-text-muted'}`}>{row.value}</span>
                  </div>
                ))}
                <div className="p-2.5 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-[11px] leading-relaxed text-indigo-300">
                  {mvp57SubtitlePanelModel.helper}
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* About Tab Section */
        <div className="bg-card-bg/40 border border-border-color/60 rounded-xl p-6 space-y-6">
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-text-primary flex items-center space-x-2">
              <BookOpen className="w-4.5 h-4.5 text-indigo-400" />
              <span>作品简介</span>
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line bg-card-bg/20 p-4 rounded-xl border border-border-color/40">
              {rjWork.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-text-primary">元数据细节</h4>
              <table className="w-full text-xs text-text-secondary">
                <tbody>
                  <tr className="border-b border-border-color/40 py-2 block">
                    <td className="w-24 text-text-muted">作品编号</td>
                    <td className="font-mono text-text-primary">{rjWork.id}</td>
                  </tr>
                  <tr className="border-b border-border-color/40 py-2 block">
                    <td className="w-24 text-text-muted">制作社团</td>
                    <td className="text-text-primary">{rjWork.circle}</td>
                  </tr>
                  <tr className="border-b border-border-color/40 py-2 block">
                    <td className="w-24 text-text-muted">出演声优</td>
                    <td className="text-text-primary">{rjWork.cvs.join('、')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-text-primary">资源记录</h4>
              <table className="w-full text-xs text-text-secondary">
                <tbody>
                  <tr className="border-b border-border-color/40 py-2 block">
                    <td className="w-24 text-text-muted">记录来源</td>
                    <td className="font-mono text-text-primary">本地资源库记录</td>
                  </tr>
                  <tr className="border-b border-border-color/40 py-2 block">
                    <td className="w-24 text-text-muted">封面状态</td>
                    <td className="font-mono text-text-primary">{rjWork.coverSourceKind === 'local-file' ? '本地封面' : '占位封面'}</td>
                  </tr>
                  <tr className="border-b border-border-color/40 py-2 block">
                    <td className="w-24 text-text-muted">音轨概况</td>
                    <td className="font-mono text-text-primary">{rjWork.tracks.length} 个音轨 / {Math.floor(rjWork.totalDuration / 60)} 分钟</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Feedback Toast */}
      {feedbackMsg && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center space-x-2 animate-bounce-subtle">
          <CheckCircle className="w-4 h-4 text-white" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Manual Metadata & Tag Editor Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setIsEditModalOpen(false)}>
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-scale-up" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-black/25">
              <h3 className="text-sm font-bold text-text-primary flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>编辑本地元数据 & 标签修改 ({rjWork.id})</span>
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-5 overflow-y-auto scrollbar-thin space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">作品标题 (Title)</label>
                <input 
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3.5 py-2.5 text-text-primary text-xs outline-none focus:border-brand-color transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">制作社团 (Circle)</label>
                  <input 
                    type="text"
                    value={editCircle}
                    onChange={(e) => setEditCircle(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3.5 py-2.5 text-text-primary text-xs outline-none focus:border-brand-color transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">发售日期</label>
                  <input 
                    type="text"
                    value={editReleaseDate}
                    onChange={(e) => setEditReleaseDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3.5 py-2.5 text-text-primary text-xs font-mono outline-none focus:border-brand-color transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">声优 / CV (用英文逗号隔开)</label>
                <input 
                  type="text"
                  value={editCvsStr}
                  onChange={(e) => setEditCvsStr(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3.5 py-2.5 text-text-primary text-xs outline-none focus:border-brand-color transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">专辑详情/简介</label>
                <textarea 
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3.5 py-2.5 text-text-primary text-xs outline-none focus:border-brand-color transition-colors resize-none scrollbar-thin"
                />
              </div>

              {/* Tags Area */}
              <div className="space-y-2 border-t border-white/5 pt-3">
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">本地标签管理</label>
                
                {/* Render current tags pills */}
                <div className="flex flex-wrap gap-1.5">
                  {editTags.length === 0 ? (
                    <span className="text-[10px] text-text-muted italic">暂无任何手动或自动分配的标签</span>
                  ) : (
                    editTags.map(t => (
                      <span 
                        key={t}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-zinc-800 text-[10px] text-text-secondary border border-white/5 font-medium"
                      >
                        <span>#{t}</span>
                        <button
                          type="button"
                          onClick={() => setEditTags(editTags.filter(tag => tag !== t))}
                          className="hover:text-rose-400 transition-colors font-bold text-[11px] cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Tag Input adder */}
                <div className="flex items-center space-x-2 mt-2">
                  <input 
                    type="text"
                    value={newTagInput}
                    placeholder="按回车或点击按钮追加新标签..."
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = newTagInput.trim();
                        if (val && !editTags.includes(val)) {
                          setEditTags([...editTags, val]);
                          setNewTagInput('');
                        }
                      }
                    }}
                    className="flex-1 bg-zinc-950 border border-white/5 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-brand-color transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = newTagInput.trim();
                      if (val && !editTags.includes(val)) {
                        setEditTags([...editTags, val]);
                        setNewTagInput('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-text-primary text-[11px] font-bold transition-colors cursor-pointer border border-white/5"
                  >
                    添加
                  </button>
                </div>
              </div>

              <AsmrMetadataProviderPreview
                work={rjWork}
                onApplyToDraft={(candidate: AsmrMetadataProviderCandidateV1) => {
                  if (candidate.title !== undefined) setEditTitle(candidate.title);
                  if (candidate.circle !== undefined) setEditCircle(candidate.circle);
                  if (candidate.cvs !== undefined) setEditCvsStr(candidate.cvs.join(', '));
                  if (candidate.releaseDate !== undefined) setEditReleaseDate(candidate.releaseDate);
                  if (candidate.description !== undefined) setEditDescription(candidate.description);
                  if (candidate.tags !== undefined) setEditTags(candidate.tags);
                  showFeedback('外部信息已填入编辑表单，点击“保存修改”后才会写入本地覆盖层。');
                }}
              />
            </div>

            <div className="px-5 pb-3 text-[11px] leading-5 text-text-muted">
              修改会保存到独立的本地元数据覆盖层。重新扫描资源库时会继续应用，不修改音频文件标签，也不联网。
            </div>

            {/* Actions */}
            <div className="px-5 py-4 border-t border-white/5 flex items-center justify-between gap-2 bg-black/25">
              <div>
                {metadataOverrideService.hasAsmrOverride(rjWork.id) && onClearRjWorkOverride && (
                  <button
                    onClick={() => {
                      onClearRjWorkOverride(rjWork.id);
                      setIsEditModalOpen(false);
                      showFeedback('该作品的本地修改已还原为资源库记录。');
                    }}
                    className="px-4 py-2 rounded-xl bg-transparent hover:bg-rose-500/10 text-rose-400 text-xs font-semibold transition-colors cursor-pointer border border-rose-500/20"
                  >
                    还原本地修改
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-text-secondary hover:text-text-primary text-xs font-semibold transition-colors cursor-pointer border border-white/5"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (onUpdateRjWork) {
                    onUpdateRjWork({
                      ...rjWork,
                      title: editTitle,
                      circle: editCircle,
                      cvs: editCvsStr.split(',').map(s => s.trim()).filter(Boolean),
                      releaseDate: editReleaseDate,
                      description: editDescription,
                      tags: editTags
                    });
                  }
                  setIsEditModalOpen(false);
                  showFeedback('本地元数据修改已保存，重新扫描后仍会保留。');
                }}
                className="px-4 py-2 rounded-xl bg-brand-color hover:bg-brand-color-hover text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                保存修改
              </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
