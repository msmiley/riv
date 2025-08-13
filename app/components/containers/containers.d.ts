import type { SemanticSize } from '~/types';

// Container types

export type FlexJustify = 'start' | 'end' | 'center' | 'space-between' | 'space-evenly';
export type FlexAlign = 'start' | 'end' | 'center' | 'baseline' | 'stretch';

export function resolveGap(gap?: string | SemanticSize): string;