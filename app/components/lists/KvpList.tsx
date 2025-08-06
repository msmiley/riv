import React from 'react';
import styles from './data.module.css';

interface KvpListProps extends React.PropsWithChildren {
  data: object;
}

export default function KvpList(props: KvpListProps) {
  return (
    <div className={styles.kvpList}>
      {Object.entries(props.data).map(([k, v]) =>
        <React.Fragment key={k}>
          {/*KEY*/}
          <div className={styles.kvpListKey}>
            {k}
          </div>
          {/*VALUE*/}
          <div className={styles.kvpListValue}>
            {v}
          </div>
        </React.Fragment>
      )}
    </div>
  );
}
