import React from 'react';
import { cls } from '../../utils';

interface GridProps extends React.PropsWithChildren {
  columns?: number | string;             // number of columns or grid-template-columns string
  rows?: string;                         // CSS grid-template-rows
  gap?: string;                          // grid gap, defaults to --riv-layout-gap
  center?: boolean;                      // center items (justify & align)
  justifyItems?: React.CSSProperties['justifyItems'];
  alignItems?: React.CSSProperties['alignItems'];
  justifyContent?: React.CSSProperties['justifyContent'];
  alignContent?: React.CSSProperties['alignContent'];
  autoFlow?: React.CSSProperties['gridAutoFlow'];
  style?: React.CSSProperties;           // custom inline styles
}

export default function Grid(props: GridProps) {
  const {
    columns,
    rows,
    gap,
    center,
    justifyItems,
    alignItems,
    justifyContent,
    alignContent,
    autoFlow,
    style,
    children,
  } = props;

  const gridTemplateColumns =
    typeof columns === 'number' ? `repeat(${columns}, 1fr)` : columns;

  return (
    <div
      className={cls('riv-grid', { center: !!center })}
      style={{
        display: 'grid',
        ...(style || {}),
        gridTemplateColumns,
        gridTemplateRows: rows,
        gap: gap ?? 'var(--riv-layout-gap)',
        justifyItems: center ? 'center' : justifyItems,
        alignItems: center ? 'center' : alignItems,
        justifyContent,
        alignContent,
        gridAutoFlow: autoFlow,
      }}
    >
      {children}
    </div>
  );
}