import React from 'react';

import useSlot from '../../hooks/useSlot';
import Slot from '../slots/Slot';
import FormItem from './FormItem';
import type { FormSharedProps } from './forms';

import styles from './forms.module.css';
import Button from '../buttons/Button';
import Icon from '../icons/Icon';
import InputText from '../inputs/InputText';

interface FormInputEditorProps extends FormSharedProps {
  value: string;                      // the text buffer
  placeholder?: string;               // placeholder text
  onUpdate?: (value: string) => void; // update value
}

export default function FormInputEditor(props: FormInputEditorProps) {

  const onClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    props.onUpdate && props.onUpdate(''); // Clear the buffer
  };

  return (
    <FormItem variant={props.variant} joinable={props.joinable} required={props.required}>
      <Slot name="input">
        <Button variant="icon" onClick={onClear}>
          <Icon name="trash"/>
        </Button>
      </Slot>
      {/* EDITOR */}
      <textarea className={styles.formInputEditor}
                value={props.value}
                onChange={(e) => {
                  props.onUpdate && props.onUpdate(e.target.value);
                }}
                placeholder={props.placeholder || 'Enter text...'}
                aria-required={props.required}
      />
      {/* passthrough slots */}
      {useSlot(props.children, 'label')}
      {useSlot(props.children, 'description')}
    </FormItem>
  );
}
