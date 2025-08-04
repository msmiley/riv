import { fileURLToPath, URL } from 'node:url';
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";

// riv server import
import RivVitePlugin from './server/riv-vite-plugin';

export default defineConfig({
  root: 'app', // root for index.html, etc.
  esbuild: { // these flags are necessary to enable riv class sharing/syncing
    target: 'es2022',
    minifyIdentifiers: false,
    keepNames: true,
  },
  plugins: [
    // COMMENTED FOR NOW, UNTIL DECORATORS ARE WIDELY SUPPORTED
    // RivVitePlugin({
      // don't copy the demoMode field to your project! this enables this project to demo itself
      // demoMode: true,
      // configPath: './riv.config.js',
    // }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    svgr(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
});
