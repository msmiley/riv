
// helper to process classNames in Vue form
//
export function cls(classnames) {
  // recursive function to crawl
  let recur = function(o, ary) {
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
  let ret = [];
  recur(classnames, ret)
  return ret.join(' ');
};

//
// util to interpret bootstrap variant (succes, warning, critical) color names,
// also wraps naked CSS vars in var()
//
export function parseColor(color) {
  // if CSS var name was provided, wrap it and exit
  if (typeof(color) === 'string' && color.startsWith('--')) {
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
