// centered column layout
//
// mobile: composes .riv-mobile-full-width class for small screens
//
import React from 'react';
import styles from './layouts.module.css';

interface CenteredColumnProps extends React.PropsWithChildren {
  width?: string;    // nominal width, use relative or absolute dimensions
  maxWidth?: string; // max width (useful if nominal width is relative)
}

export default function CenteredColumn({
  width = '40vw',
  maxWidth = '800px',
  children,
}: CenteredColumnProps) {
  return (
    <div className={styles.centeredColumn}
         style={{
           width: `min(${width}, ${maxWidth})`,
         }}>
      {children}
    </div>
  );
}
