
// interface for calling server APIs from client
export interface CallApiParams {
  id: string;   // unique id generated for api call, used to associate response
  api: string;  // name of api in the form Module.Api
  type: string; // type of arg
  arg: any;     // argument, can be primitive or complex object
}

