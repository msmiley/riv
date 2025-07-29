// This class provides a common structure for modules in the Riv framework.
// It includes a constructor that initializes the module name and provides a method to retrieve it.   
import type { RivServer } from '../../server/riv-server.ts';
import type { RivRequest, ConsoleLogMethod } from '../types/server.d.ts';

export interface MethodDescriptor {
  name: string;               // Name of the API method
  description?: string;       // Optional description of the method
}

export interface ApiMethodDescriptor extends MethodDescriptor {
  roles: string[];            // Roles required to access this method, open access if empty
}

export interface EventHandlerDescriptor extends MethodDescriptor {
  event: string;              // Event type this handler listens to, can be comma-separated for multiple events
}

// abstract base class for Riv modules
export abstract class RivModule {
  static type = 'riv-module';  // Type of the module, for future use in identifying different module types
  name: string;                // Name of the module
  
  // reference to other modules, set by the server
  $: Record<string, any> = {};

  // logging aliases will be assigned by the server
  $log: ConsoleLogMethod = () => {};
  $debug: ConsoleLogMethod = () => {};
  $warn: ConsoleLogMethod = () => {};
  $error: ConsoleLogMethod = () => {};
  $ready: ConsoleLogMethod = () => {};
  // alias for emitting events, can be used by modules to communicate
  $emit: (eventType: string, ...args: any[]) => void = () => {};
  $shutdown: () => void = () => {}; // shutdown method to be called by server
  $server: RivServer | null = null; // reference to the server instance

  // private fields to hold meta from decorators
  #apiMethods: ApiMethodDescriptor[] = [];  // Array to hold API method names registered in the module
  #props: string[] = [];       // Array to hold configurable property names registered in the module
  #eventHandlers: EventHandlerDescriptor[] = []; // Array to hold event handler names registered in the module
  #methods: MethodDescriptor[] = [];

  // Constructor initializes the module name based on the class name
  constructor() {
    this.name = this.constructor.name;
  }
  // helper method to register the module with the server
  // this method is called by the server when the module is loaded
  selfRegister(server: RivServer, propOverrides: Record<string, any> = {}) {
    console.info(`riv> Module self-register called for ${this.name}`);
    // override properties if provided
    if (propOverrides) {
      for (const [key, value] of Object.entries(propOverrides)) {
        if (this.hasProp(key)) {
          (this as any)[key] = value; // set the property to the provided value
          console.info(`riv> Property ${key} overridden to ${value}`);
        } else {
          console.warn(`riv> Property ${key} not found in module ${this.name}, skipping override`);
        }
      }
    }
    // self-register the module with the server
    server.modules[this.name] = this;
    // set the server reference for this module
    this.$server = server; 
    // Assign the server's modules to this instance for easy access
    this.$ = server.modules;
    // Assign logging methods from the server
    this.$log = (...args) => { server.$log.apply(server, [ this.name, ...args ]) };
    this.$debug = (...args) => { server.$debug.apply(server, [ this.name, ...args ]) };
    this.$warn = (...args) => { server.$warn.apply(server, [ this.name, ...args ]) };
    this.$error = (...args) => { server.$error.apply(server, [ this.name, ...args ]) };
    this.$ready = (...args) => { server.$ready.apply(server, [ this.name, ...args ]) };
    // Assign the emit method for event communication
    this.$emit = server.emit.bind(server);
    // Assign the shutdown method for server shutdown
    this.$shutdown = () => { server.$shutdown.apply(server, [ this.name ]) };
    // register event handlers
    for (const handler of this.#eventHandlers) {
      console.log(`riv> event handler registered: ${this.name}.${handler.name} listening for ${handler.event}`);
      if (handler.event.includes(',')) {
        // multi-event handler, won't execute until all events have fired BUT only happens ONCE
        console.log(`riv> registering multi-event handler for ${handler.event}`);
        let eventData: Record<string,any> = {};
        for (let e of handler.event.split(',')) {
          eventData[e] = null; // initial value
          // register for this event
          server.once(e, (...args: any[]) => {
            // collect arguments for later
            eventData[e] = args;
            // see if we have a value for all requested events
            let itsgotime = Object.keys(eventData).reduce((acc, key) => {
              return acc && !!eventData[key];
            }, true);
            // if it's go time, call the handler with all the event args
            if (itsgotime) {
              (this as any)[handler.name].bind(this)(eventData);
            }
          });
        }
      } else {
        // repeating event handler
        server.on(handler.event, (this as any)[handler.name].bind(this));
      }
    }
  }

