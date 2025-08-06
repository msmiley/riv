// built-in riv info module meant to encapsulate info API calls such as
// version, system metrics, etc.
//
//
import fs from 'node:fs';
import path from 'node:path';
import utils from './utils';
import type { RivServer } from './riv-server.ts';
import { RivError } from '../shared/base/riv-error';
import { RivModule, ApiMethod, Property, EventHandler } from '../shared/base/riv-module';
import type { RivRequest } from 'shared/types/server';

export default class Info extends RivModule {
  private version: string = ''; // should represent riv version

  @Property('this is a test prop')
  testProp: string = 'testProp default value';
  @Property('sets the pint interval')
  pingInterval: number = 10000; // ping interval in ms, default 10 seconds

  init() {
    this.$log('Info init()');
    
    this.version = JSON.parse(fs.readFileSync(path.join(utils.findRoot(), 'package.json'), 'utf-8')).version;
    setInterval(this.sendTime, this.pingInterval);
  }
  done() {
    this.$log('Info done()');
  }
  /////////////////////
  // API METHODS
  /////////////////////
  @ApiMethod('Get the current Riv version')
  getRivVersion() {
    return this.version;
  }
  @ApiMethod('Get the server name')
  getName() {
    return this.name;
  }
  @ApiMethod('Get the current date and time')
  getDate() {
    return new Date();
  }
  @ApiMethod('Get the testProp')
  getTestProp() {
    let d = this.$.Mongo.find('rivRoles', { name: 'Administrator' });
    return d;
  }
  // test harnesses
  @ApiMethod('Manually throw a console error on the server', 'dev')
  throwConsoleError(req: RivRequest, msg: string) {
    this.$error(msg);
  }
  @ApiMethod('Manually throw a RivError on the server', 'dev')
  throwRivError(req: RivRequest, msg: string) {
    return new RivError(msg);
  }
  @ApiMethod('Test log to console', 'dev')
  consoleLog(req: RivRequest, arg: any) {
    console.log('Info.consoleLog----------------------------------------------');
    console.log('typeof: ', typeof(arg));
    console.log(arg);
    console.log('-------------------------------------------------------------');
  }

  //
  // EVENT HANDLERS
  //
  @EventHandler('riv.test,riv.test2', 'Test event handler')
  testEventHandler(...args: any[]) {
    this.$log('Info.testEventHandler called with args:', args);
  }

  //
  // METHODS
  //
  sendTime() {
    // this.$emit('sendToAllUsers', 'ServerTime', new Date().getTime());
    // this.$emit('sendToUserId', '667b2561c943a65d9f932e1a', 'sdjfkls');
  }
}


