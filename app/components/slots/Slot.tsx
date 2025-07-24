// simple slot wrapper component which provides a name for named slots
// use in combination with useSlot on the parent
// useSlot will look for this slot by name
//
import React from 'react';

interface SlotProps extends React.PropsWithChildren {
  name: string; // slot name
}

export default function Slot(props: SlotProps) {
  return props.children;
}
