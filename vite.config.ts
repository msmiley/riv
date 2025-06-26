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
  plugins: [
    RivVitePlugin({
      // don't copy the demoMode field to your project! this enables this project to demo itself
      demoMode: true,
      configPath: './riv.config.js',
    }),
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
