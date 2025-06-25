import { PropsWithChildren } from 'react';
import styles from './data.module.css';

interface KvpListProps extends PropsWithChildren {
  data: object;
}

export default function KvpList(props: KvpListProps) {
  return (
    <div className={styles.kvpList}>
      {props.data.map((v, k) =>
        {/*KEY*/}
        <div className={styles.kvpListKey}>
          {k}
        </div>
        {/*VALUE*/}
        <div className={styles.kvpListValue}>
          {v}
        </div>
      )}
    </div>
  );
}
