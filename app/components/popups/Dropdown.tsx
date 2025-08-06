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

  // auto-position container when open and anchorRef provided
  React.useLayoutEffect(() => {
    if (isOpen && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      const top = rect.bottom + scrollY + 1;
      let left: number;
      if (right) {
        // align right edge of dropdown to right edge of trigger
        const width = container.offsetWidth;
        left = rect.right + scrollX - width;
      } else {
        left = rect.left + scrollX;
      }
      Object.assign(container.style, {
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
      });
    }
  }, [isOpen, anchorRef, container]);

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
      {isOpen &&
        createPortal(
          <div className={cls(styles.dropdownContent, { right })}>
            {useSlot(children, 'default', { onClose: () => setIsOpen(false) } as PopupCloseSlotProps)}
          </div>,
          container
        )}
    </div>
  );
}
