// absolutely positioned frame
//
import React from 'react';

interface AbsoluteProps extends React.PropsWithChildren {
}

export default function Absolute(props: AbsoluteProps) {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    }}>
      {props.children}
    </div>
  )
}
