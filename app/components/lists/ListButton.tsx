import React from 'react';
import { cls } from '../../utils';
import useSlot from '../../hooks/useSlot';
import styles from './lists.module.css';

interface ListButtonProps extends React.PropsWithChildren<unknown> {
  onClick: React.MouseEventHandler<HTMLDivElement>;
  disabled?: boolean;
  ariaLabel?: string;
}

export default function ListButton({ children, onClick, disabled, ariaLabel }: ListButtonProps) {
  // handle Enter/Space key for accessibility
  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(e as any);
    }
  };
  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      className={cls(styles.listButton)}
      onClick={disabled ? undefined : onClick}
      onKeyDown={handleKeyDown}
    >
      <div className={cls(styles.listButtonContent)}>
        {useSlot(children, 'default')}
      </div>
    </div>
  );
}
