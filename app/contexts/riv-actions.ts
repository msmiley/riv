import { filter } from 'lodash-es';
import { io } from 'socket.io-client';
import { generateId } from '../utils';
import type { RivState, RivAction, RivActionData } from '../types';
import { RivSocketDirection } from '../enums';
import { jwtValid } from '../utils';
import useRiv from '~/hooks/useRiv';


const SOCKET_RECONNECT_INTERVAL = 1000; // 1 second

export default {
  // special action to initialize the riv context
  init(state: RivState, 
       data: RivActionData, 
       dispatch: React.ActionDispatch<[action: RivAction]>): RivState {
    let ret: RivState = { // prepare return state
      ...state
    };
    //////////////////////////////////////////////////////////////////////////
    // check stored token
    let storedToken = localStorage.getItem('rivToken');
    let validToken = null;
    if (storedToken && jwtValid(storedToken)) {
      ret.authToken = storedToken;
    } else {
      localStorage.clear();
    }
    // setup socket
    if (ret.authToken) {
      ret.authState = 'checkingToken';
      console.log('RIV | setting up socket.io with token', ret.authToken);
    } else {
      console.log('RIV | setting up socket.io without token');
    }
    // meta.env is set by vite, so we can use it to determine the URL when running in vite
    let url = import.meta.env ? 'http://localhost:5500/riv' : '/riv';
    ret.ioSocket = io(url, {
      path: `/socket.io`,
      transports: ['websocket', 'polling'],
      auth: {
        token: ret.authToken, // send the token for auth
      },
    });
    // called when the socket connects
    ret.ioSocket.on('connect', () => {
      dispatch({ type: 'connected' });
    });
    // called on disconnect
    ret.ioSocket.on('disconnect', () => {
      dispatch({ type: 'disconnected' });
      ret.ioSocket.auth = { token: state.authToken }; // set token for reconnect attempt
      setTimeout(() => { // use timeout to avoid immediate reconnect loop
        ret.ioSocket.connect();
      }, SOCKET_RECONNECT_INTERVAL);
    });
    // receive handler
    ret.ioSocket.on(RivSocketDirection.Recv, (eventType: string, arg: any) => {
      // process built-in riv messages
      switch (eventType) {
        case 'ping':
          break;
        case 'riv-invalid-token':
          console.log('RIV | invalid token, logging out');
          dispatch({ type: 'logout' });
          break;
        case 'riv-update-user':
          console.log('RIV | received user profile', arg);
          dispatch({ type: 'login', data: arg });
          break;
      }
      // provide the event to any listeners
      let listeners = filter(state.ioListeners, { eventType });
      for (let l of listeners) {
        l.callback && l.callback(arg);
      }
    });
    return ret;
  },
  login(state: RivState, data: RivActionData): RivState {
    console.log('RIV | login action received', data);
    if (data.token && jwtValid(data.token)) {
      localStorage.setItem('rivToken', data.token);
      console.log('RIV | login successful, token set');
      return {
        ...state,
        authState: 'loggedIn',
        authToken: data.token,
        username: data.username || state.username,
        fullname: data.fullname || state.fullname,
        email: data.email || state.email,
        avatar: data.avatar || state.avatar,
        permissions: data.permissions || state.permissions,
        isDarkMode: data.isDarkMode || state.isDarkMode,
      };
    } else {
      console.warn('RIV | login failed, invalid token');
      return {
        ...state,
        authState: 'loggedOut',
      };
    }
  },
  logout(state: RivState): RivState {
    console.log('RIV | logout action received');
    localStorage.removeItem('rivToken');
    state.ioSocket?.disconnect();
    return {
      ...state,
      authState: 'loggedOut',
      authToken: '',
      username: '',
      fullname: '',
      email: '',
      avatar: '',
      permissions: [],
    };
  },
  connected(state: RivState): RivState {
    console.debug('RIV | socket.io connected');
    return {
      ...state,
      ioConnected: true,
    };
  },
  disconnected(state: RivState): RivState {
    console.debug('RIV | socket.io disconnected, reconnecting...');
    return {
      ...state,
      ioConnected: false,
    };
  },
  addListener(state: RivState, data: RivActionData): RivState {
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
  toggleDarkMode(state: RivState): RivState {
    const nextIsDark = !state.isDarkMode;
    // Toggle class on body if running in a browser
    if (typeof document !== 'undefined' && document?.body) {
      try {
        document.body.classList.toggle('riv-dark', nextIsDark);
      } catch (e) {
        // noop if DOM isn't available
      }
    }
    return {
      ...state,
      isDarkMode: nextIsDark,
    };
  },
}