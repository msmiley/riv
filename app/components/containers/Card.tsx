import { PropsWithChildren } from 'react';
import useSlot from '../../hooks/useSlot';
import { cls } from '../../utils';
import styles from './containers.module.css';

interface CardProps extends PropsWithChildren {
  border: boolean;     // true for a border around card
  cols: number;        // bootstrap-style column width (1-12)
}

export default function Card({
  border = false,
  cols = 0,
  children,
}: CardProps) {
  return (
    <div className={cls([styles.rivCard, `riv-basis-${cols}`, { border }])}>
      <div className={styles.rivCardTitle}>
        {useSlot(children, 'title')}
      </div>
      <div className={styles.rivCardSubTitle}>
        {useSlot(children, 'subtitle')}
      </div>
      <div className={styles.rivCardDescription}>
        {useSlot(children, 'description')}
      </div>
      {/* DEFAULT SLOT */}
      {useSlot(children, 'default')}
    </div>
  );
}
