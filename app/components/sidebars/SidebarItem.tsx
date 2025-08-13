import React from 'react';
import { NavLink, useLocation } from 'react-router';
import { cls } from '../../utils';
import styles from './sidebar.module.css';
import Icon from '../icons/Icon';

import SidebarSubRoutes from './SidebarSubRoutes';

// register components which can be used in sidebar as titleComponent/iconComponent/badgeComponent
import UsernameText from '../text/UsernameText';
import DarkModeToggle from '../misc/DarkModeToggle';
import UserAvatar from '../images/UserAvatar';

// Simple registry to resolve string component names from config
const SidebarSubComponents: Record<string, React.ComponentType<any>> = {
  UsernameText,
  DarkModeToggle,
  UserAvatar,
};

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

  // optional iconComponent
  let IconComp: any = props.item.iconComponent;
  if (typeof IconComp === 'string') {
    IconComp = SidebarSubComponents[IconComp];
  }
  const itemIcon = IconComp ? (
    <IconComp/>
  ) : (
    <Icon name={props.item.icon} />
  );

  // render title or titleComponent (string name resolves via registry, or direct component reference)
  let TitleComp: any = props.item.titleComponent;
  if (typeof TitleComp === 'string') {
    TitleComp = SidebarSubComponents[TitleComp];
  }
  const itemTitle = TitleComp ? (
    <TitleComp/>
  ) : (
    props.item.title
  );

  // optional badge component rendered to the right of the title
  let BadgeComp: any = props.item.badgeComponent;
  if (typeof BadgeComp === 'string') {
    BadgeComp = SidebarSubComponents[BadgeComp];
  }
  // Prevent clicks within the badge area from triggering NavLink or toggles
  const stopNav: React.MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const itemBadge = BadgeComp ? (
    <div className={styles.sidebarItemComponentWrapper}
         onClick={stopNav}
         onMouseDown={stopNav}>
      <BadgeComp />
    </div>
  ) : null;

  // render sidebar item differently based on whether it has children or not
  if (props.item.category) {
    // CATEGORY
    return (
      <div className={styles.sidebarItemCategory}>
        {itemTitle}
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
            {itemIcon}
          </div>
          <div className={styles.sidebarItemTitle}>
            <span>{itemTitle}</span>
            {itemBadge}
          </div>
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
            {itemIcon}
          </div>
          <div className={styles.sidebarItemTitle}>
            <span>{itemTitle}</span>
            {itemBadge}
          </div>
        </NavLink>
      </div>
    );
  }
}
