import React from 'react';
import { cls } from '../../utils';
import useSlot from '../../hooks/useSlot';

import Button from '../buttons/Button';
import Icon from '../icons/Icon';

import styles from './inputs.module.css';

interface InputsTextProps extends React.PropsWithChildren {
  label?: string;                                   // formal label, will render to the left of field
  placeholder?: string;                             // input placeholder
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'regular' | 'shaded' | 'clean';
  grow?: boolean;                                   // set flex-grow
  right?: boolean;                                  // right justification
  center?: boolean;                                 // center justification
  clearable?: boolean;                              // shows clear button
  required?: boolean;                               // adds "Required" text and sets aria-required flag
  disabled?: boolean;                               // disables control
  value: string;                                    // the main value setting
  onUpdate?: (value: string) => void;               // easy access to new string value
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLInputElement>;
}

export default function InputsText({
  label,
  value,
  placeholder,
  size = 'md',
  variant = 'regular',
  grow,
  right,
  center,
  clearable,
  required,
  disabled,
  onUpdate,
  onChange,
  onKeyUp,
  children,
}: InputsTextProps) {
  // refs
  const inputRef = React.useRef<HTMLInputElement>(null);
  // focus state
  const [focused, setFocus] = React.useState<boolean>(false);
  // local input buffer
  const [inputBuffer, setInputBuffer] = React.useState<string>('');

  // methods
  const clearInput = () => {
    onUpdate && onUpdate('');
    inputRef.current?.focus();
  }
  // proxy the onChange event to power our easy onUpdate
  const onChangeProxy = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    onUpdate && onUpdate(e.target.value);
    onChange && onChange(e);
  }

  return (
    <div className={cls(styles.inputsText, size, variant, { center, right, grow })}>
      {/* ATTEMPT TO USE LABEL AS WRAPPER FOR IMPROVED A11y */}
      <label className={cls(styles.inputsTextInner, variant, { focused })}>
        {/* LABEL */}
        {useSlot(children, 'label')}
        {/* ICON SLOT */}
        <div className={styles.inputsTextIconSlot}>
          {useSlot(children, 'icon')}
        </div>
        {/* THE INPUT */}
        <input ref={inputRef}
               className={styles.inputsTextInputEl}
               value={value}
               placeholder={placeholder}
               aria-required={required}
               onChange={onChangeProxy}
               onKeyUp={onKeyUp}
               onFocus={() => setFocus(true)}
               onBlur={() => setFocus(false)}/>
        {/* UNIT SLOT */}
        <div className={styles.inputsTextUnitSlot}>
          {useSlot(children, 'units')}
        </div>
        {/* BUTTONS SLOT */}
        <div className={styles.inputsTextButtons}>
          {useSlot(children, 'buttons')}
          {/* BUILT-IN CLEAR BUTTON */}
          {clearable && value.length > 0 &&
              <Button variant="tight"
                      onClick={clearInput}>
                <Icon name="times"/>
              </Button>
          }
        </div>
      </label>
    </div>
  );
}

