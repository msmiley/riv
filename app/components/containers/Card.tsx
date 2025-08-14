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
  opacity?: number;     // background opacity
  cols?: number;        // bootstrap-style column width (1-12)
  grow?: boolean;       // flex grow
}

export default function Card({
  border = false,
  color,
  opacity = 1,
  cols = 0,
  grow = false,
  children,
}: CardProps) {
  const titleSlot = useSlot(children, 'title');
  const subtitleSlot = useSlot(children, 'subtitle');
  const descriptionSlot = useSlot(children, 'description');
  const header = (
    <div className={styles.rivCardHeader}>
      <h1 className={styles.rivCardTitle}>
        {titleSlot}
      </h1>
      <h2 className={styles.rivCardSubTitle}>
        {subtitleSlot}
      </h2>
      <p className={styles.rivCardDescription}>
        {descriptionSlot}
      </p>
    </div>
  );

  return (
    <div className={cls(styles.rivCard, `riv-basis-${cols}`, { border, grow })}
         style={{
           '--riv-card-bg': color,
           '--riv-card-opacity': opacity,
         } as React.CSSProperties}>
      {/* HEADER */}
      {titleSlot || subtitleSlot || descriptionSlot ? header : null}
      {/* DEFAULT SLOT */}
      {useSlot(children, 'default')}
    </div>
  );
}
