import type { SemanticSize } from '~/types';

const semanticMap: Record<SemanticSize, string> = {
  xs: 'var(--riv-gap-xs)',
  sm: 'var(--riv-gap-sm)',
  md: 'var(--riv-gap-md)',
  lg: 'var(--riv-gap-lg)',
  xl: 'var(--riv-gap-xl)',
  '2xl': 'var(--riv-gap-2xl)',
};

export function resolveGap(gap?: string | SemanticSize): string {
  if (!gap) return 'var(--riv-layout-gap)';
  return (semanticMap as Record<string, string>)[gap] || gap;
}
