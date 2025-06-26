// Base class for simple CRUD-based operations on mongo collections
//
import { RivData } from './riv-data.ts';

export class RivMongoData extends RivData {
  constructor(obj = {}, defaults = {}) {
    super(obj, defaults);
    console.log('RIV MONGO DATA!!!!!!!!!!!!!')
  }
  static hasServerInit = false;
  static serverInit() {
    console.log('server init called 1', this.hasServerInit)
    this.hasServerInit = true;
    console.log('server init called 2', this.hasServerInit)
  }

}
