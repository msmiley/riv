import { PropsWithChildren } from 'react';
import { cls, parseColor } from '../../utils';
import useSlot from '../../hooks/useSlot';

import styles from './buttons.module.css';

interface ToggleProps extends PropsWithChildren {
  size: 'sm' | 'md' | 'lg', 'xl';
  color: string;
  active: boolean,
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  color: string;
}

export default function Toggle({
  size = 'md',
  color = 'var(--riv-primary)',
  active,
  onClick,
  children,
}: ToggleProps) {
  return (
    <div className={styles.toggle}
         style={{ '--riv-button-color': parseColor(color) }}
         onClick={onClick}>
      <div className={styles.toggleTitle}>
        {useSlot(children, 'title')}
      </div>
      <div className={cls([styles.toggleInner, styles.buttonSize, size, { active }])}>
        <div className={styles.toggleDot}></div>
      </div>
    </div>
  );
}
