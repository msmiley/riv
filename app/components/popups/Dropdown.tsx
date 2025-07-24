import React from 'react';
import { cls } from '../../utils';

import styles from './popups.module.css';

interface DropdownProps extends React.PropsWithChildren {

}

export default function Dropdown({
  children,
}: DropdownProps) {
  return (
    <div className={cls(styles.dropdown)}>
      test
    </div>
  );
}
