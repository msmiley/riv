import { type RouteConfig, layout, route, prefix } from "@react-router/dev/routes";

// framework mode router
export default [
  // login/logout routes with a full-page layout
  layout("components/layouts/FullPage.tsx", [
    route('login', 'demoapp/login.tsx'),
    route('logout', 'demoapp/logout.tsx'),
  ]),
  // use framework mode with layout() as the top-level of each type of view
  layout("DemoApp.tsx", [
    route('buttons', 'demoapp/buttons.tsx'),
    route('colors', 'demoapp/colors.tsx'),
    // containers sub-menu
    ...prefix("containers", [
      route('column', 'demoapp/column.tsx'),
      route('row', 'demoapp/row.tsx'),
    ]),
    // inputs sub-menu
    ...prefix("inputs", [
      route('text', 'demoapp/inputsText.tsx'),
      route('date', 'demoapp/inputsDate.tsx'),
      route('color', 'demoapp/inputsColor.tsx'),
    ]),
    route('settings', 'demoapp/settings.tsx'),
    // fallback route
    route('*?', 'demoapp/home.tsx'),
  ]),
] satisfies RouteConfig;
