import React from 'react';
import { filter } from 'lodash-es';
import { cls, parseColor, getGeoPattern } from '../../utils';
import useSlot from '../../hooks/useSlot';

import styles from './buttons.module.css';

interface PillProps extends React.PropsWithChildren {
  name: string;
  size: 'sm' | 'md' | 'lg';
  variant: 'regular' | 'corners' | 'outline';
  color: string;
  geopattern: string;
  grow: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export default function Pill({
  name,
  size = 'md',
  variant = 'regular',
  color = 'var(--riv-primary)',
  geopattern,
  grow,
  onClick,
  children,
}: ButtonProps) {

  return (
    <div className={cls([styles.pill, styles.buttonSize, size, { grow, clickable: !!onClick }])}
         style={{
           '--riv-pill-color': parseColor(color),
           '--riv-pill-geopattern': getGeoPattern(geopattern),
         }}
         onClick={onClick}>
      <div className={styles.pillInner}>
        <div className={styles.pillTitle}>
          {useSlot(children, 'title')}
        </div>
        <div className={styles.pillValue}>
          {useSlot(children, 'value')}
        </div>
        <div className={styles.pillButtons}>
          {useSlot(children, 'buttons')}
        </div>
      </div>
    </div>
  );
}
