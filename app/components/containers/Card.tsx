// Card Component
// Slots:
//   - title - flex row for quick layout with automatic gapping
//   - subtitle - flex row for quick layout with automatic gapping
//   - description - p element meant for denser text
//
import React from 'react';
import useSlot from '../../hooks/useSlot';
import { cls } from '../../utils';
import styles from './containers.module.css';

interface CardProps extends React.PropsWithChildren {
  border?: boolean;     // true for a border around card
  color?: string;       // background color
  cols?: number;        // bootstrap-style column width (1-12)
  grow?: boolean;       // flex grow
}

export default function Card({
  border = false,
  color,
  cols = 0,
  grow = false,
  children,
}: CardProps) {
  return (
    <div className={cls(styles.rivCard, `riv-basis-${cols}`, { border, grow })}
         style={{
           '--riv-card-bg': color,
         } as React.CSSProperties}>
      {/* HEADER */}
      <div className={styles.rivCardHeader}>
        <div className={styles.rivCardTitle}>
          {useSlot(children, 'title')}
        </div>
        <div className={styles.rivCardSubTitle}>
          {useSlot(children, 'subtitle')}
        </div>
        <p className={styles.rivCardDescription}>
          {useSlot(children, 'description')}
        </p>
      </div>
      {/* DEFAULT SLOT */}
      {useSlot(children, 'default')}
    </div>
  );
}
