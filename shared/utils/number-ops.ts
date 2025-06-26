export default {
  toCommas(d) {
    if (d === null || d === undefined) {
      return '';
    }
    if (typeof(d) === 'number') {
      return Number(d).toLocaleString('en');
    }
    if (typeof(d) === 'string') {
      let n = Number(parseFloat(d)).toLocaleString('en');
      if (!isNaN(n)) {
        return n;
      }
    }
    return d;
  },
};
