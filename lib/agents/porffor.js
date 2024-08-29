'use strict';

const fs = require('fs');
const runtimePath = require('../runtime-path');
const ConsoleAgent = require('../ConsoleAgent');

const errorExp = /^(.+?Error): (.+)$/m;

let preludes;
class PorfforAgent extends ConsoleAgent {
  constructor(options) {
    super(options);

    // disable node error coloring stuff
    this.cpOptions = {
      env: {
        NO_COLOR: 1
      }
    };
  }
  
  compile(contents, attrs, scenario) {
    return (scenario === 'strict mode' ? '"use strict";\n' : '') +
      (attrs.flags.async ? preludes['doneprintHandle.js'] : '') +
      attrs.includes.reduce((acc, x) => acc + (preludes[x] ?? ''), '') +
      alwaysPrelude +
      contents.slice(contents.lastIndexOf('---*/') + 5);
  }

  async evalScript(code, options = {}) {
    if (!preludes) preludes = (await (await fetch('https://raw.githubusercontent.com/CanadaHonk/porffor/main/test262/harness.js')).text()).split('///').reduce((acc, x) => {
      const [ k, ...content ] = x.split('\n');
      acc[k.trim()] = content.join('\n').trim() + '\n';
      return acc;
    }, {});

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
