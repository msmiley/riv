import { type RouteConfig, layout, route, prefix } from "@react-router/dev/routes";

// framework mode router
export default [
  layout("components/layouts/FullPage.tsx", [
    route('login', 'demoapp/login.tsx'),
    route('logout', 'demoapp/logout.tsx'),
  ]),
  // use framework mode with layout() as the top-level of each type of view
  layout("DemoApp.tsx", [
    route('buttons', 'demoapp/buttons.tsx'),
    // containers sub-menu
    ...prefix("containers", [
      route('row', 'demoapp/row.tsx'),
    ]),
    route('settings', 'demoapp/settings.tsx'),
    // fallback route
    route('*?', 'demoapp/home.tsx'),
  ]),
] satisfies RouteConfig;
