// simple slot wrapper component which provides a name for named slots
// use in combination with useSlot on the parent
// useSlot will look for this slot by name
//
import React from 'react';

/**
 * SlotProps allows named slots and accepts any children including render functions
 */
interface SlotProps {
  name: string;
  children: any;
}

export default function Slot(props: SlotProps) {
  return props.children;
}
