//
// shared analytics util functions
//
import NumberOps from './number-ops.ts';

export default {
  // intelligently render a measure value based on the name of the measure
  //
  renderMeasureValue(measure, value) {
    switch (measure.format) {
      case 'commas':
        return NumberOps.toCommas(value);
      case 'bytes':
        return this.renderBytes(value);
      case 'auto':
      default:
        if (/byte/i.test(measure.field)) {
          return this.renderBytes(value);
        } else {
          return this.renderCount(value);
        }
    }
  },
  // render integer count value with a friendly mnemonic, i.e. 1.2 k instead of 1200
  renderCount(value) {
    if (value == null || value === undefined) {
      return '';
    }
    const suffixes = ['k', 'M', 'B', 'T', 'Qd', 'Qn', 'Sx', 'Sp', 'O', 'N', 'D', 'G', 'Gp'];
    if (value < 1000) {
      return value % 1 > 0 ? value.toFixed(1):value;
    }
    let i = parseInt(Math.floor(Math.log(value) / Math.log(1000)), 10) - 1;
    return `${(value / Math.pow(1000, i+1)).toFixed(1)} ${suffixes[i]}`;
  },
  // render byte count value as bytes string, i.e. 1.2 kB instead of 1200
  renderBytes(value) {
    if (value === null || value === undefined) {
      return '';
    }
    const suffixes = ['B', 'kB', 'MB', 'GB', 'TB', 'PB'];
    if (value < 1000) {
      return value.toFixed(1) + suffixes[0];
    }
    let i = parseInt(Math.floor(Math.log(value) / Math.log(1000)), 10);
    return `${(value / Math.pow(1000, i)).toFixed(1)} ${suffixes[i]}`;
  },
};
