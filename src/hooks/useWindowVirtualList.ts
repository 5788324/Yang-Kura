import { useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { getVirtualWindowRange, type VirtualWindowRange } from '../services/virtualWindowService';

export interface WindowVirtualListOptions {
  enabled?: boolean;
  itemHeight: number;
  overscan?: number;
}

export interface WindowVirtualListResult<T> extends VirtualWindowRange {
  items: T[];
  containerRef: RefObject<HTMLDivElement | null>;
}

export function useWindowVirtualList<T>(
  items: T[],
  options: WindowVirtualListOptions,
): WindowVirtualListResult<T> {
  const containerRef = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState<VirtualWindowRange>(() => getVirtualWindowRange({
    totalCount: items.length,
    itemHeight: options.itemHeight,
    scrollTop: 0,
    viewportHeight: typeof window === 'undefined' ? 800 : window.innerHeight,
    overscan: options.overscan,
  }));

  useLayoutEffect(() => {
    if (!options.enabled) {
      setRange({
        start: 0,
        end: items.length,
        visibleCount: items.length,
        paddingTop: 0,
        paddingBottom: 0,
        totalHeight: items.length * options.itemHeight,
      });
      return;
    }

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const node = containerRef.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const containerTop = window.scrollY + rect.top;
        setRange(getVirtualWindowRange({
          totalCount: items.length,
          itemHeight: options.itemHeight,
          scrollTop: Math.max(0, window.scrollY - containerTop),
          viewportHeight: window.innerHeight,
          overscan: options.overscan,
        }));
      });
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [items.length, options.enabled, options.itemHeight, options.overscan]);

  const visibleItems = useMemo(
    () => items.slice(range.start, range.end),
    [items, range.end, range.start],
  );
  return { ...range, items: visibleItems, containerRef };
}
