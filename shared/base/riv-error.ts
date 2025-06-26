import { RivData } from './riv-data.ts';
//
// Error class
//
export class RivError extends RivData {
  constructor(msg) {
    if (!msg) {
      throw Error('need a msg');
    }
    if (typeof(msg) === 'string') {
      this.msg = msg;
    }
    // set timestamp
    this.ts = new Date();

    this.error = new Error(msg);

  }
}
