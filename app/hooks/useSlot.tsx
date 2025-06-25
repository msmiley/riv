import React from 'react';
import { isFunction } from 'lodash-es';

// find the Slot by name in the parent props
//
// parentSlots - usually the 'children' prop
// slotName - the slot name being used
// slotProps - optional data members to pass up the slot through a function
//
export default function useSlot(parentSlots, slotName, slotProps = {}) {
  // find slot by name prop
  console.log(React.Children.toArray(parentSlots))
  let slot = React.Children.toArray(parentSlots).filter((child) => {
    // if it's a named slot, make sure it matches slotName
    if (child?.type?.name === 'Slot' && child?.props?.name) {
      return child.props.name === slotName;
    } else if (slotName === 'default') { // handle default slot(s)
      return true;
    }
  });
  // console.log(slot)

  // if a function was provided to the slot, call it with the slotProps as a
  // way to provide functionality back up the tree
  if (slot?.props?.children && isFunction(slot.props.children)) {
    return slot.props.children(slotProps);
  }
  // default slot
  return slot;
}
