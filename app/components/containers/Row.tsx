import { PropsWithChildren } from 'react';
import { cls } from '../../utils';

interface RowProps extends PropsWithChildren {
  center: boolean; // alias for flex align-items: center
  gap: string;     // flex gap parameter, defaults to --riv-layout-gap
  grow: boolean;   // set flex grow
  shrink: boolean; // set flex shrink
  self: string;    // flex align-self setting
  nowrap: boolean; // flex nowrap
}

export default function Row(props: RowProps) {
  return (
    <div className={cls(['riv-row', {
      center: props.center
    }])} style={{
      gap: props.gap ?? 'var(--riv-layout-gap)',
      flexGrow: props.grow ? 1:0,
      flexShrink: props.shrink ? 1:0,
      alignSelf: props.self,
      flexWrap: props.nowrap ? 'nowrap':'wrap',
    }}>
      {props.children}
    </div>
  );
}
