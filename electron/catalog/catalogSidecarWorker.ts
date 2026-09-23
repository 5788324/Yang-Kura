import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import { parentPort, workerData } from 'node:worker_threads';
import { KuraCatalogDatabase } from './catalogDatabase.js';
import { parseLibraryIndexJsonBuffer } from '../libraryIndexJsonReader.js';
import type { LegacyLocalJsonIndex } from './catalogTypes.js';

interface CatalogSidecarWorkerData {
  databasePath: string;
  indexPath: string;
  expectedSha256: string;
}

interface CatalogSidecarWorkerResult {
  ok: boolean;
  code: string;
  summary?: unknown;
  message?: string;
}

function post(result: CatalogSidecarWorkerResult): void {
  parentPort?.postMessage(result);
}

async function run(): Promise<void> {
  const payload = workerData as CatalogSidecarWorkerData;
  const source = await fs.readFile(payload.indexPath);
  const actualSha256 = crypto.createHash('sha256').update(source).digest('hex');
  if (actualSha256 !== payload.expectedSha256) {
    post({
      ok: false,
      code: 'SOURCE_INDEX_CHANGED',
      message: 'library-index.json changed after the foreground read; sidecar sync skipped.',
    });
    return;
  }

  const parsed = parseLibraryIndexJsonBuffer(source);
  if (parsed.text.includes('file://')) {
    post({
      ok: false,
      code: 'UNSAFE_SOURCE_INDEX',
      message: 'library-index.json contains file:// and was not imported into the catalog sidecar.',
    });
    return;
  }

  const catalog = new KuraCatalogDatabase(payload.databasePath);
  try {
    const summary = catalog.upsertFromLegacyIndex(parsed.value as LegacyLocalJsonIndex);
    post({ ok: true, code: 'SYNCED', summary });
  } finally {
    catalog.close();
  }
}

run().catch((error) => {
  post({
    ok: false,
    code: 'SIDECAR_SYNC_FAILED',
    message: error instanceof Error ? error.message : String(error),
  });
});
