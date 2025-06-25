import { Outlet } from 'react-router';
import { PropsWithChildren } from 'react';

import Row from '../containers/Row';
import Sidebar from '../sidebar/Sidebar';

interface SidebarOnlyProps extends PropsWithChildren {
  routes: Array; // routes array
}

export default function SidebarOnly(props: SidebarOnlyProps) {
  return (
    <Row grow gap="0">
      {/* SIDEBAR (RECEIVES ALL SLOTS) */}
      <Sidebar routes={props.routes} children={props.children}/>

      {/* CONTENT OUTLET */}
      <div className="riv-sidebar-only-content">
        <Outlet/>
      </div>
    </Row>
  );
}
