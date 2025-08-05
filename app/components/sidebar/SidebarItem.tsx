import React from 'react';
import { NavLink, useLocation } from 'react-router';
import { cls } from '../../utils';
import styles from './sidebar.module.css';
import Icon from '../icons/Icon';

import SidebarSubRoutes from './SidebarSubRoutes';

interface SidebarItemProps extends React.PropsWithChildren {
  item: {[key: string]: any};
}

export default function SidebarItem(props: SidebarItemProps) {
  const loc = useLocation();

  // sub-menu  open state
  const [isOpen, setIsOpen] = React.useState<boolean>(() => {
    // if this item has children, expand if current route matches a child path
    if (props.item.children && Array.isArray(props.item.children)) {
      const current = loc.pathname;
      return props.item.children.some((child: any) =>
        typeof child.path === 'string' && current.startsWith(child.path)
      );
    }
    return false;
  });

  // toggle isOpen
  function handleClick() {
    setIsOpen(!isOpen);
  }

  // render sidebar item differently based on whether it has children or not
  if (props.item.category) {
    // CATEGORY
    return (
      <div className={styles.sidebarItemCategory}>
        {props.item.title}
      </div>
    );
  } else if (props.item.children) {
    // ITEM WITH CHILDREN
    return (
      <div className={cls(styles.sidebarItem, { bottom: props.item.sidebarBottom })}
           style={{
             '--riv-sidebar-item-bg': props.item.color,
           } as React.CSSProperties}>
        <a className={styles.sidebarItemLink} onClick={handleClick}>
          <div className={styles.sidebarItemIcon}>
            <Icon name={props.item.icon}/>
          </div>
          {props.item.title}
        </a>
        <SidebarSubRoutes isShown={isOpen} routes={props.item.children}/>
      </div>
    );
  } else {
    // REGULAR ITEM
    return (
      <div className={cls(styles.sidebarItem, { bottom: props.item.sidebarBottom })}>
        <NavLink to={props.item.path}
              className={styles.sidebarItemLink}>
          <div className={styles.sidebarItemIcon}>
            <Icon name={props.item.icon}/>
          </div>
          {props.item.title}
        </NavLink>
      </div>
    );
  }
}
