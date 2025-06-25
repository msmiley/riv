// DEMO APP LAYOUT
import { Outlet } from 'react-router';

import SidebarOnly from "./components/layouts/SidebarOnly";
import Slot from './components/slots/Slot';

import RivLogo from './components/misc/RivLogo';

// pull in config file
import RivConfig from '../riv.config.js';

export default function DemoApp() {
  return (
    <SidebarOnly routes={RivConfig.app.routes}>
      <Slot name="header">
        <RivLogo/>
      </Slot>
    </SidebarOnly>
  );
}
