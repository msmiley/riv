import React from 'react';
import { cls } from '../../utils';
import useSlot from '../../hooks/useSlot';
import Button from '../buttons/Button';
import Icon from '../icons/Icon';

import styles from './inputs.module.css';

interface InputEditorProps extends React.PropsWithChildren {
  value: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  grow?: boolean;
  onUpdate?: (value: string) => void;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
}

export default function InputEditor({
  value,
  placeholder,
  required,
  disabled,
  grow,
  onUpdate,
  onChange,
  children,
}: InputEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = React.useState<boolean>(false);
  const id = React.useId();

  const clearInput = () => {
    onUpdate && onUpdate('');
    textareaRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate && onUpdate(e.target.value);
    onChange && onChange(e);
  };

  return (
    <div className={cls(styles.inputsText, { grow })}>
      <label
        htmlFor={id}
        className={cls(styles.inputsTextInner, { focused })}
      >
        {useSlot(children, 'label')}
        <textarea
          id={id}
          ref={textareaRef}
          className={styles.inputsTextInputEl}
          value={value}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <div className={styles.inputsTextButtons}>
          {useSlot(children, 'buttons')}
          {value.length > 0 && (
            <Button variant="tight" onClick={clearInput} aria-label="Clear text">
              <Icon name="times" />
            </Button>
          )}
        </div>
      </label>
      {useSlot(children, 'description')}
    </div>
  );
}
