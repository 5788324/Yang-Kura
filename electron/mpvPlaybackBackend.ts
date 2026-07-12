import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import fs from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

export type MpvPlaybackCommand =
  | { command: 'pause' }
  | { command: 'resume' }
  | { command: 'seek'; seconds: number }
  | { command: 'stop' }
  | { command: 'set-volume'; volume: number }
  | { command: 'set-muted'; muted: boolean };

export interface MpvStartRequest {
  trackId: string;
  absolutePath: string;
  startSeconds: number;
  volume: number;
  muted: boolean;
}

export type MpvPlaybackEvent =
  | { type: 'ready'; trackId: string; backend: 'mpv'; at: string }
  | { type: 'time'; trackId: string; positionSeconds: number; at: string }
  | { type: 'duration'; trackId: string; durationSeconds: number; at: string }
  | { type: 'pause-state'; trackId: string; paused: boolean; at: string }
  | { type: 'ended'; trackId: string; reason: string; at: string }
  | { type: 'error'; trackId: string; message: string; at: string }
  | { type: 'fallback-requested'; trackId: string; resumeSeconds: number; reason: string; message: string; at: string };

export interface MpvStartResult {
  ok: boolean;
  status: 'mvp122-mpv-started' | 'mvp122-mpv-unavailable' | 'mvp122-mpv-start-failed';
  backend: 'mpv' | 'html-audio-fallback';
  trackId: string;
  message: string;
  executableLabel: string;
  absolutePathReturned: false;
  fileUrlReturned: false;
}

export interface MpvCommandResult {
  ok: boolean;
  status: 'mvp122-mpv-command-accepted' | 'mvp122-mpv-not-running' | 'mvp122-mpv-command-failed';
  command: MpvPlaybackCommand['command'];
  message: string;
  absolutePathReturned: false;
  fileUrlReturned: false;
}

export interface MpvRuntimeStatus {
  status: 'mvp122-mpv-runtime-status';
  configuredExecutable: string;
  running: boolean;
  connected: boolean;
  activeTrackId: string | null;
  fallbackAvailable: true;
  seekStrategy: 'coalesced-absolute-exact';
  pendingSeek: boolean;
  lastKnownPositionSeconds: number;
  lastKnownDurationSeconds: number;
  lastErrorMessage: string | null;
  lastExitReason: string | null;
  shutdownState: 'idle' | 'graceful' | 'forced';
  processStartedAt: string | null;
  absolutePathReturned: false;
  fileUrlReturned: false;
}

type JsonRecord = Record<string, unknown>;

const SEEK_COALESCE_MS = 50;
const MAX_SEEK_SECONDS = 30 * 24 * 60 * 60;
const GRACEFUL_EXIT_TIMEOUT_MS = 700;
const FORCE_EXIT_TIMEOUT_MS = 500;

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeVolume(value: number): number {
  if (!Number.isFinite(value)) return 75;
  return Math.max(0, Math.min(100, value * 100));
}

function defaultExecutableCandidate(): string {
  const configured = process.env.YANG_KURA_MPV_PATH?.trim();
  if (configured) return configured;
  return process.platform === 'win32' ? 'mpv.exe' : 'mpv';
}

function buildIpcEndpoint(): string {
  const suffix = `${process.pid}-${crypto.randomUUID()}`;
  if (process.platform === 'win32') return `\\\\.\\pipe\\yang-kura-mpv-${suffix}`;
  return path.join(os.tmpdir(), `yang-kura-mpv-${suffix}.sock`);
}

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function waitForChildExit(child: ChildProcessWithoutNullStreams, timeoutMs: number): Promise<boolean> {
  if (child.exitCode !== null || child.signalCode !== null) return Promise.resolve(true);
  return new Promise<boolean>((resolve) => {
    const timer = setTimeout(() => {
      cleanup();
      resolve(false);
    }, timeoutMs);
    const onExit = () => {
      cleanup();
      resolve(true);
    };
    const cleanup = () => {
      clearTimeout(timer);
      child.removeListener('exit', onExit);
    };
    child.once('exit', onExit);
  });
}

