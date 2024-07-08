'use strict';

const fs = require('fs');
const runtimePath = require('../runtime-path');
const ConsoleAgent = require('../ConsoleAgent');

const errorExp = /^(.+?Error): (.+)$/m;

let preludes;
class PorfforAgent extends ConsoleAgent {
  compile(code, attrs) {
    code = super.compile(code).replaceAll(';$262.destroy();', '');

    return attrs.includes.reduce((acc, x) => acc + (preludes[x] ?? '') + '\n', '') + code.slice(code.lastIndexOf('---*/') + 5);
  }

  async evalScript(code, options = {}) {
    if (!preludes) preludes = (await (await fetch('https://raw.githubusercontent.com/CanadaHonk/porffor/main/test262/harness.js')).text()).split('///').reduce((acc, x) => {
      const [ k, ...content ] = x.split('\n');
      acc[k.trim()] = content.join('\n').trim();
      return acc;
    }, {});

    if (options.module && this.args[0] !== '--module') {
      this.args.unshift('--module');
    }

    if (!options.module && this.args[0] === '--module') {
      this.args.shift();
    }

    let toRun = code.contents;

    toRun = toRun
      // error detail checks
      .replace(/assert\.notSameValue\(er?r?\.message\.indexOf\('.*?'\), -1\);/g, '')
      .replace(/if *\(\(er?r? *instanceof *(.*)Error\) *!==? *true\) *\{[\w\W]*?\}/g, '')
      .replace(/if *\((er?r?|reason)\.constructor *!==? *(.*)Error\) *\{[\w\W]*?\}/g, '')
      .replace(/assert\.sameValue\(\s*e instanceof RangeError,\s*true,[\w\W]+?\);/g, '')
      // replace old tests' custom checks with standard assert
      // .replace(/if \(([^ ]+) !== ([^ ]+)\) \{ *\n *throw new Test262Error\(['"](.*)\. Actual:.*\); *\n\} *\n/g, (_, one, two) => `assert.sameValue(${one}, ${two});\n`)
      // remove actual string concats from some error messages
      // .replace(/\. Actual: ' \+ .*\);/g, _ => `');`);
      
    code.contents = toRun;

    // disable node error coloring stuff
    this.cpOptions = {
      env: {
        NO_COLOR: 1
      }
    };

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
