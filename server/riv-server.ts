//
// entry point for riv server, sets up basically everything on the server side
// this should be called with a config object
//
import utils from './utils.ts';

import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { EventEmitter } from 'node:events';
import { Server } from 'socket.io';
import { defaultsDeep, get, cloneDeep, isArray } from 'lodash-es';

// uncaught promise error guards
process.on('unhandledRejection', (reason, p) => {
  console.error('riv> Unhandled Rejection at Promise', reason, p);
});
// uncaught exception, exit for now, may want to log it and keep going
process.on('uncaughtException', (err) => {
  console.error('riv> Uncaught Exception thrown', err);
  process.exit(1);
});

//
// DEFAULT RIV CONFIG, anything here will be overridden by riv.config.js file
//
const DEFAULT_CONFIG = {
  name: 'riv-server',
  debug: false,            // global server-side debug flag
  // internal-use, don't override the below arguments unless you know what you're doing
  ioNs: '/riv',            // socket.io namespace
  ioSend: 'server>client', // socket.io inbound event name
  ioRecv: 'client>server', // socket.io outbound event name
  ioPing: 1000,            // ping interval over socket.io
  app: {},                 // app config, mostly for user stuff in riv.config.js
  // list of paths to user classes, built-in classes will be
  // automatically loaded from riv/shared/data, so anything in here will be
  // assumed to be relative to parent app root
  classes: [],
  // default modules
  modules: {
    analytics: {},
    'analytics/engines/mongolap': {},
    'analytics/engines/druid': {},
    auth: {},
    info: {},
    roles: {},
    users: {},
    activity: {},
    store: {},
    mongo: {},
  },
};

