import React from 'react';
import { useMatches } from "react-router";
import { cls } from '../../utils';
import useSlot from '../../hooks/useSlot';
import styles from './sidebar.module.css';

import SidebarItem from './SidebarItem';

interface SidebarProps extends React.PropsWithChildren {
  routes: object[];
}

export default function Sidebar(props: SidebarProps) {
  // mini sidebar state
  const [mini, setMini] = React.useState<boolean>(true);

  return (
    <div className={styles.sidebar}>
      {/* HEADER SLOT */}
      <div className={styles.sidebarHeaderSlot}>
        {useSlot(props.children, 'header')}
      </div>
      {/* TOOLBAR */}
      <div className={styles.sidebarToolbarSlot}>
        {useSlot(props.children, 'toolbar')}
      </div>

      {/* MENU */}
      <div className={styles.sidebarMenu}>
        {props.routes.map((item, i) =>
          <SidebarItem item={item} key={i.toString()}/>
        )}
      </div>

      {/* FOOTER SLOT */}
      <div className={styles.sidebarFooterSlot}>
        {useSlot(props.children, 'footer')}
      </div>
    </div>
  );
}
