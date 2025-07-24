import * as d3 from 'd3';
let colors = d3.scaleOrdinal([...Array(10).keys()], d3.schemeDark2);

import * as GP from '@victr/geopattern';
//
// helper to process classNames in Vue form
// e.g. cls(styles.button, `variant_${props.variant}`, { disabled, color: getColor(props) })
//
export function cls(...classnames: (string | object)[]) {
  // recursive function to crawl
  let recur = function(o: (string | object), ary: string[]) {
    // loop through object entries
    for (let [k, v] of Object.entries(o)) {

      // ignore children in case PropsWithChildren was passed in
      if (k === 'children') continue;

      // if value is boolean, use it as flag to add key
      let tv = typeof(v);
      if (tv === 'boolean' ||
          tv === 'undefined') {
        if (v) {
          ary.push(k);
        }
      } else if (tv !== 'string') { // if value not string, then assume object
        recur(v, ary);
      } else { // push string value onto array
        ary.push(v);
      }
    }
  };
  let ret: string[] = [];
  recur(classnames, ret)
  return ret.join(' ');
};

//
// util to interpret bootstrap variant (succes, warning, critical) color names,
// also wraps naked CSS vars in var()
//
export function parseColor(color: string) {
  // if CSS var name was provided, wrap it and exit
  if (color.startsWith('--')) {
    return `var(${color})`;
  }
  // interpret semantic color variants, otherwise return original
  switch (color) {
    case 'success':
      return 'var(--riv-success)';
    case 'primary':
      return 'var(--riv-primary)';
    case 'secondary':
      return 'var(--riv-secondary)';
    case 'info':
      return 'var(--riv-info)';
    case 'warning':
      return 'var(--riv-warning)';
    case 'danger':
      return 'var(--riv-danger)';
    case 'text':
      return 'var(--riv-text-color)';
    case 'white':
      return 'var(--riv-white)';
    default: // give up and return directly
      return color;
  }
};

export function chartColorGenerator(color: number) {
  return colors(color);
};

export function getGeoPattern(str: string) {
  if (str) {
    return GP.generate(str).toDataUrl()
  }
};

export function generateId(length = 8) {
  function dec2hex (dec: number) {
    return dec < 10 ? '0' + String(dec):dec.toString(16);
  }
  var arr = new Uint8Array((length) / 2);
  crypto.getRandomValues(arr);
  return Array.from(arr, dec2hex).join('');
};
