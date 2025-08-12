import React from 'react';
import ListItem from './ListItem';

import type { ReactElement } from 'react';
import type { ListItemProps } from './ListItem';

interface ListProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * List: wraps ListItem children and disables divider on the last item.
 */
export default function List({ children, className, style }: ListProps) {
  const items = React.Children.toArray(children).filter(Boolean);
  const count = items.length;
  return (
    <div className={className} style={style}>
      {items.map((child, i) => {
        if (React.isValidElement(child) && child.type === ListItem) {
          return React.cloneElement(child as ReactElement<ListItemProps>, {
            noDivider: i === count - 1,
          });
        }
        return child;
      })}
    </div>
  );
}
