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
  const containerRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const highlightInnerRef = React.useRef<HTMLDivElement>(null);
  const gutterRef = React.useRef<HTMLDivElement>(null);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + '\t' + value.substring(end); // insert real tab character
      
      onUpdate && onUpdate(newValue);
      
      // Restore cursor position after the inserted tab
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
    }
  };

  // Calculate line numbers based on textarea content
  const lines = value.split('\n');
  const lineCount = lines.length;
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

  // Split content into lines and highlight each line individually
  const highlightedLines = React.useMemo(() => {
    const grammar = Prism.languages[prismLangKey as keyof typeof Prism.languages] || Prism.languages.javascript;
    return lines.map((line, index) => {
      // Add newline back except for last line to maintain proper highlighting
      const lineWithNewline = index < lines.length - 1 ? line + '\n' : line;
      const highlighted = Prism.highlight(lineWithNewline, grammar, prismLangKey);
      return highlighted;
    });
  }, [lines, prismLangKey]);

  // Sync scroll between textarea, gutter, and highlight inner
  const handleScroll: React.UIEventHandler<HTMLTextAreaElement> = (e) => {
    const target = e.target as HTMLTextAreaElement;
    const top = target.scrollTop;
    const left = target.scrollLeft;
    if (gutterRef.current) {
      gutterRef.current.style.transform = `translateY(-${top}px)`;
    }
    if (highlightInnerRef.current) {
      (highlightInnerRef.current.style as any).transform = `translate(${-left}px, ${-top}px)`;
    }
  };

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
          <div 
            ref={containerRef}
            className={styles.inputEditorScrollContainer}
            style={dynamicHeight ? { height: dynamicHeight } : undefined}
          >
            {showLineNumbers && (
              <div className={styles.inputEditorGutter}>
                <div ref={gutterRef}>
                  {lineNumbers.map((lineNum) => (
                    <div key={lineNum} className={styles.inputEditorLineNumber}>
                      {lineNum}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className={styles.inputEditorContent}>
              {/* Highlighted background */}
              <div className={styles.inputEditorHighlightLayer} aria-hidden="true">
                <div ref={highlightInnerRef} className={styles.inputEditorHighlightInner}>
                  {highlightedLines.map((highlighted, index) => (
                    <div 
                      key={index} 
                      className={styles.inputEditorLine}
                      dangerouslySetInnerHTML={{ __html: highlighted || '\u00A0' }} // Non-breaking space for empty lines
                    />
                  ))}
                </div>
              </div>
              
              {/* Editable textarea */}
              <textarea
                id={id}
                ref={textareaRef}
                className={cls(styles.inputsTextInputEl, styles.inputEditorTextarea)}
                value={value}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onScroll={handleScroll}
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
