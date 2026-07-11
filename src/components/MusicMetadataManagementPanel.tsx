import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Download, RotateCcw, Save, Upload, X } from 'lucide-react';
import type { AudioTrack, MusicAlbum } from '../types';
import { metadataOverrideService, type MetadataOverrideImportPreview, type MetadataOverrideSummary } from '../services/metadataOverrideService';

interface MusicMetadataManagementPanelProps {
  albums: MusicAlbum[];
  onUpdateAlbum: (album: MusicAlbum) => void;
  onUpdateTrack: (track: AudioTrack) => void;
  onClearAlbumOverride: (albumId: string) => void;
  onClearTrackOverride: (trackId: string) => void;
  onMetadataStoreChanged: () => void;
}

export default function MusicMetadataManagementPanel({
  albums,
  onUpdateAlbum,
  onUpdateTrack,
  onClearAlbumOverride,
  onClearTrackOverride,
  onMetadataStoreChanged,
}: MusicMetadataManagementPanelProps) {
  const [selectedAlbumId, setSelectedAlbumId] = useState(albums[0]?.id ?? '');
  const selectedAlbum = useMemo(
    () => albums.find((album) => album.id === selectedAlbumId) ?? albums[0],
    [albums, selectedAlbumId],
  );
  const [selectedTrackId, setSelectedTrackId] = useState(selectedAlbum?.tracks[0]?.id ?? '');
  const selectedTrack = useMemo(
    () => selectedAlbum?.tracks.find((track) => track.id === selectedTrackId) ?? selectedAlbum?.tracks[0],
    [selectedAlbum, selectedTrackId],
  );
  const [albumDraft, setAlbumDraft] = useState<MusicAlbum | null>(selectedAlbum ?? null);
  const [trackDraft, setTrackDraft] = useState<AudioTrack | null>(selectedTrack ?? null);
  const [message, setMessage] = useState('本地修改只影响 Yang-Kura 显示，不会改写音频文件标签。');
  const [summary, setSummary] = useState<MetadataOverrideSummary>(() => metadataOverrideService.getSummary());
  const [pendingImport, setPendingImport] = useState<{ fileName: string; raw: string; preview: MetadataOverrideImportPreview } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!albums.some((album) => album.id === selectedAlbumId)) {
      setSelectedAlbumId(albums[0]?.id ?? '');
    }
  }, [albums, selectedAlbumId]);

  useEffect(() => {
    setAlbumDraft(selectedAlbum ? { ...selectedAlbum } : null);
    const nextTrack = selectedAlbum?.tracks.find((track) => track.id === selectedTrackId) ?? selectedAlbum?.tracks[0];
    setSelectedTrackId(nextTrack?.id ?? '');
    setTrackDraft(nextTrack ? { ...nextTrack } : null);
  }, [selectedAlbum]);

  useEffect(() => {
    setTrackDraft(selectedTrack ? { ...selectedTrack } : null);
  }, [selectedTrack]);

  useEffect(() => {
    setSummary(metadataOverrideService.getSummary());
  }, [albums]);

  const inputClassName = 'w-full rounded-lg border border-border-color bg-card-bg/70 px-3 py-2 text-xs text-text-primary outline-none focus:border-brand-color';

  const exportBackup = () => {
    const blob = new Blob([metadataOverrideService.exportSnapshot()], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `yang-kura-metadata-overrides-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage('本地元数据修改已导出为 JSON 备份。');
  };

  const previewBackup = async (file: File) => {
    const raw = await file.text();
    const preview = metadataOverrideService.previewImportSnapshot(raw, 'replace');
    setPendingImport({ fileName: file.name, raw, preview });
    setMessage(preview.message);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const confirmImport = (mode: 'replace' | 'merge') => {
    if (!pendingImport) return;
    const result = metadataOverrideService.importSnapshot(pendingImport.raw, mode);
    setMessage(result.message);
    if (result.ok) {
      setSummary(result.summary);
      onMetadataStoreChanged();
      setPendingImport(null);
    }
  };

  const refreshSummary = () => setSummary(metadataOverrideService.getSummary());

  if (albums.length === 0) return null;

  return (
    <details id="mvp115-music-metadata-management" className="rounded-2xl border border-border-color/60 bg-card-bg/25 p-4">
      <summary className="cursor-pointer list-none text-sm font-bold text-text-primary flex items-center justify-between gap-3">
        <span>整理音乐信息</span>
        <span className="text-[10px] text-text-muted font-normal">{summary.totalRecords} 项修改 · {summary.totalFields} 个字段</span>
      </summary>

      <div className="mt-4 space-y-4">
        <p className="text-[11px] text-text-muted leading-relaxed">{message}</p>
        <div id="mvp116-metadata-override-summary" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            ['音声作品', summary.asmrWorks],
            ['音乐专辑', summary.musicAlbums],
            ['曲目', summary.tracks],
            ['修改字段', summary.totalFields],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-border-color/50 bg-card-bg/40 px-3 py-2">
              <p className="text-[10px] text-text-muted">{label}</p>
              <p className="text-sm font-bold text-text-primary mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={exportBackup} className="px-3 py-2 rounded-lg border border-border-color bg-card-bg text-xs font-bold text-text-secondary hover:text-text-primary flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> 导出修改
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="px-3 py-2 rounded-lg border border-border-color bg-card-bg text-xs font-bold text-text-secondary hover:text-text-primary flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" /> 导入恢复
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void previewBackup(file);
            }}
          />
        </div>

        {pendingImport && (
          <section id="mvp116-metadata-backup-preview" className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-text-primary">恢复前预览：{pendingImport.fileName}</p>
                <p className="text-[11px] text-text-muted mt-1">备份内含 {pendingImport.preview.incomingSummary.totalRecords} 项记录、{pendingImport.preview.incomingSummary.totalFields} 个修改字段。</p>
              </div>
              <button aria-label="关闭备份预览" onClick={() => setPendingImport(null)} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5"><X className="w-4 h-4" /></button>
            </div>
            {pendingImport.preview.ok ? (
              <div className="flex flex-wrap gap-2">
                <button onClick={() => confirmImport('merge')} className="px-3 py-2 rounded-lg border border-border-color bg-card-bg text-xs font-bold text-text-secondary hover:text-text-primary">合并恢复</button>
                <button onClick={() => confirmImport('replace')} className="px-3 py-2 rounded-lg bg-amber-500 text-black text-xs font-bold">替换当前修改</button>
                <span className="self-center text-[10px] text-text-muted">当前 {pendingImport.preview.currentSummary.totalRecords} 项；合并后约 {metadataOverrideService.previewImportSnapshot(pendingImport.raw, 'merge').resultingSummary.totalRecords} 项。</span>
              </div>
            ) : (
              <p className="text-xs text-rose-400">{pendingImport.preview.message}</p>
            )}
          </section>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <section className="rounded-xl border border-border-color/50 bg-card-bg/30 p-4 space-y-3">
            <h3 className="text-xs font-bold text-text-primary">专辑信息</h3>
            <select value={selectedAlbum?.id ?? ''} onChange={(event) => setSelectedAlbumId(event.target.value)} className={inputClassName}>
              {albums.map((album) => <option key={album.id} value={album.id}>{album.title}</option>)}
            </select>
            {albumDraft && (
              <>
                <input aria-label="专辑标题" value={albumDraft.title} onChange={(event) => setAlbumDraft({ ...albumDraft, title: event.target.value })} className={inputClassName} placeholder="专辑标题" />
                <input aria-label="专辑艺术家" value={albumDraft.artist} onChange={(event) => setAlbumDraft({ ...albumDraft, artist: event.target.value })} className={inputClassName} placeholder="艺术家" />
                <div className="grid grid-cols-2 gap-2">
                  <input aria-label="发行年份" value={albumDraft.releaseYear} onChange={(event) => setAlbumDraft({ ...albumDraft, releaseYear: event.target.value })} className={inputClassName} placeholder="发行年份" />
                  <input aria-label="音乐类型" value={albumDraft.genre} onChange={(event) => setAlbumDraft({ ...albumDraft, genre: event.target.value })} className={inputClassName} placeholder="类型" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => { onUpdateAlbum(albumDraft); window.setTimeout(refreshSummary, 0); setMessage('专辑信息已保存为本地修改。'); }} className="px-3 py-2 rounded-lg bg-brand-color text-white text-xs font-bold flex items-center gap-1.5">
                    <Save className="w-3.5 h-3.5" /> 保存专辑
                  </button>
                  <button
                    disabled={!metadataOverrideService.hasMusicAlbumOverride(albumDraft.id)}
                    onClick={() => { onClearAlbumOverride(albumDraft.id); window.setTimeout(refreshSummary, 0); setMessage('专辑本地修改已清除。'); }}
                    className="px-3 py-2 rounded-lg border border-border-color text-xs font-bold text-text-secondary disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> 还原专辑
                  </button>
                </div>
              </>
            )}
          </section>

          <section className="rounded-xl border border-border-color/50 bg-card-bg/30 p-4 space-y-3">
            <h3 className="text-xs font-bold text-text-primary">曲目信息</h3>
            <select value={selectedTrack?.id ?? ''} onChange={(event) => setSelectedTrackId(event.target.value)} className={inputClassName}>
              {(selectedAlbum?.tracks ?? []).map((track) => <option key={track.id} value={track.id}>{track.title}</option>)}
            </select>
            {trackDraft ? (
              <>
                <input aria-label="曲目标题" value={trackDraft.title} onChange={(event) => setTrackDraft({ ...trackDraft, title: event.target.value })} className={inputClassName} placeholder="曲目标题" />
                <input aria-label="曲目艺术家" value={trackDraft.artist} onChange={(event) => setTrackDraft({ ...trackDraft, artist: event.target.value })} className={inputClassName} placeholder="艺术家" />
                <input aria-label="曲目专辑" value={trackDraft.album} onChange={(event) => setTrackDraft({ ...trackDraft, album: event.target.value })} className={inputClassName} placeholder="专辑" />
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => { onUpdateTrack(trackDraft); window.setTimeout(refreshSummary, 0); setMessage('曲目信息已保存为本地修改。'); }} className="px-3 py-2 rounded-lg bg-brand-color text-white text-xs font-bold flex items-center gap-1.5">
                    <Save className="w-3.5 h-3.5" /> 保存曲目
                  </button>
                  <button
                    disabled={!metadataOverrideService.hasTrackOverride(trackDraft.id)}
                    onClick={() => { onClearTrackOverride(trackDraft.id); window.setTimeout(refreshSummary, 0); setMessage('曲目本地修改已清除。'); }}
                    className="px-3 py-2 rounded-lg border border-border-color text-xs font-bold text-text-secondary disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> 还原曲目
                  </button>
                </div>
              </>
            ) : (
              <p className="text-xs text-text-muted">当前专辑没有可编辑曲目。</p>
            )}
          </section>
        </div>
      </div>
    </details>
  );
}
