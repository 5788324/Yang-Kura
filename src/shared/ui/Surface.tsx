import type { HTMLAttributes, ReactNode } from 'react';

export type SurfaceTone = 'default' | 'subtle';
export type SurfaceElevation = 'flat' | 'raised';
export type SurfacePadding = 'none' | 'sm' | 'md' | 'lg';

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  tone?: SurfaceTone;
  elevation?: SurfaceElevation;
  padding?: SurfacePadding;
  className?: string;
  children?: ReactNode;
}

export function Surface({
  tone = 'default',
  elevation = 'flat',
  padding = 'none',
  className = '',
  children,
  ...surfaceProps
}: SurfaceProps) {
  return (
    <div
      {...surfaceProps}
      data-tone={tone}
      data-elevation={elevation}
      data-padding={padding}
      className={`yk-surface ${className}`.trim()}
    >
      {children}
    </div>
  );
}
