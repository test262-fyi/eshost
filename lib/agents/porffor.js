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
    if (!preludes) preludes = (await (await fetch('https://raw.githubusercontent.com/CanadaHonk/porffor/main/test262/prelude.js')).text()).split('///').reduce((acc, x) => {
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

    const str = `if (err.constructor !== Test262Error) {`;
    const ind = toRun.indexOf(str);
    if (ind !== -1) {
      const nextEnd = toRun.indexOf('}', ind + str.length);
      toRun = toRun.replace(toRun.slice(ind, nextEnd + 1), '');
    }
  
    toRun = toRun
      // random error detail checks
      .replace(/assert\.notSameValue\(err\.message\.indexOf\('.*?'\), -1\);/g, '')
      .replace(/if \(\(e instanceof (.*)Error\) !== true\) \{[\w\W]*?\}/g, '')
      .replace(/assert\.sameValue\(\s*e instanceof RangeError,\s*true,[\w\W]+?\);/g, '')
      // replace old tests' custom checks with standard assert
      .replace(/if \(([^ ]+) !== ([^ ]+)\) \{ *\n *throw new Test262Error\(['"](.*)\. Actual:.*\); *\n\} *\n/g, (_, one, two) => `assert.sameValue(${one}, ${two});\n`)
      // remove actual string concats from some error messages
      .replace(/\. Actual: ' \+ .*\);/g, _ => `');`)
      // replace some (avoid false pos) assert.throws with inline try
      // .replace(/assert\.throws\(ReferenceError, function\(\) {([\w\W]+?)}\);/g, (_, body) => `let _thrown = false;\ntry {${body}\n_thrown = true;\n} catch {}\nif (_thrown) throw new Test262Error('Expected a ReferenceError to be thrown but no exception was at all');\n`);
      .replace(/assert\.throws\(.*?Error, function\(\) {([\w\W]+?)}\);/g, (_, body) => `{ let _thrown = false;\ntry {${body}\n_thrown = true;\n} catch {}\nif (_thrown) throw new Test262Error('Expected an Error to be thrown but no exception was at all'); }\n`);

    code.contents = toRun;

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
