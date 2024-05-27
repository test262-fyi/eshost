'use strict';

const fs = require('fs');
const runtimePath = require('../runtime-path');
const ConsoleAgent = require('../ConsoleAgent');

const errorRe = /^Uncaught exception: (.+?)(?:: (.+))?$/m;

class NovaAgent extends ConsoleAgent {
  constructor(options) {
    super(options);

    this.args.unshift('eval');
  }

  async evalScript(code, options = {}) {
    // if (options.module && this.args[0] !== '--module') {
    //   this.args.unshift('--module');
    // }

    // if (!options.module && this.args[0] === '--module') {
    //   this.args.shift();
    // }

    return super.evalScript(code, options);
  }

  parseError(str) {
    const match = str.match(errorRe);

    if (!match) return null;

    const name = match[1] ? match[1].trim() : "";
    let message = match[2] ? match[2].trim() : "";

    try {
      const parsedMessage = JSON.parse(message);
      if (typeof parsedMessage["message"] === 'string')
        message = parsedMessage["message"];
    } catch {
      // ignored
    }

    const stack = [];

    return {
      name,
      message,
      stack
    };
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

NovaAgent.runtime = fs.readFileSync(runtimePath.for('nova'), 'utf8');

module.exports = NovaAgent;
