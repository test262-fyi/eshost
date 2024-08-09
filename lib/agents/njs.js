'use strict';

const fs = require('fs');
const runtimePath = require('../runtime-path');
const ConsoleAgent = require('../ConsoleAgent');

const errorRe = /^Thrown:\n(.+?)(?:: (.+))?$/m;

class NJSAgent extends ConsoleAgent {
  constructor(options) {
    super(options);

    this.args.unshift('-r'); // ignore unhandled promise rejection
  }
  
  async evalScript(code, options = {}) {
    if (options.module && this.args[0] !== '-m') {
      this.args.unshift('-m');
    }

    if (!options.module && this.args[0] === '-m') {
      this.args.shift();
    }

    return super.evalScript(code, options);
  }

  parseError(str) {
    const match = str.match(errorRe);
    if (match) {
      return {
        name: match[1].trim(),
        message: match[2] ? match[2].trim() : "",
        stack: [] // Stack seems largely useless ("at unknown (native)")
      };
    }

    return null;
  }

  normalizeResult(result) {
    const match = result.stdout.match(errorRe);

    if (match) {
      result.stdout = result.stdout.replace(errorRe, '');
      result.stderr = match[0];
    }

    return result;
  }
}

NJSAgent.runtime = fs.readFileSync(runtimePath.for('njs'), 'utf8');

module.exports = NJSAgent;
