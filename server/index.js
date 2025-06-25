#!/usr/bin/env node
// production file, dev is implemented as vite middleware

import { RivServer } from 'riv/riv-server.js';

let configPath = './riv.config.js';

// see if config file was provided as first argument
if (process.argv.length > 2) {
  configPath = process.argv[2];
}

new RivServer({
  parentRoot: process.cwd(),
  configPath,
});

