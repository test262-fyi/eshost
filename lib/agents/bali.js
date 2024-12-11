'use strict';

const fs = require('fs');
const runtimePath = require('../runtime-path');
const ConsoleAgent = require('../ConsoleAgent');

const errorExp = /^RuntimeException: Uncaught (.+?): (.+)$/m;

class BaliAgent extends ConsoleAgent {
  constructor(options) {
    super(options);

    this.args.unshift('--test262', 'run');
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

    if (!match) return null;

    return {
      name: match[1],
      message: match[2],
      stack: []
    };
  }
}

BaliAgent.runtime = fs.readFileSync(runtimePath.for('bali'), 'utf8');

module.exports = BaliAgent;
