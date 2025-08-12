import React from 'react';
import styles from './lists.module.css';
import useSlot from '~/hooks/useSlot';
import { cls } from '~/utils';

interface ListItemProps extends React.PropsWithChildren{
  hoverable?: boolean;  // Enable hover background and rounded corners
  selected?: boolean;   // Apply selection background
  onClick?: React.MouseEventHandler<HTMLDivElement>; // Click handler for the entire ListItem (button slot stops propagation)
}

export default function ListItem(props: ListItemProps) {
  const icon = useSlot(props.children, 'icon');
  const title = useSlot(props.children, 'title');
  const subtitle = useSlot(props.children, 'subtitle');
  const description = useSlot(props.children, 'description');
  const buttons = useSlot(props.children, 'buttons');

  return (
    <>
      <div className={cls(styles.listItem, { hoverable: props.hoverable, selected: props.selected })}
           onClick={props.onClick}>
          {icon && <div className={styles.listItemIcon}>{icon}</div>}
          <div className={styles.listItemContent}>
            {title && <div className={styles.listItemTitle}>{title}</div>}
            {subtitle && <div className={styles.listItemSubtitle}>{subtitle}</div>}
            {description && <div className={styles.listItemDescription}>{description}</div>}
          </div>
        {buttons && (
          <div className={styles.listItemButtons}
               onClick={e => e.stopPropagation()}>
            {buttons}
          </div>
        )}
      </div>
      <div className={styles.listItemDivider}/>
    </>
  );
}