export class MpvPlaybackBackend {
  private child: ChildProcessWithoutNullStreams | null = null;
  private socket: net.Socket | null = null;
  private ipcEndpoint: string | null = null;
  private readBuffer = '';
  private activeTrackId: string | null = null;
  private pendingStartSeconds = 0;
  private connectPromise: Promise<void> | null = null;
  private requestId = 1;
  private pendingSeekSeconds: number | null = null;
  private seekFlushTimer: NodeJS.Timeout | null = null;
  private lastKnownPositionSeconds = 0;
  private lastKnownDurationSeconds = 0;
  private lastErrorMessage: string | null = null;
  private lastExitReason: string | null = null;
  private shutdownState: 'idle' | 'graceful' | 'forced' = 'idle';
  private processStartedAt: string | null = null;
  private expectedShutdown = false;
  private fallbackEmittedForTrack: string | null = null;

  constructor(
    private readonly emit: (event: MpvPlaybackEvent) => void,
    private readonly resolveExecutable: () => string = defaultExecutableCandidate,
  ) {}

  getRuntimeStatus(): MpvRuntimeStatus {
    return {
      status: 'mvp122-mpv-runtime-status',
      configuredExecutable: path.basename(this.resolveExecutable()),
      running: Boolean(this.child && this.child.exitCode === null && !this.child.killed),
      connected: Boolean(this.socket && !this.socket.destroyed),
      activeTrackId: this.activeTrackId,
      fallbackAvailable: true,
      seekStrategy: 'coalesced-absolute-exact',
      pendingSeek: this.pendingSeekSeconds !== null,
      lastKnownPositionSeconds: this.lastKnownPositionSeconds,
      lastKnownDurationSeconds: this.lastKnownDurationSeconds,
      lastErrorMessage: this.lastErrorMessage,
      lastExitReason: this.lastExitReason,
      shutdownState: this.shutdownState,
      processStartedAt: this.processStartedAt,
      absolutePathReturned: false,
      fileUrlReturned: false,
    };
  }

