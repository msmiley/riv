//
// The RoleModule handles all aspects of role management.
// This module implements the concept of Role and will help other modules enforce role.
//
import mongo from 'mongodb';
import { find, findIndex, flatMap } from 'lodash-es';
import { ApiMethod, EventHandler, Property, RivModule } from 'shared/base/riv-module';
import type { CategorizedPermissions, DefaultRoleDescriptor, Permission } from 'shared/types/shared';
import type { RivRequest } from 'shared/types/server';

export default class Roles extends RivModule {
  roleCache: any[] = []; // local cache of roles, updated through mongo.watch

  //
  // built-in permissions, the admin role will be given all of these
  // plus any defined in riv.config.js
  //
  @Property('Permissions available in the system')
  permissions: Permission[] = [
    // RIV BUILT-IN ADMIN PERMISSIONS
    {
      key: 'manageRoles',
      title: 'Manage Roles',
      description: 'Allow the user to manage Roles',
      category: 'Administrative',
    },
    { 
      key: 'manageUsers',
      title: 'Manage Users',
      description: 'Allow the user to manage user accounts',
      category: 'Administrative',
    },
    {
      key: 'manageSessions',
      title: 'Manage Sessions',
      description: 'Allow the user to manage active user sessions',
      category: 'Administrative',
      recommend: ['manageActivity'],
    },
    {
      key: 'manageActivity',
      title: 'Manage Activity Log',
      description: 'Allow the user to manage the activity log',
      category: 'Administrative',
    },
    {
      key: 'dev',
      title: 'Developer',
      description: 'Mark a user as a developer, which enables some dev/debug extras',
      category: 'Administrative',
    },
  ];
  //
  // default roles to be added if they don't exist, the Admin role will be
  // assigned all permissions
  //
  @Property('Default roles to be created on startup')
  defaultRoles: DefaultRoleDescriptor[] = [
    {
      name: 'Administrator',
      nickname: 'Admin',
      description: 'Full access',
      // as a special case, will be given all permissions above
      permissions: [ /* all */ ]
    },
  ]
  @Property('Interval in ms to refresh the role cache')
  cacheInterval: number = 60000;

  @EventHandler('Mongo.ready', 'Initializes the role module when Mongo is ready')
  async dbReady() {
    await this.ensureDefaultRoles();
    this.ensureIndex();
    this.refresh();
    // auto-refresh when users collection changes
    this.$.Mongo.watch('rivRoles', [], this.refresh);
    // also start a timer as a fail-safe in case watching fails
    setInterval(this.refresh, this.cacheInterval);
  }

  // get all permissions, or single permission by id
  // which is typically used to look up titles/descriptions given an id
  @ApiMethod('Find permissions')
  findPermissions(req: RivRequest, key: string) {
    if (key) {
      return find(this.permissions, { key });
    }
    // return array of permissions organized by category alphabetically
    let ret: CategorizedPermissions[] = [];
    for (let p of this.permissions) {
      // initialize the category if not exists
      let idx = findIndex(ret, { category: p.category });
      if (idx < 0) {
        idx = ret.push({
          category: p.category,
          children: [],
        }) - 1;
      }
      ret[idx].children.push(p);
    }
    return ret;
  }

  // get all roles, only allowed for privileged users
  @ApiMethod('Find roles')
  findRoles(req: RivRequest, _id: string | null = null) {
    if (req.user.permissions.includes('manageRoles')) {
      if (_id) {
        return this.$.Mongo.findOne('rivRoles', _id);
      }
      return this.$.Mongo.find('rivRoles', {});
    } else {
      return Promise.reject('not allowed to view all roles');
    }
  }
  @ApiMethod('Find external roles')
  findExternalRoles() {
    return this.$.Mongo.find('rivRoles', {});
  }
  // create a role, only allowed for privileged users
  @ApiMethod('Create a role', 'manageRoles')
  createRole(req: RivRequest, {
    name,         // role name, must be unique
    nickname,     // role short name, for abbreviations
    description,  // free text description of role
    permissions,  // array of permissions assigned to role, as booleans
  }: any) {
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
  }

  // update a role, only allowed for privileged users
  @ApiMethod('Update a role', 'manageRoles')
  updateRole(req: RivRequest, {
    _id,
    name,
    nickname,
    description,
    permissions
  }: any) {
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
  }
  // delete a role, only allowed for privileged users
  // also need to remove the _id from all users
  @ApiMethod('Delete a role', 'manageRoles')
  async deleteRole(req: RivRequest, { _id }: any) {
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
  }

  // refresh local role cache from mongo
  refresh() {
    this.$.Mongo.find('rivRoles', {}).then((docs: any[]) => {
      this.$debug(`fetched ${docs.length} roles for cache`);
      this.roleCache = docs;
    }).catch((err: Error) => {
      this.$error('error loading roles from mongo', err);
    });
  }
  ensureIndex() {
    this.$.Mongo.createIndexes('rivRoles', [
      {
        key: { name: 1 },
        unique: true, // enforce unique role name
        name: 'nameIndex',
      },
    ]).then((result: any) => {
      this.$log('role index ready to go');
    }).catch((err: Error) => {
      this.$error('mongo.createIndexes call failed', err);
    });
  }
  //
  // Ensure the database contains the admin role
  //
  async ensureDefaultRoles() {
    // flatten permissions into permissions.<key>
    // so we can update the default role permissions non-destructively to enable
    // adding new permissions
    let createdRolesResult: any[] = [];
    for (let d of this.defaultRoles) {
      let perms: { [key: string]: boolean } = {};
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
      }).then((rslt: any) => {
        this.$log(`ensureDefaultRoles successful for ${d.name}`);
        if (rslt._id) {
          createdRolesResult.push(rslt);
        }
      }).catch((err: Error) => {
        this.$error('error running ensureDefaultRoles against mongo', err);
      });
    }
    this.$emit('Roles.ensureDefaultRoles', createdRolesResult);
  }
  //
  // get all role info for the given array of role_ids
  //
  getAllRoleInfo(role_ids: string[] | mongo.ObjectId[]) {
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
  }
}

