import React from 'react';
import { createPortal } from 'react-dom';
import useSlot from '../../hooks/useSlot';
import styles from './popups.module.css';

interface DropdownProps extends React.PropsWithChildren<unknown> {}

export default function Dropdown({ children }: DropdownProps) {
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
  const anchorRef = React.useRef<HTMLElement>(null);

  // auto-position container when open and anchorRef provided
  React.useLayoutEffect(() => {
    if (isOpen && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      Object.assign(container.style, {
        position: 'absolute',
        // move dropdown 1px below trigger
        top: `${rect.bottom + window.scrollY + 1}px`,
        left: `${rect.left + window.scrollX}px`,
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

  // Render trigger button slot
  const trigger = useSlot(children, 'button', {
    ref: anchorRef,
    onClick: () => setIsOpen(open => !open),
  });

  return (
    <>
      {trigger}
      {isOpen &&
        createPortal(
          <div className={styles.dropdownContent}>{useSlot(children, 'default')}</div>,
          container
        )}
    </>
  );
}
