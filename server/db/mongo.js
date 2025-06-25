// mongo wrapper module
// Important Configuration:
// - dbopts - the standard config object and is passed through to mongodb driver, only needed for advanced setups with mongo login/encryption
// - rivDatabase - the base db used for all built-in riv functions (users/roles/activity)
//
import mongo from 'mongodb';
const MongoClient = mongo.MongoClient;

export default {
  name: 'Mongo',
  init() {
    this.connect();
  },
  props: {
    enabled: true,
    debug: false,
    host: 'localhost',
    port: 27017,
    dbopts: {               // native node.js driver options
      directConnection: true,
    },
    retryInterval: 2000,    // connect retry interval
    rivDatabase: 'riv',     // database name to use for riv data
    namespaces: {},         // namespace dictionary for centralized management of namespaces
    promoteIds: true,       // attempt to promote ObjectId strings
  },
  data() {
    return {
      isUp: false,   // flag to track mongo status
      client:  null, // handle to client/driver
      mongo,         // alias driver for type defs
    };
  },
  api: {
    // no public APIs to prevent data leaks, all calls to methods below
    // have to be made by other server/backend modules
  },
  methods: {
    //
    // Process the provided options and connect to mongodb
    //
    async connect() {
      if (this.enabled) {
        this.numConnectionAttempts++;
        this.$log(`Connecting to mongodb at: ${this.host}:${this.port}, using db "${this.rivDatabase}" for built-in documents`);

        var fullhost = this.host;

        // add full mongodb:// schema if not provided
        if (!fullhost.match(/^mongodb:\/\/.*/)) {
          fullhost = `mongodb://${this.host}:${this.port}`;
        }
        this.debug && this.$debug(`full mongo url: ${fullhost}`);

        // create a new MongoClient and initiate a connect
        new MongoClient(fullhost, this.dbopts)
        .on('connectionReady', (rslt) => {
          this.numConnects++;
          this.debug && this.$debug(`mongodb new connectionId: ${rslt.connectionId}`);
          this.$emit('Mongo.connected', rslt);
        })
        .on('connectionClosed', (rslt) => {
          // this event is often called multiple times, based on the pool connections closing
          this.numDisconnects++;
          this.$warn(`mongodb disconnected connectionId: ${rslt.connectionId} from ${rslt.address}`);
          this.$emit('Mongo.disconnected', rslt);
        })
        .on('serverHeartbeatSucceeded', (rslt) => {
          if (this.isUp === false) {
            this.isUp = true;
            this.$emit('Mongo.up', rslt);
          }
        })
        .on('serverHeartbeatFailed', (rslt) => {
          if (this.isUp === true) {
            this.isUp = false;
            this.$emit('Mongo.down', rslt);
          }
        })
        .connect() // tell mongo driver to actually connect
        .then(this.success)
        .catch(this.mongoConnectionError);
      } else {
        this.$warn('refusing to connect because enabled=false');
      }
    },
    disconnect() {
      if (this.client) {
        this.client.close(true);
        this.client = null;
        this.$log('MongoClient closed');
      }
    },
    //
    // Receives the freshly connected db object from the mongodb native driver
    //
    success(client) {
      // save client to instance variable
      this.client = client;
      // set ready state since MongoClient is happy
      this.$ready(`Mongo Client for mongodb at ${this.host} ready`);
    },
    //
    // mongo error handler for connection attempts
    //
    mongoConnectionError(err) {
      // black hole certain errors
      if (err.codeName === 'NotMasterNoSlaveOk') return;
      // log it, this also kicks out the ready-state,
      this.$error('mongo error', err);
      // usually should be recovered by a retry:
      if ((err.errno === 'ECONNREFUSED' ||
          err.errno === 'EHOSTDOWN' ||
          err.name === 'MongoNetworkError' ||
          err.name === 'MongoServerSelectionError')) {
        this.$log(`retrying in ${this.retryInterval}ms`);
        // clear existing timers so we don't snowball
        if (this.reconnectTimer) {
          clearInterval(this.reconnectTimer);
        }
        this.reconnectTimer = setTimeout(this.connect, this.retryInterval);
      }
    },
    //
    // Use mongodb node.js driver insertOne()
    //
    insertOne(ns, doc, ...args) {
      let { options, callback } = this.handleArgs(...args);
      if (this.client) {
        this.numInserts++;
        this.debug && this.$debug('insertOne', ns, doc);
        return this.getCollection(ns).insertOne(doc, options, callback);
      }
      return Promise.reject('client not ready for insertOne');
    },
    //
    // Use mongodb node.js driver insertMany()
    //
    insertMany(ns, docs, ...args) {
      let { options, callback } = this.handleArgs(...args);
      if (this.client) {
        this.numInserts += docs.length;
        this.debug && this.$debug('insertMany', ns, docs);
        return this.getCollection(ns).insertMany(docs, options, callback);
      }
      return Promise.reject('client not ready for insertMany');
    },
    find(ns, query={}, ...args) {
      let { options, callback } = this.handleArgs(...args);
      if (this.client) {
        this.numFinds++;
        // see if we need to rehydrate _id
        if (query._id) {
          query._id = this.checkId(query._id);
        }
        this.debug && this.$debug('find', ns, query);
        return this.getCollection(ns).find(query, options).toArray(callback);
      }
      return Promise.reject('client not ready for find');
    },
    findOne(ns, query, ...args) {
      let { options, callback } = this.handleArgs(...args);
      if (this.client) {
        this.numFinds++;
        // see if we need to rehydrate _id
        if (typeof(query) === 'string' || query instanceof mongo.ObjectId) {
          // if query is a plain string, assume user meant it as value of _id
          query = { _id: this.checkId(query) };
        } else if (query._id) {
          query._id = this.checkId(query._id);
        }
        this.debug && this.$debug('findOne', ns, query);
        return this.getCollection(ns).findOne(query, options, callback);
      }
      return Promise.reject('client not ready for findOne');
    },
    findOneAndUpdate(ns, filter, update, ...args) {
      let { options, callback } = this.handleArgs(...args);
      if (this.client) {
        this.numUpdates++;
        // see if we need to rehydrate _id in filter
        if (typeof(filter) === 'string' || filter instanceof mongo.ObjectId) {
          filter = { _id: this.checkId(filter) };
        } else if (filter._id) {
          filter._id = this.checkId(filter._id);
        }
        // make sure update doesn't try to change _id
        if (update.$set) {
          delete update.$set._id;
        }
        this.debug && this.$debug('findOneAndUpdate', ns, filter, update);
        return this.getCollection(ns).findOneAndUpdate(filter, update, options, callback);
      }
      return Promise.reject('client not ready for findOneAndUpdate');
    },
    findOneAndDelete(ns, filter, ...args) {
      let { options, callback } = this.handleArgs(...args);
      if (this.client) {
        this.numUpdates++;
        // see if we need to rehydrate _id in filter
        if (typeof(filter) === 'string' || filter instanceof mongo.ObjectId) {
          filter = { _id: this.checkId(filter) };
        } else if (filter._id) {
          filter._id = this.checkId(filter._id);
        }
        this.debug && this.$debug('findOneAndDelete', ns, filter);
        return this.getCollection(ns).findOneAndDelete(filter, options, callback);
      }
      return Promise.reject('client not ready for findOneAndDelete');
    },
    updateOne(ns, filter, update, ...args) {
      let { options, callback } = this.handleArgs(...args);
      if (this.client) {
        this.numUpdates++;
        // see if we need to rehydrate _id in filter
        if (typeof(filter) === 'string' || filter instanceof mongo.ObjectId) {
          filter = { _id: this.checkId(filter) };
        } else if (filter._id) {
          filter._id = this.checkId(filter._id);
        }
        // make sure update doesn't try to change _id
        if (update.$set) {
          delete update.$set._id;
        }
        this.debug && this.$debug('updateOne', ns, filter, update);
        return this.getCollection(ns).updateOne(filter, update, options, callback);
      }
      return Promise.reject('client not ready for updateOne');
    },
    updateMany(ns, filter, update, ...args) {
      let { options, callback } = this.handleArgs(...args);
      if (this.client) {
        this.numUpdates++;
        // see if we need to rehydrate _id in filter
        if (filter._id) {
          filter._id = this.checkId(filter._id);
        }
        // make sure update doesn't try to change _id
        if (update.$set) {
          delete update.$set._id;
        }
        this.debug && this.$debug('updateMany', ns, filter, update);
        return this.getCollection(ns).updateMany(filter, update, options, callback);
      }
      return Promise.reject('client not ready for updateMany');
    },
    deleteOne(ns, filter, ...args) {
      let { options, callback } = this.handleArgs(...args);
      if (this.client) {
        this.numDeletes++;
        this.debug && this.$debug('deleteOne', ns, filter);
        // see if we need to rehydrate _id in filter
        if (typeof(filter) === 'string' || filter instanceof mongo.ObjectId) {
          filter = { _id: this.checkId(filter) };
        } else if (filter && filter._id) {
          filter._id = this.checkId(filter._id);
        } else {
          return Promise.reject('filter (2nd arg) needs to be string, ObjectId, or object with _id set to string/ObjectId');
        }
        return this.getCollection(ns).deleteOne(filter, options, callback);
      }
      return Promise.reject('client not ready for deleteOne');
    },
    deleteMany(ns, filter, ...args) {
      let { options, callback } = this.handleArgs(...args);
      if (this.client) {
        this.numDeletes++;
        this.debug && this.$debug('deleteMany', ns, filter);
        return this.getCollection(ns).deleteMany(filter, options, callback);
      }
      return Promise.reject('client not ready for deleteMany');
    },
    aggregate(ns, pipeline, ...args) {
      let { options, callback } = this.handleArgs(...args);
      if (this.client) {
        this.numAggregates++;
        this.debug && this.$debug('aggregate', ns, pipeline);
        return this.getCollection(ns).aggregate(pipeline, options).toArray(callback);
      }
      return Promise.reject('client not ready for aggregate');
    },
    watch(ns, pipeline, callback) {
      if (this.client) {
        this.numWatchers++;
        this.debug && this.$debug(`watching ${ns} for changes with pipeline:`, pipeline);
        this.getCollection(ns).watch(pipeline, { fullDocument: 'updateLookup' })
        .on('change', (data) => {
          callback && callback(null, data);
        })
        .on('error', (err) => {
          // watchers emit a couple different errors which warrant an automatic
          // re-issue of the watcher, which we do here for the user's convenience
          // all other errors are passed to the user
          if (err.message.indexOf('getMore') > -1 ||
              err.name === 'MongoServerSelectionError') {
            this.$warn(`mongo lost watch cursor, re-watching ${ns}`);
            setTimeout(() => {
              this.watch(...arguments);
            }, this.retryInterval);
          } else {
            callback(err.message);
          }
        });
      } else {
        callback && callback('db client not ready for watch');
      }
    },
    distinct(ns, field, query={}, ...args) {
      let { options, callback } = this.handleArgs(...args);
      if (this.client) {
        this.debug && this.$debug('distinct', ns, field, query);
        return this.getCollection(ns).distinct(field, query ?? {}, options, callback);
      }
      return Promise.reject('client not ready for distinct');
    },
    count(ns, query={}, ...args) {
      let { options, callback } = this.handleArgs(...args);
      if (this.client) {
        // see if we need to rehydrate _id
        if (query._id) {
          query._id = this.checkId(query._id);
        }
        this.debug && this.$debug('count', ns, query);
        return this.getCollection(ns).countDocuments(query, options, callback);
      }
      return Promise.reject('client not ready for count');
    },
    //
    // call the mongo createIndexes function, this one takes the raw index spec
    // https://docs.mongodb.com/manual/reference/command/createIndexes/
    //
    createIndexes(ns, indexes) {
      if (this.client) {
        this.debug && this.$debug('createIndexes', ns, indexes);
        return this.getCollection(ns).createIndexes(indexes);
      }
      return Promise.reject('client not ready for createIndexes');
    },
    //
    // upload a file to mongo gridfs
    //
    openUploadStream(ns, filename, options) {
      if (this.client) {
        this.numGridFsUploads++;
        this.debug && this.$debug('openUploadStream', ns);
        var bucket = new mongo.GridFSBucket(this.getDatabase(ns), {
          bucketName: this.getCollection(ns, true),
        });
        return bucket.openUploadStream(filename, options);
      }
      return new Writable().destroy('client not ready for openUploadStream');
    },
    //
    // download a file from mongo gridfs
    //
    openDownloadStream(ns, fileId, options) {
      if (this.client) {
        this.numGridFsDownloads++;
        this.debug && this.$debug('openDownloadStream', ns);
        var bucket = new mongo.GridFSBucket(this.getDatabase(ns), {
          bucketName: this.getCollection(ns, true),
        });
        return bucket.openDownloadStream(new mongo.ObjectId(fileId), options);
      }
      return new Readable().destroy('client not ready for openDownloadStream');
    },
    //
    // download a file by filename from mongo gridfs
    //
    openDownloadStreamByName(ns, filename, options) {
      if (this.client) {
        this.numGridFsDownloads++;
        this.debug && this.$debug('openDownloadStream', ns);
        var bucket = new mongo.GridFSBucket(this.getDatabase(ns), {
          bucketName: this.getCollection(ns, true),
        });
        // handle .on('error') on this return to catch errors
        return bucket.openDownloadStreamByName(filename, options);
      }
      return new Readable().destroy('client not ready for openDownloadStreamByName');
    },
    //
    // delete a file from mongo gridfs, returns a promise, but the callback can be used
    // as instead of a promise
    //
    deleteFile(ns, fileId, callback) {
      if (this.client) {
        this.debug && this.$debug('deleteFile', ns);
        var bucket = new mongo.GridFSBucket(this.getDatabase(ns), {
          bucketName: this.getCollection(ns, true),
        });
        if (typeof(fileId) === 'string') {
          fileId = new mongo.ObjectId(fileId);
        }
        // driver returns promise, with optional callback
        return bucket.delete(fileId, callback);
      }
      return Promise.reject('client not ready for deleteFile');
    },
    ///////////////////////////////////////////////////
    // UTILITY FUNCTIONS START HERE
    ///////////////////////////////////////////////////
    //
    // split namespace into db and collection name
    //
    splitNamespace(ns) {
      let s = ns.split('.');
      if (s.length > 1) {
        return [s[0], s.splice(1).join('.')];
      }
      return s;
    },
    //
    // Get the native driver Collection object for the given namespace.
    //
    getCollection(ns, asString=false) {
      if (typeof ns !== 'string') {
        throw new Error('not valid namespace');
      } else {
        // check for riv built-in names
        switch (ns) {
          case 'rivUsers':
            return this.client.db(this.rivDatabase).collection('users');
          case 'rivRoles':
            return this.client.db(this.rivDatabase).collection('roles');
          case 'rivStore':
            return this.client.db(this.rivDatabase).collection('store');
          case 'rivLog':
            return this.client.db(this.rivDatabase).collection('logs');
          case 'rivActivity':
            return this.client.db(this.rivDatabase).collection('activity');
        }
        let sns = this.splitNamespace(ns);
        if (sns.length === 1) {
          // if provided string is not full namespace, try to lookup in
          // this.namespaces and use the value as the namespace
          let configNs = this.namespaces[ns];
          if (configNs) {
            sns = this.splitNamespace(configNs);
          } else {
            this.$warn(`cannot find namespace ${ns} in config`);
          }
        }
        let collStr;
        // handle gridfs collections that end with .files or .chunks
        if (sns.length === 3) {
          collStr = `${sns[1]}.${sns[2]}`;
        } else {
          collStr = sns[1];
        }
        // return collection name as string if flag set
        if (asString) {
          return collStr;
        }
        return this.client.db(sns[0]).collection(collStr);
      }
    },
    //
    // Get the database for the given namespace
    //
    getDatabase(ns) {
      if (typeof ns !== 'string') {
        throw new Error('not valid namespace');
      } else {

        let sns = this.splitNamespace(ns);
        if (sns.length === 1) {
          // if provided string is not full namespace, try to lookup in
          // this.namespaces and use the value as the namespace
          let configNs = this.namespaces[ns];
          if (configNs) {
            sns = this.splitNamespace(configNs);
          } else {
            this.$warn(`cannot find namespace ${ns} in config`);
          }
        }
        return this.client.db(sns[0]);
      }
    },
    // handle skipped options param
    // i.e. callback provided in options place
    //
    handleArgs(options, callback) {
      if (typeof options === 'function') {
        return {
          options: {},
          callback: options,
        };
      }
      return {
        options,
        callback,
      };
    },
    //
    // Check provided _id and promote it to an ObjectId if
    // it's a string and promoteIds prop is true,
    // this method can be used by user modules instead of having to call mongo.ObjectId directly
    //
    checkId(_id) {
      // check to see if this can be an ObjectId
      if (this.promoteIds) {
        if (_id instanceof mongo.ObjectId) {
          return _id;
        } else if (typeof(_id) === 'string' && _id.length === 24) {
          return new mongo.ObjectId(_id);
        } else if (_id.$in) {
          // make sure all the array items are ObjectIds
          let convertedIds = [];
          for (let id of _id.$in) {
            // try to check validity
            if (typeof(id) === 'string' && id.length === 24) {
              convertedIds.push(new mongo.ObjectId(id));
            } else {
              convertedIds.push(id); // just push it
            }
          }
          return { $in: convertedIds };
        }
      }
      this.debug && this.$debug(`checkId won't promote ${_id} to an ObjectId, make sure that is what you expect`);
      return _id;
    },
    //
    // helper function to find $-prefixed object keys
    //
    recursiveSearch(obj, results = []) {
      if (obj) {
        Object.keys(obj).forEach((key) => {
          if (key.startsWith('$')) {
            results.push(key);
          }
          if (typeof obj[key] === 'object') {
            this.recursiveSearch(obj[key], results);
          }
        });
      }
      return results;
    },
    //
    // basic express.js middleware to sanitize a request body for mongo operators
    // allowed operators can be set through the props
    //
    sanitize(req, res, next) {
      let keys = this.recursiveSearch(req.body);
      for (let k of keys) {
        if (this.allowedUpdateOperators.indexOf(k) < 0) {
          return res.status(400).send(`mongo operator: ${k} not allowed by volante-mongo.sanitize`);
        }
      }
      next();
    },
    //
    // Convenience methods to convert riv client-side
    // queries to mongo (filter, options) argument tuple used with spread operator
    // like this: this.$.Mongo.find('<ns>', ...this.$.Mongo.convertQuery(query))
    //
    convertQuery(query) {
      // filter argument
      let filter = {};
      if (query.filter && Object.keys(query.filter).length > 0) {
        let ands = [];
        let ors = [];
        for (let [field, filters] of Object.entries(query.filter)) {
          for (let f of filters) {
            let ary = f.logic === 'And' ? ands:ors;
            switch (f.op) {
              case 'Equals':
                for (let v of f.values) {
                  ary.push({
                    [field]: { $eq: v },
                  });
                }
                break;
              case 'Contains':
                for (let v of f.values) {
                  ary.push({
                    [field]: { $regex: v, $options: 'i' },
                  });
                }
                break;
              case 'Starts With':
                for (let v of f.values) {
                  ary.push({
                    [field]: { $regex: `^${v}`, $options: 'i' },
                  });
                }
                break;
              case 'Ends With':
                for (let v of f.values) {
                  ary.push({
                    [field]: { $regex: `${v}$`, $options: 'i' },
                  });
                }
                break;
              case 'Regex':
                for (let v of f.values) {
                  ary.push({
                    [field]: { $regex: v },
                  });
                }
                break;
            }
          }
        }
        // assign to filter if we collected any ands or ors
        if (ands.length > 0) {
          filter.$and = ands;
        }
        if (ors.length > 0) {
          filter.$or = ors;
        }
      }
      // options argument
      let options = {};
      // add sort options
      if (query.sort && query.sort.length > 0) {
        options.sort = {};
        for (let s of query.sort) {
          options.sort[s.field] = s.direction === 'desc' ? -1:1;
        }
      }
      // add pagination options
      if (query.limit && query.limit > 0) {
        options.limit = query.limit;
      }
      if (query.skip && query.skip > 0) {
        options.skip = query.skip;
      }
      return [filter, options];
    },
  },
};
