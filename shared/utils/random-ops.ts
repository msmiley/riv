if (typeof window === 'undefined') {
  await import('node:crypto');
}

export default {
  randomNumber(min, max) {
    return Math.random() * (max - min) + min;
  },
  randomInteger(min, max) {
    return Math.round(Math.random() * (max - min) + min);
  },
  // generate a random hex string with the given length
  generateId(length) {
    function dec2hex (dec) {
      return dec < 10 ? '0' + String(dec):dec.toString(16);
    }
    var arr = new Uint8Array((length ?? 40) / 2);
    crypto.getRandomValues(arr);
    return Array.from(arr, dec2hex).join('');
  },
};
