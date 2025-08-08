import React from 'react';
import { cls } from '../../utils';
import useSlot from '../../hooks/useSlot';
import Button from '../buttons/Button';
import Icon from '../icons/Icon';

import styles from './inputs.module.css';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/themes/prism.css';

interface InputEditorProps extends React.PropsWithChildren {
  value: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  grow?: boolean;
  showLineNumbers?: boolean;
  language?: 'javascript' | 'typescript' | 'json' | 'css' | 'html';
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
  language = 'javascript',
  onUpdate,
  onChange,
  children,
}: InputEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const highlightRef = React.useRef<HTMLDivElement>(null);
  const gutterContentRef = React.useRef<HTMLDivElement>(null);
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

  // keep highlight scrolled with textarea
  const handleScroll: React.UIEventHandler<HTMLTextAreaElement> = (e) => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = (e.target as HTMLTextAreaElement).scrollTop;
      highlightRef.current.scrollLeft = (e.target as HTMLTextAreaElement).scrollLeft;
    }
    if (gutterContentRef.current) {
      const top = (e.target as HTMLTextAreaElement).scrollTop;
      gutterContentRef.current.style.transform = `translateY(-${top}px)`;
    }
  };

  // Calculate line numbers based on textarea content
  const lineCount = value.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  // Calculate dynamic height for disabled state
  const dynamicHeight = React.useMemo(() => {
    if (disabled) {
      // Calculate height based on content lines + padding
      const lineHeight = 1.4; // matches CSS line-height
      const padding = 1; // 0.5em top + 0.5em bottom converted to em
      return `${lineCount * lineHeight + padding}em`;
    }
    return undefined;
  }, [disabled, lineCount]);

  // Prism highlight
  const prismLangKey = React.useMemo(() => {
    switch (language) {
      case 'typescript': return 'typescript';
      case 'json': return 'json';
      case 'css': return 'css';
      case 'html': return 'markup';
      default: return 'javascript';
    }
  }, [language]);
  const highlighted = React.useMemo(() => {
    const grammar = Prism.languages[prismLangKey as keyof typeof Prism.languages] || Prism.languages.javascript;
    return Prism.highlight(value, grammar, prismLangKey);
  }, [value, prismLangKey]);

  // keep highlight scroll position synced on content change
  React.useEffect(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, [value]);

  // also sync when language/theme/layout might change
  React.useEffect(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, [prismLangKey]);

  return (
    <div className={cls(styles.inputsText, styles.inputEditor, { grow })}>
      <div className={styles.inputEditorWrapper}>
        <div className={styles.inputEditorToolbar}>
          <div className={styles.inputEditorLabelGroup}>
            <label htmlFor={id} className={styles.inputEditorLabel}>
              {useSlot(children, 'label')}
            </label>
            <div className={styles.inputEditorDescription}>
              {useSlot(children, 'description')}
            </div>
          </div>
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
              <div ref={gutterContentRef} className={styles.inputEditorGutterContent}>
                {lineNumbers.map((lineNum) => (
                  <div key={lineNum} className={styles.inputEditorLineNumber}>
                    {lineNum}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className={styles.inputEditorCodeArea} style={dynamicHeight ? { height: dynamicHeight } : undefined}>
            {/* highlight layer */}
            <div
              ref={highlightRef}
              className={styles.inputEditorHighlight}
              aria-hidden="true"
            >
              <pre className={cls('language-' + prismLangKey)}>
                <code dangerouslySetInnerHTML={{ __html: highlighted }} />
              </pre>
            </div>
            {/* editable layer */}
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
              onScroll={handleScroll}
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