  async start(request: MpvStartRequest): Promise<MpvStartResult> {
    const executable = this.resolveExecutable();

    try {
      await this.ensureConnected(executable);
      this.activeTrackId = request.trackId;
      this.fallbackEmittedForTrack = null;
      this.lastErrorMessage = null;
      this.lastExitReason = null;
      this.lastKnownPositionSeconds = Math.max(0, Number.isFinite(request.startSeconds) ? request.startSeconds : 0);
      this.lastKnownDurationSeconds = 0;
      this.pendingStartSeconds = this.normalizeSeekSeconds(request.startSeconds);
      await this.sendCommand(['set_property', 'volume', normalizeVolume(request.volume)]);
      await this.sendCommand(['set_property', 'mute', Boolean(request.muted)]);
      await this.sendCommand(['loadfile', request.absolutePath, 'replace']);
      return {
        ok: true,
        status: 'mvp122-mpv-started',
        backend: 'mpv',
        trackId: request.trackId,
        message: 'mpv 已接管当前本地音频；HTMLAudio 保留为启动或运行失败时的 fallback。',
        executableLabel: path.basename(executable),
        absolutePathReturned: false,
        fileUrlReturned: false,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.lastErrorMessage = message;
      await this.shutdownProcess();
      return {
        ok: false,
        status: message.includes('ENOENT') || message.includes('not found')
          ? 'mvp122-mpv-unavailable'
          : 'mvp122-mpv-start-failed',
        backend: 'html-audio-fallback',
        trackId: request.trackId,
        message: `mpv 未能启动，将回退 HTMLAudio：${message}`,
        executableLabel: path.basename(executable),
        absolutePathReturned: false,
        fileUrlReturned: false,
      };
    }
  }

  async command(input: MpvPlaybackCommand): Promise<MpvCommandResult> {
    if (!this.socket || this.socket.destroyed) {
      return {
        ok: false,
        status: 'mvp122-mpv-not-running',
        command: input.command,
        message: 'mpv 当前未连接；播放器会继续使用 HTMLAudio fallback。',
        absolutePathReturned: false,
        fileUrlReturned: false,
      };
    }

    try {
      switch (input.command) {
        case 'pause':
          await this.sendCommand(['set_property', 'pause', true]);
          break;
        case 'resume':
          await this.sendCommand(['set_property', 'pause', false]);
          break;
        case 'seek':
          this.scheduleSeek(input.seconds);
          break;
        case 'stop':
          this.clearPendingSeek();
          await this.sendCommand(['stop']);
          this.activeTrackId = null;
          this.lastKnownPositionSeconds = 0;
          this.lastKnownDurationSeconds = 0;
          break;
        case 'set-volume':
          await this.sendCommand(['set_property', 'volume', normalizeVolume(input.volume)]);
          break;
        case 'set-muted':
          await this.sendCommand(['set_property', 'mute', input.muted]);
          break;
      }
      return {
        ok: true,
        status: 'mvp122-mpv-command-accepted',
        command: input.command,
        message: input.command === 'seek' ? 'mpv 跳转请求已合并排队。' : 'mpv 命令已发送。',
        absolutePathReturned: false,
        fileUrlReturned: false,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.lastErrorMessage = message;
      return {
        ok: false,
        status: 'mvp122-mpv-command-failed',
        command: input.command,
        message,
        absolutePathReturned: false,
        fileUrlReturned: false,
      };
    }
  }

  async dispose(): Promise<void> {
    await this.shutdownProcess();
  }

  private normalizeSeekSeconds(value: number): number {
    if (!Number.isFinite(value)) return 0;
    const hardClamped = Math.max(0, Math.min(MAX_SEEK_SECONDS, value));
    if (this.lastKnownDurationSeconds > 0) return Math.min(hardClamped, this.lastKnownDurationSeconds);
    return hardClamped;
  }

  private scheduleSeek(seconds: number): void {
    this.pendingSeekSeconds = this.normalizeSeekSeconds(seconds);
    if (this.seekFlushTimer) clearTimeout(this.seekFlushTimer);
    this.seekFlushTimer = setTimeout(() => {
      this.seekFlushTimer = null;
      void this.flushPendingSeek().catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        this.lastErrorMessage = message;
        this.requestFallback('seek-failed', `mpv 跳转失败，已请求回退 HTMLAudio：${message}`);
      });
    }, SEEK_COALESCE_MS);
  }

  private async flushPendingSeek(): Promise<void> {
    const seconds = this.pendingSeekSeconds;
    this.pendingSeekSeconds = null;
    if (seconds === null) return;
    await this.sendCommand(['seek', seconds, 'absolute+exact']);
    this.lastKnownPositionSeconds = seconds;
  }

  private clearPendingSeek(): void {
    if (this.seekFlushTimer) clearTimeout(this.seekFlushTimer);
    this.seekFlushTimer = null;
    this.pendingSeekSeconds = null;
  }

  private async ensureConnected(executable: string): Promise<void> {
    if (this.socket && !this.socket.destroyed) return;
    if (this.connectPromise) return this.connectPromise;

    this.connectPromise = this.launchAndConnect(executable).finally(() => {
      this.connectPromise = null;
    });
    return this.connectPromise;
  }

