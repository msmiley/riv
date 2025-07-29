
// interface for calling server APIs from client
export interface CallApiParams {
  id: string;   // unique id generated for api call, used to associate response
  api: string;  // name of api in the form Module.Api
  type: string; // type of arg
  arg: any;     // argument, can be primitive or complex object
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