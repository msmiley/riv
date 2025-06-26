import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { defaultsDeep, pick } from 'lodash-es';

export default {
  // start http server for RELEASE mode (vite provides server for dev)
  startHttpServer(port = 5000) {
    console.info('riv> starting http server in RELEASE mode');
    let server = http.createServer().listen(port, () => {
      console.log(`riv> http listening on port ${port}`);
    });
    // set up handler to serve app files
    server.on('request', (req, res) => {
      let filePath = './index.html';
      var contentType = 'text/html';
      // handle exceptions
      if (req.url.endsWith('.ttf')) {
        contentType = 'application/octet-stream';
        filePath = req.url;
      } else if (req.url === '/favicon.ico') {
        contentType = 'image/x-icon';
        filePath = req.url;
      } else if (req.url === '/logo.png') {
        contentType = 'image/png';
        filePath = req.url;
      } else if (req.url.startsWith('/assets')) {
        filePath = `.${req.url}`;
        let ext = path.extname(filePath);
        contentType = 'text/html';
        switch (ext) {
          case '.js':
            contentType = 'text/javascript';
            break;
          case '.css':
            contentType = 'text/css';
            break;
          case '.json':
            contentType = 'application/json';
            break;
          case '.png':
            contentType = 'image/png';
            break;
          case '.jpg':
            contentType = 'image/jpg';
            break;
        }
      } else if (req.url.startsWith('/socket.io')) {
        return; // do nothing, let socket.io take over
      }
      let fullPath = path.join('dist', filePath);
      fs.readFile(fullPath, function(error, content) {
        if (error) {
          if (error.code == 'ENOENT'){
            res.writeHead(404);
            res.end('riv> file not found');
          } else {
            res.writeHead(500);
            res.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
          }
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content, 'utf-8');
        }
      });
    });
    return server;
  },
  //
  // helper to set a value deep in an object using dot path
  //
  deepSet(obj, path, value) {
    let a = path.split('.');
    let o = obj;
    while (a.length - 1) {
      let n = a.shift();
      if (!(n in o)) {
        o[n] = {};
      }
      o = o[n];
    }
    // check for basic type primitives and coerce
    switch (typeof o[a[0]]) {
      case 'number':
        o[a[0]] = parseFloat(value);
        break;
      case 'boolean':
        o[a[0]] = value === 'true';
        break;
      case 'object':
        o[a[0]] = JSON.parse(value);
        break;
      default: // string, etc.
        o[a[0]] = value;
        break;
    }
  },
  //
  // function to look in a bunch of places to find modules called out in riv.config
  //
  async findModule(root, relPath) {
    // worker function to try all path variations
    let tryFindModule = async (root, relPath) => {
      let mod;
      let modPath = relPath;
      let errors = []; // collect errors
      // 1. try relative path
      try {
        mod = await import(pathToFileURL(`./${relPath}`));
      } catch (e) {
        errors.push(e);
      }
      // 2. try relative to riv server folder
      if (!mod) {
        try {
          modPath = path.resolve(this.findRoot(), 'server', relPath);
          mod = await import(pathToFileURL(modPath));
        } catch (e) {
          errors.push(e);
        }
      }
      // 3. try relative to parent project root
      if (!mod) {
        try {
          modPath = path.resolve(root, relPath);
          mod = await import(pathToFileURL(modPath));
        } catch (e) {
          errors.push(e);
        }
      }
      // 4. try node_modules in nearest root, this handles cases where riv is a dep
      if (!mod) {
        try {
          modPath = path.resolve(this.findRoot(), 'node_modules/riv/server', relPath);
          mod = await import(pathToFileURL(modPath));
        } catch (e) {
          errors.push(e);
        }
      }
      return {
        mod,
        modPath,
        errors,
      };
    };

    let mod, modPath;
    let errors1 = [];
    let errors2 = [];
    // 1. try adding .ts extension if not there (ES6 doesn't allow us to import without an extension 😢 ))
    let tsPath = relPath;
    if (tsPath.lastIndexOf('.') < 0) {
      tsPath += '.ts';
    }
    ({ mod, modPath, errors: errors1 } = await tryFindModule(root, tsPath));
    // 2. if .ts didn't work, try adding /index.ts in case it's a folder with index.ts inside
    if (!mod) {
      // try adding /index.ts in case it is a dir module
      let idxPath = `${relPath}/index.ts`;
      ({ mod, modPath, errors: errors2 } = await tryFindModule(root, idxPath));
    }
    return {
      mod,
      modPath,
      errors: [ ...errors1, ...errors2 ], // aggregate all errors
    };
  },
  __dirname() {
    return path.dirname(fileURLToPath(import.meta.url));
  },
  findRoot(p = this.__dirname()) {
    // console.log(`riv> findRoot starting in ${p}`);
    var rpath = path.resolve(p);
    if (fs.existsSync(path.join(rpath, 'package.json'))) {
      // console.log(`riv> findRoot found package.json in ${p}`);
      return rpath;
    } else {
      var parent = path.dirname(rpath);
      // console.log(`riv> findRoot traversing up to ${parent}`);
      if (parent !== rpath) {
        return this.findRoot(parent);
      } else { // failsafe - means we got all the way to root
        // if a parent root cannot be found, naively default to using our own root
        return this.__dirname();
      }
    }
  },
  findFiles(p, ext = '.ts') {
    return fs.globSync(`${p}/**/*${ext}`);
  },
  async findClasses(p) {
    let ret = {};
    let files = this.findFiles(p);
    for (let f of files) {
      let cls = await import(pathToFileURL(f));
      let name = Object.keys(cls)[0];
      ret[name] = cls[name];
    }
    return ret;
  },
  // register handled events
  addEvents(mod, events, ctx) {
    if (events) {
      for (let [k, v] of Object.entries(events)) {
        // multi-event handler, only fires when all comma-separated events
        // have been emitted
        if (k.indexOf(',') > -1) {
          // multi-event handler, won't execute until all events have fired
          // BUT only happens ONCE
          console.log(`riv> registering multi-event handler for ${k}`);
          let eventData = {};
          for (let e of k.split(',')) {
            eventData[e] = null; // initial value
            // register for this event
            ctx.once(e, (...args) => {
              // save arguments
              eventData[e] = args;

              // see if we have a value for all requested events
              let itsgotime = Object.keys(eventData).reduce((acc, key) => {
                return acc && !!eventData[key];
              }, true);

              // if it's go time, call the handler with event args
              if (itsgotime) {
                v.bind(mod)(eventData);
              }
            });
          }
        } else {
          // traditional event register, using method inherited from EventEmitter
          ctx.on(k, v.bind(mod));
        }
      }
    }
  },
  // add properties to module
  addProps(mod, props, propOverrides) {
    if (props) {
      // save off list of "official" prop field names
      mod.$propNames = Object.keys(props);
      // merge in prop overrides, but for only "official" prop fields
      defaultsDeep(mod, pick(propOverrides, mod.$propNames), props);
    } else {
      mod.$propNames = [];
    }
  },
  // add data members
  addData(mod, data, ctx) {
    if (data) {
      // apply data twice so values can settle if they are dependent
      let appliedData = data.apply(ctx);
      Object.assign(mod, appliedData);
      Object.assign(mod, data.apply(ctx));
      mod.$dataKeys = Object.keys(appliedData);
    } else {
      mod.$dataKeys = [];
    }
  },
  // add api functions to module, api functions have an optional syntax for informing
  // riv which permissions a user should have to be able to call the api.
  // this syntax is:
  // <apiName>:<permission>,<permission>,...
  // where apiName is the name of the api function, and permission can be one or more
  // comma delimited permissions. The api call will only be allowed if the calling
  // user has been assigned one of the permissions listed.
  addApi(mod, api) {
    // track api names for validation and permissions checking, array of subobjects
    // with { name: '', permissions: [] }
    mod.$apiNames = {};
    if (api) {
      // allow recursion on module api functions to enable 'namespacing'
      // of api through the use of sub-objects
      let recur = function(obj, parent, path = []) {
        for (let [k, v] of Object.entries(obj)) {
          if (typeof(v) === 'function') {
            let name = k;
            let permissions = [];
            // if name uses riv-permissions-syntax, split it up
            if (name.includes(':')) {
              let s = name.split(':');
              name = s[0];
              for (let p of s[1].split(',')) {
                permissions.push(p);
              }
            }
            // generate a fully qualified api name
            let fullApiName = [...path, name].join('.');
            // save permissions extracted from function name, empty if all allowed
            mod.$apiNames[fullApiName] = permissions;
            // bind function by its name-only to parent (permissions stripped)
            parent[name] = v.bind(parent);
          } else if (typeof(v) === 'object') { // recur
            parent[k] = {}; // initialize 'namespace'
            recur(v, parent[k], [...path, k]);
          }
        }
      };
      recur(api, mod);
    }
  },
  // add methods (not callable from client) to module
  addMethods(mod, methods) {
    if (methods) {
      // allow recursion on module methods to enable 'namespacing'
      // of methods through the use of sub-objects
      let recur = function(obj, parent) {
        for (let [k, v] of Object.entries(obj)) {
          if (typeof(v) === 'function') {
            // bind function to parent
            parent[k] = v.bind(parent);
          } else if (typeof(v) === 'object') { // recur
            parent[k] = {}; // initialize 'namespace'
            recur(v, parent[k]);
          }
        }
      };
      recur(methods, mod);
    }
  },
  // add built-in ($-prefixed) methods
  addBuiltins(mod, name, ctx) {
    mod.$log = (...args) => {
      ctx.modules.Activity.log(name, ...args);
    };
    mod.$debug = (...args) => {
      ctx.config.debug && ctx.modules.Activity.debug(name, ...args);
    };
    mod.$warn = (...args) => {
      ctx.modules.Activity.warn(name, ...args);
    };
    mod.$error = (...args) => {
      ctx.modules.Activity.error(name, ...args);
    };
    mod.$ready = (...args) => {
      if (args.length === 0) { // if no msg provided, print "ready"
        args[0] = 'ready';
      }
      ctx.modules.Activity.ready(name, ...args);
      ctx.emit(`${name}.ready`);
    };
    // server-side emit, doesn't go client side unless eventType is sendToUserId or sendToAllUsers
    mod.$emit = (eventType, ...args) => {
      ctx.emit(eventType, ...args);
    };
  }
};
