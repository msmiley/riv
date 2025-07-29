
  
// format for actions
export interface RivAction {
  type: string;
  data?: {[key: string]: any};
}

// state object
export interface RivState {
  // USER
  username: string;
  
  // SOCKET
  ioSocket: any;
  ioConnected: boolean;
  ioListeners: { eventType: string, callback: Function }[];
}

