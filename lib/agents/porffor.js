'use strict';

const fs = require('fs');
const runtimePath = require('../runtime-path');
const ConsoleAgent = require('../ConsoleAgent');

const errorExp = /^(.+?Error): (.+)$/gm;

class PorfforAgent extends ConsoleAgent {
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
