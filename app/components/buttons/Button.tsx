import React from 'react';
import { cls, parseColor } from '../../utils';
import useSlot from '../../hooks/useSlot';

import styles from './buttons.module.css';

interface ButtonProps extends React.PropsWithChildren {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'regular' | 'corners' | 'outline' | 'icon' | 'link' | 'text' | 'tight';
  color?: string;
  grow?: boolean;
  active?: boolean;
  disabled?: boolean; // disables the button
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  htmlType?: 'button' | 'submit' | 'reset'; // underlying button type
}

export default function Button({
  size = 'md',
  variant = 'regular',
  color = 'var(--riv-secondary)',
  grow,
  active,
  disabled,
  onClick,
  htmlType = 'button',
  children,
}: ButtonProps) {
  return (
    <button className={cls(styles.button, { grow })}
            style={{
              '--riv-button-color': parseColor(color)
            } as React.CSSProperties}
            {...(active ? { 'aria-pressed': active } : {})}
            type={htmlType}
            disabled={disabled}
            onClick={onClick}>
      <div className={cls(styles.buttonInner,
                          styles.buttonSize,
                          styles.buttonPadding,
                          size,
                          variant,
                          {
                            active,
                          })}>
        <div className={styles.buttonContent}>
          {useSlot(children, 'default')}
        </div>
      </div>
    </button>
  );
}
