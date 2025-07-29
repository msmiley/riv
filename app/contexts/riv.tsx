// RIV context
// serves as the store for centralized built-in RIV state
// this includes:
// - user session
// -
import React from 'react';
import { generateId } from '../utils';
import RivActions from './riv-actions';
import type { RivState, RivAction } from '../types';
import { RivSocketDirection } from '../enums';

// context type
interface RivContextT {
  state: RivState;
  dispatch: React.Dispatch<RivAction>;
  apiCall: (api: string, ...args: any[]) => Promise<any>;
}

export const RivContext = React.createContext<RivContextT>({} as RivContextT);

export function RivProvider({ children }: React.PropsWithChildren) {
  let token = '<token>';

  // proxy for dispatching an action
  const dispatchProxy = (action: RivAction) => dispatch(action);
  //
  // riv context reducer, all actions are handled here
  //
  const reducer = (state: RivState, action: RivAction): RivState => {
    if (action.type in RivActions) {
      return RivActions[action.type as keyof typeof RivActions](state, action, dispatchProxy);
    }
    return state;
  };
  //
  // initialize reducer
  //
  const [state, dispatch] = React.useReducer(reducer, {
    username: '',
    ioSocket: null,
    ioConnected: false,
    ioListeners: [], // socket listeners
  });
  //
  // dispatch initial init
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
