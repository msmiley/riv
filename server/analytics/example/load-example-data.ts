import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

export default {
  loadData(insertFn) {
    let data = require('./MOCK_DATA.json');
    let cnt = 0;
    for (let d of data) {
      insertFn('example', d);
      cnt++;
    }
    console.log(`inserting ${cnt} example analytics docs`);
  },
};
