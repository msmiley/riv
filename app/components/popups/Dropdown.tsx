import React from 'react';
import { cls } from '../../utils';
import { createPortal } from 'react-dom';
import useSlot from '../../hooks/useSlot';
import styles from './popups.module.css';
import type { PopupCloseSlotProps, PopupTriggerSlotProps } from '~/types';

interface DropdownProps extends React.PropsWithChildren {
  right?: boolean; // whether to align dropdown to the right
}

export default function Dropdown({ right, children }: DropdownProps) {
  // Create a container for the portal
  const [container] = React.useState(() => document.createElement('div'));
  
  // append container to body once
  React.useEffect(() => {
    document.body.appendChild(container);
    return () => {
      document.body.removeChild(container);
    };
  }, [container]);
  
  // internal open state and anchor for trigger
  const [isOpen, setIsOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  // state for popup style
  const [popupStyle, setPopupStyle] = React.useState<React.CSSProperties>({ position: 'absolute', top: '0px', left: '0px', visibility: 'hidden' });

  // position dropdown on mount/update
  React.useLayoutEffect(() => {
    if (!isOpen || !anchorRef.current || !dropdownRef.current) return;
    const triggerRect = anchorRef.current.getBoundingClientRect();
    const dropdownRect = dropdownRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    // vertical: default below, flip above if overflowing
    let top = triggerRect.bottom + scrollY + 1;
    if (top + dropdownRect.height > scrollY + window.innerHeight) {
      top = triggerRect.top + scrollY - dropdownRect.height - 1;
    }
    // horizontal: default align left, align right or adjust if overflowing
    let left = triggerRect.left + scrollX;
    if (right) {
      left = triggerRect.right + scrollX - dropdownRect.width;
    } else if (left + dropdownRect.width > scrollX + window.innerWidth) {
      left = triggerRect.right + scrollX - dropdownRect.width;
    }
    // apply position and show
    setPopupStyle({ position: 'absolute', top: `${top}px`, left: `${left}px`, visibility: 'visible' });
  }, [isOpen, right, container]);

  // handle click-outside and Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        !container.contains(e.target as Node) &&
        !(anchorRef.current && anchorRef.current.contains(e.target as Node))
      ) {
        setIsOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, container]);

  // Render trigger slot
  const trigger = useSlot(children, 'trigger', {
    onClick: () => setIsOpen(open => !open),
  } as PopupTriggerSlotProps);

  return (
    <div className={styles.dropdown}>
      <div ref={anchorRef} className={styles.dropdownTrigger}>
        {trigger}
      </div>
      {isOpen && createPortal(
        // content rendered in portal container
        <div ref={dropdownRef} className={cls(styles.dropdownContent, { right })} style={popupStyle}>
          {useSlot(children, 'default', { onClose: () => setIsOpen(false) } as PopupCloseSlotProps)}
        </div>,
        container
      )}
    </div>
  );
}
