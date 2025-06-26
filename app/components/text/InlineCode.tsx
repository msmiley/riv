import { PropsWithChildren } from 'react';
import styles from './text.module.css';

interface InlineCodeProps extends PropsWithChildren {

}

export default function InlineCode(props: InlineCodeProps) {
  return (
    <div className={styles.inlineCode}>
      {props.children}
    </div>
  );
}
