import { Outlet } from 'react-router';
import { PropsWithChildren } from 'react';
import styles from './layouts.module.css';

import Sidebar from '../sidebar/Sidebar';

interface SidebarOnlyProps extends PropsWithChildren {
  routes: Array; // routes array
}

export default function SidebarOnly(props: SidebarOnlyProps) {
  return (
    <div className={styles.sidebarOnly}>
      {/* SIDEBAR (RECEIVES ALL SLOTS) */}
      <Sidebar routes={props.routes} children={props.children}/>

      {/* CONTENT OUTLET */}
      <div className={styles.sidebarOnlyContent}>
        <Outlet/>
      </div>
    </div>
  );
}
