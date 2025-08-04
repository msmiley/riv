import React from 'react';
import useSlot from '../../hooks/useSlot';
import styles from './pickers.module.css';

interface ColorPickerProps extends React.PropsWithChildren {
  value: string;                  // hex color string (e.g. "#ff0000")
  onChange: (value: string) => void; // callback when color changes
  disabled?: boolean;
  required?: boolean;
}

export default function ColorPicker({
  value,
  onChange,
  disabled,
  required,
  children,
}: ColorPickerProps) {
  const id = React.useId();
  return (
    <div className={styles.colorPicker}>
      <label htmlFor={id} className={styles.colorPickerLabel}>
        {useSlot(children, 'label')}
      </label>
      <input
        id={id}
        type="color"
        value={value}
        disabled={disabled}
        required={required}
        onChange={e => onChange(e.target.value)}
        className={styles.colorPickerInput}
      />
      {useSlot(children, 'description')}
    </div>
  );
}
