import React from 'react';
import { cls } from '../../utils';
import type { FlexAlign, FlexJustify } from './containers';
import type { SemanticSize } from '~/types';
import { resolveGap } from './containers';

interface RowProps extends React.PropsWithChildren {
  center?: boolean;            // alias for flex align-items: center
  justify?: FlexJustify;       // flex justify-content
  align?: FlexAlign;           // flex align-items
  gap?: string | SemanticSize;  // flex gap parameter or semantic token, defaults to --riv-layout-gap
  grow?: boolean;              // set flex grow
  shrink?: boolean;            // set flex shrink
  self?: string;               // flex align-self setting
  nowrap?: boolean;            // flex nowrap
  style?: React.CSSProperties; // allow custom inline styles
}

export default function Row(props: RowProps) {
  const gapValue = resolveGap(props.gap as any);
  return (
    <div
      className={cls('riv-row', { center: props.center })}
      style={{
        ...(props.style || {}),
        gap: gapValue,
        flexGrow: props.grow ? 1 : 0,
        flexShrink: props.shrink ? 1 : 0,
        alignSelf: props.self,
        flexWrap: props.nowrap ? 'nowrap' : 'wrap',
        justifyContent: props.justify,
        alignItems: props.align,
      }}
    >
      {props.children}
    </div>
  );
}
