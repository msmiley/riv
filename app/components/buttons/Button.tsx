import React from 'react';
import { filter } from 'lodash-es';
import { cls, parseColor } from '../../utils';
import useSlot from '../../hooks/useSlot';

import styles from './buttons.module.css';

interface ButtonProps extends React.PropsWithChildren {
  name: string;
  size: 'sm' | 'md' | 'lg';
  variant: 'regular' | 'corners' | 'outline';
  color: string,
  grow: boolean,
  active: boolean,
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export default function Button({
  name,
  size = 'md',
  variant = 'regular',
  color = 'var(--riv-secondary)',
  grow,
  active,
  onClick,
  children,
}: ButtonProps) {

  return (
    <div className={cls([styles.button, { grow }])}
         style={{ '--riv-button-color': parseColor(color) }}
         onClick={onClick}>
      <div className={cls([styles.buttonInner, size, variant, { active }])}>
        <div className={styles.buttonContent}>
          {useSlot(children, 'default')}
        </div>
      </div>
    </div>
  );
}


//backup
//
//         {
//   ({ closeDropdown }) => <>
//     <Button size="lg" onClick={closeDropdown}>
//       button
//     </Button>
//   </>
// }
