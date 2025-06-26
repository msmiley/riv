export default {
  toTitleCase(str) {
    return str.split(' ').map(function(word, idx) {
      if (word && word.length > 0) {
        let exceptions = [
          // short conjunctions
          'and', 'as', 'but', 'for', 'if', 'nor', 'or', 'so', 'yet',
          // articles
          'a', 'an', 'the',
          // short prepositions
          'as', 'at', 'by', 'in', 'of', 'off', 'on', 'per', 'to', 'up', 'via',
          // Apple words
          'iOS', 'macOS', 'iCloud', 'KVPs'
        ];
        if (idx === 0 || exceptions.indexOf(word) < 0) {
          let hyphenated = word.split('-');
          if (hyphenated.length > 1) {
            return hyphenated.map(function(word) {
              return word.replace(word[0], word[0].toUpperCase());
            }).join('-');
          }
          return word.replace(word[0], word[0].toUpperCase());
        }
        return word;
      }
    }).join(' ');
  },
  toHumanizedBytes(intNum) {
    if (intNum === null || intNum === undefined) {
      return '';
    }
    const suffixes = ['B', 'kB', 'MB', 'GB', 'TB', 'PB'];
    if (intNum < 1000) {
      return intNum.toFixed(1) + suffixes[0];
    }
    let i = parseInt(Math.floor(Math.log(intNum) / Math.log(1000)), 10);
    return (intNum / Math.pow(1000, i)).toFixed(1) + suffixes[i];
  },
  toHumanizedNumber(intNum) {
    if (intNum == null || intNum === undefined) {
      return '';
    }
    const suffixes = ['k', 'M', 'B', 'T', 'Qd', 'Qn', 'Sx', 'Sp', 'O', 'N', 'D', 'G', 'Gp'];
    if (intNum < 1000) {
      return intNum % 1 > 0 ? intNum.toFixed(1):intNum;
    }
    let i = parseInt(Math.floor(Math.log(intNum) / Math.log(1000)), 10) - 1;
    return (intNum / Math.pow(1000, i+1)).toFixed(1) + suffixes[i];
  },
};
