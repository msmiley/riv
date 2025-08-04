import type { RivState } from "~/types";

export default {
  isLoggedIn(state: RivState) {
    return state.authState === 'loggedIn';
  },
  
}