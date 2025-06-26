// riv configuration file
// you will need a file like this in the root of your riv project
// use the comments below as a guide to what you need to keep/set in yours
//
export default {
  name: 'riv-demo-app',  // global project name, set this to your project name
  port: 5500,            // port for web server, only used in production mode (non-Vite)
  debug: true,           // enables debug messages
  // app config object will be available at the Web app, under this.$riv.config
  // don't put anything sensitive in this object, it will be the same for all users
  app: {
    exampleField: 'hello',
    verboseActivityTracking: true, // add this to app to enable tracking all clicks
    // sidebar route setup, note that this is independent of the route setup
    // in app/routes.ts
    routes: [
      {
        title: '<username>',
        iconComponent: '',
        color: 'var(--riv-sidebar-user-menu-bg)',
        children: [
          {
            title: 'Profile',
            path: '/profile',
          },
          {
            title: 'Logout',
            path: '/logout',
          },
        ],
      },
      {
        title: 'Buttons',
        path: '/buttons',
        icon: 'button',
      },
      {
        title: 'Colors',
        path: '/colors',
        icon: 'colors',
      },
      {
        title: 'Containers',
        icon: 'container',
        children: [
          {
            title: 'Column',
            path: '/containers/column',
          },
          {
            title: 'Row',
            path: '/containers/row',
          },
        ]
      },
      {
        title: 'Inputs',
        icon: 'textfield',
        children: [
          {
            title: 'Text',
            path: '/inputs/text',
          },
          {
            title: 'Date',
            path: '/inputs/date',
          },
          {
            title: 'Color',
            path: '/inputs/color',
          },
        ]
      },
      {
        title: 'Server',
        category: true,
      },
      {
        title: 'Socket.io',
        path: '/socketio',
        icon: 'plug',
      },
      {
        title: 'Settings',
        path: '/settings',
        icon: 'gear',
        sidebarBottom: true,
        color: 'var(--riv-indigo)',
      },
    ],
  },
  // classes: ['./shared/data'], // uncomment this and set to folder of JS classes
  // module config both dictates which modules to load and is also used to
  // provide/override props for those modules
  modules: {
    // example of loading a user-defined module in the same folder as front-end app code
    auth: {
      // enable2fa: true,
    },
    activity: {
      // if set to a log level string ('error', 'warn', 'log', 'ready'),
      // forwards log messages up to the highest provided level
      // if true, records everything but debug
      preserveLogLevel: 'error',
    },
    // example settings for particular engine:
    // 'analytics/engines/druid': {
    //   timeout: 60000,
    // },
    analytics: {
      loadExampleData: true,          // load example data into an "example" dataset
      datasets: {
        activity: {
          engine: 'Mongolap',         // name of module which handles Analytics api calls
          store: 'riv.activity',      // needed to inform mongo about database name
          timestamp: 'Timestamp',     // name of timestamp field (default is 'Timestamp')
          measures: [ 'EventCount' ], // call out which fields should be considered measures
        },
        kttm1: {
          engine: 'Druid',
          url: 'http://localhost:8888', // engine-specific parameter
          // Druid allows array for store, for a union of the specified dataSources
          store: ['kttm1', 'wikipedia'],
        },
      },
    },
    mailer: { // add this to enable email
      enabled: true,
      testAccount: true,
      // uncomment the following to set your SMTP server settings
      // transport: {
      // }
    },
    mongo: { // built-in mongo module
      enabled: true,
      host: '127.0.0.1',
      port: 27017,
      // debug: true,
      rivDatabase: 'riv', // default is riv but change this to use a different db for built-in collections
    },
    roles: { // add this to extend the built-in permissions with your own custom perms
      permissions: {
        examplePerm: { // add an entry like this for each of your custom permissions
          title: 'Example Perm',
          description: 'Test permission for riv demo',
          category: 'Example Category',
        },
      },
    },
  },
};
