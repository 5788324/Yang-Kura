import fs from 'node:fs/promises';
import path from 'node:path';

export type RootAuthorizationLibraryType = 'asmr' | 'music' | 'mixed';

export interface RootAuthorizationRecord {
  rootPathToken: string;
  absolutePath: string;
  displayName: string;
  libraryType: RootAuthorizationLibraryType;
  selectedAt: string;
}

interface RootAuthorizationFileV1 {
  schemaVersion: 1;
  updatedAt: string;
  records: RootAuthorizationRecord[];
}

interface AuthorizeRootInput {
  absolutePath: string;
  displayName: string;
  libraryType: RootAuthorizationLibraryType;
  createToken: () => string;
}

const TOKEN_PREFIX = 'rootPathToken:';
const TOKEN_PATTERN = /^yk-root-[A-Za-z0-9-]{8,}$/;

function isLibraryType(value: unknown): value is RootAuthorizationLibraryType {
  return value === 'asmr' || value === 'music' || value === 'mixed';
}

function normalizeAbsolutePath(value: string): string {
  if (!path.isAbsolute(value)) throw new Error('Root authorization paths must be absolute.');
  return path.resolve(value);
}

function pathKey(value: string): string {
  const resolved = path.resolve(value);
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}

function isValidToken(value: unknown): value is string {
  return typeof value === 'string' && TOKEN_PATTERN.test(value);
}

function parseRecord(value: unknown): RootAuthorizationRecord | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const candidate = value as Partial<RootAuthorizationRecord>;
  if (!isValidToken(candidate.rootPathToken)) return null;
  if (typeof candidate.absolutePath !== 'string' || !path.isAbsolute(candidate.absolutePath)) return null;
  if (typeof candidate.displayName !== 'string' || !candidate.displayName.trim()) return null;
  if (!isLibraryType(candidate.libraryType)) return null;
  return {
    rootPathToken: candidate.rootPathToken,
    absolutePath: path.resolve(candidate.absolutePath),
    displayName: candidate.displayName.trim(),
    libraryType: candidate.libraryType,
    selectedAt: typeof candidate.selectedAt === 'string' ? candidate.selectedAt : new Date(0).toISOString(),
  };
}

export class RootAuthorizationStore {
  private readonly records = new Map<string, RootAuthorizationRecord>();

  constructor(private readonly authorizationFilePath: string) {}

  async initialize(): Promise<RootAuthorizationRecord[]> {
    this.records.clear();
    try {
      const raw = await fs.readFile(this.authorizationFilePath, 'utf8');
      const parsed = JSON.parse(raw) as Partial<RootAuthorizationFileV1>;
      if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.records)) return [];
      const occupiedPaths = new Set<string>();
      for (const rawRecord of parsed.records) {
        const record = parseRecord(rawRecord);
        if (!record) continue;
        const key = record.libraryType + ':' + pathKey(record.absolutePath);
        if (occupiedPaths.has(key) || this.records.has(record.rootPathToken)) continue;
        occupiedPaths.add(key);
        this.records.set(record.rootPathToken, record);
      }
    } catch {
      this.records.clear();
    }
    return this.list();
  }

  list(): RootAuthorizationRecord[] {
    return Array.from(this.records.values()).map((record) => ({ ...record }));
  }

  async authorize(input: AuthorizeRootInput): Promise<RootAuthorizationRecord> {
    const absolutePath = normalizeAbsolutePath(input.absolutePath);
    const normalizedKey = pathKey(absolutePath);
    const existingByPath = Array.from(this.records.values()).find(
      (record) => record.libraryType === input.libraryType && pathKey(record.absolutePath) === normalizedKey,
    );
    const indexedToken = existingByPath ? null : await this.readTokenFromLibraryIndex(absolutePath, input.libraryType);
    let rootPathToken = existingByPath?.rootPathToken ?? indexedToken ?? input.createToken();
    if (!isValidToken(rootPathToken)) rootPathToken = input.createToken();

    const conflictingRecord = this.records.get(rootPathToken);
    if (conflictingRecord && pathKey(conflictingRecord.absolutePath) !== normalizedKey) {
      rootPathToken = input.createToken();
    }

    for (const [token, record] of this.records) {
      if (record.libraryType === input.libraryType && pathKey(record.absolutePath) === normalizedKey && token !== rootPathToken) {
        this.records.delete(token);
      }
    }

    const record: RootAuthorizationRecord = {
      rootPathToken,
      absolutePath,
      displayName: input.displayName.trim() || path.basename(absolutePath),
      libraryType: input.libraryType,
      selectedAt: new Date().toISOString(),
    };
    this.records.set(rootPathToken, record);
    await this.persist();
    return { ...record };
  }

  private async readTokenFromLibraryIndex(
    absolutePath: string,
    libraryType: RootAuthorizationLibraryType,
  ): Promise<string | null> {
    try {
      const raw = await fs.readFile(path.join(absolutePath, 'library-index.json'), 'utf8');
      const parsed = JSON.parse(raw.replace(/^﻿/, '')) as { roots?: unknown[] };
      if (!Array.isArray(parsed.roots)) return null;
      const roots = parsed.roots.filter((value): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value));
      const matchingRoot = roots.find((root) => root.libraryType === libraryType) ?? roots[0];
      const rootPathValue = matchingRoot?.rootPath;
      if (typeof rootPathValue !== 'string' || !rootPathValue.startsWith(TOKEN_PREFIX)) return null;
      const token = rootPathValue.slice(TOKEN_PREFIX.length).trim();
      return isValidToken(token) ? token : null;
    } catch {
      return null;
    }
  }

  private async persist(): Promise<void> {
    const payload: RootAuthorizationFileV1 = {
      schemaVersion: 1,
      updatedAt: new Date().toISOString(),
      records: this.list().sort((left, right) => left.selectedAt.localeCompare(right.selectedAt)),
    };
    await fs.mkdir(path.dirname(this.authorizationFilePath), { recursive: true });
    const temporaryPath = this.authorizationFilePath + '.tmp-' + process.pid + '-' + Date.now();
    try {
      await fs.writeFile(temporaryPath, JSON.stringify(payload, null, 2), { encoding: 'utf8', mode: 0o600 });
      await fs.rm(this.authorizationFilePath, { force: true });
      await fs.rename(temporaryPath, this.authorizationFilePath);
    } catch (error) {
      await fs.rm(temporaryPath, { force: true }).catch(() => undefined);
      throw error;
    }
  }
}
