// built-in activity logging
// riv will use this module for logging-built in actions related to
// auth, users, and roles
//
// end-user can call the method or emit the events below to add their
// own activity log entries

import type { RivRequest } from 'shared/types/server';
import os from 'node:os';
import util from 'node:util';

export default {
  name: 'Activity',
  props: {
    preserveLogLevel: false,
  },
  events: {
    // local event which can be sent from other modules to add an entry to activity log
    'Activity.addEntry'(obj: ActivityEntry) {
      this.addEntry(obj);
    },
    'Mongo.ready'() {
      this.addEntry({
        source: 'Activity',
        event: 'server start',
        user_id: 'system',
      });
    },
  },
  api: {
    //
    // api for finding activity entries
    //
    findEntries(req: RivRequest, query) {
      return this.$.Mongo.find('rivActivity', ...this.$.Mongo.convertQuery(query));
    },
    //
    // proxy to addEntry meant to be used from client
    //
    clientAddEntry(req, {
      source,
      event,
      eventValue,
      data,
      elapsed,
    }) {
      return this.addEntry({
        component: 'Client', // force this when this API is used
        source,
        event,
        eventValue,
        data,
        elapsed,
        req, // add in the req data provided by API layer
      });
    },
  },
  methods: {
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
    },
    // determine if log event needs to be preserved
    preserveLog(level, name, ...args) {
      switch (this.preserveLogLevel) {
        case 'error':
          if (level !== 'error') return;
        case 'warning':
          if (level !== 'error' || level !== 'warn') return;
        case 'log':

      }
      // TODO: act on the value of preserveLogLevel
      // if (this.preserveLogLevel)
      this.addEntry({
        source: name,
        level,
        event: args[0],
        // data: args.slice(1),
        user_id: 'system',
      }).catch((e) => {
        console.log(`riv> error preserving log`, e);
      });
    },
  },
};
