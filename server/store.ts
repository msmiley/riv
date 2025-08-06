// This Riv module implements a simple KVP-style JSON storage service which
// can be used similarly to S3 with a key associated with a value which
// in this case is a JSON document, but could technically be any kind of serialized data
// capable and small enough to be stored in mongo.
// Currently this is not optimized for large data storage, as it will be subject
// to the document size limit of mongo.
//
// Note: this store requires a user_id to be attached to the request, so it is not
// necessarily meant to be used for 'system' level storage
//
// Note: this uses the 'rivStore' built-in mongo collection alias which may be pointed
// at a different db using the

import { ApiMethod, EventHandler, Method, RivModule } from "shared/base/riv-module";
import type { RivRequest } from "shared/types/server";

export default class Store extends RivModule {
  @EventHandler('Mongo.ready', 'fire when database is ready')
  async dbReady() {
    let rdy = await this.ensureIndex();
    rdy && this.$ready();
  }
  //
  // load from db by key for this user
  // allowed for all authenticaed users
  // className is the _expected_ type/class name, if it does not match what
  // was stored in the db, an error will be returned
  //
  @ApiMethod('Find a store value by key for this user')
  findValue(req: RivRequest, key: string, className: string) {
    return this.$.Mongo.findOne('rivStore', {
      user_id: req.user._id,
      key,
    }).then((doc: any) => {
      if (doc) {
        // only check type if className and type are set, otherwise assume
        // it's a generic object
        if (className) {
          if (doc.type && (className === doc.type)) {
            // rehydrate class and return
            return new this.$class[className](doc.value);
          } else { // expected type mismatch
            return Promise.reject('store value not expected type');
          }
        }
        // return raw/generic value if no expected className provided
        return doc.value;
      } else if (className) { // no db match, but className provided
        // return a new instance of the expected class
        return new this.$class[className]();
      }
      // no match and no className provided, just return null
      return null;
    }).catch((err: Error) => {
      this.$warn(`error finding store value`, err);
      return Promise.reject(err);
    });
  }
  //
  // save/update value for key, calls to this always either set or overwrite the value
  // allowed for all authenticated users
  // if a class type can be determined from value.constructor.name, it will be stored
  // in the type field
  //
  @ApiMethod('Save or update a store value by key for this user')
  saveValue(req: RivRequest, key: string, value: any) {
    return this.$.Mongo.updateOne('rivStore', {
      user_id: req.user._id,
      key,
    }, {
      $set: {
        value,
        type: value.constructor?.name ?? 'generic',
      },
    }, {
      upsert: true,
    });
  }
  //
  // delete value for key
  // allowed for all authenticaed users
  //
  @ApiMethod('Delete a store value by key for this user')
  deleteValue(req: RivRequest, key: string) {
    return this.$.Mongo.deleteOne('rivStore', {
      user_id: req.user._id,
      key,
    });
  }

  // create index on store collection
  @Method('Ensure index on user_id and key')
  ensureIndex() {
    return this.$.Mongo.createIndexes('rivStore', [
      {
        key: { user_id: 1, key: 1 },
        name: 'userIdKeyIndex',
      },
    ]).catch((err: Error) => {
      this.$error('Mongo.createIndexes call failed', err);
    });
  }
}
