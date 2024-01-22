'use strict';

const fs = require('fs');
const runtimePath = require('../runtime-path');
const ConsoleAgent = require('../ConsoleAgent');
const ErrorParser = require('../parse-error.js');

const errorExp = /^Uncaught (.*?): (.*)$/m;

class BoaAgent extends ConsoleAgent {
  constructor(options) {
    super(options);

    this.args.unshift('--debug-object');
  }

  compile(code) {
    code = super.compile(code);

    // ensure no return value
    code += ";;;";

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
    if (!match) return null;

    return {
      name: match[1],
      message: match[2],
      stack: []
    };
  }

  normalizeResult(result) {
    const match = result.stdout.match(errorExp);
    if (match) {
      result.stdout = result.stdout.replace(errorExp, '');
      result.stderr = match[0];
    }

    // remove return value
    result.stdout = result.stdout.replace('undefined\n', '');

    return result;
  }
}

BoaAgent.runtime = fs.readFileSync(runtimePath.for('boa'), 'utf8');
module.exports = BoaAgent;