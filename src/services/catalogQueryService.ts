export interface CatalogPagePayload<T> {
  items: T[];
  hasMore: boolean;
  nextCursor: YangKuraCatalogCursor | null;
}

export const catalogQueryService = {
  isAvailable(): boolean {
    return Boolean(window.yangKura?.requestCatalogQuery);
  },

  async query<T>(request: YangKuraCatalogQueryRequest): Promise<T | null> {
    if (!window.yangKura?.requestCatalogQuery) return null;
    const result = await window.yangKura.requestCatalogQuery(request);
    return result.ok ? result.payload as T : null;
  },

  async page<T>(
    request: Extract<YangKuraCatalogQueryRequest, { mode: 'collections' | 'tracks' }>,
  ): Promise<CatalogPagePayload<T> | null> {
    return this.query<CatalogPagePayload<T>>(request);
  },
};