export class RivServer extends EventEmitter {
  // constructor also initializes EventEmitter super
  constructor({
    server,     // server object (either from vite or index)
    parentRoot, // root of parent project, used to resolve config
    configPath, // path to config.json file for riv server side
  }) {
    super();

    // up the max listeners for EventEmitter to prevent warnings
    this.setMaxListeners(1000);

    // save options locally
    this.server = server;
    this.parentRoot = parentRoot;
    this.configPath = configPath;

    this.io = null;          // handle to socket.io server
    this.config = {};        // riv config
    this.modules = {};
    this.classes = {};         // data types
    this.init();
  }
  async init() {
    await this.loadConfig();
    await this.loadModules();
    await this.loadClasses();

    // if server not provided, start one after loading config (for port num)
    // (for dev we use the vite server passed in)
    if (!this.server) {
      this.server = utils.startHttpServer(this.config.port);
    }
    // socket.io started by us for both modes
    this.connectSocketIo();

    // call init for each module, note potential out-of-order implications
    for (let m of Object.values(this.modules)) {
      if (m.init) {
        m.init();
      }
    }
  }
  // load config file and merge with default config
  async loadConfig() {
    if (this.configPath) {
      // get parent project's root folder
      console.info(`riv> loading config from ${this.configPath} at ${this.parentRoot}`);
      // try to load configPath relative to parent root
      let configMod = await import(pathToFileURL(path.resolve(this.parentRoot, this.configPath)));
      // merge down the config recursively, applying defaults last
      defaultsDeep(this.config, configMod.default, DEFAULT_CONFIG);
      // finally, let env vars override config items if they are prefixed by
      // volante_config_ and have an underscore-delimited path
      for (let [k, v] of Object.entries(process.env)) {
        // overrides have to start with volante_
        if (k.match(/^riv_/i)) {
          // split off path
          let kp = k.split(/riv_/i)[1].split('_').join('.');
          console.info(`riv> env var override: ${kp}=${v}`);
          utils.deepSet(this.config, kp, v);
        }
      }
      console.info(`riv> done loading config, name = ${this.config.name}`);
    }
  }
  // initialize socket.io and wire up the riv api layer
  connectSocketIo() {
    // connect socket.io to http server
    console.info('riv> setting up socket.io');
    this.io = new Server(this.server.httpServer ?? this.server, {
      path: '/socket.io',
    });

    // set up ping broadcast
    setInterval(() => {
      this.io.of(this.config.ioNs).emit(this.config.ioSend, 'ping', {
        ts: new Date(),
        hostname: os.hostname(),
      });
    }, this.config.ioPing);

    // set up event listener
    this.io.of(this.config.ioNs).on('connection', (socket) => {
      let clientIp = socket.request.connection.remoteAddress;
      let token = socket.handshake.auth.token;
      // the user object for this socket session, will start out null until user
      // is successfully authenticated and connects with a valid token
      let user_id = null;
      let user = null;

      if (!token) {
        console.warn(`riv> socket.io connection with no token, only login will be allowed`);
      } else {
        // validate the sent token
        let tokenValid = this.modules.Auth.validateToken(token);
        if (tokenValid) {
          user_id = tokenValid.sub;
          let tokenType = tokenValid.aud;
          // use tokenType for 2fa, etc.
          user = cloneDeep(this.modules.Users.userById(user_id));
          if (user_id && user) {
            // save user_id to socket handle so we can look up this socket by user_id
            socket.user_id = user_id;
            // delete fields we don't need to be passing around
            delete user.mustChangePass;
            delete user.password;
            // collect roles and permissions for easy access by methods
            let roleInfo = this.modules.Roles.getAllRoleInfo(user.role_ids);
            user.roles = roleInfo.roles;
            user.permissions = roleInfo.permissions;
            // tell client user is valid and provide permissions
            socket.emit(this.config.ioSend, 'riv-update-user', user);
            // give client the app config object
            socket.emit(this.config.ioSend, 'riv-app-config', this.config.app);
            console.log('riv> user authenticated', user_id, user.username);
          } else {
            // tell client token is invalid so it will delete and stop using it
            socket.emit(this.config.ioSend, 'riv-invalid-token');
            console.warn(`riv> socket.io connection with invalid token`, token);
          }
        }
      }
      console.info(`riv> new connection from ${clientIp}`);
      // process received messages
      socket.on(this.config.ioRecv, (d) => {
        // console.info(`riv> api call`, util.inspect(d, { colors: true, depth: null }));
        // make sure message is valid api call
        if (d.id && d.api && d.args) {
          // if user is not authenticated, only allow call to Auth.login and 2fa
          if (!user) {
            if (d.api !== 'Auth.login' && d.api !== 'Auth.checkTwoFa') {
              socket.emit(d.id, 'unauthorized, please login');
              socket.emit(this.config.ioSend, 'riv-logged-out');
              return;
            }
          }
          // setTimeout(() => { // uncomment to add artificial delay
            // call the local api and emit promise result for client
            try {
              // use helper to call the local api function
              this.callApi(user, clientIp, d).then((data) => {
                // try to resolve type and send it
                let type = 'generic';
                if (data && data.constructor) {
                  // this should be Number, String, Date, Array, Object, or custom class name
                  type = data.constructor.name;
                }
                // emit to the client-side with the id so it can be matched up to the request
                socket.emit(d.id, null, {
                  type,
                  data,
                });
                // if this was an Auth.login, disconnect the client so it can reconnect
                // with the token
                if (d.api === 'Auth.login' || d.api === 'Auth.checkTwoFa') {
                  console.log(`riv> disconnecting user without token`);
                  return socket.disconnect(true);
                }
              }).catch((err) => { // this catches errors thrown by api call
                console.log(`riv> error in callApi`, err);
                socket.emit(d.id, `${err}`);
              });
            } catch (e) { // this catches errors related to api (e.g. destructuring errors)
              socket.emit(d.id, `couldn't call api: ${e}`);
              console.warn(`riv> couldn't call api: ${d.api}, error: ${e}`);
            }
          // }, 1000);
        } else {
          console.warn(`riv> client tried to send incomplete api call`);
        }
      });
    });

    // set up local event listeners
    this.on('sendToUserId', (user_id, ...args) => {
      this.sendToUserId(user_id, ...args);
    });
    this.on('sendToAllUsers', (...args) => {
      this.sendToAllUsers(...args);
    });
  }
  // load modules from config
  async loadModules() {
    // load and wire up modules
    for (let [relPath, propOverrides] of Object.entries(this.config.modules)) {
      // try to find the module using a number of methods
      let { mod, modPath, errors } = await utils.findModule(this.parentRoot, relPath);
      // only required field is name, if the mod loaded has that, proceed
      if (mod && mod.default && mod.default.name) {
        console.log(`riv> found module with relative path ${relPath} at ${modPath}`);
        // initial load
        this.loadModule(mod, propOverrides);
        // file watcher to reload module if it changes (ONLY IN DEBUG MODE)
        if (this.config.debug) {
          console.log('riv> in debug mode; watching module files for changes');
          fs.watchFile(modPath, async () => {
            console.log(`riv> module ${modPath} changed on disk; reloading`);
            // re-import using cache-busting query param (only way to make it work)
            // note that ESM modules are not currently garbage collected so this could cause
            // memory leak if for some reason module files are being touched repeatedly
            mod = await import(`${pathToFileURL(modPath)}?ts=${Date.now()}`);
            this.loadModule(mod, propOverrides);
          });
        }
      } else {
        console.error(`riv> module ${relPath} not found relative to riv or in ${this.parentRoot}`);
        if (errors.length > 0) {
          console.error('riv> possible errors:', errors);
        }
      }
    }
  }
  // takes a loaded module and prepares it for use on server side
  loadModule(mod, propOverrides) {
    let moduleDef = mod.default;
    console.log(`riv> loadModule called for ${moduleDef.name}`);
    let newMod = {
      name: moduleDef.name,
      $: this.modules,      // reference for module to call peers e.g. this.$.<peer>.
      $class: this.classes, // reference to class definitions
      $parentRoot: this.parentRoot,
      init: moduleDef.init,
    };
    utils.addBuiltins(newMod, moduleDef.name, this);
    utils.addEvents(newMod, moduleDef.events, this);
    utils.addProps(newMod, moduleDef.props, propOverrides);
    utils.addData(newMod, moduleDef.data, this);
    utils.addApi(newMod, moduleDef.api);
    utils.addMethods(newMod, moduleDef.methods);
    // save to modules with name as key
    this.modules[moduleDef.name] = newMod;
  }
  // loads class definitions from array of directories
  async loadClasses() {
    // load built-in classes
    let builtIns = await utils.findClasses(path.join(utils.findRoot(), '/shared/data'));
    Object.assign(this.classes, builtIns);
    // load classes from array of user paths (config.classes)
    if (isArray(this.config.classes)) {
      for (let classPath of this.config.classes) {
        console.log(`riv> loading user data classes from ${classPath}`);
        let classes = await utils.findClasses(classPath);
        Object.assign(this.classes, classes);
      }
    }
    // see if any classes have a server-side init hook, if they do, call it
    for (let c of Object.values(this.classes)) {
      if (c.serverInit) {
        c.serverInit();
      }
    }
    console.log(`riv> loaded classes: ${Object.keys(this.classes).join(',')}`);
  }
  // helper/entry point for riv API calls from client-side
  callApi(user, // user object
    ip,         // user ip (obviously not always correct)
  { id,         // id to use for emitting response
    api,        // fully resolved api name e.g. Module.Api
    types,      // arg type names if known, 'generic' if unknown
    args,       // argument with above type
  }) {
    // get the module part of the api call
    let [moduleName, ...apiParts] = api.split('.');
    let apiName = apiParts.join('.');
    if (moduleName && apiName) {
      // find the module
      let module = this.modules[moduleName];
      // see if module has api
      if (module && module.$apiNames[apiName]) {
        // get the api
        let theApi = get(module, apiName);
        if (theApi) {
          // provide the api function with some built-in request info
          let req = {
            id,
            ip,
            user,
          };
          for (let i=0; i<args.length; i++) {
            // try to resolve the type on the arguments
            switch (types[i]) {
              // noops for primitives handled automatically
              case 'Array':
              case 'Boolean':
              case 'Number':
              case 'Object':
              case 'String':
              case 'generic':
                break;
              case 'Date':
                args[i] = new Date(args[i]);
                break;
              default:
                // see if there's a class with this name
                if (this.classes[types[i]]) {
                  args[i] = new this.classes[types[i]](args[i]);
                } else {
                  return Promise.reject(`received unhandled type ${types[i]} from client for api call ${api}`);
                }
            }
          }
          // check roles, only continue if user has specified roles
          // TODO
          // call the api
          let rslt = theApi(req, ...args);
          if (rslt && rslt instanceof Promise) {
            return rslt;
          } else {
            // not a promise, return resolved promise directly, no error
            return Promise.resolve(rslt);
          }
        } else {
          return Promise.reject(`can't find api: ${apiName}`);
        }
      } else {
        return Promise.reject(`can't find module: ${moduleName} or api: ${apiName}`);
      }
    }
    return Promise.reject('invalid api call');
  }
  //
  // send socket.io event to a specific user by user_id
  //
  sendToUserId(user_id, ...args) {
    console.log(`riv> sending to ${user_id}`, args);
    // coerce _id to string if we were sent an ObjectID
    if (typeof user_id === 'object') {
      user_id = `${user_id}`;
    }
    let found = false;
    // make sure the namespace exists
    if (this.io && this.io.of(this.config.ioNs) && this.io.of(this.config.ioNs).sockets) {
      // loop through all the sockets
      for (let s of this.io.of(this.config.ioNs).sockets.values()) {
        // check token value
        if (s.user_id) {
          if (s.user_id === user_id) {
            found = true;
            console.log(`riv> found user ${user_id} with active socket.io connection`);
            s.emit(this.config.ioSend, ...args);
          }
        }
      }
    }
    if (!found) {
      console.warn(`riv> could not find user ${user_id} in socket.io`);
    }
  }
  //
  // send socket.io event to all users
  //
  sendToAllUsers(...args) {
    this.io.of(this.config.ioNs).emit(this.config.ioSend, ...args);
  }
}
