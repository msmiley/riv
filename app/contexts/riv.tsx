// RIV context
// serves as the store for centralized built-in RIV state
// this includes:
// - user session
// -
import React from 'react';
import { filter } from 'lodash-es';
import { io } from 'socket.io-client';
import { generateId } from '../utils';

const SOCKET_RECONNECT_INTERVAL = 1000; // 1 second

// enum for direction of socket messages
enum RivSocketDirection {
  Send = 'client>server',
  Recv = 'server>client',
}

// format for actions
interface RivAction {
  type: string;
  data?: {[key: string]: any};
}
// state object
interface RivState {
  username: string;
  count: number;

  ioSocket: any;
  ioConnected: boolean;
  ioListeners: { eventType: string, callback: Function }[];
}
// context type
interface RivContextT {
  state: RivState;
  dispatch: React.Dispatch<RivAction>;
  apiCall: (api: string, ...args: any[]) => Promise<any>;
}

export const RivContext = React.createContext<RivContextT>({} as RivContextT);

export function RivProvider({ children }: React.PropsWithChildren) {
  let token = '<token>';
  //
  // riv context reducer, all actions are handled here
  //
  const reducer = (state: RivState, action: RivAction) => {
    const { type, data } = action;
    switch (type) {
      // riv initialization
      case 'init': {
        // meta.env is set by vite, so we can use it to determine the URL
        let url = import.meta.env ? 'http://localhost:5500/riv' : '/riv';
        const ioSocket = io(url, {
          path: `/socket.io`,
          transports: ['websocket', 'polling'],
          auth: {
            token: 'token', // send the token for auth
          },
        });
        // called when the socket connects
        ioSocket.on('connect', () => {
          dispatch({ type: 'connected' });
        });
        // called on disconnect
        ioSocket.on('disconnect', () => {
          dispatch({ type: 'disconnected' });
          ioSocket.auth = { token: 'token' }; // set token for reconnect attempt
          setTimeout(() => { // use timeout to avoid immediate reconnect loop
            ioSocket.connect();
          }, SOCKET_RECONNECT_INTERVAL);
        });
        // receive handler
        ioSocket.on(RivSocketDirection.Recv, (eventType, ...args) => {
          // process built-in riv messages
          switch (eventType) {
            case 'ping':
              console.debug('riv> ping received', args); 
              break;
            case 'riv-invalid-token':
              console.log('riv> invalid token, logging out');
              dispatch({ type: 'logout' });
              break;
            case 'riv-update-user':
              console.log('riv> received user profile', args);
              break;
          }
          // provide the event to any listeners
          let listeners = filter(state.ioListeners, { eventType });
          for (let l of listeners) {
            l.callback && l.callback(...args);
          }
        });
        return {
          ...state,
          ioSocket
        };
      }
      case 'connected':
        console.debug('riv> socket.io connected');
        return {
          ...state,
          ioConnected: true,
        };
      case 'disconnected':
        console.debug('riv> socket.io disconnected, reconnecting...');
        return {
          ...state,
          ioConnected: false,
        };
      // add socket listener
      case 'addListener':
        if (data?.eventType && data?.callback) {
          let newListener = {
            id: generateId(),
            eventType: data.eventType,
            callback: data.callback,
          };
          return {
            ...state,
            ioListeners: [...state.ioListeners, newListener],
          };
        }
        return state;
      case 'increment':
        return {
          ...state,
          count: state.count + 1,
        };
      default:
        return state;
    }
  };
  //
  // initialize reducer
  //
  const [state, dispatch] = React.useReducer(reducer, {
    username: '',
    count: 0,

    ioSocket: null,
    ioConnected: false,
    ioListeners: [], // socket listeners
  });
  //
  // dispatch init
  //
  React.useEffect(() => {
    dispatch({
      type: 'init',
    });
  }, []);
  //
  // perform server api call
  //
  const apiCall = (api: string, arg: any = {}) => {
    return new Promise((resolve, reject) => {
      if (!state.ioSocket) {
        console.error('tried apiCall before socket initialized');
        return;
      }
      // unique id to handle the response event
      let id = generateId();
      // gather types into the types array ('generic' is the failsafe)
      let type = arg?.constructor?.name ?? 'generic';
      // send it
      state.ioSocket.emit(RivSocketDirection.Send, {
        id,
        api,
        type,
        arg,
      });
      // register a one-time handler for the response and resolve the promise
      // and try to rehydrate the data type
      state.ioSocket.once(id, (err: string, res: any) => {
        // console.log('apiCall response', err, res);
        if (err) {
          // console.error(`error in apiCall ${api} response`, err);
          return reject(`error in apiCall: ${err}`);
        }
        // rehydrate data type
        switch (res.type) {
          // noop for primitives handled automatically
          case 'Array':
          case 'Boolean':
          case 'Number':
          case 'String':
          case 'generic':
            break;
          case 'Date':
            return resolve(new Date(res.data));
          default:
            // // see if there's a class with this name
            // let Module = this.classes[res.type];
            // if (Module) {
            //   // rehydrate and set the isClient flag
            //   let instance = new Module(res.data);
            //   instance.isOnClient = true;
            //   return resolve(instance); // send new instance to caller
            // }
        }
        // fallback to raw data
        resolve(res.data);
      });
    });
  };

  return (
    <RivContext value={{
        state,
        dispatch,
        apiCall,
      }}>
      {children}
    </RivContext>
  );
}
