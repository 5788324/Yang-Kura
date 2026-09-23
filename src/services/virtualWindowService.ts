export interface VirtualWindowInput {
  totalCount: number;
  itemHeight: number;
  scrollTop: number;
  viewportHeight: number;
  overscan?: number;
}

export interface VirtualWindowRange {
  start: number;
  end: number;
  visibleCount: number;
  paddingTop: number;
  paddingBottom: number;
  totalHeight: number;
}

export function getVirtualWindowRange(input: VirtualWindowInput): VirtualWindowRange {
  const totalCount = Math.max(0, Math.trunc(input.totalCount));
  const itemHeight = Math.max(1, input.itemHeight);
  const scrollTop = Math.max(0, input.scrollTop);
  const viewportHeight = Math.max(itemHeight, input.viewportHeight);
  const overscan = Math.max(0, Math.trunc(input.overscan ?? 6));

  if (!totalCount) {
    return { start: 0, end: 0, visibleCount: 0, paddingTop: 0, paddingBottom: 0, totalHeight: 0 };
  }

  const firstVisible = Math.floor(scrollTop / itemHeight);
  const visibleRows = Math.ceil(viewportHeight / itemHeight);
  const start = Math.max(0, firstVisible - overscan);
  const end = Math.min(totalCount, firstVisible + visibleRows + overscan);
  return {
    start,
    end,
    visibleCount: end - start,
    paddingTop: start * itemHeight,
    paddingBottom: Math.max(0, (totalCount - end) * itemHeight),
    totalHeight: totalCount * itemHeight,
  };
}
