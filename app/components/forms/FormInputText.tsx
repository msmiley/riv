import React from 'react';

import useSlot from '../../hooks/useSlot';
import Slot from '../slots/Slot';
import FormItem from './FormItem';
import InputText from '../inputs/InputText';

import styles from './forms.module.css';

interface FormInputTextProps extends React.PropsWithChildren {
  // form item props
  variant?: string;
  joinable?: boolean;
  required?: boolean;
  // input-specific props
  placeholder?: string;
  value: string;              // the main value setting
  onUpdate?: (value: string) => void; // easy access to new string value
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLInputElement>;
}

export default function FormInputText(props: FormInputTextProps) {

  // proxy the onChange event to power our easy onUpdate
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    props.onUpdate && props.onUpdate(e.target.value);
    props.onChange && props.onChange(e);
  }

  return (
    <FormItem variant={props.variant} joinable={props.joinable} required={props.required}>
      <Slot name="input">
        <input className={styles.formInputText}
               value={props.value}
               placeholder={props.placeholder}
               aria-required={props.required}
               onChange={onChange}
               onKeyUp={props.onKeyUp}/>
      </Slot>
      {/* passthrough slots */}
      {useSlot(props.children, 'label')}
      {useSlot(props.children, 'description')}
      {useSlot(props.children, 'default')}
    </FormItem>
  );
}
