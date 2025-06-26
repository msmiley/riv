//
// The RoleModule handles all aspects of role management.
// This module implements the concept of Role and will help other modules enforce role.
//
import mongo from 'mongodb';
import { findIndex, flatMap } from 'lodash-es';

export default {
  name: 'Roles',
  props: {
    //
    // built-in permissions, the admin role will be given all of these
    // plus any defined in riv.config.js
    //
    permissions: {
      // RIV BUILT-IN ADMIN
      manageRoles: {
        title: 'Manage Roles',
        description: 'Allow the user to manage Roles',
        category: 'Administrative',
      },
      manageUsers: {
        title: 'Manage Users',
        description: 'Allow the user to manage user accounts',
        category: 'Administrative',
      },
      manageSessions: {
        title: 'Manage Sessions',
        description: 'Allow the user to manage active user sessions',
        category: 'Administrative',
        recommend: ['manageActivity'],
      },
      manageActivity: {
        title: 'Manage Activity Log',
        description: 'Allow the user to manage the activity log',
        category: 'Administrative',
      },
      dev: {
        title: 'Developer',
        description: 'Mark a user as a developer, which enables some dev/debug extras',
        category: 'Administrative',
      },
    },
    //
    // default roles to be added if they don't exist, the Admin role will be
    // assigned all permissions
    //
    defaultRoles: [
      {
        name: 'Administrator',
        nickname: 'Admin',
        description: 'Full access',
        // as a special case, will be given all permissions above
      },
    ],
    cacheInterval: 60000,
  },
  data() {
    return {
      roleCache: [], // local cache of roles stored in mongo, updated using mongo.watch
    };
  },
  events: {
    async 'Mongo.ready'() {
      await this.ensureDefaultRoles();
      this.ensureIndex();
      this.refresh();
      // auto-refresh when users collection changes
      this.$.Mongo.watch('rivRoles', [], this.refresh);
      // also start a timer as a fail-safe in case watching fails
      setInterval(this.refresh, this.cacheInterval);
    },
  },
  api: {
    // get all permissions, or single permission by id
    // which is typically used to look up titles/descriptions given an id
    findPermissions(req, value) {
      if (value) {
        return this.permissions[value];
      }
      // return array of permissions organized by category alphabetically
      let ret = [];
      for (let [k,v] of Object.entries(this.permissions)) {
        // initialize the category if not exists
        let idx = findIndex(ret, { category: v.category });
        if (idx < 0) {
          idx = ret.push({
            category: v.category,
            children: [],
          }) - 1;
        }
        ret[idx].children.push({
          value: k,
          title: v.title,
          description: v.description,
          recommend: v.recommend,
        });
      }
      return ret;
    },
    // get all roles, only allowed for privileged users
    findRoles(req, _id) {
      if (req.user.permissions.includes('manageRoles')) {
        if (_id) {
          return this.$.Mongo.findOne('rivRoles', _id);
        }
        return this.$.Mongo.find('rivRoles', {});
      } else {
        return Promise.reject('not allowed to view all roles');
      }
    },
    findExternalRoles() {
      return this.$.Mongo.find('rivRoles', {});
    },
    // create a role, only allowed for privileged users
    'createRole:manageRoles'(req, {
      name,         // role name, must be unique
      nickname,     // role short name, for abbreviations
      description,  // free text description of role
      permissions,  // array of permissions assigned to role, as booleans
    }) {
      let doc = {
        name,
        nickname,
        description,
        permissions,
        created: new Date(),
        updated: null,
      };
      // add to activity log
      this.$.Activity.addEntry({
        source: this.name,
        event: 'Role created',
        eventValue: name,
        data: doc,
        req,
      });
      return this.$.Mongo.insertOne('rivRoles', doc);
    },
    // update a role, only allowed for privileged users
    'updateRole:manageRoles'(req, {
      _id,
      name,
      nickname,
      description,
      permissions
    }) {
      // add to activity log
      this.$.Activity.addEntry({
        source: this.name,
        event: 'Role updated',
        eventValue: name,
        data: arguments[1],
        req,
      });
      return this.$.Mongo.updateOne('rivRoles', _id, {
        $set: {
          name,
          nickname,
          description,
          permissions,
        },
      });
    },
    // delete a role, only allowed for privileged users
    // also need to remove the _id from all users
    async 'deleteRole:manageRoles'(req, { _id }) {
      // add to activity log
      this.$.Activity.addEntry({
        source: this.name,
        event: 'Role deleted',
        eventValue: _id,
        req,
      });
      // remove from users
      await this.$.Users.purgeRole(_id);
      return this.$.Mongo.deleteOne('rivRoles', _id);
    },
  },
  methods: {
    // refresh local role cache from mongo
    refresh() {
      this.$.Mongo.find('rivRoles', {}).then((docs) => {
        this.$debug(`fetched ${docs.length} roles for cache`);
        this.roleCache = docs;
      }).catch((err) => {
        this.$error('error loading roles from mongo', err);
      });
    },
    ensureIndex() {
      this.$.Mongo.createIndexes('rivRoles', [
        {
          key: { name: 1 },
          unique: true, // enforce unique role name
          name: 'nameIndex',
        },
      ]).then((result) => {
        this.$log('role index ready to go');
      }).catch((err) => {
        this.$error('mongo.createIndexes call failed', err);
      });
    },
    //
    // Ensure the database contains the admin role
    //
    async ensureDefaultRoles() {
      // flatten permissions into permissions.<key>
      // so we can update the default role permissions non-destructively to enable
      // adding new permissions
      let createdRoles = [];
      for (let d of this.defaultRoles) {
        let perms = {};
        if (d.name === 'Administrator') {
          for (let p of Object.keys(this.permissions)) {
            perms[`permissions.${p}`] = true;
          }
        } else {
          for (let p of d.permissions) {
            perms[`permissions.${p}`] = true;
          }
        }
        await this.$.Mongo.findOneAndUpdate('rivRoles', {
          name: d.name,
        }, {
          $set: {
            name: d.name,
            nickname: d.nickname,
            description: d.description,
            ...perms,
            updated: new Date(),
          }
        }, {
          upsert: true,
          returnDocument: 'after',
        }).then((rslt) => {
          this.$log(`ensureDefaultRoles successful for ${d.name}`);
          if (rslt._id) {
            createdRoles.push(rslt);
          }
        }).catch((err) => {
          this.$error('error running ensureDefaultRoles against mongo', err);
        });
      }
      this.$emit('Roles.ensureDefaultRoles', createdRoles);
    },
    //
    // get all role info for the given array of role_ids
    //
    getAllRoleInfo(role_ids) {
      let roleInfo = [];
      let perms = [];
      let stringifiedRoleIds = role_ids.map((o) => { return o.toString() });
      // get matching roles from local cache
      let roles = this.roleCache.filter((o) => {
        return stringifiedRoleIds.includes(o._id.toString());
      });
      // collect consolidated permissions
      for (let r of roles) {
        for (let [k, v] of Object.entries(r.permissions)) {
          if (v && perms.indexOf(k) < 0) {
            perms.push(k);
          }
        }
        roleInfo.push({
          name: r.name,
          nickname: r.nickname,
        });
      }
      return {
        roles: roleInfo,
        permissions: perms,
      };
    },
  },
};
