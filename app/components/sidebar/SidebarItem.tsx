import { PropsWithChildren, useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { cls } from '../../utils';
import styles from './sidebar.module.css';
import Icon from '../icons/Icon';

import SidebarSubRoutes from './SidebarSubRoutes';

interface SidebarItemProps extends PropsWithChildren {
  item: any;
}

export default function SidebarItem(props: SidebarItemProps) {
  const loc = useLocation();

  // sub-menu  open state
  const [isOpen, setIsOpen] = useState(() => {
    // if this item has children, see if one of them is open, if so start with
    // sub-menu open by default
    if (props.item.children) {
      return `${loc.pathname}`.startsWith(props.item.path);
    }
    return false;
  });

  // toggle isOpen
  function handleClick() {
    setIsOpen(!isOpen);
  }

  // render sidebar item differently based on whether it has children or not
  if (props.item.category) {
    return (
      <div className={styles.sidebarItemCategory}>
        {props.item.title}
      </div>
    );
  } else if (props.item.children) {
    return (
      <div className={cls([styles.sidebarItem, { bottom: props.item.sidebarBottom }])}
           style={{
             '--riv-sidebar-item-bg': props.item.color,
           }}>
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
    return (
      <div className={cls([styles.sidebarItem, { bottom: props.item.sidebarBottom }])}>
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