  private async launchAndConnect(executable: string): Promise<void> {
    await this.shutdownProcess();
    const endpoint = buildIpcEndpoint();
    this.ipcEndpoint = endpoint;
    if (process.platform !== 'win32') {
      await fs.rm(endpoint, { force: true }).catch(() => undefined);
    }

    const args = [
      '--idle=yes',
      '--no-terminal',
      '--no-config',
      '--force-window=no',
      '--audio-display=no',
      '--keep-open=no',
      '--really-quiet',
      `--input-ipc-server=${endpoint}`,
    ];

    this.expectedShutdown = false;
    this.shutdownState = 'idle';
    const child = spawn(executable, args, { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true, shell: false });
    this.child = child;
    this.processStartedAt = nowIso();
    child.stdout.resume();
    child.stderr.resume();

    let connected = false;
    const earlyFailure = new Promise<never>((_resolve, reject) => {
      child.once('error', reject);
      child.once('exit', (code, signal) => {
        const reason = `code=${String(code)}, signal=${String(signal)}`;
        this.lastExitReason = reason;
        this.child = null;
        this.processStartedAt = null;
        if (!connected) {
          reject(new Error(`mpv 在 IPC 连接前退出（${reason}）。`));
        } else if (!this.expectedShutdown) {
          this.requestFallback('process-exit', `mpv 进程意外退出（${reason}），已请求切换 HTMLAudio。`);
        }
      });
    });

    await Promise.race([this.connectWithRetry(endpoint, 4_000), earlyFailure]);
    connected = true;
    await this.sendCommand(['observe_property', 1, 'time-pos']);
    await this.sendCommand(['observe_property', 2, 'duration']);
    await this.sendCommand(['observe_property', 3, 'pause']);
    await this.sendCommand(['observe_property', 4, 'mute']);
    await this.sendCommand(['observe_property', 5, 'volume']);
  }

