//
// Base class for shared data structures in riv,
// which traverse riv framework from client to server, provides built-in handling
// for saving, logging, state maintenance, etc.
//
import { defaultsDeep, pick } from 'lodash-es';

// extend this class like this:
// import { RivData } from './riv-data.ts';
// export class MyData extends RivData {
//   constructor(obj = {}, defaults = { // defaults should include ALL your local fields, even if they're just null
//     field1: 'default value',
//     field2: 'default value 2',
//   }) {
//     super(obj, defaults);
//   }
// }
export class RivData {
  //////////////////////////////////////////////////////////////////////////////
  // private properties
  //////////////////////////////////////////////////////////////////////////////
  #isOnClient = false; // true when we are on browser/client
  #saveHooks = [];     // hook functions to call on save action
  #sockets = [];       // sockets to use for sync operations
  #loggers = [];       // loggers to use for logging operations
  //////////////////////////////////////////////////////////////////////////////
  // see example above for how to use this constructor
  //////////////////////////////////////////////////////////////////////////////
  constructor(obj = {}, defaults = {}) {
    //
    // merge defaults in with provided object, note that all fields should be present
    // in defaults in order for them to be set locally, otherwise they will be ignored
    //
    defaultsDeep(this, pick(obj, Object.keys(defaults)), defaults);

    // use explicit binds for methods used under Proxy
    // (this will mainly apply to Vue/client side)
    this.log = this.log.bind(this);
    this.addSaveHook = this.addSaveHook.bind(this);
    this.save = this.save.bind(this);

    // set up flags with explicit binds to handle Proxy wrapper
    Object.defineProperty(this, 'isOnClient', {
      get: (function() {
        return this.#isOnClient;
      }).bind(this),
      set: (function(value) {
        this.#isOnClient = value;
      }).bind(this),
    });
  }
  //////////////////////////////////////////////////////////////////////////////
  // SOCKETS
  //////////////////////////////////////////////////////////////////////////////
  // add a socket.io socket to use for traversal
  addSocket(socket) {
    // TODO
    this.#sockets.push(socket);
  }
  //////////////////////////////////////////////////////////////////////////////
  // LOGGING
  //////////////////////////////////////////////////////////////////////////////
  addLogger(logger) {
    // TODO
    this.#loggers.push(logger);
  }
  // call all logger functions with the provided arguments
  log(...args) {
    for (let s of this.#loggers) {
      if (s && typeof(s) === 'function') {
        s(...args);
      }
    }
  }
  //////////////////////////////////////////////////////////////////////////////
  // SAVE HOOK
  //////////////////////////////////////////////////////////////////////////////
  // register a save hook (function called when save() is called)
  addSaveHook(hookFn) {
    if (this.#saveHooks.indexOf(hookFn) < 0) {
      this.#saveHooks.push(hookFn);
    }
  }
  // save function triggers all registered save hooks
  save() {
    for (let s of this.#saveHooks) {
      if (s && typeof(s) === 'function') {
        s(this);
      }
    }
  }
}
