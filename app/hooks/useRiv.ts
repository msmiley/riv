//
// Main Riv hook to use riv built-in functionality
//
import React from 'react';

import { RivContext } from '../contexts/riv';

export default function useRiv() {
  return React.useContext(RivContext);
}
