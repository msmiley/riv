import React from 'react';
import { cls } from '../../utils';

interface ColumnProps extends React.PropsWithChildren {
  center?: boolean;            // alias for flex align-items: center
  gap?: string;                // flex gap parameter, defaults to --riv-layout-gap
  grow?: boolean;              // set flex grow
  shrink?: boolean;            // set flex shrink
  self?: string;               // flex align-self setting
  style?: React.CSSProperties; // allow custom inline styles
}

export default function Column(props: ColumnProps) {
  return (
    <div
      className={cls('riv-column', { center: props.center })}
      style={{
        ...(props.style || {}),
        gap: props.gap ?? 'var(--riv-layout-gap)',
        flexGrow: props.grow ? 1 : 0,
        flexShrink: props.shrink ? 1 : 0,
        alignSelf: props.self,
      }}
    >
      {props.children}
    </div>
  );
}
