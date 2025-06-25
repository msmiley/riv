import { PropsWithChildren } from 'react';
import * as GP from '@victr/geopattern';

interface GeoPatternProps extends PropsWithChildren {
  seed: string;
}

export default function GeoPattern(props: GeoPatternProps) {
  return (
    <div style={{
      backgroundImage: GP.generate(props.seed).toDataUrl(),
    }}>
      {props.children}
    </div>
  )
}
