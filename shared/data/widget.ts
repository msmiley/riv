//
// widget class, used in widgets array of WidgetBoard
//
import { RivData } from '../base/riv-data.ts';
import RandomOps from '../utils/random-ops.ts';

export class Widget extends RivData {
  constructor(obj = {}, defaults = {
    id: RandomOps.generateId(8),
    component: '', // client-side riv component name
    data: [],      // data, either array, function, or string API name
    options: {},   // free form options object
    position: {    // position used to place widget on RivWidgetBoard
      x: 0,  // x pos
      y: 0,  // y pos
      w: 1,  // width
      h: 1,  // height
    },
  }) {
    super(obj, defaults);
  }
}
