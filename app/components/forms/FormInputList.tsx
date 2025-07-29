import React from 'react';

import useSlot from '../../hooks/useSlot';
import Slot from '../slots/Slot';
import FormItem from './FormItem';
import type { FormSharedProps } from './forms';

import styles from './forms.module.css';
import Button from '../buttons/Button';
import Icon from '../icons/Icon';
import InputText from '../inputs/InputText';
import Pill from '../buttons/Pill';

interface FormInputListProps extends FormSharedProps {
  enumerate?: boolean; // whether to enumerate items
  placeholder?: string; // placeholder for new items
  value: string[]; // the list of items
  onUpdate?: (value: string[]) => void; // update value
}

export default function FormInputList(props: FormInputListProps) {
  // Add a new item to the list
  const onAddItem = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Logic to add a new item to the list
    props.onUpdate && props.onUpdate([...props.value, '']); // Add an empty string as a new item
  };

  return (
    <FormItem variant={props.variant} joinable={props.joinable} required={props.required}>
      <Slot name="input">
        <Button variant="icon" onClick={onAddItem}>
          <Icon name="plus"/>
        </Button>
      </Slot>
      {/* LIST */}
      <ul className={styles.formInputList}>
        {props.value.map((item, index) => (
          <li key={index} className={styles.formInputListItem}>
            {props.enumerate && <Pill size="sm" color="var(--riv-secondary)">
              <Slot name="title">{index + 1}</Slot>
            </Pill>}
            <InputText grow variant="clean" placeholder={props.placeholder || 'Item'}
                       value={item}
                       onChange={(e) => {
                         const newValue = [...props.value];
                         newValue[index] = e.target.value;
                         props.onUpdate && props.onUpdate(newValue);
                       }}
            />
            <Button variant="icon" onClick={() => {
                      const newValue = props.value.filter((_, i) => i !== index);
                      props.onUpdate && props.onUpdate(newValue);
                    }}>
              <Icon name="trash"/>
            </Button>
          </li>
        ))}
      </ul>
      {/* passthrough slots */}
      {useSlot(props.children, 'label')}
      {useSlot(props.children, 'description')}
    </FormItem>
  );
}
