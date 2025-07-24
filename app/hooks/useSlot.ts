import React from 'react';
import { isFunction } from 'lodash-es';

// find the Slot by name in the parent props
//
// parentSlots - usually the 'children' prop
// slotName - the slot name being used
// slotProps - optional data members to pass up the slot through a function
//
export default function useSlot(parentSlots: React.ReactNode, slotName: string, slotProps = {}) {
  // find slot by name prop
  let slot = React.Children.toArray(parentSlots).filter((child) => {
    // if it's a named slot, make sure it matches slotName
    if (React.isValidElement(child) &&    // make sure it's a react element
        typeof child.type !== 'string' && // make sure it's not just a string el
        child.type.name === 'Slot' &&     // make sure it's a riv Slot
        React.isValidElement<{ name: string }>(child)) {
        return child.props.name === slotName;
    } else if (slotName === 'default') { // handle default slot(s)
      return true;
    }
  });

  // if a function was provided to the slot, call it with the slotProps as a
  // way to provide functionality back up the tree
  if (React.isValidElement<{ children: React.ReactNode }>(slot) && isFunction(slot.props.children)) {
    return slot.props.children(slotProps);
  }
  // default slot
  return slot;
}
