import { Property, RivModule } from "shared/base/riv-module";
import util from 'node:util';
import readline from 'node:readline';

export default class Console extends RivModule {
  @Property('Enable timestamp prefixes in console logs')
  timestamp: boolean = false;
  @Property('Enable monochrome output in console logs')
  monochrome: boolean = false;
  @Property('Enable compact mode for console logs')
  compact: boolean = true;
  @Property('Allow eval in console')
  allowEval: boolean = false;
  @Property('Filter for console logs')
  filter: RegExp | null = null; // regex filter for console logs, null means no filter

  // general props
  pauseOutput: boolean = false; // pause output
  waitForInput: boolean = false; // waiting for input from user

  init() {
    this.$log('Console module initialized');
    // print header
    console.log(this.colorz('  ____    ____  ', 'bg.blue') + this.colorz(` Powered by Riv`, 'bold.blue'));
    console.log(this.colorz('  \\\\\\\\\\  /////  ', 'bg.blue') + this.colorz(` started on ${(new Date).toISOString()}`, 'bold.blue'));
    console.log(this.colorz('   \\\\\\\\\\/////   ', 'bg.blue') + this.colorz(' press q to shutdown', 'bold.blue'));
    console.log(this.colorz('    \\\\\\\\////    ', 'bg.blue') + this.colorz(' press f to filter', 'bold.blue'));
    console.log(this.colorz('     \\\\\\///     ', 'bg.blue') + this.colorz(' press t to toggle timestamps', 'bold.blue'));
    console.log(this.colorz('      \\\\//      ', 'bg.blue') + this.colorz(' press c to toggle compact inspect', 'bold.blue'));
    console.log(this.colorz('       \\/       ', 'bg.blue') + this.colorz(' press s to print status for the wheel', 'bold.blue'));
    console.log(this.colorz('                ', 'bg.blue') + this.colorz(' press p to pause output', 'bold.blue'));
    console.log(this.colorz('                ', 'bg.blue') + this.colorz(' press e to evaluate statement', 'bold.blue'));

    // add keypress handler if there is tty
    if (Boolean(process.stdout.isTTY) && process.stdin.setRawMode) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      readline.emitKeypressEvents(process.stdin);
      process.stdin.setRawMode(true);
      process.stdin.on('keypress', (str, key) => {
        // don't process keystrokes when waiting for input
        if (!this.waitForInput) {
          if ((key.ctrl && key.name === 'c') || key.name === 'q') {
            this.$shutdown();
          } else if (key.name === 't') {
            this.timestamp = !this.timestamp;
          } else if (key.name === 'c') {
            this.compact = !this.compact;
          } else if (key.name === 's') {
            this.renderServerStatus();
          } else if (key.name === 'p') {
            if (!this.pauseOutput) {
              console.log(this.colorz('Pausing, press p again to un-pause', 'bg.magenta'));
            }
            this.pauseOutput = !this.pauseOutput;
          } else if (key.name === 'e' && this.allowEval) {
            this.waitForInput = true;
            rl.clearLine();
            rl.question(this.colorz('Enter statement:', 'bg.magenta'), (ans) => {
              if (ans.length > 0) {
                try {
                  (() => {
                    console.log(util.inspect(eval(ans), {
                      colors: !this.monochrome,
                      breakLength: Infinity,
                      depth: null,
                      compact: false,
                    }));
                  }).call(this);
                } catch (e) {
                  console.log(this.colorz(e, 'red'));
                }
              }
              this.waitForInput = false;
            });
          } else if (key.name === 'f') {
            this.waitForInput = true;
            rl.clearLine();
            rl.question(this.colorz('Enter new filter:', 'bg.magenta'), (ans: string) => {
              if (ans.length > 0) {
                this.filter = new RegExp(ans, 'i');
                console.log(this.colorz(`Filtering on ${ans}`, 'bg.magenta'));
              } else {
                console.log(this.colorz('Continuing with no filtering', 'bg.magenta'));
                this.filter = null;
              }
              this.waitForInput = false;
            });
          }
        }
      });
    }
  }

  //
  // CONSOLE LOGGING METHODS
  //
  log(name: string, ...args: any[]) {
    console.log(`LOG | ${name} |`, this.renderConsoleArgs(args));
  }
  debug(name: string, ...args: any[]) {
    console.debug(`DBG | ${name} |`, this.renderConsoleArgs(args));
  }
  warn(name: string, ...args: any[]) {
    console.warn(`WRN | ${name} |`, this.renderConsoleArgs(args));
  }
  error(name: string, ...args: any[]) {
    console.error(`ERR | ${name} |`, this.renderConsoleArgs(args));
  }
  ready(name: string, ...args: any[]) {
    console.info(`RDY | ${name} |`, this.renderConsoleArgs(args));
  }
  renderConsoleArgs(args: any[]) {
    if (args.length > 0) {
      // aggregate rendered content items
      let content = [];
      for (let a of args) {
        if (typeof (a) === 'object') {
          content.push(util.inspect(a, {
            colors: true,
            breakLength: Infinity,
            depth: null,
            compact: false,
          }));
        } else {
          content.push(a);
        }
      }
      return content.join(', ');
    }
    return '';
  }
  colorz(str: string, color: string) {
    if (this.monochrome) {
      return str;
    }
    switch (color) {
      case 'bg.red':
        return `\x1b[41m${str}\x1b[0m`;
      case 'bg.green':
        return `\x1b[42m${str}\x1b[0m`;
      case 'bg.blue':
        return `\x1b[44m${str}\x1b[0m`;
      case 'bg.magenta':
        return `\x1b[45m${str}\x1b[0m`;
      case 'bold.blue':
        return `\x1b[34;1m${str}\x1b[0m`;
      case 'red':
        return `\x1b[31m${str}\x1b[0m`;
      case 'green':
        return `\x1b[32m${str}\x1b[0m`;
      case 'yellow':
        return `\x1b[33m${str}\x1b[0m`;
      case 'magenta':
        return `\x1b[35m${str}\x1b[0m`;
      case 'cyan':
        return `\x1b[36m${str}\x1b[0m`;
      default:
        console.warn(`not implemented color code ${color}`);
        return str;
    }
  }
    renderServerStatus() {

    }
}