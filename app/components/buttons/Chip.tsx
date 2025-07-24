import React from 'react';
import { filter } from 'lodash-es';
import { cls, parseColor } from '../../utils';
import useSlot from '../../hooks/useSlot';

import styles from './buttons.module.css';

interface ChipProps extends React.PropsWithChildren {
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'regular' | 'corners' | 'outline';
  color?: string,
  grow?: boolean,
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export default function Chip({
  name,
  size = 'md',
  variant = 'regular',
  color = 'var(--riv-primary)',
  grow,
  onClick,
  children,
}: ChipProps) {

  return (
    <div role="button"
         className={cls(styles.chip, { grow })}
         style={{
           '--riv-chip-color': parseColor(color)
         } as React.CSSProperties}
         onClick={onClick}>
          {useSlot(children, 'default')}
    </div>
  );
}
