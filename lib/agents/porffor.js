'use strict';

const fs = require('fs');
const runtimePath = require('../runtime-path');
const ConsoleAgent = require('../ConsoleAgent');

const errorExp = /^(.+?Error): (.+)$/m;

let prelude;
class PorfforAgent extends ConsoleAgent {
  compile(code) {
    code = super.compile(code).replaceAll(';$262.destroy();', '');

    return prelude + code.split('---*/').pop();
  }

  async evalScript(code, options = {}) {
    if (!prelude) prelude = await (await fetch('https://raw.githubusercontent.com/CanadaHonk/porffor/main/test262/prelude.js')).text();

    if (options.module && this.args[0] !== '--module') {
      this.args.unshift('--module');
    }

    if (!options.module && this.args[0] === '--module') {
      this.args.shift();
    }

    const hacks = [
      // remove error constructor checks
      x => {
        const str = `if (err.constructor !== Test262Error) {`;
        const ind = x.indexOf(str);
        if (ind === -1) return x;
    
        const nextEnd = x.indexOf('}', ind + str.length);
    
        return x.replace(x.slice(ind, nextEnd + 1), '');
      },
    
      // random error detail checks
      x => {
        return x
          .replace(/assert\.notSameValue\(err\.message\.indexOf\('.*?'\), -1\);/g, '')
          .replace(/if \(\(e instanceof (.*)Error\) !== true\) \{[\w\W]*?\}/g, '');
      },
    
      // remove messages from asserts (assert, assert.sameValue, assert.notSameValue)
      x => {
        return x
          .replace(/((assert)(\.sameValue|\.notSameValue)?\(.*?, .*?), .*\);/g, (_, excludingLastArg) => excludingLastArg + ')');
      },
    
      // replace old tests' custom checks with standard assert
      x => {
        return x
          .replace(/if \(([^ ]+) !== ([^ ]+)\) \{ *\n *throw new Test262Error\(['"](.*)\. Actual:.*\); *\n\} *\n/g, (_, one, two) => `assert.sameValue(${one}, ${two});\n`);
      },
    
      // remove actual string concats from some error messages
      x => {
        return x
          .replace(/\. Actual: ' \+ .*\);/g, _ => `');`);
      }
    ];

    for (const hack of hacks) {
      code.contents = hack(code.contents);
    }

    return super.evalScript(code, options);
  }

  parseError(str) {
    const match = str.match(errorExp);

    if (!match) return null;

    return {
      name: match[1],
      message: match[2],
      stack: []
    };
  }
}

PorfforAgent.runtime = fs.readFileSync(runtimePath.for('porffor'), 'utf8');

module.exports = PorfforAgent;
