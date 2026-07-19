import React, { useEffect, useMemo, useState } from 'react';
import { coverArtworkService, type CoverArtworkFallbackKind } from '../services/coverArtworkService';

interface CoverArtworkProps {
  src?: string;
  title: string;
  subtitle?: string;
  kind?: CoverArtworkFallbackKind;
  className?: string;
  imgClassName?: string;
  rounded?: boolean;
  referrerPolicy?: React.ImgHTMLAttributes<HTMLImageElement>['referrerPolicy'];
}

export default function CoverArtwork({
  src,
  title,
  subtitle = '本地媒体库',
  kind = 'track',
  className = '',
  imgClassName = '',
  rounded = false,
  referrerPolicy = 'no-referrer',
}: CoverArtworkProps) {
  const fallbackSrc = useMemo(
    () => coverArtworkService.makeFallbackCover(title, subtitle, kind),
    [title, subtitle, kind],
  );
  const [useFallback, setUseFallback] = useState(false);
  useEffect(() => {
    setUseFallback(false);
  }, [src]);
  const hasDirectSource = Boolean(src && !useFallback);
  const finalSrc = hasDirectSource ? src : fallbackSrc;

  return (
    <img
      src={finalSrc}
      alt={title}
      referrerPolicy={referrerPolicy}
      onError={() => setUseFallback(true)}
      className={`${rounded ? 'rounded-full' : ''} ${className || imgClassName}`.trim()}
      data-cover-source={finalSrc === fallbackSrc ? 'generated-fallback' : coverArtworkService.isTokenizedCoverUrl(finalSrc) ? 'tokenized-local-cover' : 'direct-url'}
    />
  );
}
