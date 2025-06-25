//
// The UserModule handles all aspects of user accounting except authentication.
//
import utils from './auth/utils.js';
import { find, isObject, pick } from 'lodash-es';

export default {
  name: 'Users',
  props: {
    ensureAdmin: true,
    cacheInterval: 60000,
  },
  events: {
    //
    // When Roles gets an _id for a newly created role _id,
    // it's a pretty good indication we need to add an initial admin user
    // Note that adding an admin user can be disabled for security by setting
    // the ensureAdmin prop to false
    //
    async 'Roles.ensureDefaultRoles'(roles) {
      for (let r of roles) {
        if (r.name === 'Administrator') {
          await this.ensureAdminUser(r._id);
        }
      }
      // refresh the local cache
      this.refresh();
    },
    'Mongo.ready'() {
      this.ensureIndex();
      this.refresh();
      // auto-refresh when users collection changes
      this.$.Mongo.watch('rivUsers', [], this.refresh);
      // also start a timer as a fail-safe in case watching fails
      setInterval(this.refresh, this.cacheInterval);
    },
  },
  data() {
    return {
      userCache: [], // local cache of mongo docs, updated through mongo.watch
    };
  },
  // api callable from client
  api: {
    // get own user info
    me(req) {
      return this.$.Mongo.findOne('rivUsers', { _id: req.user._id });
    },
    // kvp settings service for user
    saveSetting(req, setting) {
      // prepend settings keys with 'settings.' so that the mongo update
      // will merge individual kvp sets
      let setSettings = {};
      for (let [k, v] of Object.entries(setting)) {
        setSettings[`settings.${k}`] = v;
      }
      return this.$.Mongo.updateOne('rivUsers', req.user._id, {
        $set: setSettings,
      });
    },
    //
    // user profile (subset of user record)
    //
    profileById(req, user_id) {
      let user = this.userById(user_id);
      return pick(user, ['fullname', 'username', 'avatar']);
    },
    //
    // user avatar only
    //
    avatarById(req, user_id) {
      let user = this.userById(user_id);
      return user.avatar;
    },
    findUsers(req) {
      // TODO: need to add permissions checks
      return this.$.Mongo.find('rivUsers', {}, {
        // exclude credential fields, even for admin
        projection: {
          password: 0,
          token: 0,
        },
      });
    },
    'createUser:manageUsers'(req, { fullname, username, email, password, enabled, role_ids = [] }) {
      let hashedPassword = utils.generatePasswordHash(password);
      let obj = {
        fullname,
        username,
        email,
        password: hashedPassword,
        enabled,
        mustChangePass: true,
        role_ids: [],
        settings: {},
      };
      // process role_ids, make sure we only have ids not objects
      for (let r of role_ids) {
        if (isObject(r) && r._id) {
          obj.role_ids.push(r._id);
        } else {
          obj.role_ids.push(r);
        }
      }
      let st = Date.now();
      return this.$.Mongo.insertOne('rivUsers', obj).then((rslt) => {
        // send entry to activity log
        this.$.Activity.addEntry({
          source: this.name,
          event: 'user created',
          eventValue: username,
          data: obj,
          req,
          elapsed: Date.now() - st,
        });
        return rslt;
      }).catch((e) => { // catch common errors and provide sane explanation
        if (e.code) {
          switch (e.code) {
            case 11000:
              return Promise.reject('Error: Duplicate username');
          }
        }
        return Promise.reject(e); // failsafe return entire error
      });
    },
    'updateUser:manageUsers'(req, { _id, fullname, username, email, password, enabled, role_ids }) {
      let obj = {
        fullname,
        username,
        email,
        enabled,
        role_ids: [],
      };
      // process role_ids, make sure we only have ids not objects
      for (let r of role_ids) {
        if (isObject(r) && r._id) {
          obj.role_ids.push(r._id);
        } else {
          obj.role_ids.push(r);
        }
      }
      // if admin set password, set it and flag it for change
      if (password && password.length > 0) {
        this.$debug(`user ${req.user.username} password reset`);
        obj.password = utils.generatePasswordHash(password);
        obj.mustChangePass = true;
      }
      let st = Date.now();
      return this.$.Mongo.updateOne('rivUsers', _id, {
        $set: obj,
      }).then((rslt) => {
        // send entry to activity log
        this.$.Activity.addEntry({
          source: this.name,
          event: 'user updated',
          eventValue: username,
          data: obj,
          req,
          elapsed: Date.now() - st,
        });
        return rslt;
      });
    },
    'deleteUser:manageUsers'(req, { _id, username }) {
      let st = Date.now();
      return this.$.Mongo.deleteOne('rivUsers', _id).then((rslt) => {
        this.$.Activity.addEntry({
          source: this.name,
          event: 'user deleted',
          eventValue: username,
          req,
          elapsed: Date.now() - st,
        });
        return rslt;
      });
    },
    numUsers(req) {
      return this.$.Mongo.count('rivUsers');
    },
  },
  // private methods
  methods: {
    // refresh local user cache from mongo
    refresh() {
      return this.$.Mongo.find('rivUsers', {}).then((docs) => {
        this.$debug(`fetched ${docs.length} users for cache`);
        this.userCache = docs;
      }).catch((err) => {
        this.$error('error loading users from mongo', err);
      });
    },
    userById(_id) {
      if (typeof(_id) === 'string') {
        _id = new this.$.Mongo.mongo.ObjectId(_id);
      }
      return find(this.userCache, { _id });
    },
    userByUsername(username) {
      return find(this.userCache, { username });
    },
    ensureIndex() {
      this.$.Mongo.createIndexes('rivUsers', [
        {
          key: { username: 1 },
          unique: true, // enforce unique usernames
          name: 'usernameIndex',
        },
      ]).then(() => {
        this.$log('user index ready to go');
      }).catch((err) => {
        this.$error('mongo.createIndexes call failed', err);
      });
    },
    // remove given role _id from all users role_ids array
    purgeRole(_id) {
      return this.$.Mongo.updateMany('rivUsers', {}, {
        $pull: { role_ids: _id },
      });
    },
    //
    // if user count is zero, at least make an admin/admin user, this can be disabled for
    // security by setting ensureAdmin prop false, or add ENV var at run-time:
    // volante_Users_ensureAdmin=false
    //
    ensureAdminUser(adminRole_id) {
      if (this.ensureAdmin) {
        return this.$.Mongo.count('rivUsers', {}).then((count) => {
          if (count === 0) {
            this.$.Mongo.insertOne('rivUsers', {
              enabled: true,
              fullname: 'Admin',
              username: 'admin',
              password: utils.generatePasswordHash('admin'),
              mustChangePass: true,
              role_ids: [ adminRole_id ],
              updated: new Date(),
              token: '',
              settings: {},
            }).then(() => {
              this.$warn('ensureAdminUser successful; created admin/admin user');
            }).catch((err) => {
              this.$error('error running ensureAdminRole against mongo', err);
            });
          } else {
            this.$log('ensureAdminUser successful; user exists');
          }
        }).catch((err) => {
          this.$error('couldnt get initial user count', err);
        });
      }
    },
    // used for syncing local users with external user auth systems
    updateExternalUser({ fullname, username, roles }) {
      let obj = {
        fullname,
        username,
        enabled: true,
        role_ids: [],
      };
      return new Promise((resolve, reject) => {
        this.$.Roles.findExternalRoles().then((result) => {
          for (let r of result) {
            if (isObject(r) && (roles.indexOf(r.name) > -1) && r._id) {
              obj.role_ids.push(r._id);
            }
          }
          this.$.Mongo.updateOne('rivUsers', {
            username: username
          }, {
            $set: obj
          }, {
            upsert: true
          }).then(() => {
            this.refresh().then(() => { return resolve(); });
          }).catch((e) => {
            if (e.code) {
              switch (e.code) {
                case 11000:
                  return reject('Error: Duplicate username');
              }
            }
            return reject(e); // failsafe return entire error
          });
        });
      });
    },
  },
 };
