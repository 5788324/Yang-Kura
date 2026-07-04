import React, { useState, useMemo } from 'react';
import { 
  Database, 
  RefreshCw, 
  Cpu, 
  CheckCircle2, 
  Terminal,
  ShieldCheck,
  ShieldAlert,
  ImageOff,
  AudioLines,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Activity,
  Trash2,
  Play,
  Link2,
  Folders,
  FileText,
  Search,
  Check,
  Zap,
  HardDrive
} from 'lucide-react';
import { RJWork, RJStatus, AudioTrack, MusicAlbum } from '../types';
import { fixtureLibraryScanner } from '../services/fixtureLibraryScanner';
import { fixtureLibrarySampleEntries } from '../services/fixtureLibrarySample';
import { fixtureScannerReportService } from '../services/fixtureScannerReportService';
import { fixtureScannerTestHarness } from '../services/fixtureScannerTestHarness';
import { plannedScannerContractService } from '../services/plannedScannerContractService';

interface DiagnosticsPageProps {
  onScanLibrary: () => void;
  scanStatus: string;
  rjWorks?: RJWork[];
  setRjWorks?: React.Dispatch<React.SetStateAction<RJWork[]>>;
  musicAlbums?: MusicAlbum[];
  setMusicAlbums?: React.Dispatch<React.SetStateAction<MusicAlbum[]>>;
  setAsmrDetailId?: (id: string | null) => void;
  onRefetchRjMetadata?: (rjId: string) => void;
}

type TabType = 'health' | 'scan' | 'rename' | 'deadlinks' | 'duplicates';

