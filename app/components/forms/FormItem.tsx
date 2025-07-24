import React from 'react';
import useSlot from '../../hooks/useSlot';
import { cls } from '../../utils';
import styles from './forms.module.css';

interface FormItemProps extends React.PropsWithChildren {
  variant?: string;
  joinable?: boolean;
  required?: boolean;
}

export default function FormItem({
  variant = 'regular',
  joinable,
  required,
  children,
}: FormItemProps) {
  return (
    <div className={cls(styles.formItem, variant, { joinable })}>
      {/* use label with nested input slot for a11y */}
      <label className={styles.formItemHeader}>
        {useSlot(children, 'label')}
        {required && <small className={styles.formItemRequired}>Required</small>}
        {useSlot(children, 'input')}
      </label>
      <p className={styles.formItemDescription}>
        {useSlot(children, 'description')}
      </p>
      <div className={styles.formItemContent}>
        {useSlot(children, 'default')}
      </div>
    </div>
  );
}
