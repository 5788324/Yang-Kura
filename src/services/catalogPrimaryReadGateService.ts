export type CatalogPrimaryReadGateState = 'ready' | 'fallback' | 'unavailable';

export interface CatalogPrimaryReadGateSnapshot {
  state: CatalogPrimaryReadGateState;
  safeForPrimaryRead: boolean;
  checkedAt: string;
  rootPathToken: string;
  schemaVersion: number | null;
  expectedCollections: number;
  actualCollections: number | null;
  expectedTracks: number;
  actualTracks: number | null;
  reason: string;
}

interface CatalogSummaryPayload {
  schemaVersion: number;
  counts: {
    collections: number;
    tracks: number;
    mediaSources: number;
    subtitles: number;
    artwork: number;
    folderNodes: number;
  };
}

const EVENT_NAME = 'yang-kura-catalog-primary-read-gate-updated';
let latest: CatalogPrimaryReadGateSnapshot | null = null;

function publish(snapshot: CatalogPrimaryReadGateSnapshot): CatalogPrimaryReadGateSnapshot {
  latest = snapshot;
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: snapshot }));
  return snapshot;
}

export function assessCatalogPrimaryReadGate(input: {
  rootPathToken: string;
  schemaVersion: number | null;
  expectedCollections: number;
  actualCollections: number | null;
  expectedTracks: number;
  actualTracks: number | null;
  queryAvailable: boolean;
}): CatalogPrimaryReadGateSnapshot {
  const checkedAt = new Date().toISOString();
  if (!input.queryAvailable) {
    return {
      state: 'unavailable',
      safeForPrimaryRead: false,
      checkedAt,
      rootPathToken: input.rootPathToken,
      schemaVersion: input.schemaVersion,
      expectedCollections: input.expectedCollections,
      actualCollections: input.actualCollections,
      expectedTracks: input.expectedTracks,
      actualTracks: input.actualTracks,
      reason: 'Catalog Query bridge unavailable; keep JSON fallback.',
    };
  }
  if ((input.schemaVersion ?? 0) < 3) {
    return {
      state: 'fallback',
      safeForPrimaryRead: false,
      checkedAt,
      rootPathToken: input.rootPathToken,
      schemaVersion: input.schemaVersion,
      expectedCollections: input.expectedCollections,
      actualCollections: input.actualCollections,
      expectedTracks: input.expectedTracks,
      actualTracks: input.actualTracks,
      reason: 'Catalog schema is older than K2-R4 v3; keep JSON fallback.',
    };
  }
  if (
    input.actualCollections !== input.expectedCollections
    || input.actualTracks !== input.expectedTracks
  ) {
    return {
      state: 'fallback',
      safeForPrimaryRead: false,
      checkedAt,
      rootPathToken: input.rootPathToken,
      schemaVersion: input.schemaVersion,
      expectedCollections: input.expectedCollections,
      actualCollections: input.actualCollections,
      expectedTracks: input.expectedTracks,
      actualTracks: input.actualTracks,
      reason: 'Catalog/JSON counts differ; keep JSON fallback until sidecar catches up.',
    };
  }
  return {
    state: 'ready',
    safeForPrimaryRead: true,
    checkedAt,
    rootPathToken: input.rootPathToken,
    schemaVersion: input.schemaVersion,
    expectedCollections: input.expectedCollections,
    actualCollections: input.actualCollections,
    expectedTracks: input.expectedTracks,
    actualTracks: input.actualTracks,
    reason: 'Catalog schema and root counts match JSON compatibility source.',
  };
}

export const catalogPrimaryReadGateService = {
  eventName: EVENT_NAME,

  getLatest(): CatalogPrimaryReadGateSnapshot | null {
    return latest;
  },

  async evaluate(input: {
    rootPathToken: string;
    expectedCollections: number;
    expectedTracks: number;
  }): Promise<CatalogPrimaryReadGateSnapshot> {
    if (!window.yangKura?.requestCatalogQuery) {
      return publish(assessCatalogPrimaryReadGate({
        ...input,
        schemaVersion: null,
        actualCollections: null,
        actualTracks: null,
        queryAvailable: false,
      }));
    }

    try {
      const result = await window.yangKura.requestCatalogQuery({
        mode: 'summary',
        rootPathToken: input.rootPathToken,
      });
      if (!result.ok) {
        return publish(assessCatalogPrimaryReadGate({
          ...input,
          schemaVersion: result.schemaVersion,
          actualCollections: null,
          actualTracks: null,
          queryAvailable: true,
        }));
      }
      const payload = result.payload as CatalogSummaryPayload;
      return publish(assessCatalogPrimaryReadGate({
        ...input,
        schemaVersion: payload.schemaVersion,
        actualCollections: payload.counts.collections,
        actualTracks: payload.counts.tracks,
        queryAvailable: true,
      }));
    } catch {
      return publish(assessCatalogPrimaryReadGate({
        ...input,
        schemaVersion: null,
        actualCollections: null,
        actualTracks: null,
        queryAvailable: true,
      }));
    }
  },
};
