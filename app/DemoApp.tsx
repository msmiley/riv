// DEMO APP LAYOUT
import React from 'react';
import { Outlet, useNavigate } from 'react-router';

import SidebarOnly from "./components/layouts/SidebarOnly";
import Slot from './components/slots/Slot';

import RivLogo from './components/misc/RivLogo';
import useRiv from './hooks/useRiv';

// pull in config file
// @ts-ignore
import RivConfig from '../riv.config.js';

export default function DemoApp() {
  const riv = useRiv();
  const navigate = useNavigate();

  // auth guard: redirect to /login if not logged in
  React.useEffect(() => {
    if (!riv.getters.isLoggedIn()) {
      navigate('/login');
    }
  }, [riv.state.authState]);

  // Optionally suppress rendering content briefly if not logged in to avoid flash
  if (!riv.getters.isLoggedIn()) {
    return null;
  }

  return (
    <SidebarOnly routes={RivConfig.app.routes}>
      <Slot name="header">
        <RivLogo/>
      </Slot>
    </SidebarOnly>
  );
}
