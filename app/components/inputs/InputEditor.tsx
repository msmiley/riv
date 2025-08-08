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
  showLineNumbers?: boolean;
  onUpdate?: (value: string) => void;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
}

export default function InputEditor({
  value,
  placeholder,
  required,
  disabled,
  grow,
  showLineNumbers = true,
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

  // Calculate line numbers based on textarea content
  const lineCount = value.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className={cls(styles.inputsText, styles.inputEditor, { grow })}>
      <div className={styles.inputEditorWrapper}>
        <div className={styles.inputEditorToolbar}>
          <label htmlFor={id} className={styles.inputEditorLabel}>
            {useSlot(children, 'label')}
          </label>
          <div className={styles.inputsTextButtons}>
            {useSlot(children, 'buttons', { clearInput })}
            <Button variant="tight" onClick={clearInput} aria-label="Clear text">
              <Icon name="trash" />
            </Button>
          </div>
        </div>

        <div className={styles.inputEditorContainer}>
          {showLineNumbers && (
            <div className={styles.inputEditorGutter}>
              {lineNumbers.map((lineNum) => (
                <div key={lineNum} className={styles.inputEditorLineNumber}>
                  {lineNum}
                </div>
              ))}
            </div>
          )}
          <textarea
            id={id}
            ref={textareaRef}
            className={cls(styles.inputsTextInputEl, styles.inputEditorTextarea)}
            value={value}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </div>
      </div>
      {useSlot(children, 'description')}
    </div>
  );
}
