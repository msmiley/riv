import React from 'react';
import { createPortal } from 'react-dom';
import useSlot from '../../hooks/useSlot';
import styles from './popups.module.css';
import type { PopupCloseSlotProps, PopupTriggerSlotProps } from '~/types';

interface ModalProps extends React.PropsWithChildren<unknown> {}

export default function Modal({ children }: ModalProps) {
  // Create a container for the portal
  const [container] = React.useState(() => document.createElement('div'));
  // Manage open state
  const [isOpen, setIsOpen] = React.useState(false);

  // append container to body
  React.useEffect(() => {
    document.body.appendChild(container);
    return () => {
      document.body.removeChild(container);
    };
  }, [container]);

  // refs for trigger and content slots
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  // handle click-outside and Escape key
  // close when clicking outside modalContent or trigger
  React.useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      const triggerEl = triggerRef.current;
      const contentEl = contentRef.current;
      // ignore clicks inside content or on trigger
      if (
        (contentEl && contentEl.contains(target)) ||
        (triggerEl && triggerEl.contains(target))
      ) {
        return;
      }
      setIsOpen(false);
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

  // slots
  // trigger slot uses ref for click-outside logic
  const trigger = useSlot(children, 'trigger', {
    ref: triggerRef,
    onClick: () => setIsOpen(true),
  } as PopupTriggerSlotProps);

  return (
    <div className={styles.modal}>
      <div ref={triggerRef} className={styles.modalTrigger}>
        {trigger}
      </div>
      {isOpen &&
        createPortal(
          <div className={styles.modalOverlay}>
            <div ref={contentRef} className={styles.modalContent}>
              <div className={styles.modalTitle}>{useSlot(children, 'title')}</div>
              <div className={styles.modalBody}>{useSlot(children, 'default')}</div>
              <div className={styles.modalButtons}>{useSlot(children, 'buttons', { onClose: () => setIsOpen(false) } as PopupCloseSlotProps)}</div>
            </div>
          </div>,
          container
        )}
    </div>
  );
}
