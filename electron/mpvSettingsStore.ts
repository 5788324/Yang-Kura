import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

export type MpvExecutableSource = 'environment' | 'user-selected' | 'system-path' | 'none';

export interface MpvExecutableCandidate {
  executable: string;
  executableLabel: string;
  source: Exclude<MpvExecutableSource, 'none'>;
  configured: boolean;
}

export interface MpvInstallationStatus {
  status: 'mvp123-mpv-installation-status';
  available: boolean;
  source: MpvExecutableSource;
  executableLabel: string;
  versionLabel: string | null;
  configured: boolean;
  canSelectExecutable: true;
  canClearUserSelection: boolean;
  checkedAt: string;
  message: string;
  absolutePathReturned: false;
  fileUrlReturned: false;
}

interface MpvSettingsFileV1 {
  schemaVersion: 1;
  executablePath: string;
  updatedAt: string;
}

interface ProbeResult {
  available: boolean;
  versionLabel: string | null;
}

function nowIso(): string {
  return new Date().toISOString();
}

function defaultExecutable(): string {
  return process.platform === 'win32' ? 'mpv.exe' : 'mpv';
}

function sanitizeVersionLabel(output: string): string | null {
  const firstLine = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);
  if (!firstLine) return null;
  return firstLine.slice(0, 120);
}

async function probeExecutable(executable: string, timeoutMs = 4_000): Promise<ProbeResult> {
  return new Promise<ProbeResult>((resolve) => {
    let stdout = '';
    let stderr = '';
    let settled = false;
    const finish = (result: ProbeResult) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    let child;
    try {
      child = spawn(executable, ['--version'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
        shell: false,
      });
    } catch {
      finish({ available: false, versionLabel: null });
      return;
    }

    const timer = setTimeout(() => {
      child.kill();
      finish({ available: false, versionLabel: null });
    }, Math.max(500, timeoutMs));

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => {
      if (stdout.length < 8_192) stdout += chunk;
    });
    child.stderr.on('data', (chunk: string) => {
      if (stderr.length < 8_192) stderr += chunk;
    });
    child.once('error', () => {
      clearTimeout(timer);
      finish({ available: false, versionLabel: null });
    });
    child.once('exit', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        finish({ available: true, versionLabel: sanitizeVersionLabel(stdout || stderr) });
      } else {
        finish({ available: false, versionLabel: null });
      }
    });
  });
}

export class MpvSettingsStore {
  private selectedExecutablePath: string | null = null;

  constructor(
    private readonly settingsFilePath: string,
    private readonly environment: NodeJS.ProcessEnv = process.env,
  ) {}

  async initialize(): Promise<void> {
    try {
      const raw = await fs.readFile(this.settingsFilePath, 'utf8');
      const parsed = JSON.parse(raw) as Partial<MpvSettingsFileV1>;
      if (parsed.schemaVersion === 1 && typeof parsed.executablePath === 'string' && path.isAbsolute(parsed.executablePath)) {
        this.selectedExecutablePath = parsed.executablePath;
      }
    } catch {
      this.selectedExecutablePath = null;
    }
  }

  getCandidate(): MpvExecutableCandidate {
    const environmentPath = this.environment.YANG_KURA_MPV_PATH?.trim();
    if (environmentPath) {
      return {
        executable: environmentPath,
        executableLabel: path.basename(environmentPath) || 'mpv',
        source: 'environment',
        configured: true,
      };
    }
    if (this.selectedExecutablePath) {
      return {
        executable: this.selectedExecutablePath,
        executableLabel: path.basename(this.selectedExecutablePath) || 'mpv.exe',
        source: 'user-selected',
        configured: true,
      };
    }
    const executable = defaultExecutable();
    return {
      executable,
      executableLabel: executable,
      source: 'system-path',
      configured: false,
    };
  }

  async getInstallationStatus(): Promise<MpvInstallationStatus> {
    const candidate = this.getCandidate();
    const probe = await probeExecutable(candidate.executable);
    const source = probe.available ? candidate.source : candidate.source === 'system-path' ? 'none' : candidate.source;
    return {
      status: 'mvp123-mpv-installation-status',
      available: probe.available,
      source,
      executableLabel: candidate.executableLabel,
      versionLabel: probe.versionLabel,
      configured: candidate.configured,
      canSelectExecutable: true,
      canClearUserSelection: Boolean(this.selectedExecutablePath),
      checkedAt: nowIso(),
      message: probe.available
        ? `已检测到 ${probe.versionLabel ?? candidate.executableLabel}，本地音频会优先使用 mpv。`
        : candidate.source === 'user-selected'
          ? '已保存的 mpv 可执行文件当前不可用，请重新选择；播放器会继续使用 HTMLAudio。'
          : candidate.source === 'environment'
            ? 'YANG_KURA_MPV_PATH 指向的 mpv 当前不可用；播放器会继续使用 HTMLAudio。'
            : '未检测到 mpv，播放器会继续使用 HTMLAudio。可手动选择 mpv.exe。',
      absolutePathReturned: false,
      fileUrlReturned: false,
    };
  }

  async setSelectedExecutable(executablePath: string): Promise<MpvInstallationStatus> {
    if (!path.isAbsolute(executablePath)) throw new Error('mpv 可执行文件必须来自系统文件选择器。');
    const fileName = path.basename(executablePath);
    if (!/^mpv(?:\.exe)?$/i.test(fileName)) throw new Error('请选择名为 mpv.exe（或 mpv）的可执行文件。');
    const stat = await fs.stat(executablePath);
    if (!stat.isFile()) throw new Error('选择的 mpv 路径不是文件。');
    const probe = await probeExecutable(executablePath);
    if (!probe.available) throw new Error('所选文件无法通过 mpv --version 检测。');

    this.selectedExecutablePath = executablePath;
    const payload: MpvSettingsFileV1 = {
      schemaVersion: 1,
      executablePath,
      updatedAt: nowIso(),
    };
    await fs.mkdir(path.dirname(this.settingsFilePath), { recursive: true });
    await fs.writeFile(this.settingsFilePath, JSON.stringify(payload, null, 2), { encoding: 'utf8', mode: 0o600 });
    return this.getInstallationStatus();
  }

  async clearSelectedExecutable(): Promise<MpvInstallationStatus> {
    this.selectedExecutablePath = null;
    await fs.rm(this.settingsFilePath, { force: true });
    return this.getInstallationStatus();
  }
}