  private async connectWithRetry(endpoint: string, timeoutMs: number): Promise<void> {
    const startedAt = Date.now();
    let lastError: unknown;
    while (Date.now() - startedAt < timeoutMs) {
      try {
        const socket = await new Promise<net.Socket>((resolve, reject) => {
          const candidate = net.createConnection(endpoint);
          const timer = setTimeout(() => {
            candidate.destroy();
            reject(new Error('mpv IPC 连接超时。'));
          }, 500);
          candidate.once('connect', () => {
            clearTimeout(timer);
            resolve(candidate);
          });
          candidate.once('error', (error) => {
            clearTimeout(timer);
            reject(error);
          });
        });
        this.attachSocket(socket);
        return;
      } catch (error) {
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, 80));
      }
    }
    throw lastError instanceof Error ? lastError : new Error('无法连接 mpv IPC。');
  }

  private attachSocket(socket: net.Socket): void {
    this.socket = socket;
    this.readBuffer = '';
    socket.setEncoding('utf8');
    socket.on('data', (chunk: string) => this.handleSocketData(chunk));
    socket.on('error', (error) => {
      this.lastErrorMessage = `mpv IPC 错误：${error.message}`;
      if (!this.expectedShutdown) this.requestFallback('ipc-error', `${this.lastErrorMessage}，已请求切换 HTMLAudio。`);
    });
    socket.on('close', () => {
      this.socket = null;
      if (!this.expectedShutdown && this.child && this.activeTrackId) {
        this.requestFallback('ipc-closed', 'mpv IPC 连接意外关闭，已请求切换 HTMLAudio。');
      }
    });
  }

  private handleSocketData(chunk: string): void {
    this.readBuffer += chunk;
    const lines = this.readBuffer.split(/\r?\n/);
    this.readBuffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const message: unknown = JSON.parse(line);
        if (isRecord(message)) this.handleMpvMessage(message);
      } catch {
        // Ignore malformed/non-JSON diagnostic lines. --really-quiet keeps this rare.
      }
    }
  }

  private handleMpvMessage(message: JsonRecord): void {
    const trackId = this.activeTrackId;
    if (!trackId) return;
    const event = typeof message.event === 'string' ? message.event : '';

    if (event === 'file-loaded') {
      if (this.pendingStartSeconds > 0) {
        const startSeconds = this.normalizeSeekSeconds(this.pendingStartSeconds);
        void this.sendCommand(['seek', startSeconds, 'absolute+exact']).catch((error) => {
          const text = error instanceof Error ? error.message : String(error);
          this.requestFallback('initial-seek-failed', `mpv 恢复上次位置失败，已请求切换 HTMLAudio：${text}`);
        });
      }
      this.pendingStartSeconds = 0;
      this.emit({ type: 'ready', trackId, backend: 'mpv', at: nowIso() });
      return;
    }

    if (event === 'property-change') {
      const name = typeof message.name === 'string' ? message.name : '';
      if (name === 'time-pos' && typeof message.data === 'number' && Number.isFinite(message.data)) {
        this.lastKnownPositionSeconds = Math.max(0, message.data);
        this.emit({ type: 'time', trackId, positionSeconds: this.lastKnownPositionSeconds, at: nowIso() });
      } else if (name === 'duration' && typeof message.data === 'number' && Number.isFinite(message.data)) {
        this.lastKnownDurationSeconds = Math.max(0, message.data);
        this.emit({ type: 'duration', trackId, durationSeconds: this.lastKnownDurationSeconds, at: nowIso() });
      } else if (name === 'pause' && typeof message.data === 'boolean') {
        this.emit({ type: 'pause-state', trackId, paused: message.data, at: nowIso() });
      }
      return;
    }

    if (event === 'end-file') {
      const reason = typeof message.reason === 'string' ? message.reason : 'unknown';
      if (reason === 'eof') {
        this.emit({ type: 'ended', trackId, reason, at: nowIso() });
      } else if (reason !== 'stop' && reason !== 'redirect') {
        this.requestFallback('end-file-error', `mpv 播放异常结束：${reason}。`);
      }
    }
  }

  private requestFallback(reason: string, message: string): void {
    const trackId = this.activeTrackId;
    if (!trackId || this.fallbackEmittedForTrack === trackId || this.expectedShutdown) return;
    this.fallbackEmittedForTrack = trackId;
    this.lastErrorMessage = message;
    this.emit({
      type: 'fallback-requested',
      trackId,
      resumeSeconds: Math.max(0, this.lastKnownPositionSeconds),
      reason,
      message,
      at: nowIso(),
    });
    void this.shutdownProcess();
  }

  private async sendCommand(command: unknown[]): Promise<void> {
    const socket = this.socket;
    if (!socket || socket.destroyed) throw new Error('mpv IPC 尚未连接。');
    const payload = JSON.stringify({ command, request_id: this.requestId++ }) + '\n';
    await new Promise<void>((resolve, reject) => {
      socket.write(payload, 'utf8', (error) => (error ? reject(error) : resolve()));
    });
  }

  private async shutdownProcess(): Promise<void> {
    this.expectedShutdown = true;
    this.clearPendingSeek();

    const socket = this.socket;
    const child = this.child;
    this.shutdownState = child ? 'graceful' : 'idle';

    if (socket && !socket.destroyed) {
      try {
        const payload = JSON.stringify({ command: ['quit'], request_id: this.requestId++ }) + '\n';
        socket.write(payload, 'utf8');
      } catch {
        // Continue to process termination fallback.
      }
    }

    if (child && child.exitCode === null && child.signalCode === null) {
      const exitedGracefully = await waitForChildExit(child, GRACEFUL_EXIT_TIMEOUT_MS);
      if (!exitedGracefully) {
        this.shutdownState = 'forced';
        child.kill();
        const exitedAfterTerminate = await waitForChildExit(child, FORCE_EXIT_TIMEOUT_MS);
        if (!exitedAfterTerminate && process.platform !== 'win32') child.kill('SIGKILL');
      }
    }

    this.socket = null;
    if (socket && !socket.destroyed) socket.destroy();
    this.child = null;

    const endpoint = this.ipcEndpoint;
    this.ipcEndpoint = null;
    if (endpoint && process.platform !== 'win32') {
      await fs.rm(endpoint, { force: true }).catch(() => undefined);
    }
    this.readBuffer = '';
    this.activeTrackId = null;
    this.pendingStartSeconds = 0;
    this.lastKnownPositionSeconds = 0;
    this.lastKnownDurationSeconds = 0;
    this.processStartedAt = null;
    this.fallbackEmittedForTrack = null;
    this.expectedShutdown = false;
  }
}
