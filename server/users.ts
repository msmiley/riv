//
// The UserModule handles all aspects of user accounting except authentication.
//
import { ApiMethod, EventHandler, Property, RivModule } from 'shared/base/riv-module';
import utils from './auth/utils';
import { find, isObject, pick } from 'lodash-es';
import type { RivRequest } from 'shared/types/server';

export default class Users extends RivModule {
  userCache: any[] = []; // local cache of users, updated through mongo.watch

  @Property('Whether to ensure at least one admin user exists on startup')
  ensureAdmin: boolean = true;
  @Property('Interval in ms to refresh the user cache')
  cacheInterval: number = 60000;

  //
  // When Roles gets an _id for a newly created role _id,
  // it's a pretty good indication we need to add an initial admin user
  // Note that adding an admin user can be disabled for security by setting
  // the ensureAdmin prop to false
  //
  @EventHandler('Roles.ensureDefaultRoles', 'Ensures default roles are created and admin user exists')
  async rolesReady(roles) {
    for (let r of roles) {
      if (r.name === 'Administrator') {
        await this.ensureAdminUser(r._id);
      }
    }
    // refresh the local cache
    this.refresh();
  }

  @EventHandler('Mongo.ready', 'Initializes the user module when Mongo is ready')
  dbReady() {
    this.ensureIndex();
    this.refresh();
    // auto-refresh when users collection changes
    this.$.Mongo.watch('rivUsers', [], this.refresh);
    // also start a timer as a fail-safe in case watching fails
    setInterval(this.refresh, this.cacheInterval);
  }

  // get own user info
  @ApiMethod('Get own user info')
  me(req: RivRequest) {
    return this.$.Mongo.findOne('rivUsers', { _id: req.user._id });
  },
  // kvp settings service for user
  @ApiMethod('Save user setting')
  saveSetting(req: RivRequest, setting: any) {
    // prepend settings keys with 'settings.' so that the mongo update
    // will merge individual kvp sets
    let setSettings: {[key: string]: any} = {};
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
  @ApiMethod('Get user profile by ID')
  profileById(req: RivRequest, user_id: string) {
    let user = this.userById(user_id);
    return pick(user, ['fullname', 'username', 'avatar']);
  },
  //
  // user avatar only
  //
  @ApiMethod('Get user avatar by ID')
  avatarById(req: RivRequest, user_id: string) {
    let user = this.userById(user_id);
    return user.avatar;
  }

  @ApiMethod('Get a list of users')
  findUsers(req: RivRequest) {
    // TODO: need to add permissions checks
    return this.$.Mongo.find('rivUsers', {}, {
      // exclude credential fields, even for admin
      projection: {
        password: 0,
        token: 0,
      },
    });
  }

  @ApiMethod('Create a new user', 'manageUsers')
  createUser(req: RivRequest, { fullname, username, email, password, enabled, role_ids = [] }: any) {
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
  }

  @ApiMethod('Update a user by ID', 'manageUsers')
  updateUser(req: RivRequest, { _id, fullname, username, email, password, enabled, role_ids }: any) {
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
  }

  @ApiMethod('Delete a user by ID', 'manageUsers')
  deleteUser(req: RivRequest, { _id, username }: any) {
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
  }

  @ApiMethod('Get the number of users in the system')
  numUsers(req: RivRequest) {
    return this.$.Mongo.count('rivUsers');
  }
  
  // private methods
  // refresh local user cache from mongo
  refresh() {
    return this.$.Mongo.find('rivUsers', {}).then((docs) => {
      this.$debug(`fetched ${docs.length} users for cache`);
      this.userCache = docs;
    }).catch((err) => {
      this.$error('error loading users from mongo', err);
    });
  }
  userById(_id) {
    if (typeof(_id) === 'string') {
      _id = new this.$.Mongo.mongo.ObjectId(_id);
    }
    return find(this.userCache, { _id });
  }
  userByUsername(username) {
    return find(this.userCache, { username });
  }
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
  }
  // remove given role _id from all users role_ids array
  purgeRole(_id) {
    return this.$.Mongo.updateMany('rivUsers', {}, {
      $pull: { role_ids: _id },
    });
  }
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
  }
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
  }
 }
