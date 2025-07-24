import React from 'react';
import { cls, parseColor } from '../../utils';

import styles from './buttons.module.css';

interface ToggleProps extends React.PropsWithChildren {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  active?: boolean,
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export default function Toggle({
  size = 'md',
  color = 'var(--riv-primary)',
  active,
  onClick,
  children,
}: ToggleProps) {
  return (
    <button className={styles.toggle}
         style={{
           '--riv-button-color': parseColor(color)
         } as React.CSSProperties}
         onClick={onClick}>
      <div className={styles.toggleTitle}>
        {children}
      </div>
      <div className={cls(styles.toggleInner, styles.buttonSize, size, { active })}>
        <div className={styles.toggleDot}></div>
      </div>
    </button>
  );
}
