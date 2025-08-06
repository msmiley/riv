// built-in activity logging
// riv will use this module for logging-built in actions related to
// auth, users, and roles
//
// end-user can call the method or emit the events below to add their
// own activity log entries

import type { ActivityEntry, RivRequest } from 'shared/types/server';
import os from 'node:os';
import util from 'node:util';
import { ApiMethod, EventHandler, Method, Property, RivModule } from 'shared/base/riv-module';

export default class Activity extends RivModule {
  @Property('Preserve log level, can be "log", "warning", or "error"')
  preserveLogLevel: 'log' | 'warning' | 'error' = 'log'; // default to log level
  
  @EventHandler('Activity.addEntry', 'Add an entry to the activity log')
  // local event which can be sent from other modules to add an entry to activity log
  addEntryEventProxy(obj: ActivityEntry) {
    this.addEntry(obj);
  }
  @EventHandler('Mongo.ready', 'Add event when db is ready')
  dbReady() {
    this.addEntry({
      source: 'Activity',
      event: 'server start',
      user_id: 'system',
    });
  }

  //
  // api for finding activity entries
  //
  @ApiMethod('Query activity entries')
  findEntries(req: RivRequest, query: any) {
    return this.$.Mongo.find('rivActivity', ...this.$.Mongo.convertQuery(query));
  }
  //
  // proxy to addEntry meant to be used from client
  //
  @ApiMethod('Add an entry to the activity log from client')
  clientAddEntry(req: RivRequest, {
    source,
    event,
    eventValue,
    data,
    elapsed,
  }: any) {
    return this.addEntry({
      component: 'Client', // force this when this API is used
      source,
      event,
      eventValue,
      data,
      elapsed,
      req, // add in the req data provided by API layer
    });
  }

  @Method('Add an entry to the activity log')
  // add an entry to the activity log, this is meant to only be called locally, if you need
  // to activity a client-side event, add a server api which provides context
  addEntry({
    timestamp = new Date(), // default to now if not provided
    source,         // source: Client, Server, additional system pieces added
    component = 'Server', // component name
    event,           // the event name, what action was taken
    eventValue,      // the supporting event value
    level = "event", // severity level (optional) default is an event type
    data = {},       // optional supporting data
    req,             // REQUIRED the riv req object, provided by api call (should be available for all user-driven requests)
    username,        // ALTERNATIVE to req, only for when req is not available or set to 'system' for system logging
    user_id,         // ALTERNATIVE to req, only for when req is not available or leave blank when 'system'
    elapsed,         // milliseconds taken by operation
  }: ActivityEntry) {
    let uid = null;
    let uname = null;
    if (req && req.user) {
      uid = req.user._id;
      uname = req.user.username;
    } else if (user_id || username) {
      if (user_id) {
        uid = user_id;
      }
      if (username) {
        uname = username;
        if (username === 'system') {
          uid = 'system';
        }
      }
    } else {
      return Promise.reject('Activity.addEntry: req, user_id, or username are required');
    }
    // build activity doc
    let doc = {
      Timestamp: timestamp,
      Component: component,
      Source: source,
      Event: event,
      EventValue: eventValue,
      Level: level,
      Data: data,
      User: uname,
      UserId: `${uid}`, // stringify to avoid having to use ObjectId type on search
      Ip: req?.ip,
      Server: os.hostname(),
      EventDurationMs: elapsed,
    };
    return this.$.Mongo.insertOne('rivActivity', doc);
  }
  
  // determine if log event needs to be preserved
  @Method('Preserve log event')
  preserveLog(level: string, name: string, ...args: any[]) {
    switch (this.preserveLogLevel) {
      case 'error':
        if (level !== 'error') return;
      case 'warning':
        if (level !== 'error' && level !== 'warn' && level !== 'warning') return;
      case 'log':
        if (level !== 'error' && level !== 'warn' && level !== 'warning' && level !== 'log') return;
    }
    // TODO: act on the value of preserveLogLevel
    // if (this.preserveLogLevel)
    this.addEntry({
      source: name,
      level,
      event: args[0],
      // data: args.slice(1),
      user_id: 'system',
    }).catch((e: Error) => {
      console.log(`RIV | error preserving log`, e);
    });
  }
}
