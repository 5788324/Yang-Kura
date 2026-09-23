import { KuraCatalogDatabase } from './catalogDatabase.js';
import { KURA_CATALOG_SCHEMA_VERSION } from './catalogSchema.js';
import { catalogRootIdFromToken } from './incrementalScanner.js';
import type { CatalogQueryRequest } from './catalogTypes.js';

export type CatalogQueryResult =
  | {
      ok: true;
      status: 'k2-r4-catalog-query-ready';
      schemaVersion: number;
      mode: CatalogQueryRequest['mode'];
      rootId: string;
      payload: unknown;
      absolutePathReturned: false;
      fileUrlReturned: false;
    }
  | {
      ok: false;
      status: 'k2-r4-catalog-query-not-ready' | 'k2-r4-catalog-query-failed';
      schemaVersion: number;
      mode: CatalogQueryRequest['mode'];
      message: string;
      absolutePathReturned: false;
      fileUrlReturned: false;
    };

export function runCatalogQuery(databasePath: string, request: CatalogQueryRequest): CatalogQueryResult {
  const catalog = new KuraCatalogDatabase(databasePath);
  try {
    const rootId = catalogRootIdFromToken(request.rootPathToken);
    if (!catalog.hasRoot(rootId)) {
      return {
        ok: false,
        status: 'k2-r4-catalog-query-not-ready',
        schemaVersion: KURA_CATALOG_SCHEMA_VERSION,
        mode: request.mode,
        message: 'Catalog sidecar 尚未准备好；继续使用兼容 JSON 读链。',
        absolutePathReturned: false,
        fileUrlReturned: false,
      };
    }

    const payload = request.mode === 'collections'
      ? catalog.pageCollections({
          rootId,
          collectionType: request.collectionType,
          search: request.search,
          circle: request.circle,
          cv: request.cv,
          tag: request.tag,
          artist: request.artist,
          sort: request.sort,
          cursor: request.cursor,
          limit: request.limit,
        })
      : request.mode === 'tracks'
        ? catalog.pageTracks({
            rootId,
            collectionId: request.collectionId,
            kind: request.kind,
            search: request.search,
            artist: request.artist,
            tag: request.tag,
            sort: request.sort,
            cursor: request.cursor,
            limit: request.limit,
          })
        : request.mode === 'facets'
          ? catalog.listCollectionFacets(request.facet, {
              rootId,
              collectionType: request.collectionType,
              limit: request.limit,
            })
          : catalog.listFolderChildren(rootId, request.parentRelativePath ?? null, request.limit);

    return {
      ok: true,
      status: 'k2-r4-catalog-query-ready',
      schemaVersion: KURA_CATALOG_SCHEMA_VERSION,
      mode: request.mode,
      rootId,
      payload,
      absolutePathReturned: false,
      fileUrlReturned: false,
    };
  } catch (error) {
    return {
      ok: false,
      status: 'k2-r4-catalog-query-failed',
      schemaVersion: KURA_CATALOG_SCHEMA_VERSION,
      mode: request.mode,
      message: error instanceof Error ? error.message : String(error),
      absolutePathReturned: false,
      fileUrlReturned: false,
    };
  } finally {
    catalog.close();
  }
}
