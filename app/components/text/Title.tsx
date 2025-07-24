import React from 'react';
import { cls } from '../../utils';
import styles from './text.module.css';

interface TitleProps extends React.PropsWithChildren {
  variant?: 'h1' | 'h2' | 'h3' | 'h4'; // semantic heading level
  hr?: boolean;                        // add horizontal rule under title
  margins?: boolean;                   // add margins top and bottom
}

export default function Title({
  variant = 'h4',
  hr,
  margins,
  children,
}: TitleProps) {
  return (
    <div className={cls(styles.title, `riv-text-${variant}`, { hr, margins })}>
      {children}
    </div>
  );
}
