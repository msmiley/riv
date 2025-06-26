// built-in riv info module meant to encapsulate info API calls such as
// version, system metrics, etc.
//
//
import fs from 'node:fs';
import path from 'node:path';
import utils from './utils.ts';
import { RivError } from '../shared/base/riv-error.ts';

export default {
  name: 'Info',
  props: {
    // finds riv version
    version: JSON.parse(fs.readFileSync(path.join(utils.findRoot(), 'package.json'))).version,
  },
  init() {
    setInterval(this.sendTime, 1000);
  },
  data() {
    return {
    };
  },
  api: {
    getRivVersion() {
      return this.version;
    },
    getName() {
      return this.name;
    },
    getDate() {
      return new Date();
    },
    // test harnesses
    'throwConsoleError:dev'(req, msg) {
      this.$error(msg);
    },
    'throwRivError:dev'(req, msg) {
      return new RivError(msg);
    },
    'consoleLog:dev'(req, msg, msg2) {
      console.log('Info.consoleLog----------------------------------------------');
      console.log('types: ', typeof(msg), typeof(msg2));
      console.log(msg, msg2);
      console.log('-------------------------------------------------------------');
    },
  },
  methods: {
    sendTime() {
      this.$emit('sendToAllUsers', 'ServerTime', new Date().getTime());
      // this.$emit('sendToUserId', '667b2561c943a65d9f932e1a', 'sdjfkls');
    },
  },
};