  // Method to register an API method, used by decorators
  registerApiMethod(name: string, roles: string[], description: string): void {
    this.#apiMethods.push({
      name,
      roles,
      description
    } as ApiMethodDescriptor);
  }
  // Method to check if an API method is registered
  hasApiMethod(name: string): boolean {
    return this.#apiMethods.some(method => method.name === name);
  }
  // Method to call an API method dynamically
  callApiMethod(name: string, req: RivRequest, arg: any): any {
    if (!this.hasApiMethod(name)) {
      throw new Error(`API method ${name} not found in module ${this.name}`);
    }
    // find the method in the module
    const method = (this as any)[name];
    if (typeof method !== 'function') {
      throw new Error(`Method ${name} is not a function in module ${this.name}`);
    }
    // Call the method dynamically with the RivRequest as the first argument always
    return method(req, arg);
  }
  // Method to register a property, used by decorators
  registerProp(name: string): void {
    this.#props.push(name);
  }
  // Method to check if a property is registered
  hasProp(name: string): boolean {
    return this.#props.includes(name);
  }
  // Method to register an event handler, used by decorators
  registerEventHandler(name: string, event: string, description: string): void {
    console.log(`riv> event handler registered: ${this.name}.${name}`);
    this.#eventHandlers.push({
      name,
      event,
      description
    } as EventHandlerDescriptor); 
  }
  // Method to check if an event handler is registered
  hasEventHandler(name: string): boolean {
    return this.#eventHandlers.some(handler => handler.name === name);
  }
  registerMethod(name: string, description: string): void {
    this.#methods.push({
      name,
      description,
    } as MethodDescriptor);
  }
}

////////////////////////////
// DECORATORS
////////////////////////////
// PROP
export function Property(description: string) {
  return function(
    originalField: any,
    context: ClassFieldDecoratorContext<RivModule, any>
  ) {
    const name = String(context.name);
    context.addInitializer(function () {
      console.log(`riv> Prop registered: ${this.name}.${name}`);
      // this.name is class name
      this.registerProp(name);
    });
  }
}
// API METHOD
export function ApiMethod(description: string, ...roles: string[]) {
  return function(
    originalMethod: (this: any, ...args: any[]) => any,
    context: ClassMethodDecoratorContext<RivModule, (this: RivModule, ...args: any[]) => any>
  ): void | ((this: RivModule, ...args: any[]) => any) {
    const name = String(context.name);
    context.addInitializer(function () {
      // this.name is class name
      console.log(`riv> API method registered: ${this.name}.${name}`);
      // bind the method to the instance so we can call it easily from callApiMethod
      (this as any)[name] = (this as any)[name].bind(this);
      // add to apiMethods array
      this.registerApiMethod(name, roles, description);
    });
    return originalMethod;
  }
}
// EVENT HANDLER
export function EventHandler(event: string, description: string) {
  return function (
    originalMethod: (this: any, ...args: any[]) => any,
    context: ClassMethodDecoratorContext<RivModule, (this: RivModule, ...args: any[]) => any>
  ): void | ((this: RivModule, ...args: any[]) => any) {
    const name = String(context.name);
    context.addInitializer(function () {
      // this.name is class name
      console.log(`riv> event handler registered: ${this.name}.${name}`);
      // bind the method to the instance so we can call it easily from handleEvent
      (this as any)[name] = (this as any)[name].bind(this);
      // add to eventHandlers array
      this.registerEventHandler(name, event, description);
    });
    return originalMethod;
  }
}
// METHOD
export function Method(description: string) {
  return function (
    originalMethod: (this: any, ...args: any[]) => any,
    context: ClassMethodDecoratorContext<RivModule, (this: RivModule, ...args: any[]) => any>
  ): void | ((this: RivModule, ...args: any[]) => any) {
    const name = String(context.name);
    context.addInitializer(function () {
      // this.name is class name
      console.log(`riv> Regular method registered: ${this.name}.${name}`);
      // bind the method to the instance so we can call it easily from callApiMethod
      (this as any)[name] = (this as any)[name].bind(this);
      // add to apiMethods array
      this.registerMethod(name, description);
    });
    return originalMethod;
  }
}
