
// global app types
//
import React from 'react';
export type RivActionData = { [key: string]: any };
  
// format for actions
export interface RivAction {
  type: string;
  data?: RivActionData;
}

// state object
export interface RivState {
  // AUTH
  authState: 'checkingToken' | 'loggedOut' | 'loggedIn' | 'loggingIn' | 'loggingOut' | 'waitingOtp' | 'changePassword';
  authToken: string;

  // USER
  username: string;
  fullname?: string;
  email?: string;
  avatar?: string;
  permissions: string[];
  isDarkMode: boolean;

  // SOCKET
  ioSocket: any;
  ioConnected: boolean;
  ioListeners: { eventType: string, callback: Function }[];
}

// format for getters: functions that derive data from the state
// uses a single argument
export type RivGetterProxy = (arg?: any) => any;
export type RivGetter = (state: RivState, arg?: any) => any;

// slot props for popup button slots (e.g. Dropdown and Modal)
export type PopupTriggerSlotProps = {
  ref: React.Ref<HTMLElement>;
  onClick: () => void;
};
// slot prop for closing popups
export type PopupCloseSlotProps = {
  onClose: () => void;
};

// Semantic size tokens (repurposed from gap sizing)
export type SemanticSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
