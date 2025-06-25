import { PropsWithChildren } from 'react';
import useSlot from '../../hooks/useSlot';
import { cls } from '../../utils';
import styles from './containers.module.css';

interface CardProps extends PropsWithChildren {
  border: boolean;
}

export default function Card({
  border = false,
  children,
}: CardProps) {
  return (
    <div className={cls([styles.rivCard, { border }])}>
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
