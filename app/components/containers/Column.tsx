import React from 'react';
import { cls } from '../../utils';
import type { FlexAlign, FlexJustify } from './containers';

interface ColumnProps extends React.PropsWithChildren {
  center?: boolean;            // alias for flex align-items: center
  justify?: FlexJustify;       // flex justify-content
  align?: FlexAlign;           // flex align-items
  gap?: string;                // flex gap parameter, defaults to --riv-layout-gap
  grow?: boolean;              // set flex grow
  shrink?: boolean;            // set flex shrink
  self?: string;               // flex align-self setting
  style?: React.CSSProperties; // allow custom inline styles
}

export default function Column(props: ColumnProps) {
  return (
    <div
      className="riv-column"
      style={{
        ...(props.style || {}),
        gap: props.gap ?? 'var(--riv-layout-gap)',
        flexGrow: props.grow ? 1 : 0,
        flexShrink: props.shrink ? 1 : 0,
        alignSelf: props.self,
        justifyContent: props.justify,
        alignItems: props.center ? 'center' : props.align,
      }}
    >
      {props.children}
    </div>
  );
}
