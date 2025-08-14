import React from 'react';

import useSlot from '../../hooks/useSlot';
import { cls } from '../../utils';
import styles from './forms.module.css';

interface FormProps extends React.PropsWithChildren {
  variant?: string;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  style?: React.CSSProperties;        // optional inline style overrides
  className?: string;                 // optional extra class name(s)
}

export default function Form({
  variant = 'regular',
  onSubmit,
  style,
  className = '',
  children,
}: FormProps) {

  // form submit proxy
  const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('submit form');

    onSubmit && onSubmit(e);
  };

  return (
    <form className={cls(styles.form, variant, className)}
          style={style}
          noValidate
          onSubmit={submitForm}>
      {/* HEADER */}
      <div className={styles.formHeader}>
        <div className={styles.formTitle}>
          {useSlot(children, 'title')}
        </div>
        <p className={styles.formDescription}>
          {useSlot(children, 'description')}
        </p>
      </div>
      <div className={styles.formContent}>
        {/* CHILDREN */}
        {useSlot(children, 'default', { submitForm })}
      </div>
      {/* BUTTONS */}
      <div className={styles.formButtons}>
        {useSlot(children, 'buttons', { submitForm })}
      </div>
    </form>
  );
}
