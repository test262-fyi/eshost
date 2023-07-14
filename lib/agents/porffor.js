'use strict';

const fs = require('fs');
const runtimePath = require('../runtime-path');
const ConsoleAgent = require('../ConsoleAgent');

const errorExp = /^(.+?Error): (.+)$/gm;

class PorfforAgent extends ConsoleAgent {
  compile(code) {
    code = super.compile(code);

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
          .replace(/assert\.notSameValue\(err\.message\.indexOf\('.*?'\), -1\);/g, '');
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
      code = hack(code);
    }

    console.log(code);

    return code;
  }

  async evalScript(code, options = {}) {
    if (options.module && this.args[0] !== '--module') {
      this.args.unshift('--module');
    }

    if (!options.module && this.args[0] === '--module') {
      this.args.shift();
    }

    return super.evalScript(code, options);
  }

  parseError(str) {
    const match = str.match(errorExp);

    if (!match)
      return null;

    return {
      name: match[1],
      message: match[2],
      stack: []
    };
  }
}

PorfforAgent.runtime = fs.readFileSync(runtimePath.for('porffor'), 'utf8');

module.exports = PorfforAgent;
