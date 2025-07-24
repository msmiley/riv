import React from 'react';
import styles from './text.module.css';

interface InlineCodeProps extends React.PropsWithChildren {

}

export default function InlineCode(props: InlineCodeProps) {
  return (
    <span className={styles.inlineCode}>
      {props.children}
    </span>
  );
}
