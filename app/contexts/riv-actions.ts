import { filter } from 'lodash-es';
import { io } from 'socket.io-client';
import { generateId } from '../utils';
import type { RivState, RivAction } from '../types';
import { RivSocketDirection } from '../enums';

const SOCKET_RECONNECT_INTERVAL = 1000; // 1 second

export default {
  init(state: RivState, 
       action: RivAction, 
       dispatch: React.ActionDispatch<[action: RivAction]>): RivState {
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
  },
  connected(state: RivState): RivState {
    console.debug('riv> socket.io connected');
    return {
      ...state,
      ioConnected: true,
    };
  },
  disconnected(state: RivState): RivState {
    console.debug('riv> socket.io disconnected, reconnecting...');
    return {
      ...state,
      ioConnected: false,
    };
  },
  addListener(state: RivState, action: RivAction): RivState {
    const { type, data } = action;
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
  },
}