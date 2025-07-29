
// interface for calling server APIs from client
export interface CallApiParams {
  id: string;   // unique id generated for api call, used to associate response
  api: string;  // name of api in the form Module.Api
  type: string; // type of arg
  arg: any;     // argument, can be primitive or complex object
}

export interface User {
  _id?: Mongo.ObjectId; // unique id for the user
  role_ids: Mongo.ObjectId[]; // array of role ids assigned to the user
  username: string; // unique username
  fullname: string; // full name of the user
  email: string; // email address of the user
  password: string; // hashed password
  enabled: boolean; // whether the user is enabled or not
  mustChangePass: boolean; // whether the user must change their password on next login
  token?: string; // authentication token for the user
  created: Date; // date when the user was created
  updated: Date | null; // date when the user was last updated, null if never updated
  firstLogin: Date | null; // date of the first login, null if never logged in
  lastLogin: Date | null; // date of the last login, null if never logged in

  // TODO: try to get rid of this
  settings?: { [key: string]: any }; // key-value pair settings for the user
}

export interface Role {
  _id?: Mongo.ObjectId; // unique id for the role
  name: string; // role name, unique
  nickname: string; // role short name, for abbreviations
  description: string; // free text description of role
  permission: { [key: string]: boolean }; // map of permissions assigned to role
  created: Date; // date when role was created
  updated: Date | null; // date when role was last updated, null if never updated
}

export interface Permission {
  key: string; // unique key for the permission
  title: string; // display name of the permission
  description: string; // description of the permission
  category: string; // category for grouping
  recommend?: string[]; // recommended permissions to also enable
}

export interface CategorizedPermissions {
  category: string; // category name
  children: Permission[]; // array of permissions in this category
}

export interface DefaultRoleDescriptor {
  name: string; // role name
  nickname: string; // role short name, for abbreviations
  description: string; // free text description of role
  permissions: string[]; // array of permission keys to assign to default role
}