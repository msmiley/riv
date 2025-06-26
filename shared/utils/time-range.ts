//
// util to calculate time ranges for some presets/mnemonics, maybe someday will
// be smart enough to interpret fuzzy user input, but for now stick to the
// presets
//
const rangePresets = {
  '1m'(et) {
    return new Date(Date.now() - 6e4);
  },
  '15m'(et) {
    return new Date(Date.now() - 9e5);
  },
  '30m'(et) {
    return new Date(Date.now() - 18e5);
  },
  '1h'(et) {
    return new Date(Date.now() - 36e5);
  },
  '6h'(et) {
    return new Date(Date.now() - 216e5);
  },
  '12h'(et) {
    return new Date(Date.now() - 432e5);
  },
  '24h'(et) {
    return new Date(Date.now() - 864e5);
  },
  '1D'(et) {
    return new Date(Date.now() - 864e5);
  },
  '3D'(et) {
    return new Date(Date.now() - 2592e5);
  },
  '1W'(et) {
    return new Date(Date.now() - 6048e5);
  },
  '2W'(et) {
    return new Date(Date.now() - 12096e5);
  },
  '1M'(et) {
    return new Date(Date.now() - 2592e6);
  },
  '3M'(et) {
    return new Date(Date.now() - 7776e6);
  },
  '6M'(et) {
    return new Date(Date.now() - 15552e6);
  },
  '1Y'(et) {
    return new Date(Date.now() - 31536e6);
  },
  'All'() {
    return new Date(0);
  },
};

export default {
  getRangePresets() {
    return Object.keys(rangePresets);
  },
  validRangePreset(range) {
    return !!rangePresets[range];
  },
  getStartOfRange(range, endTime) {
    if (this.validRangePreset(range)) {
      return rangePresets[range](endTime);
    }
    return null;
  },
};
