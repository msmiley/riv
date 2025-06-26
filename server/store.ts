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
//
export default {
  name: 'Store',
  events: {
    async 'Mongo.ready'() {
      let rdy = await this.ensureIndex();
      rdy && this.$ready();
    },
  },
  api: {
    //
    // load from db by key for this user
    // allowed for all authenticaed users
    // className is the _expected_ type/class name, if it does not match what
    // was stored in the db, an error will be returned
    //
    findValue(req, key, className) {
      return this.$.Mongo.findOne('rivStore', {
        user_id: req.user._id,
        key,
      }).then((doc) => {
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
      }).catch((err) => {
        this.$warn(`error finding store value`, err);
        return Promise.reject(err);
      });
    },
    //
    // save/update value for key, calls to this always either set or overwrite the value
    // allowed for all authenticated users
    // if a class type can be determined from value.constructor.name, it will be stored
    // in the type field
    //
    saveValue(req, key, value) {
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
    },
    //
    // delete value for key
    // allowed for all authenticaed users
    //
    deleteValue(req, key) {
      return this.$.Mongo.deleteOne('rivStore', {
        user_id: req.user._id,
        key,
      });
    },
  },
  methods: {
    // create index on store collection
    ensureIndex() {
      return this.$.Mongo.createIndexes('rivStore', [
        {
          key: { user_id: 1, key: 1 },
          name: 'userIdKeyIndex',
        },
      ]).catch((err) => {
        this.$error('Mongo.createIndexes call failed', err);
      });
    },
  },
};
