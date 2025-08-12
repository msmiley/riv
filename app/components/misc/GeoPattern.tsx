import React from 'react';
import * as GP from '@victr/geopattern';

import styles from './misc.module.css';

interface GeoPatternProps extends React.PropsWithChildren {
  seed: string;  // seed for geopattern generator
  blur?: boolean; // true to blur background
  style?: React.CSSProperties;
}

export default function GeoPattern(props: GeoPatternProps) {
  return (
    <div className={styles.geopattern} style={{
      '--riv-geopattern-bg': GP.generate(props.seed).toDataUrl(),
      ...props.style,
    } as React.CSSProperties}>
      {/* OPTIONAL BLUR LAYER */}
      {props.blur && <div className={styles.geopatternBlur}></div>}
      {/* CONTENT */}
      <div className={styles.geopatternContent}>
        {props.children}
      </div>
    </div>
  )
}
