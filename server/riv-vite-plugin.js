//
// Vite Plugin to load riv-backend
//
//
export default function({ configPath, demoMode }) {
  console.log(`riv> installing riv-vite-plugin with config at ${configPath}`);
  return {
    name: 'riv-vite-plugin',
    // main entry point called by vite plugin API, it is provided with
    // the vite server, which we will use to set up riv-server
    configureServer: async (server) => {
      let serverLoc = demoMode ? './server/riv-server.js' : 'riv/riv-server.js';
      const { RivServer } = await import(serverLoc);
      console.log('riv> configureServer', RivServer);
      // // start riv-server with options provided in vite plugin section
      // new RivServer({
      //   server,
      //   parentRoot: process.cwd(),
      //   ...arguments[0], // add all plugin options
      // });
    },
  };
}