export default function DiagnosticsPage({
  onScanLibrary,
  scanStatus,
  rjWorks = [],
  setRjWorks,
  musicAlbums = [],
  setMusicAlbums,
  setAsmrDetailId,
  onRefetchRjMetadata
}: DiagnosticsPageProps) {
  // Navigation Section Tab
  const [activeTab, setActiveTab] = useState<TabType>('health');

  const fixtureIndex = useMemo(() => fixtureLibraryScanner.scanVirtualEntries(fixtureLibrarySampleEntries, {
    generatedAt: '1970-01-01T00:00:00.000Z',
    rootPathPrefix: '<fixture>',
  }), []);

  const fixtureReport = useMemo(() => fixtureScannerReportService.analyze(fixtureIndex), [fixtureIndex]);

  const fixtureHarness = useMemo(() => fixtureScannerTestHarness.run(fixtureIndex, fixtureReport), [fixtureIndex, fixtureReport]);

  const plannedScannerContract = useMemo(() => plannedScannerContractService.getContract(), []);

  const fixtureSeverityClass = (severity: string) => {
    if (severity === 'error') return 'text-rose-300 bg-rose-500/10 border-rose-500/25';
    if (severity === 'warning') return 'text-amber-300 bg-amber-500/10 border-amber-500/25';
    return 'text-sky-300 bg-sky-500/10 border-sky-500/25';
  };

  const fixtureStatusClass = fixtureReport.status === 'pass'
    ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25'
    : fixtureReport.status === 'needs-review'
      ? 'text-amber-300 bg-amber-500/10 border-amber-500/25'
      : 'text-rose-300 bg-rose-500/10 border-rose-500/25';

  // Compute duplicates analysis (Requirement 8 & 9)
  const duplicateAnalysis = useMemo(() => {
    const seenIds = new Map<string, RJWork[]>();
    rjWorks.forEach(work => {
      const list = seenIds.get(work.id) || [];
      list.push(work);
      seenIds.set(work.id, list);
    });
    
    const duplicates: Array<{ id: string; works: RJWork[]; totalSize: string }> = [];
    seenIds.forEach((works, id) => {
      if (works.length > 1) {
        duplicates.push({
          id,
          works,
          totalSize: `${(works.length * 1.25).toFixed(2)} GB`
        });
      }
    });

    // Mock a persistent test duplication of RJ356984 if no natural duplicates are generated,
    // ensuring the user can instantly experience and verify the duplicate clearing action.
    if (duplicates.length === 0 && rjWorks.length > 0) {
      const reference = rjWorks[0];
      duplicates.push({
        id: reference.id,
        works: [
          reference,
          {
            ...reference,
            id: reference.id,
            title: reference.title + ' (外部挂载重叠下载备份)',
            description: '物理路径存在于外部拓展挂载卷 (E:/ASMR_Backup/' + reference.id + ')，该备份文件夹格式、大小与主存储完全对齐。',
            addedAt: '2026-06-25 10:14:00'
          }
        ],
        totalSize: '2.56 GB'
      });
    }
    return duplicates;
  }, [rjWorks]);
  
  // Local state for filtering health items
  const [filterType, setFilterType] = useState<string>('all');

  // Scanning newly found items states
  const [isScanning, setIsScanning] = useState(false);
  const [scannedOnce, setScannedOnce] = useState(false);
  const [scannedItems, setScannedItems] = useState<Array<{
    id: string;
    type: 'asmr' | 'music';
    title: string;
    circleOrArtist: string;
    path: string;
    size: string;
    status: 'pending' | 'imported';
  }>>([
    {
      id: 'RJ410092',
      type: 'asmr',
      title: '【耳かき】のんびり猫耳メイドさん。膝枕で耳そうじと頭皮マッサージ',
      circleOrArtist: 'あまやどり',
      path: 'D:/YangKura/Asmr_Library/RJ410092',
      size: '1.45 GB',
      status: 'pending'
    },
    {
      id: 'music_pop_04',
      type: 'music',
      title: 'Think Later (Pop Album)',
      circleOrArtist: 'Tate McRae',
      path: 'C:/Users/Admin/Music/Tate McRae - Think Later',
      size: '280 MB',
      status: 'pending'
    }
  ]);

  // Rename states
  const [renameRule, setRenameRule] = useState<string>('rule-1');
  const [isRenameSuccess, setIsRenameSuccess] = useState(false);

  // Dead links checking states
  const [isCheckingDeadLinks, setIsCheckingDeadLinks] = useState(false);
  const [hasCheckedDeadLinks, setHasCheckedDeadLinks] = useState(false);
  const [deadLinksList, setDeadLinksList] = useState<Array<{
    id: string;
    title: string;
    rjIdOrAlbum: string;
    type: 'asmr' | 'music';
    filePath: string;
    reason: string;
    status: 'broken' | 'fixed' | 'deleted';
  }>>([
    {
      id: 'track_rj356984_01_dead',
      title: '01_和風縁側でのんびりおばあちゃんの膝枕耳かき',
      rjIdOrAlbum: 'RJ356984',
      type: 'asmr',
      filePath: 'ひなき/01_縁側膝枕耳かき.flac',
      reason: '物理文件挂载异常 (Err: FILE_NOT_FOUND)',
      status: 'broken'
    },
    {
      id: 'track_music_01_03_dead',
      title: '03_Unreleased_Bonus_Track',
      rjIdOrAlbum: 'After Hours',
      type: 'music',
      filePath: 'C:/Users/Admin/Music/After Hours/03_Unreleased_Bonus.mp3',
      reason: '云端网盘共享已被创建者撤销',
      status: 'broken'
    }
  ]);

  // Concurrent repair stats
  const [isFixingAll, setIsFixingAll] = useState(false);
  const [repairProgress, setRepairProgress] = useState(0);
  const [repairLog, setRepairLog] = useState<string>('');

  // Toast feedback
  const [feedback, setFeedback] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

  // Compute stats for healthy albums
  const stats = useMemo(() => {
    const result = {
      total: rjWorks.length,
      identified: 0,
      missingCover: 0,
      missingAudio: 0,
      warning: 0
    };
    rjWorks.forEach(work => {
      if (work.status === 'identified') result.identified++;
      else if (work.status === 'missing-cover') result.missingCover++;
      else if (work.status === 'missing-audio') result.missingAudio++;
      else if (work.status === 'warning') result.warning++;
    });
    return result;
  }, [rjWorks]);

  const filteredWorks = useMemo(() => {
    if (filterType === 'all') return rjWorks;
    return rjWorks.filter(w => w.status === filterType);
  }, [rjWorks, filterType]);

  const getStatusDetail = (work: RJWork) => {
    switch (work.status) {
      case 'identified':
        return {
          label: '正常已识别',
          desc: '元数据完全对齐，物理封面与无损 Flac 音频匹配度完美。',
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
          icon: CheckCircle
        };
      case 'missing-cover':
        return {
          label: '缺失封面',
          desc: '未检测到 cover.jpg，目前使用系统精美默认占位符封面。',
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
          icon: ImageOff
        };
      case 'missing-audio':
        return {
          label: '缺失音频轨',
          desc: '该物理路径下没有任何音频文件。音轨名为空或链接失效。',
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/25',
          icon: AudioLines
        };
      case 'warning':
        return {
          label: '音频格式受损',
          desc: '包含低采样率或物理损伤的音轨，建议使用下载器补充重新拉取。',
          color: 'text-red-400 bg-red-500/10 border-red-500/25',
          icon: AlertCircle
        };
      default:
        return {
          label: '未知状态',
          desc: '校验进行中。',
          color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/25',
          icon: AlertCircle
        };
    }
  };

  // 1. One-click Batch Refetch for deficient works (Requirement 4)
  const handleBulkRepair = () => {
    const deficientWorks = rjWorks.filter(w => w.status === 'missing-cover' || w.status === 'missing-audio');
    if (deficientWorks.length === 0) {
      showToast('没有检测到缺失封面或音轨的异常条目！');
      return;
    }
    
    setIsFixingAll(true);
    setRepairProgress(10);
    setRepairLog('正在并发请求 DLsite 及 ASMR.one 代理元数据接口...');

    setTimeout(() => {
      setRepairProgress(45);
      setRepairLog(`发现 ${deficientWorks.length} 个异常条目。正在拉取 RJ100204 极上雨声与露营封面及音轨元数据...`);
    }, 700);

    setTimeout(() => {
      setRepairProgress(80);
      setRepairLog('正在将 3D 双耳 binaural 音质轨道写入本地 SQLite 索引，配置 lrc 字幕时间轴...');
    }, 1400);

    setTimeout(() => {
      // Execute refetch in parent state
      deficientWorks.forEach(w => {
        onRefetchRjMetadata?.(w.id);
      });
      setIsFixingAll(false);
      setRepairProgress(100);
      setRepairLog('');
      showToast(`一键并发修复成功！已成功抓取并补全了 ${deficientWorks.length} 个专辑的元数据与音轨名。`);
    }, 2200);
  };

  // 2. Scan and monitor new directory additions (Requirement 1)
  const handleScanNewFolders = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScannedOnce(true);
      showToast('Demo 扫描完毕：这是模拟结果，未读取真实目录。');
    }, 1200);
  };

  const handleImportScannedItem = (id: string) => {
    const item = scannedItems.find(x => x.id === id);
    if (!item || item.status === 'imported') return;

    if (item.type === 'asmr') {
      if (setRjWorks) {
        const newRj: RJWork = {
          id: item.id,
          title: item.title,
          circle: item.circleOrArtist,
          cvs: ['あまね', 'ねこ'],
          releaseDate: '2026-06-20',
          coverUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=350&auto=format&fit=crop',
          tags: ['猫耳', 'メイド', '耳かき', '新录入'],
          status: 'identified',
          fileCount: 2,
          totalDuration: 1800,
          addedAt: new Date().toISOString(),
          description: '全新检测并入库的 ASMR。双耳猫耳女仆膝枕耳搔与温柔脑部放松。',
          tracks: [
            {
              id: `${item.id.toLowerCase()}_01`,
              title: '01_猫耳メイドさんのご挨拶と膝枕.flac',
              artist: 'あまね',
              album: item.title,
              rjId: item.id,
              duration: 900,
              coverUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=350&auto=format&fit=crop',
              type: 'asmr',
              fileTreePath: 'RJ410092/01_猫耳膝枕.flac'
            },
            {
              id: `${item.id.toLowerCase()}_02`,
              title: '02_極上竹製耳そうじと頭皮マッサージ.flac',
              artist: 'ねこ',
              album: item.title,
              rjId: item.id,
              duration: 900,
              coverUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=350&auto=format&fit=crop',
              type: 'asmr',
              fileTreePath: 'RJ410092/02_竹制采耳.flac'
            }
          ]
        };
        setRjWorks(prev => [newRj, ...prev]);
      }
    } else {
      if (setMusicAlbums) {
        const newMusic = {
          id: item.id,
          title: item.title,
          artist: item.circleOrArtist,
          coverUrl: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?q=80&w=350&auto=format&fit=crop',
          tracksCount: 1,
          duration: 210,
          genre: 'Pop',
          tracks: [
            {
              id: 'track_music_tate_01',
              title: 'Greedy - Tate McRae Pop Master',
              artist: 'Tate McRae',
              album: item.title,
              duration: 210,
              coverUrl: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?q=80&w=350&auto=format&fit=crop',
              type: 'music' as const
            }
          ]
        };
        setMusicAlbums(prev => [newMusic, ...prev]);
      }
    }

    setScannedItems(prev => prev.map(x => x.id === id ? { ...x, status: 'imported' } : x));
    showToast(`Demo 导入：不会写 SQLite，后续改为 Local JSON Index。`);
  };

  const handleImportAllScanned = () => {
    const pending = scannedItems.filter(x => x.status === 'pending');
    if (pending.length === 0) {
      showToast('所有新增项已成功录入完毕！');
      return;
    }
    pending.forEach(item => {
      handleImportScannedItem(item.id);
    });
  };

  // 3. Batch physical rename preview & execute (Requirement 2)
  const handleExecuteBatchRename = () => {
    if (isRenameSuccess) {
      showToast('重命名规则已是最新，无须重复修改。');
      return;
    }
    setIsRenameSuccess(true);
    
    // Dynamically rename the names of files inside active rjWorks tracks
    if (setRjWorks) {
      setRjWorks(prev => prev.map(work => {
        const renamedTracks = work.tracks.map((track, index) => {
          const idxStr = String(index + 1).padStart(2, '0');
          let newName = track.title;
          let newPath = track.fileTreePath;
          if (renameRule === 'rule-1') {
            newName = `${idxStr}_【${work.circle}】_整理版音轨.flac`;
            newPath = `${work.circle}/${idxStr}_整理版音轨.flac`;
          } else if (renameRule === 'rule-2') {
            newName = `${idxStr}_[${work.id}]_${track.artist}_ASMR.flac`;
            newPath = `${work.id}/${idxStr}_${track.artist}.flac`;
          }
          return {
            ...track,
            title: newName,
            fileTreePath: newPath
          };
        });
        return {
          ...work,
          tracks: renamedTracks
        };
      }));
    }

    showToast('批量重命名计划成功！已对本地库所有音轨物理文件名及索引进行了规则格式化。');
  };

  // 4. Dead links re-align or delete (Requirement 1)
  const handleCheckDeadLinks = () => {
    setIsCheckingDeadLinks(true);
    setTimeout(() => {
      setIsCheckingDeadLinks(false);
      setHasCheckedDeadLinks(true);
      showToast('Demo 死链检测完成：未访问真实文件系统。');
    }, 1000);
  };

  const handleFixDeadLink = (id: string) => {
    setDeadLinksList(prev => prev.map(x => x.id === id ? { ...x, status: 'fixed' } : x));
    
    // Restore relevant work in states
    const dl = deadLinksList.find(x => x.id === id);
    if (dl && dl.type === 'asmr' && setRjWorks) {
      // Find work rjId and change status
      setRjWorks(prev => prev.map(work => {
        if (work.id === dl.rjIdOrAlbum) {
          return {
            ...work,
            status: 'identified' as const,
            description: work.description + ' (已于系统诊断死链对齐中重新挂载并修复物理链接。)'
          };
        }
        return work;
      }));
    }
    showToast('Demo 修复演示完成：未下载、未重连、未写索引。');
  };

  const handleDeleteDeadLink = (id: string) => {
    setDeadLinksList(prev => prev.map(x => x.id === id ? { ...x, status: 'deleted' } : x));
    
    const dl = deadLinksList.find(x => x.id === id);
    if (dl && dl.type === 'asmr' && setRjWorks) {
      // Physically remove this broken track from that work
      setRjWorks(prev => prev.map(work => {
        if (work.id === dl.rjIdOrAlbum) {
          const keptTracks = work.tracks.filter(t => !t.id.includes('dead'));
          return {
            ...work,
            tracks: keptTracks,
            fileCount: keptTracks.length
          };
        }
        return work;
      }));
    }
    showToast('Demo 清理演示完成：未写 SQLite。');
  };

  const handleFixAllDeadLinks = () => {
    const brokens = deadLinksList.filter(x => x.status === 'broken');
    if (brokens.length === 0) {
      showToast('没有断裂的死链需要对齐修复。');
      return;
    }
    brokens.forEach(x => {
      handleFixDeadLink(x.id);
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl pb-12 relative text-xs">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center space-x-2 text-text-primary">
            <Cpu className="w-5.5 h-5.5 text-brand-color" />
            <span>诊断页 · Demo / 原型验证</span>
          </h2>
          <p className="text-xs text-text-muted mt-1">
            当前仅展示未来诊断页的 UI 原型：不扫描真实磁盘、不修复文件、不重命名、不写 SQLite，未修改任何真实文件。
          </p>
        </div>

        {/* Diagnostic Action Tab row */}
        <div className="bg-card-bg/60 p-1 rounded-xl flex flex-wrap items-center border border-border-color gap-1">
          <button
            onClick={() => setActiveTab('health')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeTab === 'health' ? 'bg-brand-color text-white' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            健康状况
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeTab === 'scan' ? 'bg-brand-color text-white' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            多路径监控
          </button>
          <button
            onClick={() => setActiveTab('rename')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeTab === 'rename' ? 'bg-brand-color text-white' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            重命名计划
          </button>
          <button
            onClick={() => setActiveTab('deadlinks')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeTab === 'deadlinks' ? 'bg-brand-color text-white' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            死链检测
          </button>
          <button
            onClick={() => setActiveTab('duplicates')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeTab === 'duplicates' ? 'bg-brand-color text-white' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            重复与去重
          </button>
        </div>
      </div>

      {/* Database Stats Card (Persistent) */}
      <div className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
            <Database className="w-4 h-4 text-purple-400" />
            <span>Demo 数据状态 / 尚无 SQLite</span>
          </h3>
          <button 
            onClick={onScanLibrary}
            className="flex items-center space-x-1.5 text-xs text-brand-color hover:text-brand-color-hover font-semibold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanStatus.includes('正在') ? 'animate-spin' : ''}`} />
            <span>Demo 扫描</span>
          </button>
        </div>
        
        {scanStatus && (
          <div className="bg-black/20 border border-border-color/50 p-3 rounded-xl font-mono text-[10px] text-brand-color leading-relaxed relative">
            <div className="flex items-center space-x-1.5 text-text-secondary border-b border-border-color/40 pb-1.5 mb-1.5">
              <Terminal className="w-3.5 h-3.5 text-brand-color animate-pulse" />
              <span>Shell 挂载输出监控</span>
            </div>
            {scanStatus}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono pt-1">
          <div className="bg-card-bg/25 border border-border-color/50 p-3.5 rounded-xl">
            <div className="text-text-muted text-[10px] mb-1">已缓存 RJ 音声</div>
            <div className="text-text-primary font-bold text-sm">{rjWorks.length} 组专辑</div>
          </div>
          <div className="bg-card-bg/25 border border-border-color/50 p-3.5 rounded-xl">
            <div className="text-text-muted text-[10px] mb-1">物理媒体匹配率</div>
            <div className="text-text-primary font-bold text-sm text-emerald-400">96.8% (高匹配)</div>
          </div>
          <div className="bg-card-bg/25 border border-border-color/50 p-3.5 rounded-xl">
            <div className="text-text-muted text-[10px] mb-1">普通流行音乐</div>
            <div className="text-text-primary font-bold text-sm">{musicAlbums.length} 张专辑</div>
          </div>
          <div className="bg-card-bg/25 border border-border-color/50 p-3.5 rounded-xl">
            <div className="text-text-muted text-[10px] mb-1">物理路径挂载点</div>
            <div className="text-text-primary font-bold text-sm">3 组外部挂载</div>
          </div>
        </div>
      </div>

      {/* MVP-04 Fixture scanner report preview */}
      <section className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 border-b border-border-color/30 pb-3">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <span>MVP-05 Fixture Case Report / 只读诊断</span>
            </h3>
            <p className="text-[10px] text-text-muted leading-relaxed">
              本区只展示 MVP-05 扩展 fixture 的内存报告：重复 RJ、空目录、视频 ASMR、图片/CG、多语言字幕、多 disc/特典；不读取真实磁盘、不写 library-index.json、不接 Electron、不写 SQLite。
            </p>
          </div>
          <span className={`px-2.5 py-1 rounded-xl border text-[10px] font-bold uppercase ${fixtureStatusClass}`}>
            {fixtureReport.status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-card-bg/25 border border-border-color/50 p-3 rounded-xl">
            <div className="text-text-muted text-[10px] mb-1">fixture roots</div>
            <div className="text-text-primary font-bold text-sm">{fixtureReport.summary.rootCount}</div>
          </div>
          <div className="bg-card-bg/25 border border-border-color/50 p-3 rounded-xl">
            <div className="text-text-muted text-[10px] mb-1">collections</div>
            <div className="text-text-primary font-bold text-sm">{fixtureReport.summary.collectionCount}</div>
          </div>
          <div className="bg-card-bg/25 border border-border-color/50 p-3 rounded-xl">
            <div className="text-text-muted text-[10px] mb-1">tracks</div>
            <div className="text-text-primary font-bold text-sm">
              {fixtureReport.summary.trackCount}
              <span className="text-[10px] text-text-muted ml-1">A{fixtureReport.summary.audioTrackCount}/V{fixtureReport.summary.videoTrackCount}/I{fixtureReport.summary.imageTrackCount}</span>
            </div>
          </div>
          <div className="bg-card-bg/25 border border-border-color/50 p-3 rounded-xl">
            <div className="text-text-muted text-[10px] mb-1">quality score</div>
            <div className="text-text-primary font-bold text-sm text-emerald-400">{fixtureReport.summary.overallQualityScore}/100</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-[10px]">
          <div className="rounded-xl border border-border-color/50 bg-card-bg/20 p-3">
            <div className="text-text-muted">缺封面 collection</div>
            <div className="mt-1 text-sm font-black text-amber-300">{fixtureReport.summary.collectionMissingCoverCount}</div>
          </div>
          <div className="rounded-xl border border-border-color/50 bg-card-bg/20 p-3">
            <div className="text-text-muted">无音频 collection</div>
            <div className="mt-1 text-sm font-black text-rose-300">{fixtureReport.summary.collectionNoAudioCount}</div>
          </div>
          <div className="rounded-xl border border-border-color/50 bg-card-bg/20 p-3">
            <div className="text-text-muted">图片/CG-only</div>
            <div className="mt-1 text-sm font-black text-purple-300">{fixtureReport.summary.collectionImageOnlyCount}</div>
          </div>
          <div className="rounded-xl border border-border-color/50 bg-card-bg/20 p-3">
            <div className="text-text-muted">空/仅元数据</div>
            <div className="mt-1 text-sm font-black text-rose-300">{fixtureReport.summary.collectionMetadataOnlyCount}</div>
          </div>
          <div className="rounded-xl border border-border-color/50 bg-card-bg/20 p-3">
            <div className="text-text-muted">音频缺字幕</div>
            <div className="mt-1 text-sm font-black text-sky-300">{fixtureReport.summary.audioTrackMissingSubtitleCount}</div>
          </div>
          <div className="rounded-xl border border-border-color/50 bg-card-bg/20 p-3">
            <div className="text-text-muted">重复 RJ 组</div>
            <div className="mt-1 text-sm font-black text-amber-300">{fixtureReport.summary.duplicateRjGroupCount}</div>
          </div>
          <div className="rounded-xl border border-border-color/50 bg-card-bg/20 p-3">
            <div className="text-text-muted">重复 Track 路径</div>
            <div className="mt-1 text-sm font-black text-amber-300">{fixtureReport.summary.duplicateTrackPathGroupCount}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-300" />
                <span>diagnostics</span>
              </h4>
              <span className="text-[10px] text-text-muted">{fixtureReport.diagnostics.length} items</span>
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
              {fixtureReport.diagnostics.length === 0 ? (
                <p className="text-[10px] text-text-muted">fixture report 暂无诊断项。</p>
              ) : fixtureReport.diagnostics.slice(0, 8).map((item) => (
                <div key={item.id} className="rounded-xl border border-border-color/40 bg-card-bg/30 p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-text-primary truncate">{item.message}</span>
                    <span className={`px-1.5 py-0.5 rounded-lg border text-[9px] font-bold uppercase ${fixtureSeverityClass(item.severity)}`}>{item.severity}</span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-1 leading-relaxed">{item.hint}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
            <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>next actions</span>
            </h4>
            <div className="space-y-2">
              {fixtureReport.nextActions.map((action, index) => (
                <div key={action} className="flex items-start space-x-2 rounded-xl border border-border-color/40 bg-card-bg/30 p-2.5">
                  <span className="text-[10px] font-mono text-brand-color mt-0.5">{String(index + 1).padStart(2, '0')}</span>
                  <p className="text-[10px] text-text-secondary leading-relaxed">{action}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-border-color/30 space-y-2">
              <h5 className="text-[10px] font-bold text-text-primary">duplicate groups</h5>
              {fixtureReport.duplicateRjGroups.length === 0 && fixtureReport.duplicateTrackPathGroups.length === 0 ? (
                <p className="text-[10px] text-text-muted">base fixture 暂无重复 RJ / 重复 Track 路径。</p>
              ) : (
                <>
                  {fixtureReport.duplicateRjGroups.map((group) => (
                    <div key={`rj-${group.key}`} className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2">
                      <div className="text-[10px] font-bold text-amber-300">RJ {group.key}</div>
                      <p className="text-[10px] text-text-secondary truncate">{group.titles.join(' / ')}</p>
                    </div>
                  ))}
                  {fixtureReport.duplicateTrackPathGroups.map((group) => (
                    <div key={`path-${group.key}`} className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2">
                      <div className="text-[10px] font-bold text-amber-300">Track path {group.key}</div>
                      <p className="text-[10px] text-text-secondary truncate">{group.titles.join(' / ')}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
          <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
            <Search className="w-3.5 h-3.5 text-sky-300" />
            <span>collection quality preview</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
            {fixtureReport.collections.map((item) => (
              <div key={item.collectionId} className="rounded-xl border border-border-color/40 bg-card-bg/30 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-text-primary truncate">{item.title}</div>
                    <div className="text-[10px] text-text-muted font-mono mt-0.5">{item.collectionType}{item.codeNorm ? ` · ${item.codeNorm}` : ''}</div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-300">{item.qualityScore}/100</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[9px] text-text-secondary">
                  <span className="px-1.5 py-0.5 rounded bg-black/20 border border-border-color/40">tracks {item.trackCount}</span>
                  <span className="px-1.5 py-0.5 rounded bg-black/20 border border-border-color/40">audio {item.audioTrackCount}</span>
                  <span className="px-1.5 py-0.5 rounded bg-black/20 border border-border-color/40">video {item.videoTrackCount}</span>
                  <span className="px-1.5 py-0.5 rounded bg-black/20 border border-border-color/40">image {item.imageTrackCount}</span>
                  <span className="px-1.5 py-0.5 rounded bg-black/20 border border-border-color/40">sub {item.subtitleCount}</span>
                  <span className={`px-1.5 py-0.5 rounded border ${item.hasCover ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 'bg-amber-500/10 text-amber-300 border-amber-500/20'}`}>{item.hasCover ? 'cover' : 'no cover'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* MVP-06 Fixture scanner test harness / planned contract */}
      <section className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 border-b border-border-color/30 pb-3">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>MVP-06 Fixture Scanner Test Matrix / Planned Scanner Contract</span>
            </h3>
            <p className="text-[10px] text-text-muted leading-relaxed">
              本区把 fixture scanner 结果固化成测试矩阵，并给未来真实 scanner 定输入/输出/错误/安全合同。当前仍只分析 fixture 内存结果，不读真实盘、不写 library-index.json、不接 Electron。
            </p>
          </div>
          <span className={`px-2.5 py-1 rounded-xl border text-[10px] font-bold uppercase ${fixtureHarness.summary.status === 'pass' ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25' : fixtureHarness.summary.status === 'needs-review' ? 'text-amber-300 bg-amber-500/10 border-amber-500/25' : 'text-rose-300 bg-rose-500/10 border-rose-500/25'}`}>
            {fixtureHarness.summary.status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs font-mono">
          <div className="bg-card-bg/25 border border-border-color/50 p-3 rounded-xl">
            <div className="text-text-muted text-[10px] mb-1">test cases</div>
            <div className="text-text-primary font-bold text-sm">{fixtureHarness.summary.total}</div>
          </div>
          <div className="bg-card-bg/25 border border-border-color/50 p-3 rounded-xl">
            <div className="text-text-muted text-[10px] mb-1">passed</div>
            <div className="text-emerald-300 font-bold text-sm">{fixtureHarness.summary.passed}</div>
          </div>
          <div className="bg-card-bg/25 border border-border-color/50 p-3 rounded-xl">
            <div className="text-text-muted text-[10px] mb-1">failed</div>
            <div className="text-rose-300 font-bold text-sm">{fixtureHarness.summary.failed}</div>
          </div>
          <div className="bg-card-bg/25 border border-border-color/50 p-3 rounded-xl">
            <div className="text-text-muted text-[10px] mb-1">required failed</div>
            <div className="text-rose-300 font-bold text-sm">{fixtureHarness.summary.requiredFailed}</div>
          </div>
          <div className="bg-card-bg/25 border border-border-color/50 p-3 rounded-xl">
            <div className="text-text-muted text-[10px] mb-1">contract</div>
            <div className="text-sky-300 font-bold text-sm">{plannedScannerContract.status}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
            <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>test matrix</span>
            </h4>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
              {fixtureHarness.cases.map((item) => (
                <div key={item.id} className="rounded-xl border border-border-color/40 bg-card-bg/30 p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-text-primary truncate">{item.title}</span>
                    <span className={`px-1.5 py-0.5 rounded-lg border text-[9px] font-bold uppercase ${item.status === 'pass' ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25' : 'text-rose-300 bg-rose-500/10 border-rose-500/25'}`}>{item.status}</span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-1 leading-relaxed">expected：{item.expected}</p>
                  <p className="text-[10px] text-text-secondary mt-1 leading-relaxed">actual：{item.actual}</p>
                  <p className="text-[10px] text-brand-color mt-1 leading-relaxed">next：{item.nextAction}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-3">
            <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-300" />
              <span>planned scanner contract</span>
            </h4>
            <p className="text-[10px] text-amber-200/90 leading-relaxed rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5">
              {plannedScannerContract.stageGate}
            </p>
            {[plannedScannerContract.inputContract, plannedScannerContract.outputContract, plannedScannerContract.errorContract, plannedScannerContract.safetyContract].map((section) => (
              <div key={section.title} className="rounded-xl border border-border-color/40 bg-card-bg/30 p-2.5">
                <div className="text-[10px] font-bold text-text-primary mb-1">{section.title}</div>
                <div className="space-y-1">
                  {section.items.slice(0, 4).map((item) => (
                    <p key={item} className="text-[10px] text-text-muted leading-relaxed">• {item}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
            <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
              <span>forbidden actions</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {plannedScannerContract.forbiddenActions.map((item) => (
                <span key={item} className="px-2 py-1 rounded-lg border border-rose-500/20 bg-rose-500/10 text-[10px] text-rose-200">{item}</span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
            <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-sky-300" />
              <span>next implementation order</span>
            </h4>
            <div className="space-y-1.5">
              {plannedScannerContract.nextImplementationOrder.map((item, index) => (
                <div key={item} className="flex items-start space-x-2 rounded-xl border border-border-color/40 bg-card-bg/30 p-2">
                  <span className="text-[10px] font-mono text-brand-color mt-0.5">{String(index + 1).padStart(2, '0')}</span>
                  <p className="text-[10px] text-text-secondary leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Render active sub-interface based on tab selection */}
      {activeTab === 'health' && (
        <div className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-color/30 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                <ShieldAlert className="w-4.5 h-4.5 text-indigo-400" />
                <span>ASMR 媒体库健康度状况</span>
              </h3>
              <p className="text-[10px] text-text-muted">检测并过滤带有潜在缺失封面、音轨受损的异常专辑条目。</p>
            </div>
            
            {/* Bulk repair button (Requirement 4) */}
            <button
              onClick={handleBulkRepair}
              disabled={isFixingAll || (stats.missingCover + stats.missingAudio === 0)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white text-[11px] font-bold transition-all disabled:opacity-40 disabled:pointer-events-none hover:scale-103 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Demo 修复演示</span>
            </button>
          </div>

          {/* Concurrent bulk refetching progress indicator */}
          {isFixingAll && (
            <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-2 animate-pulse text-xs">
              <div className="flex items-center justify-between text-[11px] font-bold text-indigo-300">
                <span>正在并发从 DLsite / ASMR.one 代理节点补充元数据及音轨名称...</span>
                <span>{repairProgress}%</span>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-brand-color h-full transition-all duration-300" style={{ width: `${repairProgress}%` }}></div>
              </div>
              <p className="text-[10px] text-text-secondary font-mono leading-relaxed">{repairLog}</p>
            </div>
          )}

          {/* Categories selector */}
          <div className="flex flex-wrap gap-2 text-xs">
            <button 
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center space-x-1.5 border cursor-pointer ${
                filterType === 'all' 
                  ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40 font-bold shadow-sm' 
                  : 'bg-card-bg/20 text-text-secondary border-border-color/60 hover:text-text-primary hover:border-border-color'
              }`}
            >
              <span>全部条目</span>
              <span className="px-1.5 py-0.2 bg-black/30 rounded-md font-mono text-[10px]">{stats.total}</span>
            </button>

            <button 
              onClick={() => setFilterType('identified')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center space-x-1.5 border cursor-pointer ${
                filterType === 'identified' 
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 font-bold shadow-sm' 
                  : 'bg-card-bg/20 text-text-secondary border-border-color/60 hover:text-text-primary hover:border-border-color'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>完美对齐</span>
              <span className="px-1.5 py-0.2 bg-black/30 rounded-md font-mono text-[10px]">{stats.identified}</span>
            </button>

            <button 
              onClick={() => setFilterType('missing-cover')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center space-x-1.5 border cursor-pointer ${
                filterType === 'missing-cover' 
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 font-bold shadow-sm' 
                  : 'bg-card-bg/20 text-text-secondary border-border-color/60 hover:text-text-primary hover:border-border-color'
              }`}
            >
              <ImageOff className="w-3.5 h-3.5 text-amber-400" />
              <span>缺封面图</span>
              <span className="px-1.5 py-0.2 bg-black/30 rounded-md font-mono text-[10px]">{stats.missingCover}</span>
            </button>

            <button 
              onClick={() => setFilterType('missing-audio')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center space-x-1.5 border cursor-pointer ${
                filterType === 'missing-audio' 
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/40 font-bold shadow-sm' 
                  : 'bg-card-bg/20 text-text-secondary border-border-color/60 hover:text-text-primary hover:border-border-color'
              }`}
            >
              <AudioLines className="w-3.5 h-3.5 text-rose-400" />
              <span>音频轨空</span>
              <span className="px-1.5 py-0.2 bg-black/30 rounded-md font-mono text-[10px]">{stats.missingAudio}</span>
            </button>

            <button 
              onClick={() => setFilterType('warning')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center space-x-1.5 border cursor-pointer ${
                filterType === 'warning' 
                  ? 'bg-red-500/15 text-red-300 border-red-500/40 font-bold shadow-sm' 
                  : 'bg-card-bg/20 text-text-secondary border-border-color/60 hover:text-text-primary hover:border-border-color'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              <span>异常受损</span>
              <span className="px-1.5 py-0.2 bg-black/30 rounded-md font-mono text-[10px]">{stats.warning}</span>
            </button>
          </div>

          {/* Diagnosis list of matching works */}
          <div className="space-y-2.5 max-h-80 overflow-y-auto scrollbar-thin pr-1 pt-1">
            {filteredWorks.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-6">此分类下无对应的健康诊断记录。</p>
            ) : (
              filteredWorks.map(work => {
                const detail = getStatusDetail(work);
                const StatusIcon = detail.icon;
                return (
                  <div 
                    key={work.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-card-bg/20 border border-border-color/60 hover:border-border-color transition-all gap-3"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-black/20 flex-shrink-0 border border-border-color/30">
                        {work.coverUrl ? (
                          <img 
                            src={work.coverUrl} 
                            alt={work.title} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-muted">
                            <ImageOff className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-black/40 text-indigo-300 rounded border border-white/5">
                            {work.id}
                          </span>
                          <h4 className="text-xs font-bold text-text-primary truncate" title={work.title}>
                            {work.title}
                          </h4>
                        </div>
                        <p className="text-[10px] text-text-muted truncate mt-0.5">
                          社团: {work.circle} | 声优: {work.cvs.join(', ')}
                        </p>
                        <div className="flex items-center space-x-1.5 mt-1 text-text-secondary">
                          <StatusIcon className="w-3 h-3 flex-shrink-0 text-text-muted" />
                          <span className="text-[10px] font-medium">{detail.desc}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end space-x-2 flex-shrink-0 border-t sm:border-t-0 border-border-color/20 pt-2 sm:pt-0">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${detail.color}`}>
                        {detail.label}
                      </span>
                      {setAsmrDetailId && (
                        <button
                          onClick={() => setAsmrDetailId(work.id)}
                          className="flex items-center space-x-0.5 text-[10px] text-brand-color hover:text-brand-color-hover font-semibold px-2 py-1 rounded hover:bg-brand-color/5 transition-all cursor-pointer"
                        >
                          <span>管理</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 2. Scanning Sub-Interface (Requirement 1: Multi-path Scan Additions) */}
      {activeTab === 'scan' && (
        <div className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-color/30 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                <Folders className="w-4.5 h-4.5 text-brand-color" />
                <span>多物理路径追加扫描监控 (新增扫描)</span>
              </h3>
              <p className="text-[10px] text-text-muted">实时对比本地硬盘挂载路径，一键提取尚未录入 SQLite 的 RJ 文件夹或音乐专辑。</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleScanNewFolders}
                disabled={isScanning}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-brand-color hover:bg-brand-color-hover disabled:bg-zinc-800 text-white text-[11px] font-bold transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>立即扫描新增</span>
              </button>
              {scannedOnce && (
                <button
                  onClick={handleImportAllScanned}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-all cursor-pointer"
                >
                  一键导入所有
                </button>
              )}
            </div>
          </div>

          {/* Scanned Items table */}
          <div className="space-y-3">
            {!scannedOnce ? (
              <div className="py-12 text-center border border-dashed border-border-color rounded-xl bg-card-bg/10 flex flex-col items-center justify-center">
                <Search className="w-10 h-10 text-text-muted mb-2 stroke-1" />
                <h4 className="font-semibold text-text-primary">尚未启动扫描任务</h4>
                <p className="text-[10px] text-text-muted mt-1 max-w-xs leading-relaxed">
                  系统会自动读取设置里配置的 3 组 ASMR 库路径与 2 组普通音乐挂载地址。请点击右上角进行扫描。
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {scannedItems.map(item => (
                  <div 
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-card-bg/20 border border-border-color/60 hover:border-border-color/90 transition-all gap-3"
                  >
                    <div className="flex items-start space-x-3 min-w-0">
                      <div className={`p-2 rounded-lg ${item.type === 'asmr' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-pink-500/10 text-pink-400'} flex-shrink-0`}>
                        <HardDrive className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${item.type === 'asmr' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-pink-500/20 text-pink-300'}`}>
                            {item.type === 'asmr' ? 'RJ音声' : '流行音乐'}
                          </span>
                          <span className="text-[10px] font-mono text-text-muted font-bold">{item.id}</span>
                        </div>
                        <h4 className="text-xs font-bold text-text-primary mt-1 truncate" title={item.title}>{item.title}</h4>
                        <p className="text-[10px] text-text-muted mt-0.5 truncate">
                          文件路径: <span className="font-mono bg-black/30 px-1 py-0.2 rounded border border-white/5">{item.path}</span>
                        </p>
                        <p className="text-[9px] text-text-muted mt-1">预计容量: {item.size} | 社团/歌手: {item.circleOrArtist}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end flex-shrink-0">
                      {item.status === 'imported' ? (
                        <span className="flex items-center space-x-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-xl text-[10px] font-bold">
                          <Check className="w-3.5 h-3.5" />
                          <span>已成功入库</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleImportScannedItem(item.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-text-primary border border-white/5 text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          导入入库 (物理同步)
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Physical Batch Rename Sub-Interface (Requirement 2) */}
      {activeTab === 'rename' && (
        <div className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-color/30 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                <FileText className="w-4.5 h-4.5 text-brand-color" />
                <span>一键媒体库物理批量重命名 (整理命名)</span>
              </h3>
              <p className="text-[10px] text-text-muted">选择批量命名规则，一键重命名本地物理音频流名称。支持重构索引防止断链发生。</p>
            </div>
            
            <button
              onClick={handleExecuteBatchRename}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-color hover:bg-brand-color-hover text-white text-[11px] font-bold transition-all hover:scale-103 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>一键执行重命名计划</span>
            </button>
          </div>

          {/* Rule options row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">预设重命名计划规则</label>
              <select
                value={renameRule}
                onChange={(e) => {
                  setRenameRule(e.target.value);
                  setIsRenameSuccess(false);
                }}
                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-text-primary outline-none focus:border-brand-color transition-colors"
              >
                <option value="rule-1">【音轨序号】_【社团名】_整理版音频.flac (推荐)</option>
                <option value="rule-2">【音轨序号】_【RJ号】_【声优】_ASMR.flac (精简)</option>
              </select>
            </div>
            <div className="bg-zinc-950/40 p-3 rounded-xl border border-white/5 flex flex-col justify-center text-[10px] text-text-muted leading-relaxed">
              <span className="text-brand-color font-bold">● 重命名提醒：</span>
              <span>当前按钮为禁用级 Demo 概念：MVP 阶段禁止物理重命名，禁止写 SQLite。</span>
            </div>
          </div>

          {/* Before and After Preview table */}
          <div className="space-y-2 border-t border-white/5 pt-3">
            <h4 className="text-[11px] font-bold text-text-primary mb-2">文件重命名预览预览 (Preview)</h4>
            
            <div className="border border-white/5 rounded-xl overflow-hidden bg-black/25">
              <table className="w-full text-[11px] text-left">
                <thead className="bg-zinc-900 border-b border-white/5 text-[10px] text-text-muted font-bold">
                  <tr>
                    <th className="p-3">作品RJ号</th>
                    <th className="p-3">旧物理文件名 (Original)</th>
                    <th className="p-3">重命名新文件名 (Renamed Preview)</th>
                    <th className="p-3 text-right">执行状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-text-secondary">
                  <tr>
                    <td className="p-3 font-bold text-brand-color">RJ100204</td>
                    <td className="p-3 truncate max-w-[200px]">01_和風縁側でのんびりおばあちゃんの膝枕耳かき.flac</td>
                    <td className="p-3 text-emerald-400 truncate max-w-[200px]">
                      {renameRule === 'rule-1' ? '01_【ひなき】_整理版音轨.flac' : '01_[RJ100204]_ひなき_ASMR.flac'}
                    </td>
                    <td className="p-3 text-right">
                      {isRenameSuccess ? (
                        <span className="text-emerald-400 font-bold">● 已重命名成功</span>
                      ) : (
                        <span className="text-amber-500 font-bold">● 待执行</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-brand-color">RJ100204</td>
                    <td className="p-3 truncate max-w-[200px]">02_縁側ひぐらしの鳴く夕暮れと炭酸シャンプー.flac</td>
                    <td className="p-3 text-emerald-400 truncate max-w-[200px]">
                      {renameRule === 'rule-1' ? '02_【ひなき】_整理版音轨.flac' : '02_[RJ100204]_ひなき_ASMR.flac'}
                    </td>
                    <td className="p-3 text-right">
                      {isRenameSuccess ? (
                        <span className="text-emerald-400 font-bold">● 已重命名成功</span>
                      ) : (
                        <span className="text-amber-500 font-bold">● 待执行</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. Dead Links Sub-Interface (Requirement 1: Dead link checking) */}
      {activeTab === 'deadlinks' && (
        <div className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-color/30 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                <Link2 className="w-4.5 h-4.5 text-rose-400" />
                <span>失效音声及死链一键检测 (死链检测)</span>
              </h3>
              <p className="text-[10px] text-text-muted">扫描索引数据库中因移除、改名或删除造成的“幽灵文件”与死链条目。</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCheckDeadLinks}
                disabled={isCheckingDeadLinks}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-brand-color hover:bg-brand-color-hover disabled:bg-zinc-800 text-white text-[11px] font-bold transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingDeadLinks ? 'animate-spin' : ''}`} />
                <span>开始全库死链分析</span>
              </button>
              {hasCheckedDeadLinks && (
                <button
                  onClick={handleFixAllDeadLinks}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all cursor-pointer"
                >
                  一键并发对齐死链
                </button>
              )}
            </div>
          </div>

          {/* Checking list */}
          <div className="space-y-3">
            {!hasCheckedDeadLinks ? (
              <div className="py-12 text-center border border-dashed border-border-color rounded-xl bg-card-bg/10 flex flex-col items-center justify-center">
                <Link2 className="w-10 h-10 text-rose-400/60 mb-2 stroke-1 animate-pulse" />
                <h4 className="font-semibold text-text-primary">全库物理完好度检测</h4>
                <p className="text-[10px] text-text-muted mt-1 max-w-xs leading-relaxed">
                  系统将深度遍历硬盘中每一组 ASMR、Pop 音轨，确认其物理连线完好性。点击右上角按钮以运行扫描。
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {deadLinksList.map(item => (
                  <div 
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-card-bg/20 border border-border-color/60 hover:border-border-color/90 transition-all gap-3"
                  >
                    <div className="flex items-start space-x-3 min-w-0">
                      <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 flex-shrink-0">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono text-rose-400 font-bold">断流异常</span>
                          <span className="text-[10px] font-mono text-text-muted">所属专辑: {item.rjIdOrAlbum}</span>
                        </div>
                        <h4 className="text-xs font-bold text-text-primary mt-1 truncate" title={item.title}>{item.title}</h4>
                        <p className="text-[10px] text-rose-400 font-mono mt-0.5 truncate">{item.reason}</p>
                        <p className="text-[9px] text-text-muted mt-1">虚拟映射相对位置: {item.filePath}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 flex-shrink-0">
                      {item.status === 'fixed' && (
                        <span className="flex items-center space-x-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl text-[10px] font-bold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>已物理修复连线</span>
                        </span>
                      )}
                      {item.status === 'deleted' && (
                        <span className="flex items-center space-x-1 bg-zinc-800 text-text-muted px-3 py-1.5 rounded-xl text-[10px] font-bold">
                          <span>已彻底清除索引</span>
                        </span>
                      )}
                      {item.status === 'broken' && (
                        <>
                          <button
                            onClick={() => handleFixDeadLink(item.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            并发补充修复
                          </button>
                          <button
                            onClick={() => handleDeleteDeadLink(item.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            移除死链
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Duplicate Checking & Cleanup Sub-Interface (Requirement 8 & 9) */}
      {activeTab === 'duplicates' && (
        <div className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-color/30 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                <Trash2 className="w-4.5 h-4.5 text-pink-400" />
                <span>重复下载作品及 RJ 编码重叠分析</span>
              </h3>
              <p className="text-[10px] text-text-muted font-medium">深度提取并核对库中同一个 RJ作品在不同盘符或存储库（如 C盘、D盘、E/F盘）中重复下载、或者具有高度雷同属性的音频体积，保障存储空间的最大化利用。</p>
            </div>
            
            <button
              onClick={() => {
                showToast('已对全库 3 个仓库路径执行二次防重去重扫描！');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-brand-color hover:bg-brand-color-hover text-white text-[11px] font-bold transition-all cursor-pointer"
            >
              一键精细化防重复分析
            </button>
          </div>

          <div className="space-y-3.5">
            {duplicateAnalysis.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-border-color rounded-xl bg-card-bg/10 flex flex-col items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400/80 mb-2" />
                <h4 className="font-semibold text-text-primary">未检测到任何重复作品</h4>
                <p className="text-[10px] text-text-muted mt-1">完美！您的多仓库物理硬盘中所有的 RJ 音声及流行音乐只包含一份实例，没有任何多余的冗余物理拷贝。</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-rose-500/10 text-rose-300 rounded-xl border border-rose-500/20 text-[10px] leading-relaxed">
                  📢 <strong>空间预警：</strong> 检测到部分 ASMR 媒体在外部多重硬盘路径下存在备份重叠，累积占用了约 <strong>{duplicateAnalysis.reduce((acc, d) => acc + parseFloat(d.totalSize), 0).toFixed(2)} GB</strong> 宝贵空间。
                </div>

                {duplicateAnalysis.map(group => (
                  <div key={group.id} className="p-4 bg-zinc-950/40 border border-border-color/60 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded">
                          {group.id}
                        </span>
                        <span className="text-[11px] text-text-muted">（存在重合的 2 份磁盘文件，共计约 {group.totalSize}）</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => {
                            if (setRjWorks) {
                              // Filter out duplicates keeping only one
                              setRjWorks(prev => {
                                const seen = new Set();
                                return prev.filter(w => {
                                  if (w.id === group.id) {
                                    if (seen.has(w.id)) return false; // delete duplicate mock/others
                                    seen.add(w.id);
                                    return true;
                                  }
                                  return true;
                                });
                              });
                            }
                            showToast('已一键物理剪切，只在主媒体库 (D:/YangKura) 中保留一份高质量无损 FLAC 版本，腾出多余空间。');
                          }}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-sm hover:shadow"
                        >
                          仅保留主库目录
                        </button>
                        <button 
                          onClick={() => {
                            showToast('已合并索引，将不同目录的轨道配置并入该 RJ 专辑统一虚拟播放列表！');
                          }}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-text-primary rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
                        >
                          合并物理音轨
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {group.works.map((work, idx) => (
                        <div key={idx} className="flex items-start justify-between bg-black/25 p-2.5 rounded-lg border border-white/5 text-[10px] gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center space-x-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-indigo-400' : 'bg-amber-400'}`} />
                              <span className="font-bold text-text-primary truncate">{work.title}</span>
                            </div>
                            <p className="text-[9px] text-text-muted mt-1 font-mono truncate block">
                              物理地址: {idx === 0 ? `D:/YangKura/Asmr_Library/${work.id}` : `E:/ASMR_Backup/${work.id}`}
                            </p>
                            <p className="text-[9px] text-text-muted truncate mt-0.5 block">
                              导入日期: {work.addedAt ? work.addedAt : '2026-06-25'} | 分轨数: {work.fileCount} 个文件
                            </p>
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border flex-shrink-0 ${idx === 0 ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' : 'bg-amber-500/10 text-amber-300 border-amber-500/20'}`}>
                            {idx === 0 ? '主存储库 (推荐)' : '次级挂载备份'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating alert toast */}
      {feedback && (
        <div className="fixed bottom-24 right-6 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center space-x-2 animate-bounce-subtle">
          <Check className="w-4 h-4 text-white" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Hardware / Engine Diagnostics (Persistent bottom) */}
      <div className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4 shadow-sm">
        <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Demo 环境说明 / 尚未接硬件解码</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center justify-between text-xs p-3.5 rounded-xl bg-card-bg/20 border border-border-color/40">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="font-semibold text-text-primary">独占 WASAPI 驱动</span>
            </div>
            <span className="text-text-secondary font-mono text-[10px]">共享模式就绪</span>
          </div>

          <div className="flex items-center justify-between text-xs p-3.5 rounded-xl bg-card-bg/20 border border-border-color/40">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="font-semibold text-text-primary">ASMR.one 代理代理</span>
            </div>
            <span className="text-text-secondary font-mono text-[10px]">香港加速节点连接正常</span>
          </div>

          <div className="flex items-center justify-between text-xs p-3.5 rounded-xl bg-card-bg/20 border border-border-color/40">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="font-semibold text-text-primary">LRC 自动挂载对齐</span>
            </div>
            <span className="text-text-secondary font-mono text-[10px]">已装载 3 组字幕轨</span>
          </div>
        </div>
      </div>

    </div>
  );
}
